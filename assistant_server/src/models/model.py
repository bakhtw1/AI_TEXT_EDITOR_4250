from queue import Queue
import torch
import sys
import threading
import time


class ServerModel:

    def __init__(self, model_type):
        self.model_type = model_type

        self.pt_cuda_available = torch.cuda.is_available()

    # @classmethod
    # def auto(cls):
    #     from .gpt_neo import GPTNeo, GPTNeoModelType
    #     return GPTNeo(GPTNeoModelType.medium)
    
    def generate(self):
        raise NotImplementedError


class RealtimeModel:

    def __init__(self, model, num_generate=5):
        self.model = model
        self.num_generate = num_generate

        self.queue = Queue()

    @classmethod
    def auto(cls):
        from .gpt_neo import GPTNeo, GPTNeoModelType
        return cls(model=GPTNeo(GPTNeoModelType.small))

    def get_suggestions(self, inp):
        results = self.model.generate([inp] * self.num_generate)
        results = [x.split('\n')[0] for x in results]

        return results


class FullGenerationModel(ServerModel):

    def __init__(self, model_type):
        super().__init__(model_type)

    @classmethod
    def auto(cls):
        from .gpt_neo import GPTNeo, GPTNeoModelType
        return GPTNeo(GPTNeoModelType.medium)