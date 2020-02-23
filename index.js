console.clear();

class Subscription {
  subscribers = [];

  add(subscriber) {
    this.subscribers.push(subscriber);
  }

  unsubscribe() {
    this.subscribers.forEach(subscription => subscription());
    this.subscribers = [];
  }
}

class Subscriber {
  closed = false;

  constructor(observer, subscription) {
    this.observer = observer;
    this.subscription = subscription;
  }

  next(value) {
    if (!this.closed) {
      this.observer.next(value);
    }
  }

  error(err) {
    if (!this.closed) {
      this.closed = true;
      this.observer.error(err);
      this.subscription.unsubscribe();
    }
  }

  complete() {
    if (!this.closed) {
      this.closed = true;
      this.observer.complete();
      this.subscription.unsubscribe();
    }
  }
}

class Observable {
  constructor(fn) {
    this.fn = fn;
  }

  subscribe(observer) {
    const subscription = new Subscription();
    const subscriber = new Subscriber(observer, subscription);
    subscription.add(this.fn(subscriber));
    return subscription;
  }

  pipe(...fns) {
    return pipe(...fns)(this);
  }
}

const pipe = (...fns) => {
  return source => {
    return fns.reduce((prev, fn) => fn(prev), source);
  };
};

const observable = new Observable(subscriber => {
  let count = 0;
  const timer = setInterval(() => {
    subscriber.next(++count);
    if (count > 3) {
      subscriber.complete();
      subscriber.next(5);
    }
  }, 100);

  return () => {
    console.log("tearing down");
    clearInterval(timer);
  };
});

const map = fn => source => {
  return new Observable(subscriber => {
    const subscription = source.subscribe({
      next: value => subscriber.next(fn(value)),
      error: err => subscriber.error(err),
      complete: _ => subscriber.complete()
    });
    return () => subscription.unsubscribe();
  });
};

const subscription = observable
  .pipe(
    map(x => x * 2),
    map(x => x * 4),
    map(x => x * 8)
  )
  .subscribe({
    next: value => console.log(value),
    error: stack => console.log(stack),
    complete: _ => console.log("COMPLETED")
  });
