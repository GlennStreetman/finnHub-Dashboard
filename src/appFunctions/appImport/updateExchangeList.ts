import { AppProps } from './../../App'
import { rUpdateExchangeListPayload } from './../../slices/sliceExchangeList'

export const updateExchangeList = function (ex: string) {

    const p: AppProps = this.props;

    if (typeof ex === "string") {
        const newList: string[] = ex.split(",");
        const payload: rUpdateExchangeListPayload = {
            exchangeList: newList,
        };
        p.rUpdateExchangeList(payload);
    } else {
        const payload: Partial<AppProps> = { exchangeList: ex }
        p.rUpdateExchangeList(payload);
    }
}