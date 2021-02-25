// @flow

/**
 * Copyright (c) Garuda Labs, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { createProps, createTestProps, encodeXml } from '.';
import { DOMParser } from 'xmldom-instawork';
import { createStylesheets } from 'hyperview/src/services/stylesheets';

const parser = new DOMParser();
const createElement = (id: ?string) => {
  const doc = parser.parseFromString('<doc></doc>');
  const el = doc.createElement('<el>');
  if (id) {
    el.setAttribute('id', id);
  }
  return el;
};

describe('encodeXml', () => {
  it('encodes XML entities in an XML string', () => {
    expect(
      encodeXml(
        `<behavior href="https://hyperview.org/foo=bar&bar=baz" action='new' />`,
      ),
    ).toEqual(
      '&lt;behavior href=&quot;https://hyperview.org/foo=bar&amp;bar=baz&quot; action=&apos;new&apos; /&gt;',
    );
  });
});

const mockPlatform = OS => {
  jest.resetModules();
  jest.doMock('Platform', () => ({ OS, select: objs => objs[OS] }));
};

describe('createTestProps', () => {
  describe('valid cases', () => {
    let testProps;
    beforeEach(() => {
      testProps = createTestProps(createElement('myID'));
    });
    describe('Android', () => {
      beforeAll(() => mockPlatform('android'));
      it('does not set testID', () => {
        expect(testProps).not.toHaveProperty('testID');
      });

      it('sets accessibilityLabel from id attribute', () => {
        expect(testProps).toHaveProperty('accessibilityLabel', 'myID');
      });
    });

    describe('iOS', () => {
      beforeAll(() => mockPlatform('ios'));
      it('sets testID from id attribute', () => {
        expect(testProps).toHaveProperty('testID', 'myID');
      });

      it('does not set accessibilityLabel', () => {
        expect(testProps).not.toHaveProperty('accessibilityLabel');
      });
    });
  });

  it('returns empty object if no id attribute present', () => {
    expect(createTestProps(createElement(null))).toEqual({});
  });

  it('returns empty id attribute is empty', () => {
    expect(createTestProps(createElement(''))).toEqual({});
  });
});

describe('createProps', () => {
  const styleSheets = createStylesheets(parser.parseFromString('<doc></doc>'));
  let props;
  beforeEach(() => {
    props = createProps(createElement('myID'), styleSheets, {});
  });

  it('sets id from id attribute', () => {
    expect(props).toHaveProperty('id', 'myID');
  });
  describe('Android', () => {
    beforeAll(() => mockPlatform('android'));
    it('does not set testID', () => {
      expect(props).not.toHaveProperty('testID');
    });

    it('sets accessibilityLabel from id attribute', () => {
      expect(props).toHaveProperty('accessibilityLabel', 'myID');
    });
  });

  describe('iOS', () => {
    beforeAll(() => mockPlatform('ios'));
    it('sets testID from id attribute', () => {
      expect(props).toHaveProperty('testID', 'myID');
    });

    it('does not set accessibilityLabel', () => {
      expect(props).not.toHaveProperty('accessibilityLabel');
    });
  });
});
