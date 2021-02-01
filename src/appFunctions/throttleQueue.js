//used by finnDash frontend to make ALL finnhub api requests.
//returns queue object. Open new apiCalls by running finnHub function bellow.
export default function createFunctionQueueObject (maxRequestPerInterval, interval, evenlySpaced) {
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

    // if (interval < 200) {
    //     console.warn('An interval of less than 200ms can create performance issues.');
    // }

    que.dequeue = function() {
        this.running = 1
        // console.log('running deque')
        let threshold = this.lastCalled + this.interval;
        let now = Date.now();

        // Adjust the timer if it was called too early 
        if (now < threshold) {
            setTimeout(() => this.dequeue(), threshold - now);
            return;
        } else if (now < this.suspend){
            console.log("Finnhub API calls suspended")
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
                callbacks[x](); //runs callback from queue
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
        this.queue.push(callback);
        if (this.running === 0) {
            setTimeout(() => this.dequeue(), this.interval);
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
//response 429 means API queue is overloaded. Component that submitted API call --
//  needs to check if its still mounted then resubmit request.
export const finnHub = (throttle, apiString) => {
    // console.log('running finnhub: ', throttle, apiString)
    return new Promise((resolve, reject) => {
        throttle.enqueue(function() { 
            fetch(apiString)
            .then((response) => {
                if (response.status === 429) {
                    console.log('429 endpoint')
                    throttle.setSuspend(4000)
                    const errorObj = {error: 429} 
                    return errorObj
                } else {
                    return response.json()
                }
            })
            .then((data) => {
                throttle.openRequests = throttle.openRequests -= 1
                resolve(data)
            })
            .catch(error => {
                console.log("throttleQueue error",error.message)
                throttle.openRequests = throttle.openRequests -= 1
                reject({errorMessage: error.message})
            });
        })
    })
}
