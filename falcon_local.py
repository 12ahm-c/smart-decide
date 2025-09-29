from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

MODEL_NAME = "tiiuae/falcon-rw-1b"

print("⏳ Loading model...")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)

print("✅ Model loaded!")
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

def generate_response(prompt):
    inputs = tokenizer(prompt, return_tensors="pt").to(device)
    with torch.no_grad():
        output = model.generate(
            **inputs,
            max_new_tokens=100,
            do_sample=False,   # توليد أفضل استمرار مباشر
            pad_token_id=tokenizer.eos_token_id
        )
    response = tokenizer.decode(output[0], skip_special_tokens=True)
    # إزالة النص الأصلي من الرد
    response = response.replace(prompt, "").strip()
    # إزالة التكرار المتكرر
    lines = response.split('\n')
    unique_lines = []
    for line in lines:
        if line not in unique_lines:
            unique_lines.append(line)
    return ' '.join(unique_lines)

while True:
    try:
        user_input = input("\nEnter your request (English only): ")
        if user_input.lower() in ["exit", "quit"]:
            break

        prompt = f"Answer clearly and concisely in English only:\n{user_input}\nAnswer:"
        response = generate_response(prompt)
        print("\n🤖 Model response:\n", response)

    except KeyboardInterrupt:
        print("\nExiting...")
        break