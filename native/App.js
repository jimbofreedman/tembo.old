import * as React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { SplashScreen } from 'expo';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { observer } from 'mobx-react';

import BottomTabNavigator from './navigation/BottomTabNavigator';
import useLinking from './navigation/useLinking';
import useStores from './useStores';
import LoginScreen from './screens/LoginScreen';

const Stack = createStackNavigator();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default observer(function App(props) {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);
  const [initialNavigationState, setInitialNavigationState] = React.useState();
  const containerRef = React.useRef();
  const { getInitialState } = useLinking(containerRef);

  const { authStore } = useStores();

  const { skipLoadingScreen } = props;

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHide();

        // Load our initial navigation state
        setInitialNavigationState(await getInitialState());

        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          // eslint-disable-next-line global-require
          'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
          // eslint-disable-next-line global-require
          Roboto: require('native-base/Fonts/Roboto.ttf'),
          // eslint-disable-next-line global-require
          Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
        });

        await authStore.checkLoggedIn();
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        // eslint-disable-next-line no-console
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        SplashScreen.hide();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  if (!isLoadingComplete && !skipLoadingScreen) {
    return null;
  }

  const screen = authStore.isLoggedIn ? (
    <Stack.Screen name="Root" component={BottomTabNavigator} />
  ) : (
    <Stack.Screen name="Login" component={LoginScreen} />
  );

  return (
    <View style={styles.container}>
      {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
      <NavigationContainer ref={containerRef} initialState={initialNavigationState}>
        <Stack.Navigator>{screen}</Stack.Navigator>
      </NavigationContainer>
    </View>
  );
});
