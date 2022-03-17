import coremltools as ct
import numpy as np

print('loading...')

model = ct.models.MLModel('./gpt-neo.mlmodel')

print('done.')
print('predict...')

output_dict = model.predict({'input_ids_1': np.ones((5, 20))})

print(output_dict['key'])
print(output_dict['value'])

# print('done.')