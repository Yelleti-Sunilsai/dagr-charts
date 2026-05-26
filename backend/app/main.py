from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI(title="Analytics Workspace Builder API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/data/{filename}")
def get_data_file(filename: str):
    import json
    import os
    
    # Path to the data directory
    # Adjust based on the actual location relative to main.py
    data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    file_path = os.path.join(data_dir, f"{filename}.json")
    
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            return json.load(f)
    return {"error": "File not found"}
