
import { screen, waitFor } from '@testing-library/react'

const testBodyRender = async function (node, testList: string[][]) { //list of string to be in the document
    //add widget to dashboard
    for (const x in testList) {
        await waitFor(() => {
            expect(screen[testList[x][0]](testList[x][1])).toBeInTheDocument()
        })
    }
}

export { testBodyRender }