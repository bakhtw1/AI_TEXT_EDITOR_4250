import torch


class ServerModel:

    def __init__(self, model_type):
        self.model_type = model_type

        self.pt_cuda_available = torch.cuda.is_available()

    @classmethod
    def auto(cls):
        from .gpt_neo import GPTNeo, GPTNeoModelType
        return GPTNeo(GPTNeoModelType.medium)
    
    def generate(self):
        raise NotImplementedError
