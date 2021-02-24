export const newPW = async function newPW(loginText, pwText) {
    if (loginText === pwText) {
        let res = await fetch("/newPW?newPassword=" + this.state.loginText)
            if (res.status === 500) {
                throw new Error();
            }
            let data = await res.json()
            return data

    } else {
        return ({ serverResponse: "Password entries do not match." });
    }
}
