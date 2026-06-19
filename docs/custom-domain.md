# Custom Auth Domain (Supabase Vanity Domain)

By default the browser calls Supabase Auth at `https://jhrwdyebjzgvltqggqjp.supabase.co/auth/v1/*`.
A custom domain replaces that host with one you own (e.g. `https://auth.yourschool.com`), so the
`supabase.co` name never appears in the network tab. **Security is identical** — this is purely cosmetic/branding.

The codebase is already host-agnostic: the host is read from env in exactly two places
(`SUPABASE_URL` for the API/JWKS, `NEXT_PUBLIC_SUPABASE_URL` for the web). Switching is a one-line env change.

## Prerequisites (cannot be skipped)

1. **Supabase Pro plan + the Custom Domain add-on** (paid). Enable under Project Settings → Add-ons.
2. **A domain you control** with DNS access (to add CNAME + TXT records).
3. A subdomain to use, e.g. `auth.yourschool.com`.

## Steps

```bash
# 1. Install the Supabase CLI (macOS)
brew install supabase/tap/supabase

# 2. Authenticate and link this project
supabase login
supabase link --project-ref jhrwdyebjzgvltqggqjp

# 3. Register the custom hostname — this prints the DNS records you must add
supabase domains create --custom-hostname auth.yourschool.com

# 4. Add the printed CNAME + TXT records at your DNS provider, then wait for propagation

# 5. Verify and activate
supabase domains reverify
supabase domains activate
```

> Activating briefly interrupts auth (existing sessions re-authenticate). Do it during low traffic.

## Env change after activation

The anon/publishable key does **not** change — only the host.

`apps/web/.env`:

```
NEXT_PUBLIC_SUPABASE_URL=https://auth.yourschool.com
```

Root `.env`:

```
SUPABASE_URL=https://auth.yourschool.com
```

The API derives the JWKS URL from `SUPABASE_URL`, so it automatically becomes
`https://auth.yourschool.com/auth/v1/.well-known/jwks.json`. Restart the API and web after changing env.

## Verify

```bash
# JWKS should resolve on the new host
curl -s https://auth.yourschool.com/auth/v1/.well-known/jwks.json -H "apikey: <publishable-key>"
```

Then run the OTP flow — the request in the network tab should now go to `auth.yourschool.com/auth/v1/otp`.
