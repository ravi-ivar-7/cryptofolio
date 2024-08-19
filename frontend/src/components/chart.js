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

function PriceChart({ xData, yData}) {
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
                text: '90-Day Price Variation',
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

export default PriceChart;