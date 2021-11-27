import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import exchangeData, { sliceExchangeData } from './slices/sliceExchangeData'
import exchangeList, { sliceExchangeList } from './slices/sliceExchangeList'
import dataModel, { sliceDataModel } from './slices/sliceDataModel'
import showData, { sliceShowData } from './slices/sliceShowData'
import quotePrice, { sliceQuotePrice } from './slices/sliceQuotePrice'
import apiKey from 'src/slices/sliceAPIKey'
import apiAlias from 'src/slices/sliceAPIAlias'
import defaultExchange from 'src/slices/sliceDefaultExchange'
import targetSecurity from 'src/slices/sliceTargetSecurity'
import currentDashboard from 'src/slices/sliceCurrentDashboard'
import menuList, { sliceMenuList } from './slices/sliceMenuList'
import dashboardData, { sliceDashboardData } from './slices/sliceDashboardData'



export interface storeState {
  exchangeData: sliceExchangeData,
  exchangeList: sliceExchangeList,
  dataModel: sliceDataModel,
  showData: sliceShowData,
  quotePrice: sliceQuotePrice,
  apiKey: string,
  apiAlias: string,
  defaultExchange: string,
  targetSecurity: string,
  currentDashboard: string,
  menuList: sliceMenuList,
  dashboardData: sliceDashboardData
}

export const store = configureStore({
  reducer: {
    'exchangeData': exchangeData,
    'exchangeList': exchangeList,
    'dataModel': dataModel,
    'showData': showData,
    'quotePrice': quotePrice,
    'apiKey': apiKey,
    'apiAlias': apiAlias,
    'defaultExchange': defaultExchange,
    'targetSecurity': targetSecurity,
    'currentDashboard': currentDashboard,
    'menuList': menuList,
    'dashboardData': dashboardData,
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

