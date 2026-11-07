const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const bookingRoutes = require("./routes/bookingRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error.name, error.code || "");
    });

app.use("/api/bookings", bookingRoutes);
app.use("/api/contact", contactRoutes);

// Keep server files and credentials outside the public routes.
app.use("/Photos", express.static(path.join(__dirname, "Photos")));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
for (const file of [
    "index.html", "about.html", "Book.html", "destination.html",
    "style.css", "inner-pages.css", "script.js", "booking-page.js", "contact.js"
]) {
    app.get("/" + file, (req, res) => res.sendFile(path.join(__dirname, file)));
}

// Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
