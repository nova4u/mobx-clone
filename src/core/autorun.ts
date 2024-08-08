import { Unsubscribe, readValues } from "./store";

export function autorun(fn: () => void): Unsubscribe {
  const unsubs = new Set<Unsubscribe>();

  readValues.clear();
  fn();

  readValues.forEach(({ prop, target }) => {
    unsubs.add(target.subscribe(prop, fn));
  });

  return () => {
    unsubs.forEach((unsubFn) => unsubFn());
  };
}
