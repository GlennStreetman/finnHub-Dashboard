import { GetSavedDashBoards } from './getSavedDashboards'

export const getSavedDashBoardsMock = jest.fn(() => {
    // console.log('RUNNING SAVED DASHBOARD MOCK')
    return new Promise(async (res) => {
        const val = await GetSavedDashBoards()
        res(val)
    })
})


