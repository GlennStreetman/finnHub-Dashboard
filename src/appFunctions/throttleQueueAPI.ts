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

export const createFunctionQueueObject = function (maxRequestPerInterval, interval, evenlySpaced) { //interval = 1000 equals 1 second interval. 
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
                    this.openRequests = this.openRequests += 1
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
        enqueue: function (callback) {
            this.queue.push(callback);
            if (this.running === 0) {
                this.dequeue()
            }
        },
        setSuspend: function (milliseconds) {
            this.suspend = Date.now() + milliseconds
            return
        },
        resetQueue: function () {
            console.log("Finnhub.io requests queue reset.")
            this.queue = []
        },
        updateInterval: function (perSecond) {
            console.log('updating interval: ', perSecond)
            if (evenlySpaced) {
                console.log(this.interval, perSecond)
                this.interval = 1000 / perSecond;
                this.maxRequestPerInterval = 1;
                console.log('new interval', this.interval)
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
    apiString: string,
    widgetName: string,
    dashboard: string,
    widgetType: string,
    config: Object,
    widget: string,
    security: string,
}

export const finnHub = (throttle, reqObj: throttleApiReqObj) => {
    return new Promise((resolve) => {
        throttle.enqueue(function () {
            // console.log(`running: ${new Date()} ${reqObj.apiString}`)
            fetch(reqObj.apiString) //, { 'Access-Control-Allow-Origin': '*' }
                .then((response) => {
                    if (response.status === 429) {
                        console.log('--429 rate limit--')
                        throttle.setSuspend(61000)
                        return { status: 429 }
                    } else if (response.status === 200) {
                        return response.json()
                    } else {
                        console.log("Response other than 429/200", response)
                        return {
                            status: 400,
                            response: response
                        }
                    }
                })
                .then((data) => {
                    if (data.status === 429) {
                        const resObj: throttleResObj = {
                            security: reqObj.security,
                            widget: reqObj.widget,
                            apiString: reqObj.apiString,
                            data: reqObj, //
                            dashboard: reqObj.dashboard,
                            widgetName: reqObj.widgetName,
                            widgetType: reqObj.widgetType,
                            status: 429,
                            updated: Date.now(),
                            config: reqObj.config,
                        }
                        throttle.openRequests = throttle.openRequests -= 1
                        resolve(resObj)
                    } else if (data.status === 400) {
                        const resObj: throttleResObj = {
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
                        throttle.openRequests = throttle.openRequests -= 1
                        resolve(resObj)
                    } else {
                        const resObj: throttleResObj = {
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
                        throttle.openRequests = throttle.openRequests -= 1
                        resolve(resObj)
                    }
                })
                .catch(error => {
                    console.log("finnHub error:", error.message, reqObj)
                    throttle.openRequests = throttle.openRequests -= 1
                    const thisError: throttleResObj = {
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
