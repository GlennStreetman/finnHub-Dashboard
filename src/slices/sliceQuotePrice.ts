import { createSlice } from '@reduxjs/toolkit';
import { tgetQuotePrices } from '../thunks/thunkGetQuotePrices'

interface quote {
    [key: string]: number
}

export interface sliceQuotePrice {
    quote: quote,
    lastUpdate: number
}

export interface rUpdarUpdateQuotePricePayload {
    [key: string]: number
}

const startingState: sliceQuotePrice = {
    quote: {},
    lastUpdate: Date.now()
}

const quotePrice = createSlice({ //Security quote prices. Updated by v1/quote route and price socket data.
    name: 'quotePrice',
    initialState: startingState,
    reducers: {
        rUpdateQuotePriceSetup: (state: sliceQuotePrice, action: any) => {
            // if (Date.now() - state.lastUpdate > 5000) { //throttle update rate.
            const ap: rUpdarUpdateQuotePricePayload = action.payload
            for (const stock in Object.entries(ap)) {
                const entry = Object.entries(ap)[stock]
                state.quote[entry[0]] = entry[1]
            }
            state.lastUpdate = Date.now()
            // }
        },
        rUpdateQuotePriceStream: (state: sliceQuotePrice, action: any) => {
            if (Date.now() - state.lastUpdate > 5000) { //throttle update rate.
                const ap: rUpdarUpdateQuotePricePayload = action.payload
                for (const stock in Object.entries(ap)) {
                    const entry = Object.entries(ap)[stock]
                    state.quote[entry[0]] = entry[1]
                }
                state.lastUpdate = Date.now()
            }
        },
    },
    extraReducers: {
        [tgetQuotePrices.pending.toString()]: (state, action) => {
        },
        [tgetQuotePrices.rejected.toString()]: (state, action) => {
            console.log('2. failed to retrieve stock data for: ', action)
        },
        [tgetQuotePrices.fulfilled.toString()]: (state, action) => {
            const ap = action.payload
            if (ap) state.quote[ap[0]] = ap[1]
        },
    }
})

export const {
    rUpdateQuotePriceSetup,
    rUpdateQuotePriceStream
} = quotePrice.actions
export default quotePrice.reducer