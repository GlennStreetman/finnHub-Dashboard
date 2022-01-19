export const registerAccount = async function registerAccount(loginText, pwText, reEnter, emailText, secretQuestion, secretAnswer, emailIsValid) {
    if (
        loginText.length >= 6 &&
        pwText.length >= 8 &&
        emailIsValid(emailText) === true &&
        secretQuestion.length >= 8 &&
        secretAnswer.length >= 8 &&
        pwText === reEnter
    ) {
        const reqObj = {
            loginText: loginText,
            pwText: pwText,
            emailText: emailText,
            secretQuestion: secretQuestion,
            secretAnswer: secretAnswer,
        };

        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reqObj),
        };

        let res = await fetch("/register", options);
        console.log("registration status: ", res.status);
        if (res.status === 500) {
            throw new Error();
        }
        const data = await res.json();
        data.status = res.status;
        if (res.status === 200) {
            data.status = res.status;
            console.log("REGISTRATION SUCCESSFUL", data);
            return { message: data.message, status: res.status };
        } else {
            return data;
        }
    } else {
        const updateObj = { message: "Please review warnings" };
        loginText.length < 6 ? (updateObj.warn0 = "User name must be at least 6 characters") : (updateObj.warn0 = "");
        pwText.length < 8 ? (updateObj.warn1 = "Password must be at least 8 characters") : (updateObj.warn1 = "");
        pwText !== reEnter ? (updateObj.warn2 = "Passwords do not match") : (updateObj.warn2 = "");
        emailIsValid(emailText) === false ? (updateObj.warn3 = "Email must be valid") : (updateObj.warn3 = "");
        secretQuestion.length < 8 ? (updateObj.warn4 = "Secret question must be at least 8 characters") : (updateObj.warn4 = "");
        secretAnswer.length < 8 ? (updateObj.warn5 = "Secret answer must be at least 8 characters") : (updateObj.warn5 = "");
        return updateObj;
    }
};
