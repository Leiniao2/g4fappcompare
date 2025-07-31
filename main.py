from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

# List of GPT4Free providers with their endpoints
PROVIDERS = {
    "You.com": "https://api.you.com/v1/chat",
    "HuggingChat": "https://huggingface.co/api/chat",
    "Phind": "https://api.phind.com/v1/chat",
    "DeepAI": "https://api.deepai.org/v1/chat",
    "OpenAssistant": "https://api.open-assistant.io/v1/chat"
}

@app.route("/")
def index():
    return render_template("index.html", providers=list(PROVIDERS.keys()))

@app.route("/compare", methods=["POST"])
def compare():
    data = request.json
    message = data.get("message")
    selected_providers = data.get("providers", [])

    if not message or not selected_providers:
        return jsonify({"error": "Message and providers are required"}), 400

    responses = {}
    for provider in selected_providers:
        url = PROVIDERS.get(provider)
        if not url:
            responses[provider] = "Invalid provider"
            continue

        try:
            payload = {
                "model": "gpt-4",
                "prompt": message,
                "max_tokens": 150
            }
            # Normally you'd set headers or API keys if needed
            res = requests.post(url, json=payload, timeout=30)
            res.raise_for_status()
            ai_text = res.json().get("text", "No response")
            responses[provider] = ai_text
        except requests.exceptions.RequestException as e:
            responses[provider] = f"Error: {str(e)}"

    return jsonify({"results": responses})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
