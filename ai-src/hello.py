from flask import Flask
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM 

app = Flask(__name__)

@app.route("/")
def hello_world():
    tokenizer = AutoTokenizer.from_pretrained("EleutherAI/gpt-j-6B")
    model = AutoModelForCausalLM.from_pretrained("EleutherAI/gpt-j-6B")

    input_text = "Somewhere over the rainbow"
    input_ids = tokenizer.encode(str(input_text), return_tensors='pt').cuda()

    output = model.generate(
        input_ids,
        do_sample=True,
        max_length=20,
        top_p=0.7,
        top_k=0,
        temperature=1.0,
    )
    return "<h1>hello</h1>"