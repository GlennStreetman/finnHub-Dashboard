import fetch from 'node-fetch';
//returns queue object. Open new apiCalls by running finnHub function bellow.
interface queue {
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
    let que: queue = {
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
            // console.log('running deque:', this.running)
            let threshold = this.lastCalled + this.interval;
            let now = Date.now();

            // Adjust the timer if it was called too early 
            if (now < threshold) {
                setTimeout(() => this.dequeue(), threshold - now);
                return;
            } else if (now < this.suspend) {
                // console.log("Finnhub API calls suspended", that.openRequests, maxRequestPerInterval, that.suspend-now)
                setTimeout(() => this.dequeue(), this.suspend - now);
                return;
            } else if (this.openRequests >= this.maxRequestPerInterval) {
                // console.log("Open finnhub.io request limit exceeded, temp pause requests.")
                setTimeout(() => this.dequeue(), 100);
                return;
            } else {
                //max requests should default to 1 if evenly spaced. 
                let callbacks = this.queue.splice(0, this.maxRequestPerInterval);
                for (let x = 0; x < callbacks.length; x++) {
                    // console.log("Enque: " + callbacks.length, "outstanding: "+ this.queue.length,"Open: " + this.openRequests, new Date())
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
            // console.log("Enqueing")
            this.queue.push(callback);
            if (this.running === 0) {
                // console.log("starting queue:", this.interval)
                this.dequeue()
            }
            // else {console.log('queue running')}
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
            if (evenlySpaced) {
                console.log(this.interval, perSecond)
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
    // console.log("creating promise: ", throttle, reqObj)
    return new Promise((resolve) => {
        throttle.enqueue(function () {
            // console.log("------------fetch throttleQueAPI--------", reqObj, reqObj.apiString)
            fetch(reqObj.apiString, { 'Access-Control-Allow-Origin': '*' })
                .then((response) => {
                    if (response.status === 429) {
                        console.log('--429 rate limit--')
                        throttle.setSuspend(61000)
                        return { 429: 429 }
                        // } else if (response.status === 403) {
                        //     console.log('--403 Cors--')
                        //     // throttle.setSuspend(61000)
                        //     return { 403: 403 }
                    } else if (response.status === 200) {
                        // console.log("200", response.status)
                        // response.status = 200
                        return response.json()
                    } else {
                        console.log("Response other than 429/200", response)
                        return {
                            400: 400,
                            response: response
                        }
                    }
                })
                .then((data) => {
                    // console.log('data!!!', data)
                    if (data[429] !== undefined) {
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
                        // } else if (data[403] !== undefined) {
                        //     const resObj: throttleResObj = {
                        //         security: reqObj.security,
                        //         widget: reqObj.widget,
                        //         apiString: reqObj.apiString,
                        //         data: reqObj,
                        //         dashboard: reqObj.dashboard,
                        //         widgetName: reqObj.widgetName,
                        //         widgetType: reqObj.widgetType,
                        //         status: 403,
                        //         updated: Date.now(),
                        //         config: reqObj.config,
                        //     }
                        //     throttle.openRequests = throttle.openRequests -= 1
                        //     resolve(resObj)
                    } else if (data[400] !== undefined) {
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
