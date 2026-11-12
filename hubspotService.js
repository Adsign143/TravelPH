
require("dotenv").config();

async function syncContactToHubSpot(booking) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!token) {
    throw new Error("Missing HubSpot access token");
  }

  const email = booking.email.trim().toLowerCase();

  const response = await fetch(
    "https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: [
          {
            id: email,
            idProperty: "email",
            properties: {
              email,
              firstname: booking.firstName,
              lastname: booking.lastName,
              phone: booking.phone
            }
          }
        ]
      }),
      signal: AbortSignal.timeout(10000)
    }
  );

  if (!response.ok) {
    throw new Error(
      `HubSpot sync failed: HTTP ${response.status}`
    );
  }

  const data = await response.json();

  return data.results?.[0];
}

module.exports = { syncContactToHubSpot };
