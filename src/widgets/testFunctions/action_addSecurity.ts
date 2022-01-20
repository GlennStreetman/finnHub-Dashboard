import { screen, waitFor, fireEvent } from "@testing-library/react"; //prettyDOM
import userEvent from "@testing-library/user-event";

const addSecurity = async function (widgetType: string, addSecuritys: string[]) {
    //testFunction(same name), Category, Category text, widget Text
    //add security to widget from config view.
    for (const x in addSecuritys) {
        console.log("adding: ", addSecuritys[x][1]);
        let renameField = screen.getByTestId(`searchPaneValue-${widgetType}`) as HTMLInputElement;
        await renameField.focus();
        console.log("--FOCUS COMPLETE--", addSecuritys[x][1]);
        await userEvent.type(renameField, addSecuritys[x][1], { delay: 0 }); //type text
        console.log("NOW TO CLICK", `tag-${addSecuritys[x][1]}`);
        await waitFor(() => {
            expect(screen.getByTestId(`tag-${addSecuritys[x][1]}`)).toBeInTheDocument();
        });
        console.log("security ready to be added", `tag-${addSecuritys[x][1]}`);
        await fireEvent.click(screen.getByTestId(`tag-${addSecuritys[x][1]}`)); //submit security update.
        // let renameList = screen.getByTestId(`stockSearchPane-${widgetType}`) as HTMLInputElement
        // console.log(prettyDOM(renameList))
        // console.log("added security---", addSecuritys[x][1]);

        await fireEvent.click(screen.getByTestId(`SubmitSecurity-${widgetType}`)); //submit security update.
        console.log("security added: ", addSecuritys[x][1]);
        // await waitFor(() => {
        //     expect(screen.getByTestId(`remove-US-${addSecuritys[x][0]}`)).toBeInTheDocument();
        // });
    }
    return true;
};

export { addSecurity };
