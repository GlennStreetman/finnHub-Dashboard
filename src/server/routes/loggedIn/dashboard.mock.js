import { rest } from 'msw'

const menuList = {
    watchListMenu: {
        column: 0,
        columnOrder: 0,
        widgetConfig: 'menuWidget',
        widgetHeader: 'WatchList',
        widgetID: 'watchListMenu',
        widgetType: 'watchListMenu',
        xAxis: '5',
        yAxis: '75'
    },
    dashBoardMenu: {
        column: 0,
        columnOrder: 1,
        widgetConfig: 'menuWidget',
        widgetHeader: 'Saved Dashboards',
        widgetID: 'dashBoardMenu',
        widgetType: 'dashBoardMenu',
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
    // console.log('RETURNING DASHBOARD DATA MOCK')
    return res(
        ctx.status(200),
        ctx.json(resObj)
    )
})

export const postDashboard_success_noWidgets =     //auto login check rejected.
rest.post("/dashboard", (req, res, ctx) =>{

    return res(
        ctx.status(200),
        ctx.json({message: 'MOCKED EMPTY RESPONSE'})
    )
})
