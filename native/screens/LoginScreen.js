import * as React from 'react';
import { Button, Text, Container } from 'native-base';
import { observer } from 'mobx-react';

import useStores from '../useStores';

function HomeScreen() {
  const { authStore } = useStores();

  return (
    <Container>
      <Button onPress={authStore.login}>
        <Text>Login with Facebook</Text>
      </Button>
    </Container>
  );
}

HomeScreen.navigationOptions = {
  header: null,
};

export default observer(HomeScreen);
