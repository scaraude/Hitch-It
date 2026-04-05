# TCK-52: Auth Email + Deep-Link Architecture Analysis

## Scope

This document analyzes the current Hitch-It auth stack and recommends the implementation approach for:

- custom account confirmation emails
- custom password reset emails
- Expo deep links that return users to the app instead of a browser or `localhost`

This is the implementation guide for TCK-53 and TCK-54. It does not implement the feature yet.

## Current State

### App stack

- Mobile app: Expo 54 + React Native 0.81
- Navigation: React Navigation native stack, not Expo Router
- Auth provider: Supabase Auth via `@supabase/supabase-js`
- Session persistence: `expo-secure-store`
- Custom app scheme already exists: `hitchit://`

### Relevant current code

- [app.json](/home/scaraude/.openclaw/workspace/Hitch-It/app.json)
  - Expo scheme is already set to `hitchit`
- [src/lib/supabaseClient.ts](/home/scaraude/.openclaw/workspace/Hitch-It/src/lib/supabaseClient.ts)
  - `persistSession: true`
  - `detectSessionInUrl: false`
  - SecureStore-backed auth storage is already configured correctly for React Native
- [src/navigation/RootNavigator.tsx](/home/scaraude/.openclaw/workspace/Hitch-It/src/navigation/RootNavigator.tsx)
  - `NavigationContainer` has no deep-link `linking` config
  - there is no URL event listener
- [src/auth/services/authService.ts](/home/scaraude/.openclaw/workspace/Hitch-It/src/auth/services/authService.ts)
  - `signUp()` does not pass `emailRedirectTo`
  - `resendConfirmationEmail()` does not pass `emailRedirectTo`
  - `sendPasswordResetEmail()` hardcodes `redirectTo: 'hitchit://reset-password'`
  - there is no method to consume an auth email deep link or verify a `token_hash`
- [src/screens/SignUpScreen.tsx](/home/scaraude/.openclaw/workspace/Hitch-It/src/screens/SignUpScreen.tsx)
  - successful sign-up navigates straight to `Home`
- [src/screens/ForgotPasswordScreen.tsx](/home/scaraude/.openclaw/workspace/Hitch-It/src/screens/ForgotPasswordScreen.tsx)
  - reset email can be sent, but the app has no route to finish recovery from an incoming link
- [supabase/config.toml](/home/scaraude/.openclaw/workspace/Hitch-It/supabase/config.toml)
  - local `site_url` is still `http://127.0.0.1:3000`
  - local `additional_redirect_urls` only allow localhost
  - local `auth.email.enable_confirmations = false`

### Consequence of the current state

The app can send a password reset email, but it cannot safely or consistently finish confirmation or recovery from an incoming email link.

If hosted Supabase Auth falls back to its default site URL, users can be redirected to a browser or `localhost` dead end.

## Constraints

### Product constraints

- Confirmation and reset emails must be custom branded emails.
- Email actions must return the user to the mobile app.
- The flow must avoid browser dead ends and any `localhost` landing.

### Technical constraints

- The app is not using Expo Router, so deep-link routing must be handled through React Navigation and/or a custom URL listener.
- React Native should not rely on browser-style automatic URL session parsing. Keeping `detectSessionInUrl: false` is correct here.
- Supabase hosted Auth settings are configured outside the repo, so repo changes alone are not sufficient.
- Local Supabase CLI config and hosted Supabase dashboard config must not be confused: the dashboard settings control production behavior.

### Operational constraints

- Custom scheme deep links are suitable for development builds and standalone builds.
- For realistic device testing, this should be validated in a dev build or release build, not only in Expo Go.

## Recommended Architecture

### Recommendation

Use Supabase custom email templates that link directly to the app via deep links carrying `token_hash` and `type`, then complete verification inside the app with `supabase.auth.verifyOtp(...)`.

This is the recommended architecture because it:

- avoids redirecting users to `localhost`
- avoids relying on a browser landing page to complete the flow
- fits the current React Navigation stack
- works with the existing `detectSessionInUrl: false` setup
- keeps the flow explicit and testable in app code

### Recommended deep-link routes

Use two explicit routes:

- `hitchit://auth/confirm-email`
- `hitchit://auth/reset-password`

Append Supabase email token data as query params:

- account confirmation: `?token_hash=...&type=email`
- password reset: `?token_hash=...&type=recovery`

### Why `token_hash` instead of `ConfirmationURL`

Supabase supports custom email templates with `{{ .TokenHash }}` and `{{ .RedirectTo }}`. Using those values lets the app receive the token directly and verify it itself.

That is a better fit than sending users to a browser-based Supabase verify URL and hoping the redirect back into the app is configured everywhere correctly.

This is also the cleanest way to avoid the current `localhost` dead-end risk.

## Email Template Strategy

### Confirm signup email template

Recommended CTA target:

```text
{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email
```

Recommended `redirectTo` value passed from the app:

```text
hitchit://auth/confirm-email
```

### Reset password email template

