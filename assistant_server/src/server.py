from flask import Flask, jsonify, request
from flask_cors import CORS
import threading
import time
import sys

from models import RealtimeModel, FullGenerationModel
from database import Result, db
import openai 


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
    db.init_app(app)

    db.create_all(app=app)

    return app


app = create_app()

rt_model = RealtimeModel.auto()
full_model = FullGenerationModel.auto()


@app.route('/prompts', methods=['GET'])
def prompts():
    return jsonify([
        'Perform Code Completion',
        'Generate Code Documentation',
    ])


@app.route('/health', methods=['GET'])
def health():
    return ''


@app.route('/quick-predict', methods=['POST'])
def quick_predict():
    request_data = request.get_json()
    prompt = request_data['prompt']

    if len(prompt) == 0:
        return '', 400

    results = rt_model.get_suggestions(prompt)

    return jsonify(results)


@app.route('/predict', methods=['POST'])
def predict():
    request_data = request.get_json()
    prompt = request_data['prompt']

    generated = full_model.generate(prompt)

    r = Result(
        prompt=prompt,
        output=generated)

    db.session.add(r)
    db.session.commit()

    return generated


# @app.route('/predictOpenAI', methods=['POST'])
# def useOpenAI():
#     request_data = request.get_json()
#     data = request_data['prompt']
#     engine = request_data['engine']
#     secret = request_data['secret']

#     openai.api_key = secret

#     response = openai.Completion.create(
#       engine=engine,
#       prompt=data,
#       temperature=0,
#       max_tokens=len(data)*2,
#       top_p=1.0,
#       frequency_penalty=0.0,
#       presence_penalty=0.0,
#     )

#     return response


@app.route('/oai-document', methods=['POST'])
def document():
    request_data = request.get_json()
    data = request_data['prompt']
    secret = request_data['secret']

    openai.api_key = secret

    response = openai.Edit.create(
      engine="code-davinci-edit-001",
      input=data,
      instruction="Add documentation"
    )
    
    return response


if __name__ == '__main__':
    app.run(debug=True, port=5001, use_reloader=False)
