from transformers import GPTNeoForCausalLM, AutoTokenizer

from .types import GPTNeoModelType
from ..model import ServerModel


MODEL_MAPPING = dict([
    (GPTNeoModelType.small, 'EleutherAI/gpt-neo-125M'),
    (GPTNeoModelType.medium, 'EleutherAI/gpt-neo-1.3B'),
    (GPTNeoModelType.large, 'EleutherAI/gpt-neo-2.7B'),
])


class GPTNeo(ServerModel):

    def __init__(self, model_type):
        super().__init__(model_type)

        model_name = MODEL_MAPPING.get(model_type)
        assert model_name is not None

        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = GPTNeoForCausalLM.from_pretrained(model_name)

        if self.pt_cuda_available:
            self.model = self.model.to('cuda')

    def generate(self, texts):
        input_ids = self.tokenizer(texts, 
            return_tensors="pt").input_ids

        if self.pt_cuda_available:
            input_ids = input_ids.to('cuda')

        gen_tokens = self.model.generate(
            input_ids,
            do_sample=True,
            temperature=0.9,
            max_length=100)

        results = self.tokenizer.batch_decode(gen_tokens)

        if len(results) == 1:
            return results[0]

        return results

