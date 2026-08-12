import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Missing email or code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const host = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com';
    const port = Number(Deno.env.get('SMTP_PORT') || '587');
    const user = Deno.env.get('SMTP_USER');
    const pass = Deno.env.get('SMTP_PASS');
    const from = Deno.env.get('SMTP_FROM') || user;

    if (!user || !pass) {
      return new Response(
        JSON.stringify({ error: 'SMTP credentials not configured in Edge Function environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587/other ports
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: `"BOMA" <${from}>`,
      to: email,
      subject: 'Verify your BOMA email address',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; padding: 24px; border: 1px solid #D7E2EE; border-radius: 16px;">
          <h2 style="color: #0E4C8C; margin-top: 0;">Welcome to BOMA!</h2>
          <p style="color: #5B6B82; font-size: 14px; line-height: 1.6;">Please use the following 6-digit code to verify your email address and continue to the Learning Hub:</p>
          <div style="font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #0E4C8C; background: #E1EBF7; padding: 12px 24px; border-radius: 8px; width: fit-content; margin: 20px 0;">${code}</div>
          <p style="color: #5B6B82; font-size: 12px; margin-top: 24px;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
