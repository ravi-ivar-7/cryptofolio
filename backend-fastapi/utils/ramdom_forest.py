import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor

def random_forest_forecast(data, forecast_days=365):
    # Convert input data to a pandas DataFrame
    df = pd.DataFrame(data, columns=['value'])
    
    # Feature: time index
    X = np.arange(len(df)).reshape(-1, 1)
    y = df['value'].values
    
    # Initialize and train the Random Forest model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    # Generate future time indices for forecasting
    X_future = np.arange(len(df), len(df) + forecast_days).reshape(-1, 1)
    
    # Predict future values
    forecast_values = model.predict(X_future)
    
    # Prepare forecast data with time indices
    forecast = [{'index': i, 'forecast': forecast_values[i - len(df)]} for i in range(len(df), len(df) + forecast_days)]
    
    return forecast
