const nodemailer = require("nodemailer");

const { GMAIL_USER, GMAIL_APP_PASSWORD, CONTACT_INBOX = GMAIL_USER } = process.env;
const { RESEND_API_KEY, RESEND_FROM = "TravelPH <onboarding@resend.dev>" } = process.env;
const emailPattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i;
const mailer = !RESEND_API_KEY && GMAIL_USER && GMAIL_APP_PASSWORD ? nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    connectionTimeout: 10000,
    socketTimeout: 15000
}) : null;

async function sendViaResend({ replyTo, subject, text }) {
    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            from: RESEND_FROM,
            to: [CONTACT_INBOX],
            reply_to: replyTo,
            subject,
            text
        }),
        signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
        const error = new Error("Resend rejected the inquiry email");
        error.code = `RESEND_HTTP_${response.status}`;
        throw error;
    }
}

let sendInquiryEmail = null;
if (RESEND_API_KEY && emailPattern.test(CONTACT_INBOX || "")) {
    sendInquiryEmail = sendViaResend;
} else if (mailer) {
    sendInquiryEmail = ({ replyTo, subject, text }) => mailer.sendMail({
        from: GMAIL_USER,
        to: CONTACT_INBOX,
        replyTo: { address: replyTo },
        subject,
        text
    });
} else {
    console.warn("Inquiry emails are disabled. Set RESEND_API_KEY and CONTACT_INBOX, or configure Gmail SMTP.");
}

module.exports = { sendInquiryEmail, emailPattern };
