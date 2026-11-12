const { lookup } = require("node:dns/promises");
const nodemailer = require("nodemailer");

const { GMAIL_USER, GMAIL_APP_PASSWORD, CONTACT_INBOX = GMAIL_USER } = process.env;
const { RESEND_API_KEY, RESEND_FROM = "TravelPH <onboarding@resend.dev>" } = process.env;
const resendKey = RESEND_API_KEY?.trim().replace(/^["'“‘]|["'”’]$/g, "").trim();
const emailPattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i;
const gmailConfigured = !RESEND_API_KEY && GMAIL_USER && GMAIL_APP_PASSWORD;

async function sendViaGmail({ replyTo, subject, text }) {
    const servername = "smtp.gmail.com";
    // Use the system resolver while verifying Gmail's hostname over TLS.
    const { address } = await lookup(servername, { family: 4 });
    const mailer = nodemailer.createTransport({
        host: address,
        port: 465,
        secure: true,
        servername,
        auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000
    });
    return mailer.sendMail({
        from: GMAIL_USER,
        to: CONTACT_INBOX,
        replyTo: { address: replyTo },
        subject,
        text
    });
}

async function sendViaResend({ replyTo, subject, text }) {
    // A copied label or line break can make fetch reject the request before it is sent.
    if (!/^re_[A-Za-z0-9._~+\/-]+=*$/.test(resendKey)) {
        const error = new Error("RESEND_API_KEY must contain the Resend token only");
        error.code = "RESEND_CONFIG_INVALID_KEY_FORMAT";
        throw error;
    }

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${resendKey}`,
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
    }).catch((cause) => {
        const error = new Error("Could not reach the Resend email API", { cause });
        const code = cause.cause?.code || cause.cause?.errors?.find(error => error.code)?.code || cause.code;
        const reason = cause.name === "TimeoutError" ? "TIMEOUT" : (code || cause.name);
        error.code = `RESEND_NETWORK_${reason}`;
        throw error;
    });

    if (!response.ok) {
        const error = new Error("Resend rejected the inquiry email");
        const { name } = await response.json().catch(() => null) ?? {};
        const errorNames = [
            "invalid_api_key", "missing_api_key", "restricted_api_key", "validation_error",
            "invalid_from_address", "invalid_access", "daily_quota_exceeded",
            "monthly_quota_exceeded", "rate_limit_exceeded"
        ];
        const detail = errorNames.includes(name) ? ` ${name}` : "";
        error.code = `RESEND_HTTP_${response.status}${detail}`;
        throw error;
    }
}

let sendInquiryEmail = null;
if (RESEND_API_KEY && emailPattern.test(CONTACT_INBOX || "")) {
    sendInquiryEmail = sendViaResend;
    console.info("Inquiry email provider: Resend HTTPS.");
} else if (gmailConfigured) {
    console.info("Inquiry email provider: Gmail SMTP.");
    sendInquiryEmail = sendViaGmail;
} else {
    console.warn("Inquiry emails are disabled. Set RESEND_API_KEY and CONTACT_INBOX, or configure Gmail SMTP.");
}

module.exports = { sendInquiryEmail, emailPattern };
