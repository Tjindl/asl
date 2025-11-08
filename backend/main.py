from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from io import BytesIO
from PIL import Image
import base64
import torch
from torchvision import transforms
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your trained ASL model
model = torch.load("asl_model.pth", map_location=torch.device("cpu"))
model.eval()

transform = transforms.Compose([
    transforms.Resize((64, 64)),
    transforms.Grayscale(),
    transforms.ToTensor()
])

@app.post("/predict")
async def predict(request: Request):
    data = await request.json()
    img_data = data["image"]

    # Convert base64 → Image
    image_bytes = base64.b64decode(img_data.split(",")[1])
    image = Image.open(BytesIO(image_bytes))

    # Preprocess
    img_tensor = transform(image).unsqueeze(0)
    with torch.no_grad():
        output = model(img_tensor)
        pred = torch.argmax(output, dim=1).item()

    return {"prediction": int(pred)}
