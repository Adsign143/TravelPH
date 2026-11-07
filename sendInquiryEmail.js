const nodemailer = require("nodemailer");

const { GMAIL_USER, GMAIL_APP_PASSWORD, CONTACT_INBOX = GMAIL_USER } = process.env;
const emailPattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i;
const mailer = GMAIL_USER && GMAIL_APP_PASSWORD ? nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    connectionTimeout: 10000,
    socketTimeout: 15000
}) : null;

if (!mailer) {
    console.warn("Inquiry emails are disabled until GMAIL_USER and GMAIL_APP_PASSWORD are set.");
}

const sendInquiryEmail = mailer && (({ replyTo, subject, text }) => mailer.sendMail({
    from: GMAIL_USER,
    to: CONTACT_INBOX,
    replyTo: { address: replyTo },
    subject,
    text
}));

module.exports = { sendInquiryEmail, emailPattern };
