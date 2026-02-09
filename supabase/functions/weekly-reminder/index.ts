// Cron Job: Run every Friday at 14:00 UTC
// Schedule: 0 14 * * 5

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get start of current week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    // Get all users
    const { data: users, error: usersError } = await supabaseClient
      .from('users')
      .select('id, email, name');

    if (usersError) throw usersError;
    if (!users) throw new Error('No users found');

    // Get all high-fives from this week
    const { data: highFives, error: hfError } = await supabaseClient
      .from('high_fives')
      .select('from_user_id')
      .gte('created_at', monday.toISOString());

    if (hfError) throw hfError;

    // Find users who haven't given any high-fives this week
    const usersWhoGave = new Set(highFives?.map(hf => hf.from_user_id) || []);
    const usersNeedingReminder = users.filter(user => !usersWhoGave.has(user.id));

    const emailsSent = [];

    // Send reminder emails
    for (const user of usersNeedingReminder) {
      const emailData = {
        to: user.email,
        subject: '🙌 Reminder: Give a High-Five This Week!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f9ab12;">🙌 High-Five Reminder</h1>
            <p>Hey ${user.name.split(' ')[0]}!</p>
            <p>We noticed you haven't given any high-fives this week yet.</p>
            <p style="background-color: #fef3e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <strong>Remember:</strong> Everyone on the team should give at least one high-five per week to recognize great work! 🌟
            </p>
            <p>Take a moment to appreciate a colleague's contribution:</p>
            <ul style="color: #6b7280;">
              <li>Did someone help you solve a problem?</li>
              <li>Did a teammate deliver excellent work?</li>
              <li>Did someone show great teamwork?</li>
            </ul>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('APP_URL') || 'http://localhost:4200'}/give" 
                 style="background-color: #f9ab12; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Give a High-Five Now
              </a>
            </p>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              Spread the positivity before the weekend! 🎉
            </p>
          </div>
        `
      };

      // TODO: Integrate with your email service
      // Example with Resend:
      // const res = await fetch('https://api.resend.com/emails', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      //   },
      //   body: JSON.stringify({
      //     from: 'gib5 <noreply@yourdomain.com>',
      //     to: emailData.to,
      //     subject: emailData.subject,
      //     html: emailData.html,
      //   }),
      // });

      console.log('Reminder would be sent to:', emailData.to);
      emailsSent.push(emailData.to);

      // Log the email
      await supabaseClient
        .from('email_logs')
        .insert({
          user_id: user.id,
          type: 'reminder'
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Sent ${emailsSent.length} reminder emails`,
        recipients: emailsSent
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
