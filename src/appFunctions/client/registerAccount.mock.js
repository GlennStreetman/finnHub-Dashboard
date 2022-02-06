import { registerAccount } from "./registerAccount";

export const registerAccountMock = jest.fn((loginText, pwText, reEnter, emailText, emailIsValid) => {
    return new Promise(async (res) => {
        const val = await registerAccount(loginText, pwText, reEnter, emailText, emailIsValid);
        res(val);
    });
});
