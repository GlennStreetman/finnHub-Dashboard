import React from "react";
import CanvasJSReact from "../../../canvasjs.react";

class CreateCandleStickChart extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showChart: 1,
    };
  }

  render() {
    var CanvasJSChart = CanvasJSReact.CanvasJSChart;
    let options = this.props.candleData;
    return (
      <>
        {this.props.candleData !== undefined && <CanvasJSChart options={options} onRef={(ref) => (this.chart = ref)} />}
      </>
    );

    /*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/
  }
}

export default CreateCandleStickChart;
