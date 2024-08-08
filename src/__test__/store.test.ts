import { store } from "../core/store";
import { autorun } from "../core/autorun";
import { describe, expect, test, vitest } from "vitest";

describe("store", () => {
  test("should create a basic store", () => {
    const myStore = store({ count: 0 });
    expect(myStore.count).toBe(0);
  });

  test("should update store values", () => {
    const myStore = store({ count: 0 });
    myStore.count = 1;
    expect(myStore.count).toBe(1);
  });

  test("should handle nested objects", () => {
    const myStore = store({ user: { name: "John", age: 30 } });
    expect(myStore.user.name).toBe("John");
    myStore.user.name = "Jane";
    expect(myStore.user.name).toBe("Jane");
  });

  test("should trigger autorun when values change", () => {
    const myStore = store({ count: 0 });
    const mockFn = vitest.fn();

    const unsubscribe = autorun(() => {
      mockFn(myStore.count);
    });

    expect(mockFn).toHaveBeenCalledWith(0);

    myStore.count = 1;
    expect(mockFn).toHaveBeenCalledWith(1);

    unsubscribe();
    myStore.count = 2;
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  test("should allow subscribing to specific properties", () => {
    const myStore = store({ count: 0, name: "John" });
    const mockFn = vitest.fn();

    const unsubscribe = myStore.subscribe("count", () => {
      mockFn(myStore.count);
    });

    myStore.count = 1;
    expect(mockFn).toHaveBeenCalledWith(1);

    myStore.name = "Jane";
    expect(mockFn).toHaveBeenCalledTimes(1);

    myStore.count = 2;
    expect(mockFn).toHaveBeenCalledTimes(2);

    unsubscribe();
    myStore.count = 3;
    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});
