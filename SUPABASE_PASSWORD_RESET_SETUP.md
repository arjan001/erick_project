# Supabase Password Reset Configuration

## Required Supabase Dashboard Configuration

For password reset to work properly, you MUST configure the following in your Supabase project dashboard:

### 1. Site URL
- Go to: Supabase Dashboard → Authentication → URL Configuration
- Set **Site URL** to your production domain (e.g., `https://yourdomain.com`)
- For local development, you can use `http://localhost:5173` (or whatever port Vite uses)

### 2. Redirect URLs
In the same section, add these URLs to **Redirect URLs**:
- `http://localhost:5173/SignIn` (for local development)
- `https://yourdomain.com/SignIn` (for production)
- Any other domains where your app is hosted

### 3. Email Templates (Optional but Recommended)
Go to: Supabase Dashboard → Authentication → Email Templates → Reset Password

You can customize the email template to match your branding.

## How the Password Reset Flow Works

1. **User clicks "Forgot password"** → Enters email
2. **App sends reset request** → `supabase.auth.resetPasswordForEmail(email, { redirectTo: currentOrigin + '/SignIn' })`
3. **Supabase sends email** → Contains link with access token
4. **User clicks email link** → Redirects to `/SignIn#access_token=...&type=recovery`
5. **Supabase auto-detects session** → `detectSessionInUrl: true` in supabase.js
6. **App detects recovery** → Checks URL for `type=recovery` and switches to `update_password` mode
7. **User enters new password** → `supabase.auth.updateUser({ password: newPassword })`
8. **Success** → User redirected to login with new password

## Troubleshooting

### Email not received
- Check spam folder
- Verify email is enabled in Supabase dashboard
- Check SMTP settings if using custom email provider

### Link doesn't work
- Verify redirect URL is configured in Supabase dashboard
- Check browser console for errors
- Ensure `detectSessionInUrl: true` is set in supabase.js

### Password update fails
- Check that user is authenticated (session exists)
- Verify password meets minimum requirements (6+ characters)
- Check browser console for Supabase errors

## Console Logging

The implementation includes console logs to help debug:
- `Sending password reset email with redirect URL: ...`
- `Current origin: ...`
- `Auth state change: ...`
- `PASSWORD_RECOVERY event detected`
- `Signed in via recovery link`

Check browser console (F12) to see these logs during testing.
