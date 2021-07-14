
import { screen, waitFor, fireEvent } from '@testing-library/react' //prettyDOM
import userEvent from '@testing-library/user-event';

const addSecurity = async function (widgetType: string, addSecuritys: string[]) { //testFunction(same name), Category, Category text, widget Text
    //add security to widget from config view.
    for (const x in addSecuritys) {
        let renameField = screen.getByTestId(`searchPaneValue-${widgetType}`) as HTMLInputElement
        await renameField.focus()
        await userEvent.type(renameField, addSecuritys[x][1], { delay: 10 }) //type text
        await waitFor(() => {
            expect(renameField.value).toBe(addSecuritys[x][1]) //wait for stock name to fill in.
        })
        // let renameList = screen.getByTestId(`stockSearchPane-${widgetType}`) as HTMLInputElement
        // console.log(prettyDOM(renameList))

        await fireEvent.click(screen.getByTestId(`SubmitSecurity-${widgetType}`)) //submit security update.
        await waitFor(() => {
            expect(screen.getByTestId(`remove-US-${addSecuritys[x][0]}`)).toBeInTheDocument()
        })
    }
}

export { addSecurity }
