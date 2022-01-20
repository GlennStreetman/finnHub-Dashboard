import { screen, waitFor, fireEvent, prettyDOM } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const changeFilter = async function (widgetType: string, newDate: string) {
    //new date must be 'yyyy-mm-dd'
    await waitFor(() => {
        expect(screen.getByLabelText(`Start Date:`)).toBeInTheDocument();
    });

    const datepicker = screen.getByLabelText("Start Date:");
    userEvent.type(datepicker, "01-01-1999"); // type anything
    let focusChange = screen.getByLabelText("End Date:");
    focusChange.focus();

    // console.log("FOUND start date----");
    // let renameField = screen.getByLabelText(`Start Date:`) as HTMLInputElement;
    // fireEvent.change(renameField, { target: { value: newDate } });
    // await waitFor(() => {
    //     expect(renameField.value).toBe(newDate);
    // });
    // let focusChange = screen.getByTestId(`toDate-${widgetType}`) as HTMLInputElement;
    // focusChange.focus();
    // return true;
};

export { changeFilter };
