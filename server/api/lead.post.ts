import { z } from 'zod'
import { Resend } from 'resend'

// ---------- Schemas --------------------------------------------------------

const baseContact = z.object({
  locale: z.enum(['nl', 'en']).default('nl'),
  name: z.string().min(2).max(100),
  company: z.string().max(200).optional().or(z.literal('')),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal('')),
  message: z.string().max(4000).optional().or(z.literal('')),
  privacy: z.literal(true, {
    errorMap: () => ({ message: 'Privacy consent required' }),
  }),
  // honeypot — must be empty
  website: z.string().max(0).optional().or(z.literal('')),
})

const quoteSchema = baseContact.extend({
  kind: z.literal('quote'),
  productSlug: z.string().optional(),
  product: z.string().min(1).max(200),
  dimensions: z.string().max(120).optional().or(z.literal('')),
  quantity: z.coerce.number().int().min(1).max(100000),
  company: z.string().min(2).max(200),
  message: z.string().max(4000).optional().or(z.literal('')),
})

const bulkRow = z.object({
  material: z.string().min(1).max(80),
  form: z.string().min(1).max(40),
  thickness: z.string().max(40).optional().or(z.literal('')),
  dimensions: z.string().max(120).optional().or(z.literal('')),
  quantity: z.coerce.number().int().min(1).max(100000),
})

const bulkSchema = baseContact.extend({
  kind: z.literal('bulk'),
  company: z.string().min(2).max(200),
  rows: z.array(bulkRow).min(1).max(50),
})

const contactSchema = baseContact.extend({
  kind: z.literal('contact'),
  message: z.string().min(5).max(4000),
})

const leadSchema = z.discriminatedUnion('kind', [quoteSchema, bulkSchema, contactSchema])
type Lead = z.infer<typeof leadSchema>

// ---------- Naive in-memory rate limit ------------------------------------
// (Per-process. On Vercel this resets per cold start — which is acceptable
// for baseline protection. For stricter control, swap to upstash/redis later.)
const hits = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60 * 1000
const MAX_PER_WINDOW = 6

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  entry.count += 1
  if (entry.count > MAX_PER_WINDOW) return false
  return true
}

// ---------- Email rendering ----------------------------------------------

function buildEmail(lead: Lead): { subject: string; html: string; text: string } {
  const siteName = 'M&K'
  let subject = `${siteName} lead — ${lead.kind}`
  let body = ''

  if (lead.kind === 'quote') {
    subject = `${siteName} offerte — ${lead.product}`
    body = [
      `Product: ${lead.product}${lead.productSlug ? ` (${lead.productSlug})` : ''}`,
      `Afmetingen: ${lead.dimensions || '—'}`,
      `Aantal: ${lead.quantity}`,
    ].join('\n')
  } else if (lead.kind === 'bulk') {
    subject = `${siteName} bulk-offerte — ${lead.rows.length} artikelen`
    body = lead.rows
      .map((r, i) =>
        `${String(i + 1).padStart(2, '0')}. ${r.material} ${r.form} ${r.thickness || ''} ${r.dimensions || ''} × ${r.quantity}`.trim(),
      )
      .join('\n')
  } else {
    subject = `${siteName} contact — ${lead.name}`
    body = lead.message
  }

  const contact = [
    `Naam:    ${lead.name}`,
    `Bedrijf: ${lead.company || '—'}`,
    `E-mail:  ${lead.email}`,
    `Tel:     ${lead.phone || '—'}`,
    `Taal:    ${lead.locale}`,
  ].join('\n')

  const text = `${subject}\n\n${body}\n\n— Contact —\n${contact}\n${
    'message' in lead && lead.message && lead.kind !== 'contact' ? `\n— Toelichting —\n${lead.message}\n` : ''
  }`

  const html = `
    <div style="font-family:Inter,system-ui,sans-serif;line-height:1.5;color:#0B1220;max-width:640px">
      <h2 style="font-family:'Space Grotesk',sans-serif;margin:0 0 8px">${subject}</h2>
      <pre style="white-space:pre-wrap;font-family:'JetBrains Mono',monospace;background:#F5F6F8;padding:12px;border-radius:6px;margin:0 0 16px">${body}</pre>
      <h3 style="margin:16px 0 4px">Contact</h3>
      <pre style="white-space:pre-wrap;font-family:'JetBrains Mono',monospace;background:#F5F6F8;padding:12px;border-radius:6px;margin:0">${contact}</pre>
      ${'message' in lead && lead.message && lead.kind !== 'contact'
        ? `<h3 style="margin:16px 0 4px">Toelichting</h3><p>${lead.message.replace(/\n/g, '<br>')}</p>`
        : ''}
    </div>
  `

  return { subject, html, text }
}

// ---------- Handler --------------------------------------------------------

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  // Validate
  const parsed = leadSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid payload',
      data: { issues: parsed.error.flatten() },
    })
  }
  const lead = parsed.data

  // Honeypot check (double-safe — schema requires empty string)
  if (lead.website) {
    return { ok: true, spam: true }
  }

  // Rate limit by client IP
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  if (!rateLimit(ip)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }

  const { subject, html, text } = buildEmail(lead)

  // If no Resend key, fall back to logging (dev/preview without credentials)
  if (!config.resendApiKey || !config.leadRecipient) {
    console.log('[lead] (no email config, logged)', { subject, lead })
    return { ok: true, delivered: false }
  }

  try {
    const resend = new Resend(config.resendApiKey)
    const result = await resend.emails.send({
      from: config.leadFromAddress || 'M&K Kunststoffen <no-reply@mkkunststoffen.example>',
      to: config.leadRecipient.split(',').map(s => s.trim()),
      replyTo: lead.email,
      subject,
      html,
      text,
    })
    if (result.error) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Mail delivery failed',
        data: { error: result.error },
      })
    }
    return { ok: true, delivered: true, id: result.data?.id }
  } catch (err: any) {
    console.error('[lead] mail error', err)
    throw createError({
      statusCode: 502,
      statusMessage: 'Mail delivery failed',
    })
  }
})
