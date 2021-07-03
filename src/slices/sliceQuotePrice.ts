import { createSlice } from '@reduxjs/toolkit';

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
            console.log(ap)
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
                console.log(ap)
                for (const stock in Object.entries(ap)) {
                    const entry = Object.entries(ap)[stock]
                    state.quote[entry[0]] = entry[1]
                }
                state.lastUpdate = Date.now()
            }
        },
    },
})

export const {
    rUpdateQuotePriceSetup,
    rUpdateQuotePriceStream
} = quotePrice.actions
export default quotePrice.reducer