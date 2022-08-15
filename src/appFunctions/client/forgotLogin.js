export const forgotLogin = async function forgotLogin(loginText) {
    console.log("recover login request sent");
    let res = await fetch(`/api/forgot?loginText=${loginText}`);
    if (res.status === 500) {
        console.log("error recovering pw");
        throw new Error();
    }
    let data = await res.json();
    return data;
};
