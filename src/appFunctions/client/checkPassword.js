export const checkPassword = async function checkPassword(loginText, pwText) {
    let res = await fetch(`/login?loginText=${loginText}&pwText=${pwText}`)
    if (res.status === 500) {
        throw new Error();
    }
    
    let data = await res.json()
    data.status = res.status
    return data;
}

