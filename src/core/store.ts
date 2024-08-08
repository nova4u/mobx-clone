const IS_PROXY = Symbol("__isProxy");
const OBSERVERS = Symbol("__observers");

type Observer = () => void;
export type Unsubscribe = () => void;
export type StoreProps<T> = Omit<
  T,
  typeof OBSERVERS | "subscribe" | "unsubscribe"
>;

/**
 * Represents a Store object with observable properties and subscription methods.
 * @template T - The type of the object being stored.
 */
type Store<T extends object> = T & {
  [IS_PROXY]: boolean;
  [OBSERVERS]: ObserverManager<T>;
  subscribe<K extends keyof StoreProps<T>>(prop: K, cb: Observer): Unsubscribe;
  unsubscribe<K extends keyof StoreProps<T>>(prop: K, cb: Observer): void;
};

/**
 * Represents a read value from a Store object.
 * @template T - The type of the object being stored.
 */
interface ReadValue<T extends object> {
  prop: keyof T;
  target: Store<T>;
}

/**
 * A set of read values from Store objects.
 */
type ReadValues = Set<ReadValue<any>>;
export const readValues: ReadValues = new Set<ReadValue<any>>();

/**
 * Checks if a value is an object.
 *
 * @param value - The value to check.
 * @returns `true` if the value is an object, `false` otherwise.
 */
function isObject(value: unknown): value is Record<string | symbol, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Represents an Observer Manager that allows adding, removing, and notifying observers for specific properties of an object.
 * @template T - The type of the object being observed.
 * @template K - The type of the property being observed.
 */
class ObserverManager<T extends object, K extends keyof T = keyof T> {
  private observers: Map<K, Set<Observer>> = new Map();

  private observersExistFor(prop: K): prop is K {
    return this.observers.has(prop);
  }

  add(prop: K, cb: Observer): () => void {
    if (!this.observersExistFor(prop)) {
      this.observers.set(prop, new Set());
    }
    this.observers.get(prop)!.add(cb);
    return () => this.remove(prop, cb);
  }

  remove(prop: K, cb: Observer): void {
    if (this.observersExistFor(prop)) {
      const observerSet = this.observers.get(prop)!;
      observerSet.delete(cb);
      if (observerSet.size === 0) {
        this.observers.delete(prop);
      }
    }
  }

  notify(prop: K): void {
    if (this.observersExistFor(prop)) {
      const callbacks = this.observers.get(prop);
      if (callbacks) callbacks.forEach((fn) => fn());
    }
  }
}

/**
 * Creates a proxy handler for the store object.
 * @template T - The type of the object being stored.
 * @returns {ProxyHandler<T & Store<T>>} The proxy handler for the store.
 */
function createHandler<T extends object>(): ProxyHandler<T & Store<T>> {
  return {
    get(target: T & Store<T>, prop: string | symbol, receiver: any): any {
      const value = Reflect.get(target, prop, receiver);

      if (typeof prop === "symbol" || typeof value === "function") {
        return value;
      }

      if (isObject(value) && !value[IS_PROXY]) {
        const proxiedValue = store(value);
        Reflect.set(target, prop, proxiedValue, receiver);
        return proxiedValue;
      }

      readValues.add({ prop, target: receiver as Store<T> });
      return value;
    },

    set(
      target: T & Store<T>,
      prop: string | symbol,
      value: any,
      receiver: any
    ) {
      const result = Reflect.set(target, prop, value, receiver);

      if (typeof prop === "string") {
        target[OBSERVERS].notify(prop as keyof T);
      }

      return result;
    },
  };
}

export function store<T extends object>(state: T): T & Store<T> {
  const storeObj = {
    ...state,
    [OBSERVERS]: new ObserverManager<T>(),
    [IS_PROXY]: true,
    subscribe: function <K extends keyof T>(prop: K, cb: Observer) {
      return this[OBSERVERS].add(prop, cb);
    },
  } as T & Store<T>;

  return new Proxy(storeObj, createHandler<T>());
}