Recommended CTA target:

```text
{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery
```

Recommended `redirectTo` value passed from the app:

```text
hitchit://auth/reset-password
```

### Important note

This recommendation assumes the custom templates use `{{ .RedirectTo }}` plus `{{ .TokenHash }}` instead of the default `{{ .ConfirmationURL }}` button.

If the default `{{ .ConfirmationURL }}` is kept, the user will hit Supabase in the browser first and then rely on redirect configuration to get back into the app. That can work, but it is not the preferred architecture for this ticket.

## Deep-Link Flow: Account Confirmation

### Recommended flow

1. User signs up in the app.
2. App calls `supabase.auth.signUp(...)` with:
   - `options.data.username`
   - `options.emailRedirectTo = 'hitchit://auth/confirm-email'`
3. Supabase sends the custom confirmation email.
4. User taps the email CTA.
5. The email opens `hitchit://auth/confirm-email?token_hash=...&type=email`.
6. The app receives the deep link.
7. The app calls:

```ts
supabase.auth.verifyOtp({
  token_hash,
  type: 'email',
});
```

8. On success, the app lands the user on a confirmation success screen or directly on the login screen with a success message.

### Recommended UX behavior

- Do not navigate to `Home` immediately after sign-up.
- After sign-up success, show a "check your email" state/screen instead.
- After confirmation succeeds, send the user to `Login` or auto-enter the app if product wants that behavior.

### Recommendation for Hitch-It

Prefer:

- sign-up -> "check your email" screen
- confirmation deep link -> verify token -> navigate to `Login` with a success state

That keeps the account creation and first authenticated session separate and avoids surprise auto-login behavior.

## Deep-Link Flow: Password Reset

### Recommended flow

1. User requests password reset in `ForgotPasswordScreen` or `ProfileScreen`.
2. App calls:

```ts
supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'hitchit://auth/reset-password',
});
```

3. Supabase sends the custom recovery email.
4. User taps the email CTA.
5. The email opens `hitchit://auth/reset-password?token_hash=...&type=recovery`.
6. The app receives the deep link.
7. The app calls:

```ts
supabase.auth.verifyOtp({
  token_hash,
  type: 'recovery',
});
```

8. On success, the app navigates to an in-app "set new password" screen.
9. User enters a new password.
10. App calls:

```ts
supabase.auth.updateUser({
  password: newPassword,
});
```

11. On success, show success feedback and route to `Login` or authenticated home as appropriate.

### Why this is needed

The current repo can send recovery emails, but it does not have the deep-link intake path or the password update route needed to finish recovery.

## Provider / Config Changes Needed

### Supabase hosted dashboard changes

These are required for production:

1. Enable email confirmations in Supabase Auth if not already enabled.
2. Set custom email templates for:
   - Confirm signup
   - Reset password
3. Add allowed redirect URLs that cover the app deep links.

Recommended allow-list entries:

- `hitchit://auth/confirm-email`
- `hitchit://auth/reset-password`
- or a broader pattern if the dashboard allows it, such as `hitchit://auth/*`

### Supabase local config changes

If local Supabase email testing is needed later, update [supabase/config.toml](/home/scaraude/.openclaw/workspace/Hitch-It/supabase/config.toml):

- replace localhost `site_url`
- add mobile redirect URLs
- enable confirmations locally

The current local values are not compatible with the desired mobile auth flow:

- `site_url = "http://127.0.0.1:3000"`
- `additional_redirect_urls = ["https://127.0.0.1:3000"]`
- `enable_confirmations = false`

### App constants/env changes recommended

Centralize auth redirect URIs in app code rather than hardcoding them inline.

Recommended constants:

- `AUTH_CONFIRM_EMAIL_REDIRECT_URI = 'hitchit://auth/confirm-email'`
- `AUTH_RESET_PASSWORD_REDIRECT_URI = 'hitchit://auth/reset-password'`

This should live in a shared auth constants file, not inline in service methods.

## App Route Changes Needed

### New route handling required

The app needs explicit handling for incoming auth deep links.

Recommended additions:

1. Add React Navigation linking config or a dedicated global URL listener.
2. Add route(s) for:
   - email confirmation callback handling
   - password reset callback handling
   - password update form
3. Add a small auth-link parsing layer that validates:
   - route
   - `token_hash`
   - `type`

### Recommended app structure

Suggested additions:

- `src/auth/constants.ts`
- `src/auth/utils/authDeepLink.ts`
- `src/screens/AuthEmailConfirmationScreen.tsx`
- `src/screens/ResetPasswordUpdateScreen.tsx`

Suggested updates:

- `src/auth/services/authService.ts`
- `src/auth/context/AuthContext.tsx`
- `src/navigation/RootNavigator.tsx`
- `src/navigation/types.ts`
- `src/screens/SignUpScreen.tsx`
- `src/screens/ForgotPasswordScreen.tsx`
- `src/screens/ProfileScreen.tsx`
- `src/screens/index.ts`

### Service-level API recommended

