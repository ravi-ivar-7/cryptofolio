import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

def arima_forecast(data, order=(5, 1, 0), forecast_days=365):
    try:
        # Assume `data` is a list or array of daily values
        df = pd.DataFrame(data, columns=['value'])
        
        # Fit ARIMA model
        model = ARIMA(df['value'], order=order)
        fit = model.fit()

        # Forecast for the specified number of days
        forecast = fit.forecast(steps=forecast_days)
        
        return [{'index': i, 'forecast': value} for i, value in enumerate(forecast, start=len(df))]
    except Exception as e:
        print(f"An error occurred in ARIMA forecast: {e}")
        return None
