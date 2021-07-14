
import { screen } from '@testing-library/react'
import fireEvent from '@testing-library/user-event';


const toggleEditPane = async function (widgetType: string) {
    expect(screen.getByTestId(`editPaneButton-${widgetType}`)).toBeInTheDocument()
    fireEvent.click(screen.getByTestId(`editPaneButton-${widgetType}`))
}
export { toggleEditPane }
