document.addEventListener("DOMContentLoaded", () => {
    const providers = JSON.parse('{{ providers|tojson|safe }}'); // Injected from Flask
    const providersDiv = document.getElementById("providers");

    // Render provider checkboxes
    providers.forEach(p => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="checkbox" value="${p}"> ${p}`;
        providersDiv.appendChild(label);
        providersDiv.appendChild(document.createElement("br"));
    });

    document.getElementById("compareBtn").addEventListener("click", async () => {
        const message = document.getElementById("userInput").value.trim();
        const selected = Array.from(document.querySelectorAll("#providers input:checked")).map(cb => cb.value);
        const resultsDiv = document.getElementById("results");

        if (!message || selected.length === 0) {
            resultsDiv.innerHTML = "<p>Please enter a message and select at least one provider.</p>";
            return;
        }

        resultsDiv.innerHTML = "Loading...";

        try {
            const res = await fetch("/compare", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, providers: selected })
            });

            const data = await res.json();
            if (data.results) {
                resultsDiv.innerHTML = "";
                for (const [provider, reply] of Object.entries(data.results)) {
                    const div = document.createElement("div");
                    div.className = "provider-result";
                    div.innerHTML = `<strong>${provider}:</strong><p>${reply}</p>`;
                    resultsDiv.appendChild(div);
                }
            } else {
                resultsDiv.innerHTML = `<p>Error: ${data.error}</p>`;
            }
        } catch (err) {
            resultsDiv.innerHTML = `<p>Error: ${err.message}</p>`;
        }
    });
});
