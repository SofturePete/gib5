import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendEmail } from '../_shared/smtp.ts';
import { highFiveNotificationTemplate } from '../_shared/email-templates.ts';

serve(async (req) => {
  try {
    const { record } = await req.json();
    
    // Supabase Client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Hole Empfänger & Sender Daten
    const { data: recipient } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', record.to_user_id)
      .single();
    
    const { data: sender } = await supabase
      .from('users')
      .select('name')
      .eq('id', record.from_user_id)
      .single();
    
    if (!recipient || !sender) {
      throw new Error('User not found');
    }
    
    // Email senden
    const html = highFiveNotificationTemplate(
      recipient.name,
      sender.name,
      record.message
    );
    
    await sendEmail(
      recipient.email,
      `🙌 ${sender.name} hat dir ein High-Five gegeben!`,
      html
    );
    
    // Log erstellen
    await supabase.from('email_logs').insert({
      user_id: record.to_user_id,
      type: 'notification'
    });
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
