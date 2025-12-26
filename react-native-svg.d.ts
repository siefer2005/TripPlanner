declare module 'react-native-svg' {
  import * as React from 'react';

  export interface SvgXmlProps {
    xml: string;
    width?: number | string;
    height?: number | string;
  }

  export const SvgXml: React.ComponentType<SvgXmlProps>;
}

