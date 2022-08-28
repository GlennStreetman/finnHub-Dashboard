// import { screen, waitFor } from "@testing-library/react";
import { screen, render, waitFor, fireEvent, prettyDOM } from "@testing-library/react"; //prettyDOM

const testBodyRender = async function (testList: string[][]) {
    //list of string to be in the document
    for (const x in testList) {
        await waitFor(() => {
            
            expect(screen[testList[x][0]](testList[x][1], { exact: false })).toBeInTheDocument();
            // console.log(prettyDOM(screen.getByTestId('container-basicFinancialsBody'), 30000))
        });
    }
    return true;
};

export { testBodyRender };
