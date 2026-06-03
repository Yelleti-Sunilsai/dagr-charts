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

class PageSchema(BaseModel):
    id: str
    name: str
    widgets: List[WidgetSchema]

class DashboardConfigSchema(BaseModel):
    activePageId: str
    pages: List[PageSchema]

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

DEFAULT_DASHBOARD_CONFIG = {
    "activePageId": "default-page-1",
    "pages": [
        {
            "id": "default-page-1",
            "name": "Page 1",
            "widgets": DEFAULT_LAYOUT
        }
    ]
}

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
                data = json.load(f)
            # If the loaded data is a legacy list, wrap it in a single page
            if isinstance(data, list):
                migrated = {
                    "activePageId": "default-page-1",
                    "pages": [
                        {
                            "id": "default-page-1",
                            "name": "Page 1",
                            "widgets": data
                        }
                    ]
                }
                # Save migrated config
                with open(file_path, "w") as f:
                    json.dump(migrated, f, indent=2)
                return migrated
            return data
        except Exception:
            return DEFAULT_DASHBOARD_CONFIG
    return DEFAULT_DASHBOARD_CONFIG

@app.post("/api/layout")
def save_layout(config: DashboardConfigSchema):
    data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    file_path = os.path.join(data_dir, "layout.json")
    
    # Save the full config
    try:
        with open(file_path, "w") as f:
            json.dump(config.dict(), f, indent=2)
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


