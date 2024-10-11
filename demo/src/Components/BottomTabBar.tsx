import type { HvComponentProps, LocalName } from 'hyperview';
import React, { useContext } from 'react';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { BottomTabBarContext } from '../Contexts';

const namespaceURI = 'https://instawork.com/hyperview-navigation';

/**
 * This component's only job is to associate its own props with a
 * navigator ID in BottomTabBarContext. It does not render anything.
 * It's child elements are used by the BottomTabBar component
 * to build the bottom tab bar UI.
 *
 * Usage:
 * <navigation:bottom-tab-bar
 *   xmlns:navigation="https://instawork.com/hyperview-navigation"
 *   navigation:navigator="some-tab-navigator-id"
 * >
 *   ...
 * </navigation:bottom-tab-bar>
 */
const BottomTabBar = (props: HvComponentProps) => {
  const { setElementProps } = useContext(BottomTabBarContext);
  const navigator = props.element.getAttributeNS(namespaceURI, 'navigator');
  const route = useRoute();

  // Don't register these children as the UI components
  // if this screen isn't focused
  useFocusEffect(
    React.useCallback(() => {
      if (!navigator) {
        console.warn(
          '<navigation:bottom-tab-bar> element is missing `navigator` attribute',
        );
        return;
      }
      if (!setElementProps) {
        return;
      }

      setElementProps(navigator, route, props);
    }, [navigator, props, setElementProps, route]),
  );

  return null;
};

BottomTabBar.namespaceURI = namespaceURI;
BottomTabBar.localName = 'bottom-tab-bar' as LocalName;
BottomTabBar.localNameAliases = [] as LocalName[];

export { BottomTabBar };
