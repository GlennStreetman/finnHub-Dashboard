export default function createFunctionQueueObject (maxRequestPerInterval, interval, evenlySpaced) {
    let que = {}
    que.maxRequestPerInterval = maxRequestPerInterval
    que.interval = interval
    que.evenlySpaced = evenlySpaced
    que.suspend = 0
    que.queue = []
    que.lastCalled = Date.now();
    // que.timeout = undefined
    que.running = 0

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

        /**
         * Adjust the timer if it was called too early or the queue has been suspended.
         */
        if (now < threshold) {
            clearTimeout(that.timeout);
            setTimeout(() => that.dequeue(that), threshold - now);
            return;
        }

        let callbacks = that.queue.splice(0, that.maxRequestPerInterval);

        for(let x = 0; x < callbacks.length; x++) {
            // console.log('running')
            callbacks[x]();
        }

        that.lastCalled = Date.now();
        if (that.queue.length) {
            // console.log('queue has length')
            // that.timeout = setTimeout(that.dequeue(that), that.interval);
            setTimeout(() => that.dequeue(that), that.interval);
        } else {
            // console.log(that.running)
            that.running = 0
            // console.log('---------------')
            // console.log(that.running)
        }
        return
    }

    que.enqueue = function (callback) {
        this.queue.push(callback);
        if (this.running === 0) {
            // this.timeout = setTimeout(this.dequeue(this), this.interval);
            setTimeout(() => this.dequeue(this), this.interval);
        } else {console.log('already running')}
    }

    que.setSuspend = function (milliseconds) {
        console.log(milliseconds)
        this.lastCalled = this.lastCalled + milliseconds
        return
    }

    que.resetQueue = function(){
        this.queue = []
    }

    return que
}


// test = createFunctionQueueObject(1, 1000, true)
// test.enqueue(function(){console.log('1')})
// test.enqueue(function(){console.log('2')})
// test.enqueue(function(){console.log('3')})
// test.enqueue(function(){console.log('4')})
// test.enqueue(function(){console.log('5')})
// test.enqueue(function(){console.log('6')})
// test.enqueue(function(){console.log('7')})
// test.enqueue(function(){console.log('8')})
// test.enqueue(function(){console.log('9')})
// test.enqueue(function(){console.log('10')})
// test.enqueue(function(){console.log('11')})
// test.enqueue(function(){console.log('12')})
// test.enqueue(function(){console.log('13')})
// test.enqueue(function(){console.log('14')})
// test.setSuspend(5000)
// test.resetQueue()

