import * as React from 'react';
import { Container, Text, Button } from 'native-base';
import { observer } from 'mobx-react';
import useStores from '../useStores';

function SettingsScreen() {
  const { authStore } = useStores();

  return (
    <Container>
      <Button onPress={authStore.logout} title="Logout">
        <Text>Logout</Text>
      </Button>
    </Container>
  );
}

export default observer(SettingsScreen);
