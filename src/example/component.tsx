import React, { useState } from "react";
import { useEffect } from "react";
import { store } from "../core/store";
import { autorun } from "../core/autorun";
import { observer } from "../react/observer";

const myStore = store({
  a: 4,
  b: 6,
  name: { firstName: "Denis", lastName: "M" },
});

const ComponentA = observer(({ test }: { test: string }) => {
  console.log("rerender ComponentA");

  useEffect(() => {
    const dispose = autorun(() => {
      // console.log("name changed", myStore.name.lastName);
      // console.log("b changed", myStore.b);
    });

    return dispose;
  }, []);

  return (
    <>
      a: {myStore.a}
      lastName: {myStore.name.lastName}
      <input
        value={myStore.name.lastName}
        onChange={(e) => (myStore.name.lastName = e.target.value)}
      />
      <button
        onClick={() => {
          myStore.a = myStore.a + 1;
        }}
      >
        increment
      </button>
    </>
  );
});

function App() {
  const [mount, setMount] = useState(true);
  console.log("rerender App");
  const [test, setTest] = useState(0);

  useEffect(() => {
    const unsub = myStore.subscribe("a", () => {
      console.log("name changed");
    });
    return unsub;
  }, []);

  return (
    <div className="App">
      test: {test}
      <button onClick={() => setMount((prev) => !prev)}>
        {mount ? "Unmount" : "Mount"}
      </button>
      <button
        onClick={() => {
          setTest(test + 1);
        }}
      >
        increment test
      </button>
      <br />
      b: {myStore.b}
      <br />
      firstName: {myStore.name.firstName}
      <br />
      <button
        onClick={() => {
          myStore.b = myStore.b + 1;
        }}
      >
        increment b
      </button>
      <button
        onClick={() => {
          myStore.name.firstName += " 1";
        }}
      >
        increment name
      </button>
      <br />
      <br />
      <br />
      {/* @ts-ignore */}
      {mount && <ComponentA test={test} />}
    </div>
  );
}

export default observer(App);
