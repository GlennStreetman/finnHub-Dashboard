
import {GetSavedDashBoards} from "./setupDashboard";

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: async () => Promise.resolve({
            status: 200,
            savedDashBoards: {
                TEST: {
                dashboardname: 'TEST',
                globalstocklist: '{"US-TSLA":{"currency":"Tesla Inc","description":"TESLA INC","displaySymbol":"TSLA","figi":"BBG000N9MNX3","mic":"XNAS","symbol":"TSLA","type":"Common Stock","exchange":"US","key":"US-TSLA"},"US-F":{"currency":"Ford Motor Company","description":"FORD MOTOR CO","displaySymbol":"F","figi":"BBG000BQPC32","mic":"XNYS","symbol":"F","type":"Common Stock","exchange":"US","key":"US-F"},"US-GM":{"currency":"General Motors Company","description":"GENERAL MOTORS CO","displaySymbol":"GM","figi":"BBG000NDYB67","mic":"XNYS","symbol":"GM","type":"Common Stock","exchange":"US","key":"US-GM"},"US-HNDAF":{"currency":"USD","description":"HONDA MOTOR CO LTD","displaySymbol":"HNDAF","figi":"BBG000G0ZHK3","mic":"OTCM","symbol":"HNDAF","type":"Common Stock","exchange":"US","key":"US-HNDAF"},"US-TM":{"currency":"Toyota Motor Corporation","description":"TOYOTA MOTOR CORP -SPON ADR","displaySymbol":"TM","figi":"BBG000BPH299","mic":"XNYS","symbol":"TM","type":"ADR","exchange":"US","key":"US-TM"},"US-PRCH":{"currency":"Porch Group Inc","description":"PORCH GROUP INC","displaySymbol":"PRCH","figi":"BBG00QYZND30","mic":"XNAS","symbol":"PRCH","type":"Common Stock","exchange":"US","key":"US-PRCH"},"US-STLA":{"currency":"Stellantis NV","description":"STELLANTIS NV","displaySymbol":"STLA","figi":"BBG0078ZLDG9","mic":"XNYS","symbol":"STLA","type":"Common Stock","exchange":"US","key":"US-STLA"}}',
                id: 525,
                widgetlist: {
                    '1614275191410': {
                    column: 1,
                    columnOrder: 0,
                    filters: '{"startDate":-31449600000,"endDate":0,"Description":"Date numbers are millisecond offset from now. Used for Unix timestamp calculations."}',
                    trackedStocks: '{"US-TSLA":{"currency":"Tesla Inc","description":"TESLA INC","displaySymbol":"TSLA","figi":"BBG000N9MNX3","mic":"XNAS","symbol":"TSLA","type":"Common Stock","exchange":"US","key":"US-TSLA"},"US-F":{"currency":"Ford Motor Company","description":"FORD MOTOR CO","displaySymbol":"F","figi":"BBG000BQPC32","mic":"XNYS","symbol":"F","type":"Common Stock","exchange":"US","key":"US-F"},"US-GM":{"currency":"General Motors Company","description":"GENERAL MOTORS CO","displaySymbol":"GM","figi":"BBG000NDYB67","mic":"XNYS","symbol":"GM","type":"Common Stock","exchange":"US","key":"US-GM"},"US-HNDAF":{"currency":"USD","description":"HONDA MOTOR CO LTD","displaySymbol":"HNDAF","figi":"BBG000G0ZHK3","mic":"OTCM","symbol":"HNDAF","type":"Common Stock","exchange":"US","key":"US-HNDAF"},"US-TM":{"currency":"Toyota Motor Corporation","description":"TOYOTA MOTOR CORP -SPON ADR","displaySymbol":"TM","figi":"BBG000BPH299","mic":"XNYS","symbol":"TM","type":"ADR","exchange":"US","key":"US-TM"},"US-PRCH":{"currency":"Porch Group Inc","description":"PORCH GROUP INC","displaySymbol":"PRCH","figi":"BBG00QYZND30","mic":"XNAS","symbol":"PRCH","type":"Common Stock","exchange":"US","key":"US-PRCH"},"US-STLA":{"currency":"Stellantis NV","description":"STELLANTIS NV","displaySymbol":"STLA","figi":"BBG0078ZLDG9","mic":"XNYS","symbol":"STLA","type":"Common Stock","exchange":"US","key":"US-STLA"}}',
                    widgetConfig: 'stockWidget',
                    widgetHeader: 'Earnings Calendar: ',
                    widgetID: '1614275191410',
                    widgetType: 'EstimatesEarningsCalendar',
                    yAxis: '60',
                    xAxis: '455'
                    },
                    '1614275851036': {
                    column: 1,
                    columnOrder: 2,
                    filters: '{}',
                    trackedStocks: '{"US-TSLA":{"currency":"Tesla Inc","description":"TESLA INC","displaySymbol":"TSLA","figi":"BBG000N9MNX3","mic":"XNAS","symbol":"TSLA","type":"Common Stock","exchange":"US","key":"US-TSLA"},"US-F":{"currency":"Ford Motor Company","description":"FORD MOTOR CO","displaySymbol":"F","figi":"BBG000BQPC32","mic":"XNYS","symbol":"F","type":"Common Stock","exchange":"US","key":"US-F"},"US-GM":{"currency":"General Motors Company","description":"GENERAL MOTORS CO","displaySymbol":"GM","figi":"BBG000NDYB67","mic":"XNYS","symbol":"GM","type":"Common Stock","exchange":"US","key":"US-GM"},"US-HNDAF":{"currency":"USD","description":"HONDA MOTOR CO LTD","displaySymbol":"HNDAF","figi":"BBG000G0ZHK3","mic":"OTCM","symbol":"HNDAF","type":"Common Stock","exchange":"US","key":"US-HNDAF"},"US-TM":{"currency":"Toyota Motor Corporation","description":"TOYOTA MOTOR CORP -SPON ADR","displaySymbol":"TM","figi":"BBG000BPH299","mic":"XNYS","symbol":"TM","type":"ADR","exchange":"US","key":"US-TM"},"US-PRCH":{"currency":"Porch Group Inc","description":"PORCH GROUP INC","displaySymbol":"PRCH","figi":"BBG00QYZND30","mic":"XNAS","symbol":"PRCH","type":"Common Stock","exchange":"US","key":"US-PRCH"},"US-STLA":{"currency":"Stellantis NV","description":"STELLANTIS NV","displaySymbol":"STLA","figi":"BBG0078ZLDG9","mic":"XNYS","symbol":"STLA","type":"Common Stock","exchange":"US","key":"US-STLA"}}',
                    widgetConfig: 'stockWidget',
                    widgetHeader: 'Profile 2:',
                    widgetID: '1614275851036',
                    widgetType: 'FundamentalsCompanyProfile2',
                    yAxis: '178',
                    xAxis: '574'
                    }
                }
                }
            },
            menuSetup: {
                WatchListMenu: {
                column: 0,
                columnOrder: -1,
                widgetConfig: 'menuWidget',
                widgetHeader: 'WatchList',
                widgetID: 'WatchListMenu',
                widgetType: 'WatchListMenu',
                xAxis: '5rem',
                yAxis: '5rem'
                },
                DashBoardMenu: {
                column: 0,
                columnOrder: -1,
                widgetConfig: 'menuWidget',
                widgetHeader: 'Saved Dashboards',
                widgetID: 'DashBoardMenu',
                widgetType: 'DashBoardMenu',
                xAxis: '5rem',
                yAxis: '5rem'
                }
            },
            default: 'TEST'
            }),
    })
);


beforeEach((done) => {
    fetch.mockClear();
    done()
})

test("test appFunctions/appImport/setupDashboard.getSavedDashboards success", async (done) => {
    await GetSavedDashBoards()
    .then((data) => {
        expect(data).toEqual(
            expect.objectContaining({
                dashBoardData: expect.any(Object),
                currentDashBoard: "TEST",
                menuList: expect.any(Object),
            })
        )
        done()
    })
})
