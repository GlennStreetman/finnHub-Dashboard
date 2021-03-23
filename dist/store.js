import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import exchangeData from './slices/sliceExchangeData';
import exchangeList from './slices/sliceExchangeList';
import dataModel from './slices/sliceDataModel';
import finnHubQueue from './slices/sliceFinnHubQueue';
import showData from './slices/sliceShowData';
export const store = configureStore({
    reducer: {
        'exchangeData': exchangeData,
        'exchangeList': exchangeList,
        'dataModel': dataModel,
        'finnHubQueue': finnHubQueue,
        'showData': showData,
    },
    middleware: () => getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
    })
});
