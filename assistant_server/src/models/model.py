import torch


class ServerModel:

    def __init__(self, model_type):
        self.model_type = model_type

        self.pt_cuda_available = torch.cuda.is_available()
    
    def generate(self):
        raise NotImplementedError

