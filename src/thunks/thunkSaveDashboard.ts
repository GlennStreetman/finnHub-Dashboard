import { createAsyncThunk } from "@reduxjs/toolkit";

interface tSaveDashboardReq {
    dashboardName: string;
}

export const tSaveDashboard = createAsyncThunk(
    "tSaveDashboard",
    async (req: tSaveDashboardReq, thunkAPI: any) => {
        const dashboardData = thunkAPI.getState().dashboardData;
        const menuList = thunkAPI.getState().menuList;

        const data = {
            dashBoardName: req.dashboardName,
            globalStockList: dashboardData[req.dashboardName].globalstocklist,
            widgetList: dashboardData[req.dashboardName].widgetlist,
            menuList: menuList,
        };
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        };
        fetch("/api/dashBoard", options) //posts that data to be saved.
            .then((res) => res.json())
            .then((data) => {
                return true;
            })
            .catch((err) => {
                console.log("dashboard save error: ", err);
                return false;
            });
    }
);
