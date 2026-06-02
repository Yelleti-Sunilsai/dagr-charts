from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import random
import json
import os

app = FastAPI(title="Analytics Workspace Builder API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WidgetSchema(BaseModel):
    id: str
    type: str
    x: int
    y: int
    w: int
    h: int
    config: Optional[dict] = None

DEFAULT_LAYOUT = [
    {
        "id": "default-1",
        "type": "line",
        "x": 0,
        "y": 0,
        "w": 12,
        "h": 7,
        "config": {"dataset": "daily_performance"}
    },
    {
        "id": "default-2",
        "type": "area",
        "x": 12,
        "y": 0,
        "w": 12,
        "h": 7,
        "config": {"dataset": "portfolio_returns"}
    },
    {
        "id": "default-3",
        "type": "bar",
        "x": 0,
        "y": 7,
        "w": 24,
        "h": 7,
        "config": {"dataset": "attribution_summary"}
    }
]

@app.get("/api/data/{filename}")
def get_data_file(filename: str):
    data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    file_path = os.path.join(data_dir, f"{filename}.json")
    
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            return json.load(f)
    return {"error": "File not found"}

@app.get("/api/layout")
def get_layout():
    data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    file_path = os.path.join(data_dir, "layout.json")
    if os.path.exists(file_path):
        try:
            with open(file_path, "r") as f:
                return json.load(f)
        except Exception:
            return DEFAULT_LAYOUT
    return DEFAULT_LAYOUT

@app.post("/api/layout")
def save_layout(layout: List[WidgetSchema]):
    data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    file_path = os.path.join(data_dir, "layout.json")
    
    # Save the layout
    layout_data = [w.dict() for w in layout]
    try:
        with open(file_path, "w") as f:
            json.dump(layout_data, f, indent=2)
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

