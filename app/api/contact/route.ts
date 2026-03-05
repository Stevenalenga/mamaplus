import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const enquiriesEmail = process.env.ENQUIRIES_EMAIL || 'mamapluske@gmail.com'
    const safeName = escapeHtml(String(name))
    const safeEmail = escapeHtml(String(email))
    const safePhone = escapeHtml(String(phone || 'Not provided'))
    const safeSubject = escapeHtml(String(subject))
    const safeMessage = escapeHtml(String(message)).replace(/\n/g, '<br/>')

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@mamaplus.co.ke',
      to: enquiriesEmail,
      replyTo: email,
      subject: `New Enquiry: ${subject}`,
      html: `
        <h2>New Contact Enquiry</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Phone:</strong> ${safePhone}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <p><strong>Message:</strong><br/>${safeMessage}</p>
        <p><em>Submitted on: ${new Date().toLocaleString()}</em></p>
      `,
    })

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@mamaplus.co.ke',
      to: email,
      subject: 'Thank You for Contacting MamaPlus',
      html: `
        <h2>Thank You for Your Enquiry</h2>
        <p>Dear ${safeName},</p>
        <p>We have received your message about <strong>${safeSubject}</strong>.</p>
        <p>Our team will review your enquiry and get back to you shortly.</p>
        <br>
        <p>Best regards,<br>MamaPlus Team</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact enquiry error:', error)
    return NextResponse.json({ error: 'Failed to process enquiry' }, { status: 500 })
  }
}
