import React from "react";
import CanvasJSReact from "./canvasjs.react";
// import Chart from "./chartCandle.js";
// import { TypeChooser } from "react-stockcharts/lib/helper";
// import { tsv } from "d3-request";

class CreateCandleStickChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chartData: [],
      showChart: 1,
      options: {},
    };
    this.createCandleDataList = this.createCandleDataList.bind(this);
    this.createChartOptions = this.createChartOptions.bind(this);
    // this.defineNewChart = this.defineNewChart.bind(this);
  }

  componentDidMount() {
    console.log("Mount");
    this.createCandleDataList(this.props.candleData);
  }

  componentDidUpdate(prevProps) {
    console.log("Update");
    if (this.props.candleData !== prevProps.candleData) {
      if (this.props.candleData[0] !== "blank") {
        this.createCandleDataList(this.props.candleData);
      }
    }
  }
  createCandleDataList(data) {
    let nodeCount = data["c"].length;
    this.setState({ showChart: 0 });
    this.setState({ chartData: [] });
    for (let nodei = 0; nodei < nodeCount; nodei++) {
      let newNode = {
        x: new Date(data["t"][nodei] * 1000),
        y: [data["o"][nodei], data["h"][nodei], data["l"][nodei], data["c"][nodei]], //open, high, low, close
      };
      let updateChartData = this.state.chartData;
      updateChartData.push(newNode);
      this.setState({ chartData: updateChartData });
      this.createChartOptions();
    }
  }

  createChartOptions() {
    const options = {
      theme: "light2", // "light1", "light2", "dark1", "dark2"
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text: "Stock Chart",
      },
      axisX: {
        valueFormatString: "YYY-MM-DD",
      },
      axisY: {
        prefix: "$",
        title: "Price (in USD)",
      },
      data: [
        {
          type: "candlestick",
          showInLegend: true,
          name: "Candle Chart",
          yValueFormatString: "$###0.00",
          xValueFormatString: "YYYY-MM-DD",
          dataPoints: this.state.chartData,
        },
      ],
    };
    this.setState({ options: options });
    this.setState({ showChart: 1 });
  }

  render() {
    var CanvasJSChart = CanvasJSReact.CanvasJSChart;
    let options = this.state.options;
    console.log("render");
    console.log(options);

    if (this.state.showChart === 0) {
      // return <div>Loading...</div>;
      return <CanvasJSChart options={options} onRef={(ref) => (this.chart = ref)} />;
    } else {
      // return <div>Loading...</div>;
      return (
        <>
          <CanvasJSChart options={options} onRef={(ref) => (this.chart = ref)} />
          <a>----------------------------------------------------------------------------------------</a>
        </>
      );

      /*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/
    }
  }
}

export default CreateCandleStickChart;
