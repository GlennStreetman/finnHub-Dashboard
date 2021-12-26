import React from "react";
// import CanvasJSReact from "../../../canvasjs.react";

export function createOptions(title, dataPointObj) {
    let dataPoints: any[] = []
    for (const p in dataPointObj) {
        dataPoints.push({
            //new Date(data["t"][nodei] * 1000)
            x: new Date(dataPointObj[p].period),
            y: dataPointObj[p].v
        })
    }
    const options = {
        width: 350,
        height: 200,
        theme: "light2",
        title: {
            text: `${title}`
        },
        axisY: {
            title: "",
            prefix: ""
        },
        data: [{
            type: "line",
            showInLegend: true,
            xValueFormatString: "YY MM DD",
            yValueFormatString: "#,##0.00",
            dataPoints: dataPoints
        }]
    }

    return options
}

export function CreateTimeSeriesChart() {
    return (<></>)
}

// class CreateTimeSeriesChart extends React.PureComponent {
//     constructor(props) {
//         super(props);
//         this.state = {
//         showChart: 1,
//         };
//     }

//     render() {
//         var CanvasJSChart = CanvasJSReact.CanvasJSChart;
//         let options = this.props.candleData;
//         return (
//             <div data-testid={this.props.testid}>
//                 {/* {this.props.candleData !== undefined && <CanvasJSChart options={options} onRef={(ref) => (this.chart = ref)} />} */}
//             </div>
//         );

//         /*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/
//     }
// }

export default CreateTimeSeriesChart;
