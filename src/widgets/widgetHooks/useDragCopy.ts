import { useImperativeHandle } from "react";

export const useDragCopy = function (ref, exposedStateObj) {

    useImperativeHandle(ref, () => (
        //used to copy widgets when being dragged. example: if widget body renders time series data into chart, copy chart data.
        //add additional slices of state to list if they help reduce re-render time.
        {
            state: exposedStateObj
        }
    )

    )
}

