import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { to, subject, body, toName } = await req.json();
    if (!to || !subject || !body) {
      return Response.json({ error: 'to, subject and body are required' }, { status: 400 });
    }

    const settingsRows = await base44.asServiceRole.entities.SystemSetting.list();
    const settings = settingsRows?.[0] || {};
    const provider = settings.email_provider || 'brevo';
    const senderEmail = settings.email_sender_address || 'no-reply@studio22.com';
    const senderName = settings.email_sender_name || 'Studio22';

    if (provider === 'resend') {
      const apiKey = Deno.env.get('RESEND_API_KEY');
      if (!apiKey) return Response.json({ error: 'RESEND_API_KEY is not configured' }, { status: 500 });

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `${senderName} <${senderEmail}>`,
          to: [to],
          subject,
          html: body,
        }),
      });
      const data = await res.json();
      if (!res.ok) return Response.json({ error: data.message || 'Resend request failed' }, { status: 502 });
      return Response.json({ success: true, provider: 'resend', id: data.id });
    }

    // Default: Brevo
    const apiKey = Deno.env.get('BREVO_API_KEY');
    if (!apiKey) return Response.json({ error: 'BREVO_API_KEY is not configured' }, { status: 500 });

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: to, name: toName || to }],
        subject,
        htmlContent: body,
      }),
    });
    const data = await res.json();
    if (!res.ok) return Response.json({ error: data.message || 'Brevo request failed' }, { status: 502 });
    return Response.json({ success: true, provider: 'brevo', id: data.messageId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});