import React, { createContext, useCallback, useRef, useState } from 'react';
import type { HvComponentProps } from 'hyperview';

type ElementProps = Record<string, HvComponentProps>;

/**
 * React context that provides the Hyperview demo app with a state
 * holding the navigation elements rendered by each screens that
 * React navigation navigators use to drive navigation.
 */
export const BottomTabBarContext = createContext<{
  elementsProps: ElementProps | undefined;
  setElementProps: ((id: string, props: HvComponentProps) => void) | undefined;
}>({
  elementsProps: undefined,
  setElementProps: undefined,
});

export function BottomTabBarContextProvider(props: {
  children: React.ReactNode;
}) {
  const [elementsProps, setElementsProps] = useState<ElementProps>({});
  // Track the props in a ref so we don't have to recreate the
  // setElementProps function each time the props changes
  const elementsPropsRef = useRef<ElementProps>(elementsProps);
  elementsPropsRef.current = elementsProps;

  const setElementProps = useCallback(
    (navigator: string, p: HvComponentProps) => {
      const currentNavigatorProps =
        elementsPropsRef.current[navigator] || ({} as HvComponentProps);
      // If the props object hasn't actually changed,
      // let's not get caught in a render loop
      if (!!p && currentNavigatorProps === p) {
        return;
      }

      const newElementsProps = { ...elementsPropsRef.current, [navigator]: p };
      elementsPropsRef.current = newElementsProps;
      setElementsProps(newElementsProps);
    },
    [],
  );

  return (
    <BottomTabBarContext.Provider
      value={{
        elementsProps,
        setElementProps,
      }}
    >
      {props.children}
    </BottomTabBarContext.Provider>
  );
}
