/* eslint-disable no-sparse-arrays */
import { estimateOptions, fundamentalsOptions, priceOptions } from '../registers/topNavReg'
import { widgetSetup } from 'src/App'
import { updateWidgetSetup } from 'src/appFunctions/appImport/updateWidgetSetup'

interface props {
    widgetSetup: widgetSetup,
    updateAppState: Function,
}

export default function WidgetMenu(p: props) {

    function check(el) {
        const key = el[0]
        const updateObj = {
            [key]: !isChecked(el)
        }
        const newDash = updateWidgetSetup(updateObj, p.widgetSetup)
        p.updateAppState({ widgetSetup: newDash })

    }

    function isChecked(el) {
        if (p.widgetSetup[el[0]] !== undefined) {
            return p.widgetSetup[el[0]]
        } else if (p.widgetSetup[el[0]] === undefined && el[5] === 'Free') {
            return true
        } else {
            return false
        }
    }

    function widgetMenuRows(widgets) {
        const widgetMap = widgets.map((el) => (
            <tr key={el + 'tr'}>
                <td key={el + 'td1'}>{el[1]}</td>
                <td key={el + 'td2'}>{el[5]}</td>
                <td key={el + 'td3'}>
                    <input key={el + 'mark'}
                        type="checkbox"
                        onChange={() => check(el)}
                        checked={isChecked(el)}
                    />
                </td>
            </tr>
        ))
        return widgetMap
    }

    return (
        <div >
            <table >
                <thead>
                    <tr>
                        <td>Widget Name</td>
                        <td>Free/Premium</td>
                        <td>Activate</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><b>Estimates</b></td>
                        <td></td>
                        <td></td>
                    </tr>
                    {widgetMenuRows(estimateOptions)}
                    <tr>
                        <td><b>Fundamentals</b></td>
                        <td></td>
                        <td></td>
                    </tr>
                    {widgetMenuRows(fundamentalsOptions)}
                    <tr>
                        <td><b>Price</b></td>
                        <td></td>
                        <td></td>
                    </tr>
                    {widgetMenuRows(priceOptions)}
                </tbody>
            </table>
        </div>
    )
}

export function widgetMenuProps(that) {
    let propList = {
        widgetSetup: that.state.widgetSetup,
        updateAppState: that.updateAppState,
    };
    return propList;
}

