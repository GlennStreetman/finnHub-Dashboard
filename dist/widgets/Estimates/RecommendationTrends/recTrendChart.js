import React from "react";
import CanvasJSReact from "../../../canvasjs.react";
export default class RecTrendChart extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        let CanvasJSChart = CanvasJSReact.CanvasJSChart;
        let options = this.props.chartOptions;
        return (React.createElement(React.Fragment, null, this.props.chartOptions !== undefined && React.createElement(CanvasJSChart, { options: options, onRef: (ref) => (this.chart = ref) })));
        /*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/
    }
}
//# sourceMappingURL=recTrendChart.js.map