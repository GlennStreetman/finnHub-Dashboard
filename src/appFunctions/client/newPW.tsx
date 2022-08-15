export const newPW = async function newPW(loginText, pwText) {
    console.log("submitting new password");
    if (loginText === pwText) {
        console.log(
            "wating on server for updating confirmation",
            "/newPW?newPassword=" + loginText
        );
        const res = await fetch(`/api/newPW?newPassword=${loginText}`);
        console.log("res", res, res.status);
        let data = await res.json();
        console.log(res.status, data);
        if (res.status === 500) {
            console.log(data);
            return { message: false };
        } else if (res.status === 401) {
            console.log("401: problem updating password");
            return { message: false };
        } else if (res.status === 200) {
            return { message: true };
        } else {
            console.log("response other than 401/200 on password update");
            return { message: false };
        }
    } else {
        console.log("not matching");
        return { message: "Password entries do not match." };
    }
};
