
import torch
from transformers import GPTJForCausalLM, AutoTokenizer

def test():
    # generator = pipeline('text-generation', model='EleutherAI/gpt-neo-125M')
    # generator = pipeline('text-generation', model='EleutherAI/gpt-neo-1.3B')
    # prompt = "Somewhere over the rainbow"

    # res = generator(prompt, min_length=50, do_sample=True, temperature = 0.9)
    model = GPTJForCausalLM.from_pretrained(
        "EleutherAI/gpt-j-6B", 
        revision="float16", 
        torch_dtype=torch.float16, 
        low_cpu_mem_usage=True
    )
    tokenizer = AutoTokenizer.from_pretrained("EleutherAI/gpt-j-6B")

    prompt = (
        "def add(a, b): "
    )

    input_ids = tokenizer(prompt, return_tensors="pt").input_ids
    gen_tokens = model.generate(
        input_ids,
        do_sample=True,
        temperature=0.9,
        max_length=100,
    )

    gen_text = tokenizer.batch_decode(gen_tokens)[0]
    
    print(gen_text)

    
test()