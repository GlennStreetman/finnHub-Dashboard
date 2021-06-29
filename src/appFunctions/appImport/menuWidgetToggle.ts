export function MenuWidgetToggle(context) {
    //Create dashboard menu if first time looking at, else toggle visability
    return function toggleFunction(menuName, dashName = "pass", that = context) {
        if (that.state.menuList[menuName] === undefined) {
            that.newMenuContainer(menuName, dashName, "menuWidget");
            that.setState({ [menuName]: 1 });
        } else {
            that.state[menuName] === 1 ? that.setState({ [menuName]: 0 }) : that.setState({ [menuName]: 1 });
        }
    }
}