console.clear()

class Subscriber {
  closed = false;
  constructor(observer, subscription) {
    this.observer = observer
    this.subscription = subscription
  }

  next(value) {
    if(!this.closed) {
      this.observer.next(value)
    }
  }

  error(err) {
    if(!this.closed) {
      this.closed = true;
      this.observer.error(err)
      this.subscription.unsubscribe()
    }
  }

  complete() {
    if(!this.closed) {
      this.closed = true;
      this.observer.complete()
      this.subscription.unsubscribe()
    }
  }
}

class Subscription {
  subscribers = []

  add(subscriber) {
    this.subscribers.push(subscriber)
  }

  unsubscribe() {
    this.subscribers.forEach(subscription => subscription())

    this.subscribers = []
  }
}

class Observable {
  constructor(init) {
    this.init = init
  }

  subscribe(observer) {
    const subscription = new Subscription()
    const subscriber = new Subscriber(observer, subscription)
    subscription.add(this.init(subscriber))
    return subscription
  }
}

const observable = new Observable((observer) => {
  let i = 0;
  const timer = setInterval(() => {
    observer.next(i++)

    if(i > 3) {
      observer.complete()
      observer.next(i)
    }
  }, 100)

  return () => {
    console.log("tearing down ...")
    clearInterval(timer)
  }
})

const subscription = observable.subscribe({
  next: (value) => {
    console.log(value)
  },
  error: (err) => {},
  complete: () => {
    console.log("COMPLETED")
  },
})

setTimeout(() => {
  subscription.unsubscribe()
}, 2000)