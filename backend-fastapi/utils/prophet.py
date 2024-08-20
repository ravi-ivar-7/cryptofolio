import pandas as pd
from prophet import Prophet

def prophet_forecast(data, forecast_days=365):
    try:
        # Convert input data to a pandas DataFrame
        df = pd.DataFrame(data, columns=['ds', 'y'])  # 'ds' = date, 'y' = value

        # Initialize and fit the Prophet model
        model = Prophet()
        model.fit(df)
        
        # Create a DataFrame with future dates for forecasting
        future = model.make_future_dataframe(periods=forecast_days)  # Forecast next 'forecast_days' periods
        
        # Generate forecast
        forecast = model.predict(future)
        
        # Return the forecasted values for the specified number of days
        return forecast[['ds', 'yhat']].tail(forecast_days).to_dict(orient='records')
    except Exception as e:
        print(f"An error occurred in Prophet forecast: {e}")
        return None
