import { screen, fireEvent } from '@testing-library/react'

const clickPagination = async function (button: string) { //testFunction(same name), Category, Category text, widget Text
    await fireEvent.click(screen.getByTestId(button)) //copy submenu text
}
export { clickPagination }