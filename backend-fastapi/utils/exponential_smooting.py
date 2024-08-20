import pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing

def exponential_smoothing(data, forecast_days=365, seasonal_periods=7):
    try:
        # Convert input data to a pandas DataFrame
        df = pd.DataFrame(data, columns=['value'])

        # Fit the Exponential Smoothing model
        model = ExponentialSmoothing(df['value'], trend='add', seasonal='add', seasonal_periods=seasonal_periods)
        fit = model.fit()

        # Forecast for the specified number of days
        forecast = fit.forecast(steps=forecast_days)
        
        return [{'index': i, 'forecast': value} for i, value in enumerate(forecast, start=len(df))]
    except Exception as e:
        print(f"An error occurred in Exponential Smoothing forecast: {e}")
        return None
