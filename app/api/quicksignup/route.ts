import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
    try {
        const { name, location, course, email, phone } = await request.json()

        // Create transporter (configure with your email service)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        })

        // Email to mamapluske@gmail.com
        await transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@mamaplus.co.ke',
            to: 'mamapluske@gmail.com',
            subject: 'New Quick Signup - MamaPlus Training',
            html: `
                <h2>New Quick Signup Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Location:</strong> ${location}</p>
                <p><strong>Preferred Course:</strong> ${course}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><em>Submitted on: ${new Date().toLocaleString()}</em></p>
            `,
        })

        // Confirmation email to user
        await transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@mamaplus.co.ke',
            to: email,
            subject: 'Thank You for Signing Up - MamaPlus Training',
            html: `
                <h2>Thank You for Your Interest!</h2>
                <p>Dear ${name},</p>
                <p>We have received your signup for <strong>${course}</strong>.</p>
                <p>Our team will contact you soon at ${phone} to discuss the next steps.</p>
                <br>
                <p>Best regards,<br>MamaPlus Team</p>
            `,
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Quick signup error:', error)
        return NextResponse.json({ error: 'Failed to process signup' }, { status: 500 })
    }
}
