document.addEventListener("DOMContentLoaded", () => {
    const providersDiv = document.getElementById("providers");
    const resultsDiv = document.getElementById("results");

    // Render provider checkboxes with Bootstrap styling
    providers.forEach(p => {
        const wrapper = document.createElement("div");
        wrapper.className = "form-check";
        wrapper.innerHTML = `
            <input class="form-check-input" type="checkbox" value="${p}" id="${p}">
            <label class="form-check-label" for="${p}">${p}</label>
        `;
        providersDiv.appendChild(wrapper);
    });

    document.getElementById("compareBtn").addEventListener("click", async () => {
        const message = document.getElementById("userInput").value.trim();
        const selected = Array.from(document.querySelectorAll("#providers input:checked")).map(cb => cb.value);

        if (!message || selected.length === 0) {
            resultsDiv.innerHTML = `<div class="alert alert-warning">Please enter a message and select at least one provider.</div>`;
            return;
        }

        resultsDiv.innerHTML = `<div class="text-center text-muted">Loading...</div>`;

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
                    const card = document.createElement("div");
                    card.className = "col-md-6";
                    card.innerHTML = `
                        <div class="card shadow-sm h-100">
                            <div class="card-body">
                                <h5 class="card-title">${provider}</h5>
                                <p class="card-text">${reply}</p>
                            </div>
                        </div>
                    `;
                    resultsDiv.appendChild(card);
                }
            } else {
                resultsDiv.innerHTML = `<div class="alert alert-danger">Error: ${data.error}</div>`;
            }
        } catch (err) {
            resultsDiv.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
        }
    });
});
