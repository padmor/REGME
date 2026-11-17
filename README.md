# UCC Physics Practical Registration System

University of Cape Coast Physics practical registration and scheduling application.

**Stack:** HTML, CSS, JavaScript, Express, Neon PostgreSQL, and Paystack.

## Interactive demo

The `demo-access` branch includes an isolated student/admin demonstration portal at `/demo.html`. It provides:
- Student and Admin view switching.
- Sample practical sessions and a student registration form.
- Registration history and admin review screens.
- Local-only demo settings.
- Successful/failed payment simulation with no Paystack request and no real charge.

Demo records are stored in the browser's local storage only. They are not sent to the production database. The demo portal is separate from production authentication and payment routes; it does not grant a demo token or bypass server-side authorization.

## Vercel deployment

The original application source is stored in `.bundle/` as a compressed source archive and is unpacked into `app/` during the Vercel build. The Express app is served through `api/index.js`, including its frontend static assets. The build script also installs the isolated demo page from `demo/index.html` into the public output and adds a clearly labelled entry link to the landing page.

### Required Vercel environment variables

- `DATABASE_URL` — Neon PostgreSQL connection string.
- `JWT_SECRET` — long, random secret; never commit it.
- `PAYSTACK_PUBLIC_KEY` — Paystack public key.
- `PAYSTACK_SECRET_KEY` — Paystack secret key.
- `PAYSTACK_CURRENCY=GHS`
- `PAYSTACK_CHANNELS=mobile_money,bank_transfer,card`
- `PAYSTACK_MOCK=false`
- `PRACTICAL_FEE=50.00`

Apply the database schema/migrations from `app/db/` and `app/scripts/` to Neon before opening student registration. Configure the Paystack webhook as `https://YOUR_DOMAIN/api/webhooks/paystack`.

No real `.env` file or payment credentials are stored in this repository.
