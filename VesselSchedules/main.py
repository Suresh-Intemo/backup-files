# app.py

from fastapi import FastAPI
from controllers.controllers import router as schedule_router
import uvicorn

app = FastAPI()

app.include_router(schedule_router)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)