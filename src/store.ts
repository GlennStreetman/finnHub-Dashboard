import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import exchangeData, { sliceExchangeData } from './slices/sliceExchangeData'
import exchangeList, { sliceExchangeList } from './slices/sliceExchangeList'
import dataModel, { sliceDataModel } from './slices/sliceDataModel'
import showData, { sliceShowData } from './slices/sliceShowData'

export interface storeState {
  exchangeData: sliceExchangeData,
  exchangeList: sliceExchangeList,
  dataModel: sliceDataModel,
  showData: sliceShowData,
}

export const store = configureStore({
  reducer: {
    'exchangeData': exchangeData,
    'exchangeList': exchangeList,
    'dataModel': dataModel,
    'showData': showData,
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

