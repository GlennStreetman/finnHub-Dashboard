
import { screen, } from '@testing-library/react'
import userEvent from '@testing-library/user-event';

const setSecurityFocus = async function (widgetType: string, newFocus: string) {
    userEvent.selectOptions(screen.getByTestId(`focus-${widgetType}`), [newFocus])
}
export { setSecurityFocus }
