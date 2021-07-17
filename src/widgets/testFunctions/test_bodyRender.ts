
import { screen, waitFor } from '@testing-library/react'

const testBodyRender = async function (testList: string[][]) { //list of string to be in the document
    //add widget to dashboard

    for (const x in testList) {
        // console.log(testList[x])
        await waitFor(() => {
            expect(screen[testList[x][0]](testList[x][1], { exact: false })).toBeInTheDocument()
        })
    }
}

export { testBodyRender }