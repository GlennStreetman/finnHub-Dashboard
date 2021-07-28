import { screen, fireEvent, waitFor } from '@testing-library/react'

const newWidgetName = async function (widgetType: string, newName: string[]) { //testFunction(same name), Category, Category text, widget Text
    for (const x in newName) {
        let renameField = screen.getByTestId(`rename-${widgetType}`) as HTMLInputElement
        fireEvent.change(renameField, { target: { value: newName[x] } })
        await waitFor(() => {
            expect(renameField.value).toBe(newName[x])
        })
    }
    return true
}

export { newWidgetName }