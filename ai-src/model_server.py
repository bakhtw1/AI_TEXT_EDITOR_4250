from transformers import GPTNeoForCausalLM, GPT2Tokenizer
from flask import Flask, jsonify, request
import torch


# Tests:
# - Generate a python program to generate a greeting


MODEL_NAME = 'EleutherAI/gpt-neo-1.3B'


class HuggingFaceGPTJ(torch.nn.Module):
    def __init__(self, model_name):
        super().__init__()

        self.model = GPTNeoForCausalLM.from_pretrained(
            model_name)

    def forward(self, tokens):
        return self.model.generate(
            tokens,
            do_sample=True,
            temperature=0.9,
            max_length=100,
        )


app = Flask(__name__)

# model = HuggingFaceGPTJ(MODEL_NAME)
model = GPTNeoForCausalLM.from_pretrained(MODEL_NAME)
tokenizer = GPT2Tokenizer.from_pretrained(MODEL_NAME)


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
    # gen_tokens = shark_inference(
    #     model,
    #     input_ids,
    #     device="cpu",
    #     dynamic=False,
    #     jit_trace=True,
    # )
    print(gen_tokens)
    gen_text = tokenizer.batch_decode(gen_tokens)[0]
    print("Done")

    return gen_text


if __name__ == '__main__':
    # run app in debug mode on port 5000
    app.run(debug=True, port=5000, use_reloader=False)

