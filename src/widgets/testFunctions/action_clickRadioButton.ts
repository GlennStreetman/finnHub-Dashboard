import { screen, fireEvent } from '@testing-library/react'

const clickRadioButton = async function (button: string) { //testFunction(same name), Category, Category text, widget Text
    await fireEvent.click(screen.getByTestId(button)) //copy submenu text
    return true
}

export { clickRadioButton }