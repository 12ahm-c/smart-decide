# server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

app = Flask(__name__)
CORS(app)

# تحميل النموذج مرة واحدة عند بدء السيرفر
MODEL_NAME = "tiiuae/falcon-rw-1b"
print("⏳ Loading Falcon model...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
print("✅ Model loaded and ready!")

def generate_response(prompt):
    # تجهيز الإدخال
    inputs = tokenizer(prompt, return_tensors="pt").to(device)

    # توليد النصوص
    output_ids = model.generate(
        **inputs,
        max_new_tokens=150,
        do_sample=True,
        temperature=0.7,
        pad_token_id=tokenizer.eos_token_id,
        repetition_penalty=1.2
    )

    text = tokenizer.decode(output_ids[0], skip_special_tokens=True)

    # تنظيف النص من التكرار المفرط
    lines = text.split("\n")
    unique_lines = []
    for line in lines:
        if line.strip() and line not in unique_lines:
            unique_lines.append(line)
    return " ".join(unique_lines)[:500]  # الحد الأقصى 500 حرف

@app.route("/api/decision", methods=["POST"])
def decision():
    data = request.get_json()
    prompt = data.get("input", "")

    if not prompt:
        return jsonify({"error": "No input provided"}), 400

    try:
        response_text = generate_response(prompt)
        return jsonify({"result": response_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "OK"})

if __name__ == "__main__":
    # بورت 5001 لتوافقه مع React frontend
    app.run(host="127.0.0.1", port=5001, debug=False)