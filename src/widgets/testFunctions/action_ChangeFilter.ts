
import { screen, waitFor, fireEvent } from '@testing-library/react'

const changeFilter = async function (widgetType: string, newDate: string) { //new date must be 'yyyy-mm-dd'
    let renameField = screen.getByTestId(`fromDate-${widgetType}`) as HTMLInputElement
    fireEvent.change(renameField, { target: { value: newDate } })
    await waitFor(() => {
        expect(renameField.value).toBe(newDate)
    })
}

export { changeFilter }