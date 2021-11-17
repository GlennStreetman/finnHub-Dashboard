import { AppProps } from './../../App'
import { rUpdateExchangeListPayload } from './../../slices/sliceExchangeList'
import { rUpdateExchangeList } from './../../slices/sliceExchangeList'

export const UpdateExchangeList = function (dispatch: Function, ex: string | string[]) {

    if (typeof ex === "string") {
        const newList: string[] = ex.split(",");
        const payload: rUpdateExchangeListPayload = {
            exchangeList: newList,
        };
        dispatch(rUpdateExchangeList(payload));
    } else {
        const payload: Partial<AppProps> = { exchangeList: ex }
        dispatch(rUpdateExchangeList(payload));
    }
}