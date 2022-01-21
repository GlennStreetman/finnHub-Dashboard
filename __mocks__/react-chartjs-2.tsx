import React from "react";

interface props {
    height: any;
    width: any;
    options: any;
    data: any;
    testid: any;
}

function ReactChart2() {
    console.log("returning mock chart");
    return <div>MOCK CHART</div>;
}

export default ReactChart2;

export function Scatter() {
    // console.log("returning mock scatter chart");
    return <div>MOCK SCATTER CHART</div>;
}
