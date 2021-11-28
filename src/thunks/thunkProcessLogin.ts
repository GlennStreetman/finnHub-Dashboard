import { createAsyncThunk } from '@reduxjs/toolkit';

interface tProcessLoginReq {
    defaultexchange: string,
    apiKey: string,
    apiAlias: string,
    exchangelist: string[]
}

export const tProcessLogin = createAsyncThunk(
    'tProcessLogin',
    (req: tProcessLoginReq, thunkAPI: any) => {
        return req
    })