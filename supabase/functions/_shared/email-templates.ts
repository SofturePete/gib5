export function highFiveNotificationTemplate(
  recipientName: string,
  senderName: string,
  message: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .emoji { font-size: 64px; }
    h1 { color: #333; margin: 20px 0; }
    .message { background: #f9f9f9; border-left: 4px solid #6c63ff; padding: 20px; margin: 20px 0; color: #666; }
    .sender { font-weight: bold; color: #6c63ff; }
    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
    .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #6c63ff, #36d1dc); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">🙌</div>
      <h1>Du hast ein High-Five bekommen!</h1>
    </div>
    
    <p>Hallo ${recipientName},</p>
    
    <p><span class="sender">${senderName}</span> hat dir ein High-Five gegeben:</p>
    
    <div class="message">
      "${message}"
    </div>
    
    <p style="text-align: center;">
      <a href="${Deno.env.get('APP_URL') || 'http://localhost:4200'}" class="btn">
        Zur gib5 App
      </a>
    </p>
    
    <div class="footer">
      <p>gib5 - High-Five Recognition System</p>
      <p>Diese Email wurde automatisch versendet.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function weeklyReminderTemplate(
  userName: string,
  missingCount: number
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .emoji { font-size: 64px; }
    h1 { color: #333; margin: 20px 0; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; color: #856404; }
    .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #6c63ff, #36d1dc); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">⏰</div>
      <h1>Erinnerung: High-Five geben!</h1>
    </div>
    
    <p>Hallo ${userName},</p>
    
    <div class="warning">
      <strong>Diese Woche hast du noch kein High-Five gegeben!</strong>
      <p>Jeder sollte mindestens 1 High-Five pro Woche geben, um Kollegen zu würdigen.</p>
    </div>
    
    <p>Nimm dir kurz Zeit und gib deinen Kollegen Anerkennung für ihre tolle Arbeit! 🙌</p>
    
    <p style="text-align: center;">
      <a href="${Deno.env.get('APP_URL') || 'http://localhost:4200'}/give" class="btn">
        Jetzt High-Five geben
      </a>
    </p>
    
    <div class="footer">
      <p>gib5 - High-Five Recognition System</p>
      <p>Du erhältst diese Email jeden Donnerstag, wenn du noch kein High-Five gegeben hast.</p>
    </div>
  </div>
</body>
</html>
  `;
}
