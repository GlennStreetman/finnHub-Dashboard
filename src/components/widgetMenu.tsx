import { estimateOptions, fundamentalsOptions, priceOptions } from '../registers/topNavReg.js'

export default function WidgetMenu(p: { [key: string]: any }, ref: any) {

    function check(el) {
        console.log(el)
        const key = el[0]
        const updateObj = {
            [key]: !isChecked(el)
        }
        console.log(updateObj)
        p.updateWidgetSetup(updateObj)
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
            <tr>
                <td>{el[1]}</td>
                <td>{el[5]}</td>
                <td>
                    <input key={el[0] + 'mark'}
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
        updateWidgetSetup: that.updateWidgetSetup,
        widgetSetup: that.state.widgetSetup,
    };
    return propList;
}

