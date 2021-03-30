import fetch from 'node-fetch';
//returns queue object. Open new apiCalls by running finnHub function bellow.
export const createFunctionQueueObject = function (maxRequestPerInterval, interval, evenlySpaced) {
    let que = {}
    que.maxRequestPerInterval = maxRequestPerInterval
    que.interval = interval
    que.evenlySpaced = evenlySpaced //true to run evenly over interval period.
    que.suspend = 0
    que.queue = []
    que.lastCalled = Date.now();
    que.openRequests = 0 //open requests should not exceed maxRequestsPerInterval
    que.running = 0 //0 not yet started, 1 running

    if (evenlySpaced) {
        que.interval = (que.interval) / que.maxRequestPerInterval;
        que.maxRequestPerInterval = 1;
    }

    que.dequeue = function() {
        this.running = 1
        // console.log('running deque:', this.running)
        let threshold = this.lastCalled + this.interval;
        let now = Date.now();

        // Adjust the timer if it was called too early 
        if (now < threshold) {
            setTimeout(() => this.dequeue(), threshold - now);
            return;
        } else if (now < this.suspend){
            // console.log("Finnhub API calls suspended", that.openRequests, maxRequestPerInterval, that.suspend-now)
            setTimeout(() => this.dequeue(), this.suspend - now);
            return;
        } else if (this.openRequests >= this.maxRequestPerInterval){
            // console.log("Open finnhub.io request limit exceeded, temp pause requests.")
            setTimeout(() => this.dequeue(), 100);
            return;
        } else {
            //max requests should default to 1 if evenly spaced. 
            let callbacks = this.queue.splice(0, this.maxRequestPerInterval);
            for(let x = 0; x < callbacks.length; x++) {
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
    }

    que.enqueue = function(callback) {
        // console.log("Enqueing")
        this.queue.push(callback);
        if (this.running === 0) {
            // console.log("starting queue:", this.interval)
            this.dequeue()
        } 
        // else {console.log('queue running')}
    }

    que.setSuspend = function (milliseconds) {
        this.suspend = Date.now() + milliseconds
        return
    }

    que.resetQueue = function(){
        console.log("Finnhub.io requests queue reset.")
        this.queue = []
    }

    return que
}

//add all API calls to throttleQue object using function below.
//throttle =  que object returned by function above.


export const finnHub = (throttle, reqObj) => {
    // console.log("creating promise: ", throttle, apiString, id)
    return new Promise((resolve, reject) => {
        throttle.enqueue(function() { 
            // console.log("------------fetch throttleQueAPI--------", reqObj, reqObj.apiString)
            fetch(reqObj.apiString)
            .then((response) => {
                // console.log("1111!!!", response)
                if (response.status === 429) {
                    console.log('--429--')
                    throttle.setSuspend(61000)
                    // finnHub(throttle, apiString)
                    return {429: 429}
                } else if (response.status === 200) {
                    // console.log("HERE", response.status)
                    return response.json()
                } else {
                    console.log("Response other than 429/200", response)
                    return{
                        400: 400,
                        response: response
                    }
                }   
            })
            .then((data) => {
                // console.log('data!!!', data)
                if (data[429] !== undefined) {
                    console.log('------------>429', throttle)
                    resolve (finnHub(throttle, reqObj.apiString))
                    throttle.openRequests = throttle.openRequests -= 1
                } else if (data[400] !== undefined) {
                    const resObj = {
                        security: reqObj.security,
                        widget: reqObj.widget,
                        apiString: reqObj.apiString,
                        data: data,
                        dashboard: reqObj.dashboard,
                        description: reqObj.description
                    }
                    resolve(resObj)
                } else {
                    throttle.openRequests = throttle.openRequests -= 1
                    const resObj = {
                        security: reqObj.security,
                        widget: reqObj.widget,
                        apiString: reqObj.apiString,
                        data: data,
                        dashboard: reqObj.dashboard,
                        description: reqObj.description
                    }
                    console.log("sending response obj", resObj)
                    resolve(resObj)
                }
            })
            .catch(error => {
                console.log("finnHub error:", error.message, reqObj)
                throttle.openRequests = throttle.openRequests -= 1
                const thisError = {
                    err: error,
                    req: reqObj,
                }
                resolve(thisError)
            });
        })
    })
}
