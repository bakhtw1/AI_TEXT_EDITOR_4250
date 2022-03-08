from transformers import GPTNeoForCausalLM, GPT2Tokenizer
from flask import Flask, jsonify, request

app = Flask(__name__)
model = GPTNeoForCausalLM.from_pretrained("EleutherAI/gpt-neo-1.3B").to("cuda")
tokenizer = GPT2Tokenizer.from_pretrained("EleutherAI/gpt-neo-1.3B")

@app.route('/predict', methods=['POST'])
def predict():
    request_data = request.get_json()
    prompt = request_data['prompt']
    input_ids = tokenizer(prompt, return_tensors="pt").input_ids.to("cuda")
    
    print("Generating Output...")
    gen_tokens = model.generate(
        input_ids,
        do_sample=True,
        temperature=0.9,
        max_length=100,
    )
    gen_text = tokenizer.batch_decode(gen_tokens)[0]

    return gen_text

if __name__ == '__main__':
    # run app in debug mode on port 5000
    app.run(debug=True, port=5000)

