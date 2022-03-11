from distutils.log import debug
from transformers import GPTNeoForCausalLM, AutoTokenizer
from flask import Flask, jsonify, request
from flask_cors import CORS


MODEL_NAME = 'EleutherAI/gpt-neo-1.3B'

app = Flask(__name__)
CORS(app)

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = GPTNeoForCausalLM.from_pretrained(MODEL_NAME)


@app.route('/prompts', methods=['GET'])
def prompts():
    return jsonify([
        'Generate function body'
    ])


@app.route('/health', methods=['GET'])
def health():
    return ''


@app.route('/predict', methods=['POST'])
def predict():
    request_data = request.get_json()
    prompt = request_data['prompt']

    input_ids = tokenizer(prompt, return_tensors="pt").input_ids

    print("Generating Output...")
    gen_tokens = model.generate(
        input_ids,
        do_sample=True,
        temperature=0.9,
        max_length=100,
    )
    print(gen_tokens)
    gen_text = tokenizer.batch_decode(gen_tokens)[0]
    print("Done")

    return gen_text


if __name__ == '__main__':
    app.run(debug=True, port=5001, use_reloader=False)
