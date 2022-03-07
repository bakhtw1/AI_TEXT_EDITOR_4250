from transformers import pipeline
from flask import Flask, jsonify, request

app = Flask(__name__)

generator = pipeline('text-generation', model='EleutherAI/gpt-neo-2.7B')

@app.route('/predict', methods=['POST'])
def predict():
    request_data = request.get_json()
    prompt = request_data['prompt']

    print("Generating Output...")
    gen_text = generator(prompt, do_sample=True, min_length=50)
    
    return gen_text[0]['generated_text']

if __name__ == '__main__':
    # run app in debug mode on port 5000
    app.run(debug=True, port=5000)


