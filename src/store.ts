import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import exchangeData from './slices/sliceExchangeData.js'
import exchangeList from './slices/sliceExchangeList.js'
import dataModel from './slices/sliceDataModel.js'
import finnHubQueue from './slices/sliceFinnHubQueue.js'
import showData from './slices/sliceShowData.js'

export const store = configureStore({
  reducer: {
    'exchangeData': exchangeData,
    'exchangeList': exchangeList,
    'dataModel': dataModel,
    'finnHubQueue': finnHubQueue,
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

