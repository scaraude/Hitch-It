# Hitchit website

Minimal static website hosted separately from the mobile app.

## Purpose

For now this directory only exists to serve:
- `confirm-signup.html`
- `reset-password.html`

These pages are meant to be deployed on Vercel with `website/` configured as the project root directory.

## Suggested first URLs

- `/confirm-signup`
- `/reset-password`

## Vercel setup

1. Import the main repository into Vercel.
2. Set the project Root Directory to `website`.
3. Deploy as a plain static site.
4. Point your custom domain or subdomain to that Vercel project.

## Supabase redirect targets

Once deployed, use URLs like:

- `https://hitchit.org/confirm-signup`
- `https://hitchit.org/reset-password`

or the equivalent subdomain if you prefer hosting them elsewhere.
