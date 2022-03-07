from transformers import pipeline
generator = pipeline('text-generation', model='EleutherAI/gpt-neo-2.7B', device=0)
prompt = (
    "Generate a python program to generate a greeting"
)
gen_text = generator(prompt, do_sample=True, min_length=50)

print(gen_text)