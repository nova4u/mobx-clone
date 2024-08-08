import { store } from "../core/store";
import { observer } from "../react/observer";
import { render, act } from "@testing-library/react";
import React from "react";
import { describe, expect, test, vitest } from "vitest";

describe("observer", () => {
  test("should re-render observed component when store changes", () => {
    const myStore = store({ count: 0 });

    const TestComponent = observer(() => {
      return <div data-testid="count">{myStore.count}</div>;
    });

    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId("count").textContent).toBe("0");

    act(() => {
      myStore.count = 1;
    });

    expect(getByTestId("count").textContent).toBe("1");
  });

  test("should only re-render observed component when relevant store properties change", () => {
    const myStore = store({ count: 0, name: "John" });
    const renderCounter = vitest.fn();

    const TestComponent = observer(() => {
      renderCounter();
      return <div data-testid="count">{myStore.count}</div>;
    });

    const { getByTestId, rerender } = render(<TestComponent />);

    expect(renderCounter).toHaveBeenCalledTimes(1);
    expect(getByTestId("count").textContent).toBe("0");

    act(() => {
      myStore.count = 1;
    });

    expect(renderCounter).toHaveBeenCalledTimes(2);
    expect(getByTestId("count").textContent).toBe("1");

    act(() => {
      myStore.name = "Jane";
    });

    expect(renderCounter).toHaveBeenCalledTimes(2);

    act(() => {
      myStore.count = 2;
    });

    expect(renderCounter).toHaveBeenCalledTimes(3);
    expect(getByTestId("count").textContent).toBe("2");

    rerender(<TestComponent />);

    expect(renderCounter).toHaveBeenCalledTimes(3);
    expect(getByTestId("count").textContent).toBe("2");
  });

  test("should only re-render observed component when relevant nested store properties change", () => {
    // Create a store with nested values
    const myStore = store({
      name: {
        firstName: "John",
        lastName: "Doe",
      },
    });

    // Create render counters for each component
    const firstNameRenderCounter = vitest.fn();
    const lastNameRenderCounter = vitest.fn();

    // Create two observer components, one for firstName and one for lastName
    const FirstNameComponent = observer(() => {
      firstNameRenderCounter();
      return <div data-testid="firstName">{myStore.name.firstName}</div>;
    });

    const LastNameComponent = observer(() => {
      lastNameRenderCounter();
      return <div data-testid="lastName">{myStore.name.lastName}</div>;
    });

    // Render both components
    const { getByTestId } = render(
      <>
        <FirstNameComponent />
        <LastNameComponent />
      </>
    );

    // Initial render
    expect(firstNameRenderCounter).toHaveBeenCalledTimes(1);
    expect(lastNameRenderCounter).toHaveBeenCalledTimes(1);
    expect(getByTestId("firstName").textContent).toBe("John");
    expect(getByTestId("lastName").textContent).toBe("Doe");

    // Change firstName
    act(() => {
      myStore.name.firstName = "Jane";
    });

    // Only FirstNameComponent should re-render
    expect(firstNameRenderCounter).toHaveBeenCalledTimes(2);
    expect(lastNameRenderCounter).toHaveBeenCalledTimes(1);
    expect(getByTestId("firstName").textContent).toBe("Jane");
    expect(getByTestId("lastName").textContent).toBe("Doe");

    // Change lastName
    act(() => {
      myStore.name.lastName = "Smith";
    });

    // Only LastNameComponent should re-render
    expect(firstNameRenderCounter).toHaveBeenCalledTimes(2);
    expect(lastNameRenderCounter).toHaveBeenCalledTimes(2);
    expect(getByTestId("firstName").textContent).toBe("Jane");
    expect(getByTestId("lastName").textContent).toBe("Smith");
  });
});
