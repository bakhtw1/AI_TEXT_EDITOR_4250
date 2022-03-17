from coremltools.converters.mil.mil import types
import torch
import coremltools

from transformers import GPTNeoForCausalLM

print('loading...')

model = GPTNeoForCausalLM.from_pretrained('EleutherAI/gpt-neo-125M',
    torchscript=True)

print('done.')    
print('tracing...')

example_inp = torch.randint(100, (5, 20))
traced_model = torch.jit.trace(model, example_inp)

print('done.')
print('converting...')

coreml_model = coremltools.convert(
    traced_model,
    inputs=[
        coremltools.TensorType(shape=example_inp.shape, dtype=types.int32)
    ])

print('done.')
print('saving...')

coreml_model.save('./gpt-neo.mlmodel')

print('done.')