from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.caller import router as CallerRouter

app = FastAPI()

# NOTE This is bad practice for deployment
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(CallerRouter, tags=["Caller"], prefix="/caller")

@app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"message": "Hello world"}

@app.get("/james", tags=["james"])
async def get_james() -> dict:
    return {"message": "james"}
