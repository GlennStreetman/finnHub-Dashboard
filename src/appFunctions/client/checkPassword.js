export const checkPassword = async function (loginText, pwText) {
    let res = await fetch(`/login?loginText=${loginText}&pwText=${pwText}`)
    if (res.status === 500) {
        console.log('No Response from server')
        throw new Error('Problem with server');
    }
    let data = await res.json()
    data.status = res.status
    return data;
}

