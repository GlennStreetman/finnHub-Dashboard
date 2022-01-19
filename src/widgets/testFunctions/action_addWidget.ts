
import { screen, waitFor, fireEvent, prettyDOM } from '@testing-library/react'


const addWidget = async function (categoryText: string, widgetName: string, widgetContainer: string) { //testFunction(same name), Category, Category text, widget Text
    //add widget to dashboard

    fireEvent.click(screen.getByTestId('showWidgetManagementMenu')); //open widget menu
    await waitFor(() => {
        expect(screen.getByTestId('manageWidgets-SelectWidgetGroup')).toBeInTheDocument() //wait for widget grouping menu to load
    })
    const dropdown = await screen.findByLabelText('API Heading')
    fireEvent.mouseDown(dropdown); //open dropdown selection
    await waitFor(() => {
        expect(screen.getByTestId(`${categoryText}-selection`)).toBeInTheDocument() //wait for widget grouping menu to load
    })

    fireEvent.click(screen.getByTestId(`${categoryText}-selection`)); //select correct grouping
    await waitFor(() => {
        expect(screen.getByTestId(widgetName)).toBeInTheDocument() //wait for correct widget to be in document
    })

    fireEvent.click(screen.getByTestId(widgetName)); //load widget
    fireEvent.click(screen.getByTestId('showDashboardMenu')); //load dashboard screen.

    await waitFor(() => {
        expect(screen.getByTestId(widgetContainer)).toBeInTheDocument() //wait for correct widget to be in document
    })
    return true
}

export { addWidget }