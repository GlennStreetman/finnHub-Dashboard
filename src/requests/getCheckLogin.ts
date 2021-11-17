export const getCheckLogin = async function () {
    const response = await fetch("/checkLogin")
    const data = await response.json()
    return data
}