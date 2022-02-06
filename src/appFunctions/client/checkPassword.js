export const checkPassword = async function (email, pwText) {
    let res = await fetch(`/login?email=${email}&pwText=${pwText}`);
    if (res.status === 500) {
        console.log("No Response from server");
        throw new Error("Problem with server");
    }
    let data = await res.json();
    data.status = res.status;
    return data;
};
