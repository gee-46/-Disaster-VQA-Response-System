from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import analyze, history

app = FastAPI(title="Disaster VQA API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router)
app.include_router(history.router)

@app.get("/")
def read_root():
    return {"status": "Disaster VQA Backend Strategy Active"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
