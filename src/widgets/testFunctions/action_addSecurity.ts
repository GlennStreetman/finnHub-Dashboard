import { screen, waitFor, fireEvent } from "@testing-library/react"; //prettyDOM
import userEvent from "@testing-library/user-event";

const addSecurity = async function (widgetType: string, addSecuritys: string[]) {
    //testFunction(same name), Category, Category text, widget Text
    //add security to widget from config view.
    for (const x in addSecuritys) {
        await waitFor(() => {
            expect(screen.getByTestId(`searchPaneValue-${widgetType}`)).toBeInTheDocument();
        });
        let renameField = screen.getByTestId(`searchPaneValue-${widgetType}`) as HTMLInputElement;

        await renameField.focus();
        await userEvent.type(renameField, addSecuritys[x][1]); //type text
        console.log("finding", `tag-${addSecuritys[x][1]}`);
        await waitFor(() => {
            expect(screen.getByTestId(`tag-${addSecuritys[x][1]}`)).toBeInTheDocument();
        });
        await fireEvent.click(screen.getByTestId(`tag-${addSecuritys[x][1]}`)); //submit security update.
        await fireEvent.click(screen.getByTestId(`SubmitSecurity-${widgetType}`)); //submit security update.
    }
    return true;
};

export { addSecurity };
