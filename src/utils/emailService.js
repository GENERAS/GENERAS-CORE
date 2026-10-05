// src/utils/emailService.js

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const FROM_EMAIL = import.meta.env.VITE_FROM_EMAIL;
const APP_URL = import.meta.env.VITE_APP_URL;

// Email templates
const templates = {
  // User gets this immediately after applying
  applicationReceived: (data) => ({
    subject: `Application Received: ${data.service_title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .reference { background: #e5e7eb; padding: 10px; font-family: monospace; font-size: 16px; text-align: center; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Received! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${data.full_name}</strong>,</p>
            <p>Thank you for applying for <strong>${data.service_title}</strong>. I've received your application and will review it shortly.</p>
            
            <h3>Your Application Details:</h3>
            <p><strong>Service:</strong> ${data.service_title}</p>
            <p><strong>Amount:</strong> $${data.amount}</p>
            <p><strong>Payment Method:</strong> ${data.payment_method?.toUpperCase()}</p>
            
            <div class="reference">
              <strong>Your Reference Code:</strong><br>
              ${data.reference_code}
            </div>
            
            <h3>Next Steps:</h3>
            <ol>
              <li>Send payment to <strong>MTN: 0788XXXXXX</strong> or <strong>Airtel: 0788XXXXXX</strong></li>
              <li>Use the reference code above when sending payment</li>
              <li>Upload your payment screenshot in the application form</li>
              <li>I'll verify your payment within 24 hours</li>
            </ol>
            
            <a href="${APP_URL}/dashboard" class="button">Track Your Application</a>
            
            <p>If you have any questions, reply to this email or WhatsApp me at +250 788 123 456.</p>
            
            <p>Best regards,<br><strong>GENERAS CORE</strong></p>
          </div>
          <div class="footer">
            <p>You received this email because you applied for a service on GENERAS CORE.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // User gets this when payment is verified
  paymentVerified: (data) => ({
    subject: `✅ Payment Verified - ${data.service_title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-badge { background: #d1fae5; color: #065f46; padding: 10px; text-align: center; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Verified! ✅</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${data.full_name}</strong>,</p>
            
            <div class="success-badge">
              <strong>✓ Your payment of $${data.amount} has been verified!</strong>
            </div>
            
            <h3>What happens next?</h3>
            <ol>
              <li>I will contact you within <strong>24 hours</strong> to schedule your first session</li>
              <li>We'll find a time that works for you</li>
              <li>Sessions are conducted via video call (Zoom/Google Meet)</li>
              <li>Each session is recorded and shared with you</li>
            </ol>
            
            <a href="${APP_URL}/dashboard" class="button">View Your Dashboard</a>
            
            <p>While waiting, feel free to:</p>
            <ul>
              <li>Prepare any questions you want to ask</li>
              <li>Set up your trading platform (if applicable)</li>
              <li>Think about your specific goals</li>
            </ul>
            
            <p>Best regards,<br><strong>GENERAS CORE</strong></p>
          </div>
          <div class="footer">
            <p>Payment verified on ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Admin gets notification for new application
  adminNewApplication: (data) => ({
    subject: `🔔 NEW APPLICATION: ${data.service_title} from ${data.full_name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 20px; }
          .info-box { background: #e5e7eb; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Application! 🔔</h1>
          </div>
          <div class="content">
            <h2>${data.full_name}</h2>
            
            <div class="info-box">
              <p><strong>Service:</strong> ${data.service_title}</p>
              <p><strong>Amount:</strong> $${data.amount}</p>
              <p><strong>Payment Status:</strong> ${data.payment_status}</p>
              <p><strong>Reference:</strong> ${data.reference_code}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Phone:</strong> ${data.phone}</p>
            </div>
            
            <a href="${APP_URL}/admin" class="button">Go to Admin Panel</a>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // User gets reminder to complete payment
  paymentReminder: (data) => ({
    subject: `Reminder: Complete Your Payment for ${data.service_title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #d97706; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 20px; }
          .reference { background: #fef3c7; padding: 10px; font-family: monospace; text-align: center; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Reminder ⏰</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${data.full_name}</strong>,</p>
            <p>This is a reminder to complete your payment for <strong>${data.service_title}</strong>.</p>
            
            <div class="reference">
              <strong>Your Reference Code:</strong><br>
              ${data.reference_code}
            </div>
            
            <h3>Payment Instructions:</h3>
            <ol>
              <li>Send $${data.amount} to <strong>MTN: 0788XXXXXX</strong></li>
              <li>Use the reference code above</li>
              <li>Upload your payment screenshot</li>
            </ol>
            
            <p>Once verified, we can schedule your first session!</p>
            
            <p>Questions? Reply to this email or WhatsApp me.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}),

  // Contact form submission - user confirmation
  contactFormReceived: (data) => ({
    subject: 'Message Received - GENERAS CORE',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Message Received!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${data.name}</strong>,</p>
            <p>Thank you for reaching out! I have received your message and will get back to you within <strong>24-48 hours</strong>.</p>
            <p>Best regards,<br><strong>GENERAS CORE</strong></p>
          </div>
          <div class="footer">
            <p>You received this email because you submitted a contact form on GENERAS CORE.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Contact form submission - admin notification
  contactFormAdminNotification: (data) => ({
    subject: 'NEW CONTACT FORM: GENERAS CORE',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 20px; }
          .info-box { background: #e5e7eb; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Submission!</h1>
          </div>
          <div class="content">
            <h2>${data.name}</h2>
            <div class="info-box">
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p><strong>Message:</strong></p>
            <blockquote style="background: #e5e7eb; padding: 15px; border-left: 4px solid #2563eb; margin: 10px 0;">
              ${data.message}
            </blockquote>
            <a href="mailto:${data.email}" class="button">Reply to ${data.name}</a>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function
export const sendEmail = async (to, subject, html) => {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: to,
        subject: subject,
        html: html
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Email send error:', data);
      return { success: false, error: data };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Send application received email to user
export const sendApplicationReceivedEmail = async (userData) => {
  const template = templates.applicationReceived(userData);
  return await sendEmail(userData.email, template.subject, template.html);
};

// Send payment verified email to user
export const sendPaymentVerifiedEmail = async (userData) => {
  const template = templates.paymentVerified(userData);
  return await sendEmail(userData.email, template.subject, template.html);
};

// Send admin notification for new application
export const sendAdminNewApplicationEmail = async (appData) => {
  const template = templates.adminNewApplication(appData);
  return await sendEmail(ADMIN_EMAIL, template.subject, template.html);
};

// Send payment reminder email
export const sendPaymentReminderEmail = async (userData) => {
  const template = templates.paymentReminder(userData);
  return await sendEmail(userData.email, template.subject, template.html);
};

// Send project inquiry received email
export const sendProjectInquiryEmail = async (inquiryData) => {
  const template = {
    subject: `Project Inquiry Received: ${inquiryData.project_type}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:linear-gradient(135deg,#2563eb,#1e40af);color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0}.content{background:#f9fafb;padding:30px}</style></head>
      <body><div class="container"><div class="header"><h1>Inquiry Received!</h1></div><div class="content"><p>Hi <strong>${inquiryData.full_name}</strong>,</p><p>Thank you for your project inquiry regarding <strong>${inquiryData.project_type}</strong>. I'll review your requirements and get back to you within 24-48 hours.</p><p>Best regards,<br><strong>GENERAS CORE</strong></p></div></div></body>
      </html>`
  };
  return await sendEmail(inquiryData.email, template.subject, template.html);
};

// Send admin notification for project inquiry
export const sendAdminProjectInquiryEmail = async (inquiryData) => {
  const template = {
    subject: `🔔 NEW PROJECT INQUIRY: ${inquiryData.project_type} from ${inquiryData.full_name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .info-box { background: #e5e7eb; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Project Inquiry! 🔔</h1>
          </div>
          <div class="content">
            <h2>${inquiryData.full_name}</h2>
            <div class="info-box">
              <p><strong>Project Type:</strong> ${inquiryData.project_type}</p>
              <p><strong>Budget:</strong> ${inquiryData.budget_range}</p>
              <p><strong>Timeline:</strong> ${inquiryData.timeline}</p>
              <p><strong>Email:</strong> ${inquiryData.email}</p>
              <p><strong>Phone:</strong> ${inquiryData.phone}</p>
            </div>
            <p><strong>Description:</strong></p>
            <p>${inquiryData.description}</p>
            <a href="${APP_URL}/admin" class="button">Go to Admin Panel</a>
          </div>
        </div>
      </body>
      </html>
    `
  };
  return await sendEmail(ADMIN_EMAIL, template.subject, template.html);
};

// Send contact form confirmation to user
export const sendContactFormConfirmation = async (contactData) => {
  const template = templates.contactFormReceived(contactData);
  return await sendEmail(contactData.email, template.subject, template.html);
};

// Send admin notification for contact form
export const sendAdminContactNotification = async (contactData) => {
  const template = templates.contactFormAdminNotification(contactData);
  return await sendEmail(ADMIN_EMAIL, template.subject, template.html);
};

const collabTypeLabel = (value) =>
  ({
    new_project: 'Project that needs building',
    idea: 'Idea or prototype to validate',
    partnership: 'Partnership or joint venture',
    freelance: 'Freelance or contract work',
    internship: 'Internship or junior developer role',
    open_source: 'Open source contribution',
    mentorship: 'Mentorship or coaching',
    other: 'Something else',
  })[value] || value;

// Confirmation email for the person who sent a collaboration proposal
export const sendCollaborationRequestConfirmation = async (collab) => {
  const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B2436; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 22px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .title { font-size: 16px; font-weight: bold; color: #3B2436; margin-bottom: 4px; }
          .meta { color: #6b7280; font-size: 14px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
          .button { display: inline-block; background: #eab308; color: #1f2937; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Proposal received</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${collab.full_name}</strong>,</p>
            <p>Thanks for sending this over. Your proposal landed straight in my dashboard and I read every one personally.</p>

            <p class="title">${collab.project_title}</p>
            <p class="meta">${collabTypeLabel(collab.collaboration_type)}${collab.budget_range ? ` · ${collab.budget_range}` : ''}${collab.timeline ? ` · ${collab.timeline}` : ''}</p>

            <h3>What happens next</h3>
            <ol>
              <li>I review the proposal and check whether there is a realistic path to a first version.</li>
              <li>If there is a fit, you get a reply with questions or a call, usually within 48 hours.</li>
              <li>We then agree a short written scope: what v1 includes, who owns what, and how we work together.</li>
            </ol>

            <p>While you wait, have a look at what I have already built:</p>
            <p><a href="${APP_URL}/projects" class="button">See my projects</a></p>

            <p>Best regards,<br><strong>GENERAS CORE</strong></p>
            <p style="font-size:12px;color:#6b7280">Need to add something? Just reply to this email: ${ADMIN_EMAIL}</p>
          </div>
          <div class="footer">Generas Core - Software, AI and business systems.</div>
        </div>
      </body>
      </html>`;
  return await sendEmail(collab.email, `Proposal received: ${collab.project_title}`, html);
};

// Admin notification when a new collaboration proposal arrives
export const sendAdminCollaborationNotification = async (collab) => {
  const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B2436; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .info-box { background: #e5e7eb; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New collaboration proposal</h1>
          </div>
          <div class="content">
            <h2>${collab.full_name}${collab.company ? ` - ${collab.company}` : ''}</h2>
            <div class="info-box">
              <p><strong>Type:</strong> ${collabTypeLabel(collab.collaboration_type)}</p>
              <p><strong>Project:</strong> ${collab.project_title}</p>
              <p><strong>Budget:</strong> ${collab.budget_range || 'Not stated'}</p>
              <p><strong>Timeline:</strong> ${collab.timeline || 'Not stated'}</p>
              <p><strong>Tech:</strong> ${collab.tech_stack || 'Not stated'}</p>
              <p><strong>Email:</strong> ${collab.email}</p>
              <p><strong>Phone:</strong> ${collab.phone || 'Not given'}</p>
              ${collab.links ? `<p><strong>Links:</strong> ${collab.links}</p>` : ''}
            </div>
            <p><strong>The proposal:</strong></p>
            <p>${collab.project_summary}</p>
            ${collab.what_they_bring ? `<p><strong>What they bring:</strong></p><p>${collab.what_they_bring}</p>` : ''}
            <p><a href="${APP_URL}/admin" style="display:inline-block;background:#eab308;color:#1f2937;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold">Open in the dashboard</a></p>
          </div>
        </div>
      </body>
      </html>`;
  return await sendEmail(
    ADMIN_EMAIL,
    `NEW COLLABORATION: ${collab.project_title} (${collab.full_name})`,
    html
  );
};

// Quote request emails (services page "Get a quote" form)
export const sendServiceQuoteConfirmation = async (quote) => {
  const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B2436; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 22px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .title { font-size: 16px; font-weight: bold; color: #3B2436; margin-bottom: 4px; }
          .meta { color: #6b7280; font-size: 14px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your quote request is in</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${quote.full_name}</strong>,</p>
            <p>Thanks for reaching out. Nothing has been charged. I read every request myself and you will get a written quote with scope, price and timeline, usually within 24-48 hours.</p>

            <p class="title">${quote.service_title || 'Custom build'}</p>
            <p class="meta">${quote.budget_band ? `Budget: ${quote.budget_band} · ` : ''}${quote.deadline ? `Timing: ${quote.deadline}` : 'Timing: flexible'}</p>

            <h3>What happens next</h3>
            <ol>
              <li>I review what you described and check it is something I can deliver well.</li>
              <li>You get a written quote by email: what is included, what it costs, how long it takes.</li>
              <li>You decide. No deposit is taken until you say yes.</li>
            </ol>

            <p style="font-size:12px;color:#6b7280">Quote reference: <strong>${quote.quote_id}</strong></p>
            <p>Best regards,<br><strong>GENERAS CORE</strong></p>
            <p style="font-size:12px;color:#6b7280">Need it sooner? WhatsApp +250 794 144 738</p>
          </div>
          <div class="footer">Generas Core - Software, AI and business systems.</div>
        </div>
      </body>
      </html>`;
  return await sendEmail(quote.email, `Quote request received (${quote.quote_id})`, html);
};

export const sendAdminServiceQuoteNotification = async (quote) => {
  const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B2436; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .info-box { background: #e5e7eb; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New quote request</h1>
          </div>
          <div class="content">
            <h2>${quote.service_title || 'Custom build'} - ${quote.full_name}</h2>
            <div class="info-box">
              <p><strong>Reference:</strong> ${quote.quote_id}</p>
              <p><strong>Budget:</strong> ${quote.budget_band || 'Not stated'}</p>
              <p><strong>Deadline:</strong> ${quote.deadline || 'Not stated'}</p>
              <p><strong>Email:</strong> ${quote.email}</p>
              <p><strong>Phone:</strong> ${quote.phone || 'Not given'}</p>
              ${quote.company ? `<p><strong>Business:</strong> ${quote.company}</p>` : ''}
            </div>
            <p><strong>What they want:</strong></p>
            <p>${quote.project_summary}</p>
            ${quote.current_problem ? `<p><strong>What is failing today:</strong></p><p>${quote.current_problem}</p>` : ''}
            <p><a href="${APP_URL}/admin" style="display:inline-block;background:#eab308;color:#1f2937;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold">Quote it in the dashboard</a></p>
          </div>
        </div>
      </body>
      </html>`;
  return await sendEmail(
    ADMIN_EMAIL,
    `NEW QUOTE REQUEST: ${quote.service_title || 'Custom build'} (${quote.full_name})`,
    html
  );
};

export default {
  sendEmail,
  sendApplicationReceivedEmail,
  sendPaymentVerifiedEmail,
  sendAdminNewApplicationEmail,
  sendPaymentReminderEmail,
  sendProjectInquiryEmail,
  sendAdminProjectInquiryEmail,
  sendContactFormConfirmation,
  sendAdminContactNotification,
  sendCollaborationRequestConfirmation,
  sendAdminCollaborationNotification,
  sendServiceQuoteConfirmation,
  sendAdminServiceQuoteNotification
};