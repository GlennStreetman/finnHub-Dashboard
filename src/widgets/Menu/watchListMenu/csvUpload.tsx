import { useEffect } from "react";
import { rSetTargetSecurity } from 'src/slices/sliceTargetSecurity'
import { tSaveDashboard } from 'src/thunks/thunkSaveDashboard'
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { rReplaceGlobalStocklist } from 'src/slices/sliceDashboardData'

interface props {
    resetUploadList: Function,
    uploadList: string[],
}

const useDispatch = useAppDispatch
const useSelector = useAppSelector

export default function CsvUpload(p: props) {

    const dispatch = useDispatch(); //allows widget to run redux actions
    const currentDashboard = useSelector((state) => { return state.currentDashboard })
    const dashboardData = useSelector((state) => { return state.dashboardData })
    const rUpdateObj = useSelector((state) => {
        const ul = p.uploadList
        const updateObj = {}
        console.log("MAPPING")
        for (const s in ul) { //stock in uploadlist
            const stock = ul[s]
            const exchange = stock.slice(0, stock.indexOf('-'))
            const updateStock = state.exchangeData.e.ex === exchange && state?.exchangeData?.e?.data?.[stock] ? { ...state.exchangeData.e.data[stock] } : 'pass'
            if (updateStock !== 'pass') {
                updateObj[stock] = updateStock
            }
        }
        return updateObj
    })

    useEffect(() => {
        async function runComponent() {
            dispatch(rReplaceGlobalStocklist({
                stockObj: rUpdateObj,
                currentDashboard: currentDashboard,
            }))
            const focus = rUpdateObj[Object.keys(rUpdateObj)[0]] ? rUpdateObj[Object.keys(rUpdateObj)[0]].key : ''

            dispatch(rSetTargetSecurity(focus))
            p.resetUploadList()
            tSaveDashboard({ dashboardName: currentDashboard })
        }
        runComponent()
    }, [])

    return (
        <></>
    )
}