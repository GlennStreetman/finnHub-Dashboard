import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: "top" as const,
        },
        tooltip: {
            callbacks: {
                label: function (label) {
                    console.log("label", label);
                    return label.parsed.y;
                },
            },
        },
    },
};

interface props {
    chartData: any;
}

export function CreateTimeSeriesChart(p: props) {
    // console.log('making chart')

    return (
        <div style={{ height: "auto", width: "100%" }}>
            <Line options={options} data={p.chartData} />
        </div>
    );
}

export default CreateTimeSeriesChart;

export function createOptions(title, dataPoints: any[]) {
    const labels = [];
    const dataList = [];

    dataPoints.forEach((el) => {
        // @ts-ignore
        labels.unshift(el.period);
        // @ts-ignore
        dataList.unshift(el.v);
    });

    const data = {
        labels,
        datasets: [
            {
                label: title,
                data: dataList,
                borderColor: "rgb(255, 99, 132)",
                backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
        ],
    };

    return data;
}
