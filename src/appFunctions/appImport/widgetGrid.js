export const SetDrag = function setDrag(stateRef, widgetId, widgetCopy){
    const ref = stateRef === "menuWidget" ? "menuList" : "widgetList";
    let updatedWidgetLocation = Object.assign({}, this.state[ref]);
    updatedWidgetLocation[widgetId]['column'] = 'drag';
    return new Promise((resolve, reject) => {
        this.setState({ ref: updatedWidgetLocation, widgetCopy: widgetCopy }, ()=>{
        resolve(true)
        })
    })
}

export const MoveWidget = function moveWidget(stateRef, widgetId, xxAxis, yyAxis, callback=()=>{}) {
    //updates x and y pixel location of target widget.
    //stateref should be "widgetList" or "menuList"
    const widgetListRef = stateRef === "menuWidget" ? "menuList" : "widgetList"
    let updatedWidgetLocation = Object.assign({}, this.state[widgetListRef]);
    updatedWidgetLocation[widgetId]["xAxis"] = xxAxis;
    updatedWidgetLocation[widgetId]["yAxis"] = yyAxis;
    this.setState({ widgetListRef: updatedWidgetLocation }, callback());
}

export const SnapOrder = function snapOrder(widget, column, yyAxis, wType){
    const s = this.state
    // console.log(widget, column, yyAxis, wType)
    let allWidgets = [...Object.values(s.menuList), ...Object.values(s.widgetList)]
    allWidgets = allWidgets.filter(w => (w['column'] === column ? true : false))
    allWidgets = allWidgets.sort((a,b) => (a.columnOrder > b.columnOrder) ? 1 : -1)

    // console.log("1.Sorted Column", allWidgets)

    let targetLocation = 0
    let foundInsertPoint = false
    let insertionPoint = 0
    let totalHeight = 60
    for (const w in allWidgets) { 
        const h = document.getElementById(allWidgets[w]['widgetID'] + "box").clientHeight
        // console.log("dragHeight:",yyAxis, " ", allWidgets[w].widgetType, totalHeight)
        if (foundInsertPoint === true) {
            allWidgets[w].columnOrder = targetLocation
            targetLocation = targetLocation + 1
        } else if (totalHeight > yyAxis) {
            foundInsertPoint = true
            allWidgets[w].columnOrder = targetLocation + 1
            insertionPoint = targetLocation
            targetLocation = targetLocation + 1
        } else {
            allWidgets[w].columnOrder = targetLocation
            totalHeight = totalHeight + h
            targetLocation = targetLocation + 1
        }
    }

    if (foundInsertPoint === false) {insertionPoint = targetLocation + 1}

    const newMenu = {...s.menuList}
    const newWidget = {...s.widgetList}
    for (const w in allWidgets) {
        if (allWidgets[w]['widgetConfig'] === 'stockWidget') {
            newWidget[allWidgets[w]['widgetID']]['columnOrder'] = allWidgets[w]['columnOrder']
        } else {
            newMenu[allWidgets[w]['widgetID']]['columnOrder'] = allWidgets[w]['columnOrder']
        }
    }
    if (wType === 'stockWidget') {
        newWidget[widget].column = column
        newWidget[widget].columnOrder = insertionPoint
    } else {
        newMenu[widget].column = column  
        newMenu[widget].columnOrder = insertionPoint
    }
        // console.log("4:",newMenu, newWidget)
    this.setState({
    menuList: newMenu, 
    widgetList: newWidget
    })
}
  // totalHeight = totalHeight + targetColumn[w].height

export const SnapWidget = function snapWidget(stateRef, widgetId, xxAxis, yyAxis){
    //adjust column based upon status of hidden columns
    const s = this.state
    const addColumn = {}
    addColumn[s.menuList.DashBoardMenu.column] = []
    addColumn[s.menuList.WatchListMenu.column] = []
    addColumn[s.menuList.DashBoardMenu.column].push(s.DashBoardMenu)
    addColumn[s.menuList.WatchListMenu.column].push(s.WatchListMenu)
    for (const w in s.widgetList) {
        if (addColumn[s.widgetList[w].column] !== undefined ) {
        addColumn[s.widgetList[w].column].push(1)
        }
    }
    // console.log(addColumn)
    let column = Math.floor(xxAxis / 400)
    for (const x in addColumn) {
        if (addColumn[x].reduce((a,b) => a + b, 0) === 0){
            column = column + 1
        }
    }
    this.snapOrder(widgetId, column, yyAxis, stateRef)
}