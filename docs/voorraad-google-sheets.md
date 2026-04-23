# Voorraad koppelen via Google Sheets

Deze handleiding beschrijft hoe je de voorraadcijfers op de M&K-website live uit een Google Sheet laat komen, en hoe je die Sheet vanuit Python vult (bijvoorbeeld met data uit je ERP of Excel). Je hoeft niet alles in één keer te doen — de website werkt ook zonder Sheet (dan vallen de cijfers terug op de `stock:` waardes in de product-markdown).

---

## Flow in één oogopslag

```
Jouw Python-script  ──►  Google Sheet  ──►  /api/stock (cached 5 min)  ──►  Website
   (draai lokaal,                                                              (HDPE/PP cards
   op server, of                                                               + variant-knoppen
   via GitHub Action)                                                          in productdetail)
```

De site leest de Sheet als CSV — dat is simpel, geen Google Cloud project nodig om de site aan de praat te krijgen. Wel nodig als Python erin moet schrijven.

---

## Deel 1 — Website kant

### 1.1 Google Sheet opzetten

Maak een nieuwe Sheet (of tab in een bestaande) met **exact** deze structuur — eerste rij zijn de headers:

| productSlug | variantSize | stock |
|---|---|---|
| `hdpe-naturel-10mm` | `2000 × 1000 mm` | 45 |
| `hdpe-naturel-10mm` | `3000 × 1500 mm` | 18 |
| `hdpe-zwart-20mm` | `2000 × 1000 mm` | 32 |
| `hdpe-zwart-20mm` | `3000 × 1500 mm` | 12 |
| `pp-grijs-8mm` | `2000 × 1000 mm` | 28 |
| `pp-grijs-8mm` | `3000 × 1500 mm` | 9 |
| … | … | … |

**Belangrijke regels**

