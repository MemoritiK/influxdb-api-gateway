from fastapi import FastAPI
from contextlib import asynccontextmanager
from modules import time_series, devices
from database_sql import create_db_and_tables
from database_influx import init_inlfux
from fastapi.middleware.cors import CORSMiddleware
from simulator import start_simulation

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_simulation()          # START simulator
    app.state.write_api, app.state.query_api = init_inlfux()
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:5173"] for dev frontend
    allow_credentials=True,
    allow_methods=["*"],  # allows GET, POST, OPTIONS, etc.
    allow_headers=["*"],
)


app.include_router(devices.router, prefix="/devices", tags=["devices"])
app.include_router(time_series.router, prefix="/data", tags=["data"])
