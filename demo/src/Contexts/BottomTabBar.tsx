import React, { createContext, useCallback, useRef, useState } from 'react';
import type { HvComponentProps } from 'hyperview';
import { NODE_TYPE } from 'hyperview';
import { ParamListBase } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/core';

type ElementProps = Record<string, HvComponentProps>;

/**
 * React context that provides the Hyperview demo app with a state
 * holding the navigation elements rendered by each screens that
 * React navigation navigators use to drive navigation.
 */
export const BottomTabBarContext = createContext<{
  elementsProps: ElementProps | undefined;
  setElementProps:
    | ((
        navigator: string,
        componentSourceRoute: RouteProp<ParamListBase>,
        props: HvComponentProps,
      ) => void)
    | undefined;
}>({
  elementsProps: undefined,
  setElementProps: undefined,
});

/**
 * For tracking the source screen of an event later on
 * Not strictly necessary any more
 * but makes reading the behavior logging a bit clearer, so I'm leaving it in
 * @param element
 * @param routeKey
 */
const applyRoute = (element: Element, routeKey: string) => {
  if (!element.hasAttribute('navigator:origin-route-key')) {
    element.setAttribute('navigator:origin-route-key', routeKey);
  }
  const children = Array.from(element.childNodes || []).filter(
    node => node.nodeType === NODE_TYPE.ELEMENT_NODE,
  ) as Element[] | undefined;
  children?.forEach(child => applyRoute(child, routeKey));
};

export function BottomTabBarContextProvider(props: {
  children: React.ReactNode;
}) {
  const [elementsProps, setElementsProps] = useState<ElementProps>({});
  const elementsPropsRef = useRef<ElementProps>(elementsProps);
  elementsPropsRef.current = elementsProps;

  const setElementProps = useCallback(
    (
      navigator: string,
      componentSourceRoute: RouteProp<ParamListBase>,
      p: HvComponentProps,
    ) => {
      const componentScreenKey = componentSourceRoute.key;
      const currentNavigatorProps =
        elementsPropsRef.current[navigator] || ({} as HvComponentProps);
      // If the props object hasn't actually changed,
      // let's not get caught in a render loop
      if (!!p && currentNavigatorProps === p) {
        return;
      }

      // Apply tracking attributes to the tab bar display components
      if (componentScreenKey) {
        applyRoute(p.element, componentScreenKey);
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
