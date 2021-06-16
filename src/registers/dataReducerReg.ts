// import all API string generator functions here and register below to widgetDict.

import { basicFinancialsReducer } from "../widgets/Fundamentals/basicFinancials/basicFinancialsReducer";


interface widgetDictInt {
    [key: string]: Function
}

export const widgetReducers: widgetDictInt = { //if api data needs to be modified for use in widget. Useful if data is over queried.
    FundamentalsBasicFinancials: basicFinancialsReducer,
}
