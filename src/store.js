import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import exchangeData from './slices/sliceExchangeData.js'
import exchangeList from './slices/sliceExchangeList.js'
import dataModel from './slices/sliceDataModel.js'
import finnHubQueue from './slices/sliceFinnHubQueue.js'
import showData from './slices/sliceShowData.js'

export default configureStore({
  reducer: {
    'exchangeData': exchangeData,
    'exchangeList': exchangeList,
    'dataModel': dataModel, 
    'finnHubQueue': finnHubQueue,
    'showData': showData,
  },
  middleware: () =>
    getDefaultMiddleware ({
      immutableCheck: false, 
      serializableCheck: false,
    })
  //middleware and devtools are setup by default. 
  //middelware: getDefaultMIddleware(),
  //devTools: true
}); 

//createSlice() - reduces need fo constants and types, as well as action creators.  
//functions provided to createSlice become action and reducers.
//Takes intital state object filled with reducer functions.
//reducers derive state, they are a series of functions
//useDispatch && useSelector -- actions trigger reducers
//zimmer runs under the hood. YOu can mutate state and its treated like a copy then update.