- `productSlug` moet matchen met de `slug:` in de product-markdown ([content/nl/producten/*.md](../content/nl/producten/))
- `variantSize` moet **letterlijk** matchen met de `size:` uit het `variants:`-blok in de markdown — **inclusief** het `×`-teken (niet `x`) en de spaties
- `stock` moet een geheel getal zijn. 0 mag. Negatief niet.
- Mis je een rij? Dan valt de site terug op de `stock:` waarde in de markdown voor die variant.

### 1.2 Sheet publiceren als CSV

1. Open de Sheet in je browser
2. Menu: **Bestand → Delen → Publiceren op web**
3. Bij **Link**: selecteer het juiste tabblad (niet "Hele document")
4. Formaat: **Door komma's gescheiden waarden (.csv)**
5. Klik **Publiceren** en bevestig

Je krijgt een URL terug die eruit ziet als:

```
https://docs.google.com/spreadsheets/d/e/2PACX-1vQxxxxxxxxxxxxxxxxxxxx/pub?output=csv
```

Deze URL werkt als een "publiek toegankelijke" link — maar is praktisch onmogelijk te raden. Bewaar 'm veilig (bv. in je wachtwoordmanager).

> 💡 **Wat je hiermee publiceert** is alleen het tabblad dat je selecteert. Andere tabs (bv. "Bron ERP", "Kostprijzen") blijven privé zolang je ze niet publiceert.

### 1.3 Env var zetten

**Lokaal:**

Maak een `.env` bestand in de project-root (staat in `.gitignore`, wordt nooit gecommit):

```
NUXT_STOCK_SHEET_URL=https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv
```

**Op Vercel:**

1. Ga naar je project in Vercel
2. **Settings → Environment Variables**
3. Voeg toe:
   - Key: `NUXT_STOCK_SHEET_URL`
   - Value: de gepubliceerde CSV-URL
   - Environments: **Production**, **Preview**, **Development** (alle drie aanvinken)
4. Klik **Save**
5. **Redeploy** van de laatste deploy (nieuwe env vars worden pas actief na deploy)

### 1.4 Verifiëren

Na deploy:

1. Bezoek `https://jouw-site.vercel.app/api/stock` in de browser
2. Je ziet JSON terug — het veld `source` moet `"sheet"` zijn (niet `"fallback"`)
3. Het veld `stock` bevat je data: `{ "hdpe-naturel-10mm": { "2000 × 1000 mm": 45, ... } }`

Kijk ook op:
- Homepage — de HDPE en PP cards tonen de sommen
- Productpagina — onder elke variant-knop staat "N op voorraad"

**Cache:** de server cacht 5 minuten. Na een update kan het dus max 5 min duren voor bezoekers het zien.

---

## Deel 2 — Python kant

Zodra de Sheet in de website hangt, kun je Python gebruiken om 'm bij te werken.

### 2.1 Service account aanmaken (eenmalig)

Een service account is een Google-gebruiker die alleen voor scripts bestaat — geen eigen Gmail, geen wachtwoord, alleen een JSON-bestand als identiteit.

1. Ga naar **https://console.cloud.google.com/**
2. Maak een nieuw project aan (bv. `mk-kunststoffen-stock`)
3. Linker menu: **APIs & Services → Library** → zoek **Google Sheets API** → **Enable**
4. Doe hetzelfde voor **Google Drive API** (gspread gebruikt beide)
5. Linker menu: **APIs & Services → Credentials → Create Credentials → Service Account**
6. Geef hem een naam (bv. `stock-updater`). Rol: **Editor** (of skip; Sheet-toegang regel je hierna per Sheet)
7. Klik op de aangemaakte service account → tab **Keys → Add Key → Create new key → JSON**
8. Download het JSON-bestand en sla het **veilig** op (bv. `~/credentials/mk-stock-updater.json`). Commit dit **nooit** naar git.

In de JSON staat een `client_email` zoals `stock-updater@mk-kunststoffen-stock.iam.gserviceaccount.com`. Die ga je nu toegang geven tot de Sheet.

### 2.2 Sheet delen met de service account

1. Open je voorraad-Sheet
2. Knop **Delen** rechtsboven
3. Plak de `client_email` van de service account
4. Geef **Editor**-toegang
5. Zet uit: "Notify people"
6. **Delen**

Vanaf nu mag je Python-script de Sheet lezen én schrijven.

### 2.3 Python setup

```bash
# In de map waar je script staat
python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate   # macOS/Linux
pip install gspread
```

### 2.4 Voorbeeld-script: hele voorraad overschrijven

```python
# update_stock.py
import gspread

# Pad naar je service-account JSON
CREDENTIALS = r'C:\Users\michni\credentials\mk-stock-updater.json'

# ID van de Sheet (uit de URL: docs.google.com/spreadsheets/d/ → dit stuk ← /edit)
SHEET_ID = '1abcDEFghi_____vervang_me_____XYZ'

# Jouw voorraadbron — kan alles zijn: Excel lezen, ERP API, hardcoded, ...
voorraad = [
    # (productSlug, variantSize, stock)
    ('hdpe-naturel-10mm', '2000 × 1000 mm', 45),
    ('hdpe-naturel-10mm', '3000 × 1500 mm', 18),
    ('hdpe-zwart-20mm',   '2000 × 1000 mm', 32),
    ('hdpe-zwart-20mm',   '3000 × 1500 mm', 12),
    ('pp-grijs-8mm',      '2000 × 1000 mm', 28),
    ('pp-grijs-8mm',      '3000 × 1500 mm',  9),
    # ...
]

def main():
    gc = gspread.service_account(filename=CREDENTIALS)
    sheet = gc.open_by_key(SHEET_ID).sheet1   # sheet1 = eerste tabblad

    # Clear en zet headers + data
    sheet.clear()
    rows = [['productSlug', 'variantSize', 'stock']]
    rows.extend([list(r) for r in voorraad])
    sheet.update('A1', rows)

    print(f'OK — {len(voorraad)} regels geschreven naar Sheet')

if __name__ == '__main__':
    main()
```

Runnen:

```bash
python update_stock.py
```

Kijk in de Sheet — de waardes zijn bijgewerkt. Binnen 5 minuten zie je het op de website.

### 2.5 Voorbeeld-script: alleen specifieke rijen updaten

Als je niet de hele Sheet wilt overschrijven (bijvoorbeeld omdat je ook handmatige kolommen toevoegt):

```python
import gspread

CREDENTIALS = r'C:\Users\michni\credentials\mk-stock-updater.json'
SHEET_ID = '1abcDEFghi_____vervang_me_____XYZ'

def set_stock(product_slug: str, variant_size: str, stock: int):
    gc = gspread.service_account(filename=CREDENTIALS)
    sheet = gc.open_by_key(SHEET_ID).sheet1

    # Zoek de rij
    records = sheet.get_all_records()
    for idx, row in enumerate(records, start=2):    # start=2 omdat rij 1 headers zijn
        if row['productSlug'] == product_slug and row['variantSize'] == variant_size:
            sheet.update_cell(idx, 3, stock)         # kolom 3 = stock
            return True
    return False

# Gebruik:
set_stock('hdpe-naturel-10mm', '2000 × 1000 mm', 42)
```

### 2.6 Voorbeeld-script: uit een Excel-bestand lezen

```python
import gspread
from openpyxl import load_workbook

CREDENTIALS = r'C:\Users\michni\credentials\mk-stock-updater.json'
SHEET_ID = '1abcDEFghi_____vervang_me_____XYZ'
EXCEL_PATH = r'C:\Users\michni\Documents\voorraad-mk.xlsx'

def read_excel():
    wb = load_workbook(EXCEL_PATH, data_only=True)
    ws = wb['Voorraad']      # tab-naam
    rows = []
    for row in ws.iter_rows(min_row=2, values_only=True):  # skip header
        slug, size, stock = row[:3]
        if slug and size and stock is not None:
            rows.append([slug, size, int(stock)])
    return rows

def push_to_sheet(rows):
    gc = gspread.service_account(filename=CREDENTIALS)
    sheet = gc.open_by_key(SHEET_ID).sheet1
    sheet.clear()
    sheet.update('A1', [['productSlug', 'variantSize', 'stock'], *rows])

if __name__ == '__main__':
    rows = read_excel()
    push_to_sheet(rows)
    print(f'{len(rows)} regels uit Excel → Google Sheet')
```

Dependency: `pip install openpyxl`

---

## Deel 3 — Automatisering

Je hebt drie simpele opties om het script periodiek te draaien.

### Optie A — Windows Task Scheduler (lokaal)

1. Open **Taakplanner**
2. **Basistaak maken** → naam: "MK voorraad sync"
3. Trigger: dagelijks om 06:00
4. Actie: **Een programma starten**
5. Programma/script: `C:\Users\michni\MK_WEBSITE\.venv\Scripts\python.exe`
6. Argumenten: `C:\Users\michni\MK_WEBSITE\scripts\update_stock.py`

Werkt zolang je computer aanstaat.

### Optie B — GitHub Actions (cloud, gratis)

In je repo: `.github/workflows/sync-stock.yml`

```yaml
name: Sync stock to Google Sheet

on:
  schedule:
    - cron: '0 5 * * *'   # dagelijks 06:00 NL-tijd (05:00 UTC)
  workflow_dispatch:       # ook handmatig via GitHub UI

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install gspread
      - name: Write credentials
        run: echo '${{ secrets.GOOGLE_CREDS_JSON }}' > creds.json
      - name: Run sync
        env:
          GOOGLE_APPLICATION_CREDENTIALS: ./creds.json
          SHEET_ID: ${{ secrets.SHEET_ID }}
        run: python scripts/update_stock.py
```

Secrets die je in GitHub → Settings → Secrets moet zetten:
- `GOOGLE_CREDS_JSON` — de volledige inhoud van je service-account JSON
- `SHEET_ID` — het ID van je Sheet

Pas `update_stock.py` aan zodat hij de credentials uit `GOOGLE_APPLICATION_CREDENTIALS` en de Sheet-ID uit `os.environ['SHEET_ID']` leest:

```python
import os, gspread
gc = gspread.service_account(filename=os.environ['GOOGLE_APPLICATION_CREDENTIALS'])
sheet = gc.open_by_key(os.environ['SHEET_ID']).sheet1
```

### Optie C — Bij elke ERP-update (event-driven)

Als je ERP webhooks of exports kan versturen, laat het script triggeren zodra er beweging is. Niet in deze handleiding uitgewerkt — begin eerst met A of B.

---

## Deel 4 — Troubleshooting

| Symptoom | Waarschijnlijke oorzaak | Oplossing |
|---|---|---|
| `/api/stock` geeft `source: "fallback"` | Env var niet gezet of leeg | Check `.env` lokaal of Vercel env vars + redeploy |
| `/api/stock` geeft `source: "error"` | Sheet niet publiek gepubliceerd | Publiceer opnieuw via File → Share → Publish |
| Voorraad updatet niet na Sheet-wijziging | 5-min server cache | Wacht of redeploy |
| Getallen kloppen niet met Sheet | `variantSize` matcht niet letterlijk met markdown | Check `×` (niet `x`), spaties, `mm` |
| Python: `gspread.exceptions.APIError: PERMISSION_DENIED` | Sheet niet gedeeld met service account | Deel de Sheet met het `client_email` uit je JSON |
| Python: `FileNotFoundError: credentials.json` | Pad klopt niet | Gebruik absolute pad of check working directory |
| Python: `InsufficientScope` | Drive API niet enabled | In Google Cloud Console: APIs & Services → Library → Drive API → Enable |

---

## Handige links

- gspread docs — https://docs.gspread.org/
- Google Cloud Console — https://console.cloud.google.com/
- Vercel env vars — Project → Settings → Environment Variables
- Website API test — `https://jouw-site.vercel.app/api/stock`

---

## Checklist voor de eerste keer

- [ ] Google Sheet aangemaakt met juiste kolommen
- [ ] Sheet gepubliceerd als CSV → URL genoteerd
- [ ] `NUXT_STOCK_SHEET_URL` gezet op Vercel + redeploy gedaan
- [ ] `/api/stock` geeft `source: "sheet"` terug
- [ ] Service account aangemaakt in Google Cloud
- [ ] Sheet gedeeld met de service account (Editor)
- [ ] Python + gspread geïnstalleerd
- [ ] `update_stock.py` draait succesvol
- [ ] Automatisering ingesteld (Task Scheduler of GitHub Action)
