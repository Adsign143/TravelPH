(() => {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("contact-status");
    const button = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (button.disabled) return;
        button.disabled = true;
        status.textContent = "Sending…";

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Object.fromEntries(new FormData(form)))
            });

            if (!response.ok) {
                const result = await response.json().catch(() => ({}));
                status.textContent = result.error || "Could not send your message. Please try again.";
                return;
            }

            form.reset();
            status.textContent = "Thanks! We received your message.";
        } catch {
            status.textContent = "Could not send your message. Please try again.";
        } finally {
            button.disabled = false;
        }
    });
})();
