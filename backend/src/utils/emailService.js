const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

function buildEmailLayout({title, greeting, intro, content, actionText, actionUrl, footerNote }){
    return `
    <!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>${title}</title>
</head>
<body style="background-color:#f4f4f7; font-family:Arial color:#333;">
<div style="max-width:400px; margin:40px auto; background:#ffffff;border-radius:10px; overflow:hidden; box-shadow:0 2px 8px;">
    <div style="background:#1f2937; color:#ffffff; padding:24px; text-align:center;">
        <h1 style="margin:0; font-size:24px;">Restaurant Booking System</h1>
    </div>
    <div style="padding:32px 24px;">
        <h2 style="margin-top:0; color:#111827;">${greeting}</h2>
        <p style="font-size:15px; line-height:1.6;">${intro}</p>
        <div style="margin:24px 0; padding:20px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px;">
            ${content}
        </div>
        ${
        actionUrl && actionText
        ? `
        <div style="text-align:center; margin:30px 0;">
            <a href="${actionUrl}" style="display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; padding:12px 22px; border-radius:6px; font-weight:bold;">
            ${actionText}
</a>
        </div>` : ""
    }
        <p style="font-size:15px; line-height:1.6; color:#6b7280">
            ${footerNote || "automatic message for any user insert here"}
</p>
    </div>
    <div style="background:#f3f4f6; padding:16px 24px; text-align:center; font-size:12px; color:#61dafb;">
    sim25@student.le.ac.uk ${new Date().getFullYear()} Restaurant Booking System
</div>
</div>
</body>
</html>`;
}
async function sendEmail({ to, subject, text, html }) {
    try{
    console.log("EMAIL_USER loaded?", !!process.env.EMAIL_USER);
    console.log("EMAIL_PASS loaded?", !!process.env.EMAIL_PASS);
    console.log("EMAIL_USER value:", process.env.EMAIL_USER);
    const info = await transporter.sendMail({
        from: `"Restaurant Booking System" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
    });


    console.log("Email sent:", info.messageId);
    return info;
} catch (error) {
        console.error("failed tosend email:", error);
        throw error;
    }
}
module.exports = {sendEmail, buildEmailLayout,};