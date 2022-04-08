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

        self.stack = []
        self.results = Queue()

    @classmethod
    def auto(cls):
        from .gpt_neo import GPTNeo, GPTNeoModelType
        return cls(model=GPTNeo(GPTNeoModelType.small))

    def __call__(self, inp):
        self.stack.insert(0, inp)

    def worker_fn(self, input_stack, output_queue):
        while True:
            if len(input_stack) > 0:
                prompt = input_stack.pop(0)
                input_stack.clear()
                
                results = self.model.generate([prompt] * self.num_generate)
                results = [x.split('\n')[0] for x in results]

                output_queue.put(results)

    def wait_for_results(self):
        return self.results.get()

    def start_worker(self):
        t = threading.Thread(target=self.worker_fn, 
            args=(self.stack, self.results, ))
        t.daemon = True

        t.start()


class FullGenerationModel(ServerModel):

    def __init__(self, model_type):
        super().__init__(model_type)

    @classmethod
    def auto(cls):
        from .gpt_neo import GPTNeo, GPTNeoModelType
        return GPTNeo(GPTNeoModelType.medium)