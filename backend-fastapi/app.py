from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List
from fastapi.middleware.cors import CORSMiddleware

# Import the forecasting functions
from utils.exponential_smooting import exponential_smoothing
from utils.arima import arima_forecast
from utils.prophet import prophet_forecast
from utils.ramdom_forest import random_forest_forecast

app = FastAPI()

# Allow CORS for your frontend application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow your frontend domain
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

class Data(BaseModel):
    data: List[float] = Field(..., description="A list of float values representing the time series data")

class ProphetDataPoint(BaseModel):
    ds: str = Field(..., description="The date of the data point (in YYYY-MM-DD format)")
    y: float = Field(..., description="The value of the data point")

class ProphetData(BaseModel):
    data: List[ProphetDataPoint] = Field(..., description="A list of data points for Prophet forecasting")

@app.get("/")
def ping():
    return {"status":"Server is running."}
    
@app.post("/forecast/exponential_smoothing")
def forecast_exponential_smoothing(data: Data):
    try:
        result = exponential_smoothing(data.data)
        return {"forecast": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/forecast/arima")
def forecast_arima(data: Data):
    try:
        result = arima_forecast(data.data)
        return {"forecast": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/forecast/prophet")
def forecast_prophet(data: ProphetData):
    try:
        result = prophet_forecast([point.dict() for point in data.data])
        return {"forecast": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/forecast/random_forest")
def forecast_random_forest(data: dict):
    try:
        forecast = random_forest_forecast(data['data'])
        return {"forecast": forecast}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# pip install statsmodels prophet scikit-learn fastapi uvicorn pydantic numpy pandas
# uvicorn app:app --reload
# uvicorn app:app --host 0.0.0.0 --port 9000 --reload
