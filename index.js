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
  }, 100)

  return () => {
    console.log("Terminating")
    clearInterval(timer)
  }
});

const sub = observable.subscribe({
  next: value => console.log(value),
  error: err => console.log(err),
  complete: () => console.log("COMPLETED")
})
