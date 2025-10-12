from fastapi import FastAPI
from routes.generate import router as generate_router
from core.logger import log

app = FastAPI(title="Video Generator API", version="0.1.0")
app.include_router(generate_router)


@app.get("/health")
def health():
    log("Health check OK")
    return {"status": "ok"}
