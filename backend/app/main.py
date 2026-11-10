from fastapi import FastAPI

app = FastAPI(title="Samadhan Setu API")


@app.get("/health")
async def health():
    return {"status": "ok"}
