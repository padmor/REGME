# UCC Physics Practical Registration System

University of Cape Coast Physics practical registration and scheduling application.

**Stack:** HTML, CSS, JavaScript, Express, Neon PostgreSQL, and Paystack.

## Vercel deployment

The original application source is stored in `.bundle/` as a compressed source archive and is unpacked into `app/` during the Vercel build. The Express app is served through `api/index.js`, including its frontend static assets.

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
