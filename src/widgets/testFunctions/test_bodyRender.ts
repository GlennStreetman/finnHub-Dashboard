import { screen, waitFor } from "@testing-library/react";

const testBodyRender = async function (testList: string[][]) {
    //list of string to be in the document
    for (const x in testList) {
        await waitFor(() => {
            expect(screen[testList[x][0]](testList[x][1], { exact: false })).toBeInTheDocument();
        });
    }
    return true;
};

export { testBodyRender };
