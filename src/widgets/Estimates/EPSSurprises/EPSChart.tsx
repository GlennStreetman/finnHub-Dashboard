// import {
//     Chart as ChartJS,
//     LinearScale,
//     PointElement,
//     LineElement,
//     Tooltip,
//     Legend,
// } from 'chart.js';

import { Scatter } from "react-chartjs-2";

// ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

const options = {
    responsive: true,
    scales: {
        x: {
            ticks: {
                callback: function (value, index, ticks) {
                    return new Date(value).toISOString().slice(0, 10);
                },
            },
        },
    },
    plugins: {
        tooltip: {
            callbacks: {
                label: function (label) {
                    // console.log(label);
                    return (
                        new Date(label.parsed.x).toISOString().slice(0, 10) +
                        ": " +
                        label.parsed.y
                    );
                },
            },
        },
    },
};

interface props {
    chartData: any;
    testid: string;
}

export default function EPSChart(p: props) {
    const chart = p.chartData ? (
        <>
            <div
                data-testid={p.testid}
                style={{ height: "auto", width: "100%" }}
            >
                <Scatter
                    height="auto"
                    width="inherit"
                    options={options}
                    data={p.chartData}
                />
            </div>{" "}
        </>
    ) : (
        <></>
    );

    return chart;
}
