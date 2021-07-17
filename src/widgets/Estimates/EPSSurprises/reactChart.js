import React from "react";
import CanvasJSReact from "../../../canvasjs.react";

export default class ReactChart extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    let CanvasJSChart = CanvasJSReact.CanvasJSChart;
    let options = this.props.chartOptions;
    return (
      <div data-testid={`${this.props.testid}`}>
        {this.props.chartOptions !== undefined && <CanvasJSChart  options={options} onRef={(ref) => (this.chart = ref)} />}
      </div>
    );

    /*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/
  }
}
