const express = require("express");
const Booking = require("../models/booking");
const { sendInquiryEmail, emailPattern } = require("../sendInquiryEmail");

const router = express.Router();
const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" });
const clean = (value) => typeof value === "string" ? value.trim() : "";

router.post("/inquiry", async (req, res) => {
    const body = req.body ?? {};
    const firstName = clean(body.firstName);
    const lastName = clean(body.lastName);
    const email = clean(body.email);
    const phone = clean(body.phone);
    const destination = clean(body.destination);
    const notes = clean(body.notes);
    const date = clean(body.date);
    const travelers = Number(clean(body.travelers));
    const departure = new Date(date + "T00:00:00Z");

    if (!firstName || firstName.length > 80 || !lastName || lastName.length > 80 ||
        email.length > 200 || !emailPattern.test(email) || !phone || phone.length > 40 ||
        !destination || destination.length > 100 || notes.length > 1500 ||
        !Number.isInteger(travelers) || travelers < 1 || travelers > 50 ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(departure.getTime()) ||
        departure.toISOString().slice(0, 10) !== date) {
        return res.status(400).json({ error: "Please check your booking details and departure date." });
    }

    if (!sendInquiryEmail) {
        return res.status(503).json({ error: "Booking email is unavailable right now. Please try again later." });
    }

    try {
        await sendInquiryEmail({
            replyTo: email,
            subject: "New TravelPH booking inquiry",
            text: [
                `Name: ${firstName} ${lastName}`,
                `Email: ${email}`,
                `Phone: ${phone}`,
                `Destination: ${destination}`,
                `Preferred departure: ${dateFormat.format(departure)}`,
                `Travelers: ${travelers}`,
                "",
                `Notes: ${notes || "None"}`
            ].join("\n")
        });
        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error("Could not email booking inquiry:", error.code || error.name);
        return res.status(502).json({ error: "Could not send your booking inquiry. Please try again." });
    }
});

// CREATE BOOKING
router.post("/", async (req, res) => {
    try {
        const booking = new Booking(req.body);

        const savedBooking = await booking.save();

        res.status(201).json({
            message: "Booking created successfully!",
            booking: savedBooking
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create booking",
            error: error.message
        });
    }
});

module.exports = router;
