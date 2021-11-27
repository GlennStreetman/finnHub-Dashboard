import ToolTip from './toolTip.js'
import { dashBoardData } from 'src/App'
import { UpdateWidgetFilters } from 'src/appFunctions/appImport/widgetLogic'
import { useAppDispatch } from 'src/hooks';
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";

interface props {
    start: string,
    end: string,
    setStart: Function,
    setEnd: Function,
    widgetKey: string,
    widgetType: string,
    dashBoardData: dashBoardData,
    currentDashBoard: string,
    apiKey: string,
    finnHubQueue: finnHubQueue,
    updateAppState: Function,

}

const useDispatch = useAppDispatch

export default function WidgetFilterDates(p: props) {

    const dispatch = useDispatch();

    function updateStartDate(e) {
        p.setStart(e.target.value)
    }

    function updateEndDate(e) {
        p.setEnd(e.target.value)
    }

    function updateFilter(e) {
        if (isNaN(new Date(e.target.value).getTime()) === false) {
            const now = Date.now()
            const target = new Date(e.target.value).getTime();
            const offset = target - now
            const name = e.target.name;
            UpdateWidgetFilters(p.widgetKey, { [name]: offset }, p.dashBoardData, p.currentDashBoard, dispatch, p.apiKey, p.finnHubQueue)
        }
    }

    const helpTextStart = <>
        Finnhub API From date for this widget. <br />
        See Finnhub.io/docs for more info.
    </>
    const helpTextEnd = <>
        Finnhub API To date for this widget.<br />
        See Finnhub.io/docs for more info.
    </>

    return (
        <div className='stockSearch'>
            <table className="filterTable">
                <tbody>
                    <tr>
                        <td>
                            <ToolTip textFragment={helpTextStart} hintName={`start-${p.widgetKey}`} />
                        </td>
                        <td style={{ color: 'white' }} className='rightTE'><label htmlFor="start">
                            From date:</label>
                        </td>
                        <td className='centerTE'>
                            <input
                                data-testid={`fromDate-${p.widgetType}`}
                                className="btn"
                                id="start"
                                type="date"
                                name="startDate"
                                onChange={updateStartDate}
                                onBlur={updateFilter}
                                value={p.start}
                            />
                        </td>
                    </tr>
                    <tr style={{ backgroundColor: 'inherit' }}>
                        <td>
                            <ToolTip textFragment={helpTextEnd} hintName={`end-${p.widgetKey}`} />
                        </td>
                        <td style={{ color: 'white' }} className='rightTE'>
                            <label htmlFor="end">To date:</label>
                        </td>
                        <td className='centerTE'>
                            <input
                                data-testid={`toDate-${p.widgetType}`}
                                className="btn"
                                id="end"
                                type="date"
                                name="endDate"
                                onChange={updateEndDate}
                                onBlur={updateFilter}
                                value={p.end}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
