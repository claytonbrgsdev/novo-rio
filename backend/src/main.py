from fastapi import FastAPI
from db import Base, engine

app = FastAPI()

# Importar e incluir routers futuramente
# from api import action
# app.include_router(action.router)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Novo Rio backend inicializado!"}
