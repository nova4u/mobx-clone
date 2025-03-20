# MobX Clone

A lightweight, reactive state management library inspired by MobX, built for fun and learning purposes.

## Features

- Observable stores
- Automatic tracking of state changes
- React integration with `observer` HOC
- Autorun functionality for side effects

## Installation

```bash
# Clone the repository
git clone https://github.com/nova4u/mobx-clone.git

# Navigate to the project directory
cd mobx-clone

# Install dependencies
pnpm install

# Build the project (if needed)
pnpm build
```

You can then import and use it in your local projects by linking or copying the necessary files.

## Usage

### Core Library

```typescript
import { store } from "mobx-clone";

const myStore = store({
  count: 0,
  increment() {
    this.count++;
  },
});
```

### React Integration

```typescript
import React from "react";
import { observer } from "mobx-clone/react";

const Counter = observer(() => {
  return (
    <div>
      <p>Count: {myStore.count}</p>
      <button onClick={() => myStore.increment()}>Increment</button>
    </div>
  );
});
```

### Autorun for Side Effects

```typescript
import { autorun } from "mobx-clone";

const dispose = autorun(() => {
  console.log("Current count:", myStore.count);
});

// Later, when you want to stop the autorun:
dispose();
```

## API Reference

### `store<T>(state: T): T & Store<T>`

Creates an observable store from the given state object.

### `observer<P>(Component: React.FC<P>): React.FC<P>`

Higher-order component that makes a React component reactive to store changes.

### `autorun(fn: () => void): () => void`

Runs the given function immediately and tracks its dependencies. Re-runs the function whenever any of its dependencies change.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
