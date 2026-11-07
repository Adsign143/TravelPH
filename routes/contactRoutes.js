const express = require("express");
const mongoose = require("mongoose");
const { sendInquiryEmail, emailPattern } = require("../sendInquiryEmail");

const router = express.Router();
const messages = mongoose.connection.useDb("TravelPH", { useCache: true }).collection("messages");
const clean = (value) => typeof value === "string" ? value.trim() : "";

router.post("/", async (req, res) => {
    const { name, email, message } = req.body ?? {};
    const entry = {
        name: clean(name),
        email: clean(email),
        message: clean(message),
        createdAt: new Date()
    };

    if (!entry.name || entry.name.length > 100 || entry.email.length > 200 ||
        !emailPattern.test(entry.email) || !entry.message || entry.message.length > 1500) {
        return res.status(400).json({ error: "Enter a valid name, email, and message." });
    }

    let saved;
    try {
        saved = await messages.insertOne(entry);
    } catch (error) {
        console.error("Could not save contact message:", error.name);
        return res.status(503).json({ error: "Could not save your message. Please try again." });
    }

    if (sendInquiryEmail) {
        try {
            await sendInquiryEmail({
                replyTo: entry.email,
                subject: "New TravelPH inquiry",
                text: `Name: ${entry.name}\nEmail: ${entry.email}\n\n${entry.message}`
            });
        } catch (error) {
            console.error(`Email notification failed for contact message ${saved.insertedId}:`, error.code || error.name);
        }
    }

    return res.status(201).json({ ok: true });
});

module.exports = router;
