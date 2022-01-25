import { createAsyncThunk } from "@reduxjs/toolkit";
import { widget, filters } from "src/App";

interface tAddNewWidgetContainerReq {
    widgetDescription: string; //a
    widgetHeader: string; //b
    widgetConfig: string; //c
    defaultFilters: filters | undefined; //d
}

function uniqueName(widgetName: string, nameList: string[], iterator = 0) {
    const testName = iterator === 0 ? widgetName : widgetName + iterator;
    if (nameList.includes(testName)) {
        return uniqueName(widgetName, nameList, iterator + 1);
    } else {
        return testName;
    }
}

export const tAddNewWidgetContainer = createAsyncThunk("tAddNewWidgetContainer", async (req: tAddNewWidgetContainerReq, thunkAPI: any) => {
    const currentDashboard = thunkAPI.getState().currentDashboard;
    const dashboardData = thunkAPI.getState().dashboardData;
    const apiKey = thunkAPI.getState().apiKey;

    const widgetName: string = new Date().getTime().toString();
    const widgetStockList = dashboardData[currentDashboard].globalstocklist;
    const widgetList: widget[] = dashboardData[currentDashboard].widgetlist;
    const widgetIds = widgetList ? Object.keys(widgetList) : [];
    const widgetNameList = widgetIds.map((el) => widgetList[el].widgetHeader);
    const useName = uniqueName(req.widgetHeader, widgetNameList);
    const firstColumnCount = Object.entries(widgetList).reduce((acc, el) => {
        if (el[1].column === 1) {
            acc = acc + 1;
            return acc;
        } else {
            return acc;
        }
    }, 1);

    const newWidget: widget = {
        column: 1,
        columnOrder: firstColumnCount - 1,
        config: {}, //used to save user setup for the widget that does not require new api request.
        filters: req.defaultFilters ? req.defaultFilters : {}, //used to save user setup that requires new api request.
        showBody: true,
        trackedStocks: widgetStockList,
        widgetID: widgetName,
        widgetType: req.widgetDescription,
        widgetHeader: useName,
        widgetConfig: req.widgetConfig, //reference to widget type. Menu or data widget.
        xAxis: 20, //prev 5 rem
        yAxis: 20, //prev 5 rem
    };

    return {
        newWidget: newWidget,
        currentDashboard: currentDashboard,
        apiKey: apiKey,
    };
});
