console.clear()

class Subscription {
  subscribers = []

  add(fn) {
    this.subscribers.push(fn)
  }

  unsubscribe() {
    this.subscribers.forEach(fn => fn())
    this.subscribers = []
  }
}

class Observable {
  constructor(fn) {
    this.fn = fn
  }

  subscribe(observer) {
    const subscription = new Subscription()
    const subscriber = new Subscriber(observer, subscription)
    subscription.add(this.fn(subscriber))
    return subscription
  }

  map(fn) {
    return new Observable(subscriber => {
      const sub = this.subscribe({
        next: value => subscriber.next(fn(value)),
        error: err => subscriber.error(fn(err)),
        complete: ()  => subscriber.complete()
      })

      return () => {
        sub.unsubscribe()
      }
    })
  }
}

class Subscriber {
  closed = false
  constructor(observer, subscription) {
    this.observer = observer
    this.subscription = subscription

    this.subscription.add(() => (this.closed = true))
  }

  next(value) {
    if(!this.closed) {
      this.observer.next(value)
    }
  }

  error(err) {
    if(!this.closed) {
      this.closed = true
      this.observer.error(err)
      this.subscription.unsubscribe()
    }
  }

  complete() {
    if(!this.closed) {
      this.closed = true
      this.observer.complete()
      this.subscription.unsubscribe()
    }
  }
}

const observable = new Observable((subscriber) => {
  let i = 0

  const timer = setInterval(() => {
    subscriber.next(i++)

    if(i > 3) {
      subscriber.complete()
    }
  }, 1000)

  return () => {
    console.log("Terminating")
    clearInterval(timer)
  }
});

const sub = observable.map(x => x * 2).subscribe({
  next: value => console.log(value),
  error: err => console.log(err),
  complete: () => console.log("COMPLETED")
})
