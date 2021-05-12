import { AppState, AppProps } from './../../App'
import { rUpdateExchangeListPayload } from './../../slices/sliceExchangeList'

export const updateExchangeList = function (this, ex: string) {

    const p: AppProps = this.props;

    if (typeof ex === "string") {
        const newList: string[] = ex.split(",");
        const payload: rUpdateExchangeListPayload = {
            exchangeList: newList,
        };
        p.rUpdateExchangeList(payload);
        const newState: Partial<AppState> = { exchangeList: newList }
        this.setState(newState);
    } else {
        const newState: Partial<AppState> = { exchangeList: ex }
        this.setState(newState);
    }
}