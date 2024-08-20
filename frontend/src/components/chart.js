import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns'; // Needed for time scale support with date-fns

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
} from 'chart.js';

// Register the required components for Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
);

function PriceChart({ xData, yData, chartTitle }) {
    const data = {
        labels: xData,
        datasets: [
            {
                label: 'Price in USD',
                data: yData,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            title: {
                display: true,
                text: chartTitle,
            },
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day',
                    tooltipFormat: 'dd MMM, yyyy',
                    displayFormats: {
                        day: 'dd MMM yyyy',
                    },
                },
                title: {
                    display: true,
                    text: 'Date',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Price in USD',
                },
                beginAtZero: false,
            },
        },
    };

    return <Line data={data} options={options} />;
}

const ForecastChart = ({ xData, yData, chartTitle }) => {
    // Prepare data for the chart
    const data = {
      labels: xData,
      datasets: [
        {
          label: chartTitle,
          data: yData,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 1,
          fill: true,
        },
      ],
    };
  
    // Chart options
    const options = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              return `Value: ${tooltipItem.raw}`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Value',
          },
        },
      },
    };
  
    return (
      <div style={{ margin: '20px' }}>
        <h3>{chartTitle}</h3>
        <Line data={data} options={options} />
      </div>
    );
};

export { ForecastChart, PriceChart };
