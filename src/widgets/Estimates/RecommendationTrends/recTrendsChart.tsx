import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const fakeData = {
    labels: ['jan', 'feb', 'mar'],
    datasets: [
        {
            label: 'Dataset 1',
            data: [1, 2, 3],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 1)',
        },
        {
            label: 'Dataset 2',
            data: [4, 5, 6],
            borderColor: 'rgba(100, 50, 182, 1)',
            backgroundColor: 'rgba(100, 50, 182, 1)',
        }
    ]
}

const options = {
    plugins: {
        title: {
            display: false,
            text: 'Chart.js Bar Chart - Stacked',
        },
    },
    responsive: true,
    scales: {
        x: {
            stacked: true,
        },
        y: {
            stacked: true,
        },
    },
};


interface props {
    chartData: any
}

export default function EPSChart(p: props) {

    const chart = p.chartData ? <>
        <div style={{ height: 'auto', width: '100%' }}>
            <Bar height='auto' width='inherit' options={options} data={p.chartData} />
        </div>
    </> : <></>

    return (chart);
}
