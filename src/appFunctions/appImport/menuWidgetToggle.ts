export function MenuWidgetToggle(context) {
    //Create dashboard menu if first time looking at, else toggle visability
    return function toggleFunction(menuName, dashName = "pass", that = context) {
        console.log(menuName, dashName, that)
        // const menuNameRef = menuName.charAt(0).toUpperCase() + menuName.slice(1)
        if (that.state.menuList[menuName] === undefined) {
            console.log('here', menuName)
            that.newMenuContainer(menuName, dashName, "menuWidget");
            that.setState({ [menuName]: 1 });
        } else {
            console.log('there:', menuName)
            that.state[menuName] === 1 ? that.setState({ [menuName]: 0 }) : that.setState({ [menuName]: 1 });
        }
    }
}