function emailIsValid(email) {
    return /\S+@\S+\.\S+/.test(email);
}

const passwordIsValid = function (password) {
    //Minimum eight characters, at least one letter, one number and one special character:
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(
        password
    );
};

export const registerAccount = async function registerAccount(
    email,
    password,
    password2
) {
    console.log("attempting registration", email, password, password2);
    if (
        emailIsValid(email) === true &&
        password === password2 &&
        passwordIsValid(password)
    ) {
        console.log("is Valid");
        const reqObj = {
            pwText: password,
            emailText: email,
        };
        console.log("reqObj", reqObj);
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reqObj),
        };
        console.log("fetching");
        let res = await fetch("/api/register", options);
        console.log("registration status: ", res.status);
        if (res.status === 500) {
            console.log("error registering 500");
            throw new Error();
        }
        const data = await res.json();
        data.status = res.status;
        if (res.status === 200) {
            data.status = res.status;
            console.log("REGISTRATION SUCCESSFUL", data);
            return { message: data.message, status: res.status };
        } else {
            console.log("other status code than 200", data);
            return data;
        }
    } else {
        console.log("failed registration checks");
        const updateObj = { message: "Please review warnings" };
        return updateObj;
    }
};
