import { rest } from 'msw'

const menuList = {
    WatchListMenu: {
        column: 0,
        columnOrder: 0,
        widgetConfig: 'menuWidget',
        widgetHeader: 'WatchList',
        widgetID: 'WatchListMenu',
        widgetType: 'WatchListMenu',
        xAxis: '5',
        yAxis: '75'
    },
    DashBoardMenu: {
        column: 0,
        columnOrder: 1,
        widgetConfig: 'menuWidget',
        widgetHeader: 'Saved Dashboards',
        widgetID: 'DashBoardMenu',
        widgetType: 'DashBoardMenu',
        xAxis: '46',
        yAxis: '149'
    }
}

export const getDashboard_success_noWidgets =     //auto login check rejected.
rest.get("/dashboard", (req, res, ctx) =>{
    const resObj = {    
        savedDashBoards: {},
        default: '',
        menuSetup: menuList,
        message: '',
    }
    console.log('RETURNING DASHBOARD DATA MOCK')
    return res(
        ctx.status(200),
        ctx.json(resObj)
    )
})
