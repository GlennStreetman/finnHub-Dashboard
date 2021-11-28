import fetch from 'node-fetch';
//returns queue object. Open new apiCalls by running finnHub function bellow.
export interface finnHubQueue {
    maxRequestPerInterval: number,
    interval: number,
    evenlySpaced: boolean,
    suspend: number,
    queue: any[],
    lastCalled: number, //isoString number
    openRequests: number,
    running: number,
    dequeue: Function,
    enqueue: Function,
    setSuspend: Function,
    resetQueue: Function,
    updateInterval: Function,
}

export const createFunctionQueueObject = function (maxRequestPerInterval: number, interval: number, evenlySpaced: boolean) { //interval = 1000 equals 1 second interval. 
    let que: finnHubQueue = {
        maxRequestPerInterval: maxRequestPerInterval,
        interval: interval,
        evenlySpaced: evenlySpaced, //true to run evenly over interval period.
        suspend: 0,
        queue: [],
        lastCalled: Date.now(),
        openRequests: 0, //open requests should not exceed maxRequestsPerInterval
        running: 0, //0 not yet started, 1 running
        dequeue: function () {
            this.running = 1
            let threshold = this.lastCalled + this.interval;
            let now = Date.now();

            // Adjust the timer if it was called too early 
            if (now < threshold) {
                setTimeout(() => this.dequeue(), threshold - now);
                return;
            } else if (now < this.suspend) {
                setTimeout(() => this.dequeue(), this.suspend - now);
                return;
            } else if (this.openRequests >= this.maxRequestPerInterval) {
                setTimeout(() => this.dequeue(), 100);
                return;
            } else {
                //max requests should default to 1 if evenly spaced. 
                let callbacks = this.queue.splice(0, this.maxRequestPerInterval);
                for (let x = 0; x < callbacks.length; x++) {
                    callbacks[x]();
                    this.openRequests = this.openRequests + 1
                    // console.log(`Time: ${new Date().toString().slice(15, 25)}, this:${this.openRequests} `)
                }
                this.lastCalled = Date.now();
                if (this.queue.length) {
                    setTimeout(() => this.dequeue(), this.interval);
                } else {
                    this.running = 0
                }
                return
            }
        },
        enqueue: function (callback: Function) {
            this.queue.push(callback);
            if (this.running === 0) {
                this.dequeue()
            }
        },
        setSuspend: function (milliseconds: number) {
            this.suspend = Date.now() + milliseconds
            return
        },
        resetQueue: function () {
            console.log("Finnhub.io requests queue reset.")
            this.queue = []
        },
        updateInterval: function (perSecond: number) {
            if (evenlySpaced) {
                this.interval = 1000 / perSecond;
                this.maxRequestPerInterval = 1;
            } else {
                this.maxRequestPerInterval = perSecond;
                this.interval = 1000
            }
        }

    }

    if (evenlySpaced) {
        que.interval = (que.interval) / que.maxRequestPerInterval;
        que.maxRequestPerInterval = 1;
    } else {
        que.maxRequestPerInterval = maxRequestPerInterval;
        que.interval = interval
    }

    return que
}

//add all API calls to throttleQue object using function below.
//throttle =  que object returned by function above.

export interface throttleResObj {
    dashboardID: number | string,
    security: string,
    widget: string,
    apiString: string,
    data: Object,
    dashboard: string,
    widgetName: string,
    widgetType: string,
    status: number,
    updated: number,
    config: Object,
}

export interface throttleApiReqObj {
    dashboardID: number | string,
    apiString: string,
    widgetName: string,
    dashboard: string,
    widgetType: string,
    config: Object,
    widget: string,
    security: string,
    rSetUpdateStatus: Function,
    updated?: number,
}

