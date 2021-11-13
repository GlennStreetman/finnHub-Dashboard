import produce from 'immer'
export function MenuWidgetToggle(show: boolean) {
    //Create dashboard menu if first time looking at, else toggle visability
    // console.log('toggle', show)
    const s = this.state
    const widgetList = s.dashBoardData[s.currentDashBoard].widgetList
    const newWidgetList = produce(widgetList, (draftState) => {
        for (const x in draftState) { //hide any widgets in column 1
            if (draftState[x].column === 0) draftState[x].showBody = show
        }
    })
    const newMenuList = produce(s.menuList, (draftState) => {
        for (const x in draftState) { //hide any widgets in column 1
            draftState[x].showBody = show
        }
    })

    this.setState({
        widgetList: newWidgetList,
        menuList: newMenuList,
        showMenuColumn: show,
    })
}
