import * as React from 'react';
import { Text } from 'react-native';

// eslint-disable-next-line import/prefer-default-export
export function MonoText(props) {
  const { style } = props;
  return <Text {...props} style={[style, { fontFamily: 'space-mono' }]} />;
}
