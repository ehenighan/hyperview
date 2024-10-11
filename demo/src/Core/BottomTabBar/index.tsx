import * as Render from 'hyperview/src/services/render';
import { useContext, useEffect, useState } from 'react';
import { BottomTabBarContext } from '../../Contexts';
import type { HvComponentOnUpdate } from 'hyperview';
import { NODE_TYPE } from 'hyperview';
import type { Props } from './types';

/**
 * Component used by Hyperview to render a custom bottom tab bar.
 * It retrieves the arguments needed by Hyperview render service
 * from BottomTabBarContext. This works in tandem with the custom Hyperview
 * element <navigation:bottom-tab-bar>
 */
export const BottomTabBar = ({ id }: Props): JSX.Element | null => {
  // id is provided by Hyperview, and represents a tab navigator id
  const ctx = useContext(BottomTabBarContext);

  // Props are the props received by the component backing the custom
  // Hyperview element <navigation:bottom-tab-bar>
  const props = ctx.elementsProps?.[id];

  // It is assumed here the component will nest a single child
  const child = Array.from(props?.element?.childNodes || []).find(
    node => node.nodeType === NODE_TYPE.ELEMENT_NODE,
  ) as Element | undefined;

  // Since the state of the element is no longer held by the screen's doc
  // that provides it, we create a local state to store the child element
  // and keep it in sync with the child provided by the props
  const [element, setElement] = useState<Element | undefined>(child);
  useEffect(() => {
    setElement(child);
  }, [child]);
  if (!props || !child) {
    return null;
  }

  // We override onUpdate to handle local state update, and delegate
  // to props.onUpdate for any other treatments (i.e. behaviors etc.)
  const onUpdate: HvComponentOnUpdate = (
    href,
    action,
    currentElement,
    opts,
  ) => {
    if (action === 'swap' && opts.newElement) {
      // Bit scared of this but disconnecting this state update from propagating
      // up to the rest of the system solves a LOT of problems with unwanted
      // re-rendering, without any obvious negative effects.
      // Could *possibly* be moved up into the context manager,
      // but I don't want to fiddle with it any more
      setElement(opts.newElement);
    } else if (action === 'navigate') {
      // Always allow the current render loop to complete
      // before we actually start the navigation action,
      // so the tab selection visibly updates before
      // a potentially slow re-render of the destination screen
      setTimeout(() => {
        props.onUpdate(href, 'navigate', currentElement, opts);
      }, 0);
    } else {
      props.onUpdate(href, action, currentElement, opts);
    }
  };

  return Render.renderElement(element, props.stylesheets, onUpdate, {
    componentRegistry: props.options?.componentRegistry,
  }) as JSX.Element | null;
};
