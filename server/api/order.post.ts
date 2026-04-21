import { z } from 'zod'
import { Resend } from 'resend'

// ---------- Schemas -------------------------------------------------------

const cartItemSchema = z.object({
  productSlug: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  material: z.string().min(1).max(80),
  thickness: z.number().int().positive(),
  color: z.string().min(1).max(60),
  colorRal: z.string().max(40).optional(),
  variantSize: z.string().min(1).max(80),
  widthMm: z.number().int().positive(),
  heightMm: z.number().int().positive(),
  weightKg: z.number().positive(),
  pricePerKg: z.number().nonnegative(),
  pricePerSheet: z.number().nonnegative(),
  quantity: z.number().int().positive().max(1000),
})

const totalsSchema = z.object({
  subtotalExcl: z.number().nonnegative(),
  btw: z.number().nonnegative(),
  totalIncl: z.number().nonnegative(),
  totalWeight: z.number().nonnegative(),
})

const orderSchema = z.object({
  locale: z.enum(['nl', 'en']).default('nl'),
  items: z.array(cartItemSchema).min(1).max(100),
  totals: totalsSchema,

  companyName: z.string().min(2).max(200),
  kvk: z.string().min(1).max(40),
  vatNumber: z.string().max(40).optional().or(z.literal('')),
  poNumber: z.string().max(80).optional().or(z.literal('')),

  contactName: z.string().min(2).max(100),
  contactEmail: z.string().email(),
  contactPhone: z.string().max(40).optional().or(z.literal('')),

  deliveryStreet: z.string().min(2).max(200),
  deliveryPostal: z.string().min(2).max(20),
  deliveryCity: z.string().min(2).max(100),
  deliveryCountry: z.string().min(2).max(80),

  sameBillingAddress: z.boolean(),
  billingStreet: z.string().max(200).optional().or(z.literal('')),
  billingPostal: z.string().max(20).optional().or(z.literal('')),
  billingCity: z.string().max(100).optional().or(z.literal('')),
  billingCountry: z.string().max(80).optional().or(z.literal('')),

  notes: z.string().max(4000).optional().or(z.literal('')),
  privacy: z.literal(true),
  website: z.string().max(0).optional().or(z.literal('')), // honeypot
}).refine((v) => {
  if (v.sameBillingAddress) return true
  return !!v.billingStreet && !!v.billingPostal && !!v.billingCity && !!v.billingCountry
}, { message: 'Billing address incomplete', path: ['billingStreet'] })

type Order = z.infer<typeof orderSchema>

// ---------- Rate limiting -------------------------------------------------

const hits = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 4

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  entry.count += 1
  return entry.count <= MAX_PER_WINDOW
}

// ---------- Email rendering ----------------------------------------------

function eur(n: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n)
}

function orderId(): string {
  const d = new Date()
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `MK-${ymd}-${rand}`
}

