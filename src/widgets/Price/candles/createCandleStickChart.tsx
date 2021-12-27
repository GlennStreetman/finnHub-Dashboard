import React from 'react';
import {
    Chart as ChartJS,
    LinearScale,
    CategoryScale,
    BarElement,
    PointElement,
    LineElement,
    Legend,
    Tooltip,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Scatter } from 'react-chartjs-2';
import faker from 'faker';

ChartJS.register(
    LinearScale,
    CategoryScale,
    BarElement,
    PointElement,
    LineElement,
    Legend,
    Tooltip
);

// const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

// export const data = {
//     labels,
//     datasets: [
//         {
//             type: 'bar' as const,
//             label: 'Dataset 2',
//             backgroundColor: 'rgb(75, 192, 192)',
//             data: labels.map(() => [faker.datatype.number({ min: 250, max: 750 }), faker.datatype.number({ min: 250, max: 750 })]),
//             borderColor: 'white',
//             borderWidth: 2,
//         },
//         {
//             type: 'scatter' as const,
//             label: 'A dataset',
//             data: Array.from({ length: 7 }, () => ({
//                 x: 125,
//                 y: 125,
//             })),
//             backgroundColor: 'rgba(255, 99, 132, 1)',
//         },
//         {
//             type: 'scatter' as const,
//             label: 'A dataset',
//             data: Array.from({ length: 7 }, () => ({
//                 x: 850,
//                 y: 850,
//             })),
//             backgroundColor: 'rgba(155, 59, 102, 1)',
//         }
//     ],
// };

export const options = {
    scales: {
        y: {
            beginAtZero: false,
        },
    },
};



function CreateCandleStickChart(p: any) {

    // console.log('p.chartData', data, '----', p.chartData)
    const chart = p.chartData ? <>
        <div style={{ height: 'auto', width: '100%' }}>
            {/* @ts-ignore */}
            <Chart type='bar' options={options} data={p.chartData} />
        </div>
    </> : <></>
    return (
        chart
    )
}

export default CreateCandleStickChart;