Add explicit methods such as:

- `verifyEmailConfirmationLink(tokenHash: string)`
- `verifyPasswordRecoveryLink(tokenHash: string)`

These should wrap Supabase and keep URL parsing out of screens.

## Exact Changes Recommended For TCK-53

TCK-53 should implement account confirmation end to end.

### Provider/config work

- Configure Supabase confirm-signup custom email template to use:
  - `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email`
- Add `hitchit://auth/confirm-email` to Supabase redirect allow-list
- Confirm hosted Supabase email confirmation is enabled

### App work

- Add auth redirect constants
- Update `signUp()` to pass `emailRedirectTo`
- Update `resendConfirmationEmail()` to pass `options.emailRedirectTo`
- Add deep-link intake for `hitchit://auth/confirm-email`
- Add token parsing and validation
- Add service method using `supabase.auth.verifyOtp({ token_hash, type: 'email' })`
- Add confirmation success/error screen state
- Change `SignUpScreen` behavior:
  - stop navigating directly to `Home`
  - show "check your email" guidance instead
- Update login flow so post-confirmation users land cleanly on `Login`

### Suggested file targets for TCK-53

- `src/auth/services/authService.ts`
- `src/auth/context/AuthContext.tsx`
- `src/auth/constants.ts`
- `src/auth/utils/authDeepLink.ts`
- `src/navigation/RootNavigator.tsx`
- `src/navigation/types.ts`
- `src/screens/SignUpScreen.tsx`
- `src/screens/LoginScreen.tsx`
- `src/screens/AuthEmailConfirmationScreen.tsx`
- `src/screens/index.ts`

## Exact Changes Recommended For TCK-54

TCK-54 should implement password reset completion end to end.

### Provider/config work

- Configure Supabase reset-password custom email template to use:
  - `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery`
- Add `hitchit://auth/reset-password` to Supabase redirect allow-list

### App work

- Replace the current inline reset redirect string with a shared constant
- Add deep-link intake for `hitchit://auth/reset-password`
- Add recovery token verification via:
  - `supabase.auth.verifyOtp({ token_hash, type: 'recovery' })`
- Add a dedicated "set new password" screen
- Reuse existing `updatePassword()` service method to submit the new password
- Route successful recovery to `Login` or authenticated home per product decision
- Keep `ForgotPasswordScreen` and `ProfileScreen` using the same reset-email service path

### Suggested file targets for TCK-54

- `src/auth/services/authService.ts`
- `src/auth/context/AuthContext.tsx`
- `src/auth/constants.ts`
- `src/auth/utils/authDeepLink.ts`
- `src/navigation/RootNavigator.tsx`
- `src/navigation/types.ts`
- `src/screens/ForgotPasswordScreen.tsx`
- `src/screens/ProfileScreen.tsx`
- `src/screens/ResetPasswordUpdateScreen.tsx`
- `src/screens/index.ts`

## Risks and Edge Cases

### Email client behavior

Some email clients or security scanners can behave differently with auth links. Using direct app deep links with `token_hash` reduces the browser redirect problem, but email-client-specific behavior should still be tested on real devices.

### Missing query params

The app must handle malformed links safely:

- missing `token_hash`
- unexpected `type`
- expired or already-used token

### Expo environment mismatch

If testing is done only in Expo Go, deep-link behavior can be misleading. Validate on a dev build or release build.

### Confirmation mode mismatch between local and hosted Supabase

Local config currently disables email confirmations, while hosted production may require them. That mismatch can hide bugs if not called out during testing.

### Async auth event handling

Current `onAuthStateChange` usage in [src/auth/context/AuthContext.tsx](/home/scaraude/.openclaw/workspace/Hitch-It/src/auth/context/AuthContext.tsx) uses an async callback. Supabase recommends keeping this callback lightweight. TCK-53/TCK-54 should avoid pushing deep-link flow control entirely into that callback.

### Existing profile trigger assumptions

The repo assumes sign-up creates a profile record via database-side behavior. Confirmation-flow changes should not break that assumption and should verify behavior for unconfirmed users.

## Final Recommendation

Implement TCK-53 and TCK-54 around a shared auth deep-link layer that:

- uses explicit deep-link routes under `hitchit://auth/*`
- uses custom Supabase email templates with `{{ .RedirectTo }}` + `{{ .TokenHash }}`
- verifies tokens inside the app with `verifyOtp`
- keeps password update inside a dedicated in-app screen

Do not rely on browser redirects or localhost-based `SITE_URL` behavior for these flows.

## Sources

Official Supabase docs used to validate this recommendation:

- https://supabase.com/docs/guides/auth/native-mobile-deep-linking
- https://supabase.com/docs/guides/auth/auth-email-templates
- https://supabase.com/docs/reference/javascript/auth-signup
- https://supabase.com/docs/reference/javascript/auth-resend
- https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
- https://supabase.com/docs/reference/javascript/auth-verifyotp
- https://supabase.com/docs/guides/auth/redirect-urls
