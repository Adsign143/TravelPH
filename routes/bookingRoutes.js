
const express = require("express");
const Booking = require("../models/booking");
const {
  sendInquiryEmail,
  emailPattern
} = require("../sendInquiryEmail");

const {
  syncContactToHubSpot
} = require("../hubspotService");

const router = express.Router();

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "long",
  timeZone: "UTC"
});

const clean = (value) =>
  typeof value === "string" ? value.trim() : "";

// =====================================
// BOOKING INQUIRY
// =====================================

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

  // Validate booking information
  if (
    !firstName || firstName.length > 80 ||
    !lastName || lastName.length > 80 ||
    email.length > 200 ||
    !emailPattern.test(email) ||
    !phone || phone.length > 40 ||
    !destination || destination.length > 100 ||
    notes.length > 1500 ||
    !Number.isInteger(travelers) ||
    travelers < 1 || travelers > 50 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(departure.getTime()) ||
    departure.toISOString().slice(0, 10) !== date
  ) {
    return res.status(400).json({
      error: "Please check your booking details."
    });
  }

  let emailFailed = false;
  if (sendInquiryEmail) {
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
      console.log("Booking inquiry email sent.");
    } catch (error) {
      emailFailed = true;
      console.error("Booking email failed:", error.code || error.message);
    }
  }

  // HubSpot stores contact details. The email carries the full inquiry.
  let hubspotSynced = false;

  try {
    const contact = await syncContactToHubSpot({
      firstName,
      lastName,
      email,
      phone
    });

    if (!contact?.id) {
      throw new Error("HubSpot did not return a contact ID");
    }
    hubspotSynced = true;
    console.log("HubSpot contact synchronized:", contact.id);

  } catch (error) {
    console.error(
      "HubSpot synchronization failed:",
      error.message
    );
  }

  if (!sendInquiryEmail) {
    return res.status(503).json({
      error: "Booking email is unavailable right now."
    });
  }
  if (emailFailed) {
    return res.status(502).json({
      error: "Could not send your booking inquiry. Please try again."
    });
  }


  return res.status(200).json({
    ok: true,
    message: "Booking inquiry received successfully.",
    hubspotSynced
  });
});

// =====================================
// CREATE BOOKING IN MONGODB
// =====================================

router.post("/", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    const savedBooking = await booking.save();

    return res.status(201).json({
      message: "Booking created successfully!",
      booking: savedBooking
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to create booking",
      error: error.message
    });
  }
});

module.exports = router;
