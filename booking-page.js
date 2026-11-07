(() => {
    const form = document.getElementById("checkoutForm");
    const destination = document.getElementById("tripDestination");
    const selected = new URLSearchParams(window.location.search).get("destination");
    const hasSelectedDestination = Array.from(destination.options).some(option => option.value === selected);
    if (hasSelectedDestination) {
        destination.value = selected;
    }

    const today = new Date();
    document.getElementById("tripDate").min = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    const status = document.getElementById("booking-status");
    const button = form.querySelector('button[type="submit"]');
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (button.disabled) return;
        button.disabled = true;
        status.textContent = "Sending your booking inquiry…";

        try {
            const response = await fetch(form.action, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Object.fromEntries(new FormData(form)))
            });

            if (!response.ok) {
                const result = await response.json().catch(() => ({}));
                status.textContent = result.error || "Could not send your booking inquiry. Please try again.";
                return;
            }

            form.reset();
            if (hasSelectedDestination) destination.value = selected;
            status.textContent = "Thanks! Your booking inquiry was sent.";
        } catch {
            status.textContent = "Could not send your booking inquiry. Please try again.";
        } finally {
            button.disabled = false;
        }
    });
})();
