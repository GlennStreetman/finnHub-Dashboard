import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import exchangeData, { sliceExchangeData } from './slices/sliceExchangeData'
import exchangeList, { sliceExchangeList } from './slices/sliceExchangeList'
import dataModel, { sliceDataModel } from './slices/sliceDataModel'
import showData, { sliceShowData } from './slices/sliceShowData'
import quotePrice, { sliceQuotePrice } from './slices/sliceQuotePrice'
import currentDashboard from './slices/sliceCurrentDashboard'
import targetSecurity from './slices/sliceTargetSecurity'
import menuList, { sliceMenuList } from './slices/sliceMenuList'
import dashboardData, { sliceDashboardData } from './slices/sliceDashboardData'
import apiKey from './slices/sliceAPiKey'
import apiAlias from './slices/sliceApiAlias'
import defaultExchange from './slices/sliceDefaultExchange'

export interface storeState {
    exchangeData: sliceExchangeData,
    exchangeList: sliceExchangeList,
    dataModel: sliceDataModel,
    showData: sliceShowData,
    quotePrice: sliceQuotePrice,
    currentDashboard: string,
    targetSecurity: string,
    menuList: sliceMenuList,
    dashboardData: sliceDashboardData,
    apiKey: string,
    apiAlias: string,
    defaultExchange: string,
}

export const store = configureStore({
    reducer: {
        'exchangeData': exchangeData,
        'exchangeList': exchangeList,
        'dataModel': dataModel,
        'showData': showData,
        'quotePrice': quotePrice,
        'currentDashboard': currentDashboard,
        'targetSecurity': targetSecurity,
        'menuList': menuList,
        'dashboardData': dashboardData,
        'apiKey': apiKey,
        'apiAlias': apiAlias,
        'defaultExchange': defaultExchange,
    },
    middleware: () =>
        getDefaultMiddleware({
            immutableCheck: false,
            serializableCheck: false,
        })
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

