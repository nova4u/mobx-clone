import { FC, memo, useState, useCallback } from "react";
import { readValues, StoreProps } from "../core/store";

export function observer<P extends Record<string, unknown>>(
  ObservableComponent: FC<P>
) {
  return memo(function ObserverWrapper(props) {
    const [, rerender] = useState({});
    const update = useCallback(() => rerender({}), []);

    return (function () {
      readValues.clear();
      const result = ObservableComponent(props as P);
      readValues.forEach(({ prop, target }) => {
        target.subscribe(prop as keyof StoreProps<any>, update);
      });
      return result;
    })();
  });
}
