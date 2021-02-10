const fetch = require('node-fetch');
//returns queue object. Open new apiCalls by running finnHub function bellow.
const createFunctionQueueObject = function (maxRequestPerInterval, interval, evenlySpaced) {
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


const finnHub = (throttle, apiString, id) => {
    // console.log("creating promise: ", apiString)
    return new Promise((resolve, reject) => {
        throttle.enqueue(function() { 
            fetch(apiString)
            .then((response) => {
                if (response.status === 429) {
                    console.log('--429--')
                    throttle.setSuspend(61000)
                    // finnHub(throttle, apiString)
                    return {429: 429}
                } else {
                    // console.log("RESPONSE:", response.json())
                    return response.json()
                }
            })
            .then((data) => {
                if (data[429] !== undefined) {
                    console.log('------------>429', throttle)
                    resolve (finnHub(throttle, apiString, id))
                    throttle.openRequests = throttle.openRequests -= 1
                } else {
                    throttle.openRequests = throttle.openRequests -= 1
                    id.data = data
                    resolve(id)
                }
            })
            .catch(error => {
                console.log("ERRORRESPONSE:", error.message)
                throttle.openRequests = throttle.openRequests -= 1
                error.requestID = id
                id.data = {err: error}
                resolve(id)
            });
        })
    })
}

module.exports = {finnHub, createFunctionQueueObject}