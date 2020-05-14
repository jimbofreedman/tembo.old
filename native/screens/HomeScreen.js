import * as React from 'react';
import { Text, Container } from 'native-base';
import { observer } from 'mobx-react';

function HomeScreen() {
  return (
    <Container>
      <Text>Hi</Text>
    </Container>
  );
}

export default observer(HomeScreen);
