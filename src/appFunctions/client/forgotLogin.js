export const forgotLogin = async function forgotLogin(loginText) {
    // console.log("recover login request sent");
    let res = await fetch(`/forgot?loginText=${loginText}`)
    if (res.status === 500) {
        throw new Error();
    }
    let data = await res.json()
    return data
    
}  
