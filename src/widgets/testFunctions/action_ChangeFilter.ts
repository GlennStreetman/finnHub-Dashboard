
import { screen, waitFor, fireEvent, prettyDOM } from '@testing-library/react'



const changeFilter = async function (widgetType: string, newDate: string) { //new date must be 'yyyy-mm-dd'
    await waitFor(() => {
        expect(screen.getByTestId(`fromDate-${widgetType}`)).toBeInTheDocument()
    })
    let renameField = screen.getByTestId(`fromDate-${widgetType}`) as HTMLInputElement
    fireEvent.change(renameField, { target: { value: newDate } })
    await waitFor(() => {
        expect(renameField.value).toBe(newDate)
    })
    let focusChange = screen.getByTestId(`toDate-${widgetType}`) as HTMLInputElement
    focusChange.focus()
}

export { changeFilter }