function buildEmail(order: Order, id: string) {
  const lines = order.items.map((it, i) => {
    const ralSuffix = it.colorRal ? ` · ${it.colorRal}` : ''
    return `${String(i + 1).padStart(2, '0')}. ${it.title}\n    ${it.variantSize}${ralSuffix} · ${it.weightKg.toFixed(1)} kg × ${it.quantity} = ${eur(it.pricePerSheet * it.quantity)}`
  }).join('\n')

  const billing = order.sameBillingAddress
    ? `${order.deliveryStreet}, ${order.deliveryPostal} ${order.deliveryCity}, ${order.deliveryCountry}`
    : `${order.billingStreet}, ${order.billingPostal} ${order.billingCity}, ${order.billingCountry}`

  const text = `Nieuwe bestelling — ${id}

BEDRIJF
  ${order.companyName}
  KvK:  ${order.kvk}
  BTW:  ${order.vatNumber || '—'}
  PO:   ${order.poNumber || '—'}

CONTACT
  ${order.contactName}
  ${order.contactEmail}
  ${order.contactPhone || '—'}

BEZORGADRES
  ${order.deliveryStreet}
  ${order.deliveryPostal} ${order.deliveryCity}
  ${order.deliveryCountry}

FACTUURADRES
  ${billing}

ARTIKELEN
${lines}

TOTALEN
  Totaal gewicht:   ${order.totals.totalWeight.toFixed(1)} kg
  Subtotaal (excl.) ${eur(order.totals.subtotalExcl)}
  BTW (21%):         ${eur(order.totals.btw)}
  TOTAAL INCL.:     ${eur(order.totals.totalIncl)}

OPMERKINGEN
  ${order.notes || '—'}
`

  const rows = order.items.map((it) => {
    const ralSuffix = it.colorRal ? ` · ${it.colorRal}` : ''
    return `<tr>
      <td style="padding:8px;border-bottom:1px solid #ECEEF2">${it.title}<br><span style="font-size:11px;color:#64748B;font-family:monospace;text-transform:uppercase">${it.variantSize}${ralSuffix} · ${it.weightKg.toFixed(1)} kg</span></td>
      <td style="padding:8px;border-bottom:1px solid #ECEEF2;text-align:center">${it.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #ECEEF2;text-align:right">${eur(it.pricePerSheet * it.quantity)}</td>
    </tr>`
  }).join('')

  const html = `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:720px;color:#0B1220">
      <h1 style="font-family:'Space Grotesk',sans-serif;color:#E85A0C;margin:0">M&amp;K Kunststoffen</h1>
      <p style="font-family:monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#64748B;margin:4px 0 16px">— Order bevestiging · ${id}</p>
      <h2>Hallo ${order.contactName.split(' ')[0]},</h2>
      <p>Bedankt voor je bestelling bij M&amp;K Kunststoffen. Hieronder het overzicht. De factuur volgt binnen één werkdag op <strong>${order.contactEmail}</strong>.</p>

      <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:14px">
        <thead>
          <tr style="border-bottom:2px solid #0B1220">
            <th style="text-align:left;padding:8px">Artikel</th>
            <th style="padding:8px;text-align:center">Aantal</th>
            <th style="padding:8px;text-align:right">Totaal</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr><td colspan="2" style="padding:8px;text-align:right">Subtotaal (excl. BTW)</td><td style="padding:8px;text-align:right">${eur(order.totals.subtotalExcl)}</td></tr>
          <tr><td colspan="2" style="padding:8px;text-align:right">BTW (21%)</td><td style="padding:8px;text-align:right">${eur(order.totals.btw)}</td></tr>
          <tr><td colspan="2" style="padding:8px;text-align:right;font-weight:700;border-top:2px solid #0B1220">Totaal incl. BTW</td><td style="padding:8px;text-align:right;font-weight:700;border-top:2px solid #0B1220;color:#FF7A1A">${eur(order.totals.totalIncl)}</td></tr>
        </tfoot>
      </table>

      <h3 style="margin-top:32px">Bezorgadres</h3>
      <p>${order.deliveryStreet}<br>${order.deliveryPostal} ${order.deliveryCity}<br>${order.deliveryCountry}</p>

      <h3>Bedrijfsgegevens</h3>
      <p>${order.companyName}<br>KvK ${order.kvk}${order.vatNumber ? ` · BTW ${order.vatNumber}` : ''}</p>

      <p style="margin-top:32px;color:#64748B;font-size:13px">Vragen? Mail naar info@mkkunststoffen.example onder vermelding van je ordernummer.</p>
    </div>
  `

  return { subject: `M&K bestelling ${id}`, text, html }
}

// ---------- Handler -------------------------------------------------------

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const parsed = orderSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid payload',
      data: { issues: parsed.error.flatten() },
    })
  }
  const order = parsed.data

  if (order.website) return { ok: true, spam: true }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  if (!rateLimit(ip)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }

  const id = orderId()
  const { subject, text, html } = buildEmail(order, id)

  if (!config.resendApiKey || !config.leadRecipient) {
    console.log('[order] (no email config, logged)', { id, subject, order })
    return { ok: true, delivered: false, id }
  }

  try {
    const resend = new Resend(config.resendApiKey)

    // 1. Notify M&K
    await resend.emails.send({
      from: config.leadFromAddress || 'M&K Kunststoffen <no-reply@mkkunststoffen.example>',
      to: config.leadRecipient.split(',').map(s => s.trim()),
      replyTo: order.contactEmail,
      subject: `[M&K] Nieuwe bestelling ${id} — ${order.companyName}`,
      html,
      text,
    })

    // 2. Confirm to customer
    await resend.emails.send({
      from: config.leadFromAddress || 'M&K Kunststoffen <no-reply@mkkunststoffen.example>',
      to: [order.contactEmail],
      subject,
      html,
      text,
    })

    return { ok: true, delivered: true, id }
  } catch (err: any) {
    console.error('[order] mail error', err)
    throw createError({
      statusCode: 502,
      statusMessage: 'Mail delivery failed',
    })
  }
})
