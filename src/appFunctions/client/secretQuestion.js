export const secretQuestion = async function secretQuestion(loginText, userName) {
    //checks secret question before allowing pw reset.
    let res = await fetch(`/secretQuestion?loginText=${loginText}&user=${userName}`)
    if (res.status === 500) {
        throw new Error();
    }
    let data = await res.json()
    console.log("SECRET QUESTION RESPONSE: ", data)
    return data
}

