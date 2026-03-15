# 🚨 Disaster VQA Response System  
### Multimodal AI for Real-Time Disaster Assessment  

<p align="center">

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python)
![PyTorch](https://img.shields.io/badge/PyTorch-Deep%20Learning-red?style=for-the-badge&logo=pytorch)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green?style=for-the-badge&logo=fastapi)
![Transformers](https://img.shields.io/badge/HuggingFace-Transformers-yellow?style=for-the-badge&logo=huggingface)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue?style=for-the-badge&logo=docker)
![Status](https://img.shields.io/badge/Project-Active-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge&logo=apache)

</p>

---

## 🌍 Overview

The **Disaster VQA Response System** is a next-generation multimodal AI application that analyzes disaster imagery and answers operational questions in real time.

Instead of simple classification, this system performs **context-aware reasoning** using Vision-Language Models (VLMs).

Example:

> 🖼 Image: Flooded highway  
> ❓ Question: *Is the road passable?*  
> 🤖 Answer: *No, water levels appear unsafe for vehicle passage.*  
> 📊 Confidence: 87%



# 🧠 System Architecture

```
Image → Vision Encoder → Image Embeddings  
Question → Language Encoder → Text Embeddings  
Cross-Modal Fusion → Contextual Reasoning  
Output → Answer + Confidence Score
```

---

# ⚙️ Tech Stack

## 🔹 AI / ML Model Specifications

### Active Model: `Salesforce/blip-vqa-base`
While the initial design accounted for heavy-weight models like **LLaVA** and **Qwen-VL**, the current active implementation utilizes **BLIP (Bootstrapping Language-Image Pre-training)**. 

**Why BLIP?**
* **Hardware Efficiency:** BLIP is a highly capable VLM that requires significantly less VRAM (~1GB-2GB) compared to the massive 16GB+ requirements of LLaVA 7B. This allows the API to run smoothly on edge devices and consumer GPUs without out-of-memory (OOM) crashes.
* **Speed:** Inference time is dramatically reduced, enabling true real-time disaster reasoning.

*(See the guide below if you wish to run the full LLaVA architecture).*

## 🔹 Technologies
- PyTorch  
- Hugging Face Transformers  
- FastAPI (Backend API)
- Python  

## 🔹 Frontend
- AI-assisted UI (Antigravity + Gemini Pro AI)  
- Futuristic dashboard  

## 🔹 Deployment
- Docker  
- GPU-enabled Cloud Hosting  

---

# 🚀 Features

- 📷 Image Upload  
- 💬 Natural Language Questions  
- 🤖 Contextual AI Responses  
- 📊 Confidence Score  
- ⚡ Real-Time Inference  
- 📜 Session History  

---

# 📂 Project Structure

```text
Disaster-VQA-Response-System/
│
├── backend/
│   ├── main.py (FastAPI Server)
│   ├── ml/model_pipeline.py (VQA Inference)
│   └── routers/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── models/
├── docker/
└── README.md
```

---

# ⚡ Development Note

The core logic, model integration, backend architecture, and AI inference pipeline are fully self-designed and implemented using Python, FastAPI, and PyTorch.

The frontend interface was developed with the assistance of AI-powered tools (Antigravity and Gemini Pro AI) to accelerate modern UI development, while maintaining full backend ownership and integration control.

---

# 🛠️ Running with LLaVA 1.5 (Advanced Setup)

If you have access to a High-End GPU (e.g., RTX 3090, 4090, or A100 with 16GB+ VRAM) and wish to utilize the **LLaVA 1.5 7B** model instead of BLIP, follow these steps to modify the backend:

1. **Install Quantization Libraries**  
   To load LLaVA efficiently, assure `bitsandbytes` is installed to support 4-bit load:
   ```bash
   pip install bitsandbytes accelerate
   ```

2. **Modify the Pipeline Code**  
   Open `backend/ml/model_pipeline.py` and replace the BLIP classes with LLaVA:
   
   ```python
   # Replace these imports:
   # from transformers import BlipProcessor, BlipForQuestionAnswering
   
   # With LLaVA imports:
   from transformers import AutoProcessor, LlavaForConditionalGeneration
   from transformers import BitsAndBytesConfig
   ```

3. **Update Model Initialization**  
   Change the `__init__` and `load_model` methods:
   ```python
   def __init__(self, model_id="llava-hf/llava-1.5-7b-hf"):
       # ... setup code ...
       
   def load_model(self):
       self.processor = AutoProcessor.from_pretrained(self.model_id)
       
       bnb_config = BitsAndBytesConfig(
           load_in_4bit=True,
           bnb_4bit_compute_dtype=torch.float16
       )
       
       self.model = LlavaForConditionalGeneration.from_pretrained(
           self.model_id,
           quantization_config=bnb_config,
           low_cpu_mem_usage=True
       )
   ```

4. **Update Inference Prompt**  
   LLaVA requires a specific prompt template format. Update the `generate` pipeline:
   ```python
   prompt = f"USER: <image>\n{question}\nASSISTANT:"
   inputs = self.processor(text=prompt, images=image, return_tensors="pt")
   ```

Restart the FastAPI server. **Note:** The initial start will download roughly 10GB of weights from Hugging Face.

---

# 🌍 Future Scope

- 🎥 Video-based Disaster Analysis  
- 🗺 GIS Mapping Integration  
- 🚨 Automated Alert Systems  
- 📡 Edge Deployment  
- 🌐 Multilingual Support  

---
 
# 👨‍💻 Author

**Gautam N Chipkar**  
B.E – Artificial Intelligence & Data Science  

---

# ⭐ Support

If you find this project valuable, consider giving it a star ⭐ 
