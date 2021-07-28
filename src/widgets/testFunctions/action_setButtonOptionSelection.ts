
import { screen, } from '@testing-library/react'
import userEvent from '@testing-library/user-event';

const setButtonOptionSelection = async function (dropDownTestID: string, newTarget: string) {
    userEvent.selectOptions(screen.getByTestId(dropDownTestID), [newTarget])
    return true
}
export { setButtonOptionSelection }