export const finnHub = (throttle: finnHubQueue, reqObj: throttleApiReqObj) => {
    return new Promise((resolve) => {
        throttle.enqueue(function () {
            // console.log(`running: ${new Date()} ${reqObj.apiString}`)
            fetch(reqObj.apiString) //, { 'Access-Control-Allow-Origin': '*' }
                .then((response: any) => {
                    if (response.status === 429) {
                        console.log('--429 rate limit--')
                        throttle.setSuspend(61000)
                        return { status: 429 }
                    } else if (response.status === 200) {
                        return response.json()
                    } else if (response.status === 403) {
                        console.log("Response other than 429/200", response.status, response)
                        return {
                            status: 403,
                            // response: { message: '403: Access not granted to finnhub API premium route.' }
                        }
                    } else {
                        console.log("Response other than 429/403/200", response.status, response)
                        return {
                            status: 400,
                            // response: { message: 'Problem retrieving data from server' }
                        }

                    }
                })
                .then((data: any) => {
                    if (reqObj.rSetUpdateStatus) reqObj.rSetUpdateStatus({ [reqObj.dashboard]: -1 })
                    if (data.status === 429) {
                        const resObj: throttleResObj = {
                            dashboardID: reqObj.dashboardID,
                            security: reqObj.security,
                            widget: reqObj.widget,
                            apiString: reqObj.apiString,
                            data: {},
                            dashboard: reqObj.dashboard,
                            widgetName: reqObj.widgetName,
                            widgetType: reqObj.widgetType,
                            status: 429,
                            updated: Date.now(),
                            config: reqObj.config,
                        }
                        // console.log('request complete')
                        throttle.openRequests = throttle.openRequests -= 1
                        resolve(resObj)
                    } else if (data.status === 400) {
                        const resObj: throttleResObj = {
                            dashboardID: reqObj.dashboardID,
                            security: reqObj.security,
                            widget: reqObj.widget,
                            apiString: reqObj.apiString,
                            data: { message: '400: No message from server' },
                            dashboard: reqObj.dashboard,
                            widgetName: reqObj.widgetName,
                            widgetType: reqObj.widgetType,
                            status: 400,
                            updated: Date.now(),
                            config: reqObj.config,
                        }
                        // console.log('request complete')
                        throttle.openRequests = throttle.openRequests -= 1
                        resolve(resObj)
                    } else if (data.status === 403) {
                        const resObj: throttleResObj = {
                            dashboardID: reqObj.dashboardID,
                            security: reqObj.security,
                            widget: reqObj.widget,
                            apiString: reqObj.apiString,
                            data: { message: '403: Access not granted by FinnhubAPI. Review account status & permissions.' },
                            dashboard: reqObj.dashboard,
                            widgetName: reqObj.widgetName,
                            widgetType: reqObj.widgetType,
                            status: 403,
                            updated: Date.now(),
                            config: reqObj.config,
                        }
                        // console.log('request complete')
                        throttle.openRequests = throttle.openRequests -= 1
                        resolve(resObj)
                    } else {
                        const resObj: throttleResObj = {
                            dashboardID: reqObj.dashboardID,
                            security: reqObj.security,
                            widget: reqObj.widget,
                            apiString: reqObj.apiString,
                            data: data,
                            dashboard: reqObj.dashboard,
                            widgetName: reqObj.widgetName,
                            widgetType: reqObj.widgetType,
                            status: 200,
                            updated: Date.now(),
                            config: reqObj.config,
                        }
                        // console.log('request complete')
                        throttle.openRequests = throttle.openRequests -= 1
                        resolve(resObj)
                    }
                })
                .catch((error: any) => {
                    if (reqObj.rSetUpdateStatus) reqObj.rSetUpdateStatus({ [reqObj.dashboard]: -1 })
                    console.log("finnHub error:", error.message, reqObj)
                    // console.log('request complete')
                    throttle.openRequests = throttle.openRequests -= 1
                    const thisError: throttleResObj = {
                        dashboardID: reqObj.dashboardID,
                        security: reqObj.security,
                        widget: reqObj.widget,
                        apiString: reqObj.apiString,
                        data: reqObj,
                        dashboard: reqObj.dashboard,
                        widgetName: reqObj.widgetName,
                        widgetType: reqObj.widgetType,
                        status: 400,
                        updated: Date.now(),
                        config: reqObj.config,
                    }
                    resolve(thisError)
                });
        })
    })
}
