

class PromiseQueue {
  constructor () {
    this.next_promise = this.next_promise.bind(this);
    this.state = "free"
    this.queue = []
  }

  add ( promise_callback ) {
    this.queue.push(promise_callback)
    if ( this.state === "free" ) this.next_promise()
  }

  next_promise () {
    let callback = this.queue.pop()

    if ( callback ) {
      new Promise((r, j)=>{
        this.state = "busy"
        callback(r, j)
      }).then(()=>{
        this.state = "free"
        this.next_promise()
      })
    }

    

  }
}

module.exports =  PromiseQueue