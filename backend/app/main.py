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

@app.get("/")
def read_root():
    return {"message": "Analytics Workspace Builder Backend API"}

@app.get("/api/charts/sales")
def get_sales_data():
    return [
        {"name": "Jan", "value": random.randint(100, 1000)},
        {"name": "Feb", "value": random.randint(100, 1000)},
        {"name": "Mar", "value": random.randint(100, 1000)},
        {"name": "Apr", "value": random.randint(100, 1000)},
        {"name": "May", "value": random.randint(100, 1000)},
        {"name": "Jun", "value": random.randint(100, 1000)},
    ]

@app.get("/api/charts/revenue")
def get_revenue_data():
    return [
        {"name": "Q1", "value": random.randint(5000, 20000)},
        {"name": "Q2", "value": random.randint(5000, 20000)},
        {"name": "Q3", "value": random.randint(5000, 20000)},
        {"name": "Q4", "value": random.randint(5000, 20000)},
    ]

@app.get("/api/charts/analytics")
def get_analytics_data():
    return [
        {"name": "Mon", "value": random.randint(50, 200)},
        {"name": "Tue", "value": random.randint(50, 200)},
        {"name": "Wed", "value": random.randint(50, 200)},
        {"name": "Thu", "value": random.randint(50, 200)},
        {"name": "Fri", "value": random.randint(50, 200)},
        {"name": "Sat", "value": random.randint(50, 200)},
        {"name": "Sun", "value": random.randint(50, 200)},
    ]
