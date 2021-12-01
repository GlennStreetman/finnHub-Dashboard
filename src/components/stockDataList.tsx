
//list of stock data used for auto complete on stock search.
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { useEffect } from "react";
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";
import { reqObj } from 'src/slices/sliceExchangeData'
import { tGetSymbolList } from "../slices/sliceExchangeData";

interface props {
    searchText: string,
    finnHubQueue: finnHubQueue,
}

const useDispatch = useAppDispatch
const useSelector = useAppSelector


export default function StockDataList(p: props) {

    const dispatch = useDispatch(); //allows widget to run redux actions.
    const apiKey = useSelector((state) => state.apiKey)
    const defaultExchange = useSelector((state) => state.defaultExchange)
    const stockDataExchange = useSelector(state => state.exchangeData.e.ex)
    const rFilteredStocks = useSelector((state) => {
        const thisExchange = state.exchangeData.e?.data
        const newFilteredList: string[] = []
        if (thisExchange !== undefined) {
            const availableStockCount = Object.keys(thisExchange).length;
            const exchangeKeys = Object.keys(thisExchange) //list
            for (let resultCount = 0, filteredCount = 0;
                resultCount < 20 && filteredCount < availableStockCount;
                filteredCount++) {
                const thisKey = exchangeKeys[filteredCount]
                const thisSearchPhrase = `${thisExchange[thisKey].key}: ${thisExchange[thisKey].description}`
                if (thisSearchPhrase.includes(p.searchText) === true) {
                    resultCount = resultCount + 1;
                    newFilteredList.push(thisSearchPhrase);
                }
            }
            return newFilteredList
        } else {
            return undefined
        }
    })

    useEffect(() => { //update exchange data if not updating, on user input.
        if (
            apiKey !== '' &&
            p.searchText.length >= 1 &&
            defaultExchange !== stockDataExchange &&
            stockDataExchange !== 'updating'
        ) {
            const tGetSymbolObj: reqObj = {
                exchange: defaultExchange,
                apiKey: apiKey,
                finnHubQueue: p.finnHubQueue,
                dispatch: dispatch,
            }
            dispatch(tGetSymbolList(tGetSymbolObj))
        }
    }, [apiKey, defaultExchange, p.searchText, stockDataExchange])

    function createDataList() {
        //creates datalist used for autocomplete of stock names.
        if (rFilteredStocks !== undefined) {
            const stockListKey = rFilteredStocks.map((el) => (
                <option key={el + "op"} value={el} >
                    {el}
                </option>
            ));
            return stockListKey;
        }

    }

    return <>{createDataList()} </>;

}

// const mapStateToProps = (state, ownProps) => {
//     const p = ownProps
//     const thisExchange = state.exchangeData.e?.data
//     const newFilteredList = []
//     if (thisExchange !== undefined) {
//         const availableStockCount = Object.keys(thisExchange).length;
//         const exchangeKeys = Object.keys(thisExchange) //list
//         for (let resultCount = 0, filteredCount = 0;
//             resultCount < 20 && filteredCount < availableStockCount;
//             filteredCount++) {
//             const thisKey = exchangeKeys[filteredCount]
//             const thisSearchPhrase = `${thisExchange[thisKey].key}: ${thisExchange[thisKey].description}`
//             if (thisSearchPhrase.includes(p.inputText) === true) {
//                 resultCount = resultCount + 1;
//                 newFilteredList.push(thisSearchPhrase);
//             }
//         }
//         return {
//             rFilteredStocks: newFilteredList,
//         }
//     } else {
//         return {
//             rFilteredStocks: undefined,
//         }
//     }
// }


