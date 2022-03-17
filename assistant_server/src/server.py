from flask import Flask, jsonify, request
from flask_cors import CORS

import models


app = Flask(__name__)
CORS(app)

model = models.gpt_neo.PT_GPTNeo(
    models.gpt_neo.GPTNeoModelType.medium)


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

    generated = model.generate(prompt)

    return generated


if __name__ == '__main__':
    app.run(debug=True, port=5001, use_reloader=False)
