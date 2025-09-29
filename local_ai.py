from transformers import pipeline

# نستخدم نموذج صغير لتقليل استهلاك الرام
generator = pipeline("text-generation", model="gpt2")

# جملة البداية (يمكنك تغييرها حسب الاستعمال)
prompt = "اقتراح قرار حكيم لشخص محتار بين شراء سيارة جديدة أو مستعملة:"

# توليد النص
result = generator(prompt, max_length=80, num_return_sequences=1)

print("🔮 القرار الناتج:")
print(result[0]["generated_text"])