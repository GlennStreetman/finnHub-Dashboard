
import { screen, } from '@testing-library/react'
import userEvent from '@testing-library/user-event';

const setSecurityFocus = function (widgetType: string, newFocus: string) {
    userEvent.selectOptions(screen.getByTestId(`focus-${widgetType}`), [newFocus])
    return true
}

export { setSecurityFocus }
