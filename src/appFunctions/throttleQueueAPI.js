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
        que.interval = que.interval / que.maxRequestPerInterval;
        que.maxRequestPerInterval = 1;
    }

    if (interval < 200) {
        console.warn('An interval of less than 200ms can create performance issues.');
    }

    que.dequeue = function(that) {
        that.running = 1
        // console.log('running deque')
        let threshold = that.lastCalled + that.interval;
        let now = Date.now();

        // Adjust the timer if it was called too early 
        if (now < threshold) {
            
            setTimeout(() => that.dequeue(that), threshold - now);
            return;
        } else if (now < that.suspend){
            console.log("Finnhub API calls suspended")
            setTimeout(() => that.dequeue(that), that.suspend - now);
            return;
        } else if (that.openRequests >= that.maxRequestPerInterval){
            // console.log("Open finnhub.io request limit exceeded, temp pause requests.")
            that.openRequests = that.openRequests -= 1
            setTimeout(() => that.dequeue(that), 100);
            return;
        } else {

            let callbacks = that.queue.splice(0, that.maxRequestPerInterval);
            for(let x = 0; x < callbacks.length; x++) {
                callbacks[x]();
                that.openRequests = that.openRequests += 1
            }
            that.lastCalled = Date.now();
            if (that.queue.length) {
                setTimeout(() => that.dequeue(that), that.interval);
            } else {
                that.running = 0
            }
            return
        }
    }

    que.enqueue = function(callback) {
        this.queue.push(callback);
        if (this.running === 0) {
            setTimeout(() => this.dequeue(this), this.interval);
        } else {console.log('queue running')}
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
    return new Promise((resolve, reject) => {
        throttle.enqueue(function() { 
            fetch(apiString)
            .then((response) => {
                // console.log(response)
                if (response.status === 429) {
                    console.log('429')
                    throttle.openRequests = throttle.openRequests -= 1
                    throttle.setSuspend(4000)
                    finnHub(throttle, apiString)
                    // reject('finnhub 429') <--do not reject if 429. Will break promises.all in /routes/endpoint.
                } else {
            // console.log("FIRST RESPONSE:", response)
                throttle.openRequests = throttle.openRequests -= 1
                return response.json()
            }
            })
            .then((data) => {
                // data.requestID = id
                id.data = data
                resolve(id)
            })
            .catch(error => {
                console.log(error.message)
                throttle.openRequests = throttle.openRequests -= 1
                // error.requestID = id
                id.data = {err: error}
                resolve(id)
            });
        })
    })
}

module.exports = {finnHub, createFunctionQueueObject}