import * as Facebook from 'expo-facebook';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

import { observable, action, computed } from 'mobx';

export default class AuthStore {
  httpClient = null;

  @observable facebookToken = null;

  @observable apiToken = null;

  @computed get isLoggedIn() {
    return this.apiToken !== null;
  }

  constructor(httpClient) {
    this.httpClient = httpClient;

    Facebook.setAutoInitEnabledAsync(true).then(() => {
      SecureStore.getItemAsync('apiToken').then(t => {
        this.apiToken = t;
        SecureStore.getItemAsync('facebookToken').then(t => {
          this.facebookToken = t;
          Facebook.initializeAsync('461460001330325').then(() => {});
        });
      });
    });
  }

  @action.bound async checkLoggedIn() {
    this.httpClient
        .get(`${Constants.manifest.extra.apiUrl}/api/users/me`)
        .then((data) => console.log(data))
        .catch((error) => console.log(error));
    return false;
  }

  @action.bound
  async login() {
    try {
      const {
        type,
        token,
        /*        expires,
        permissions,
        declinedPermissions, */
      } = await Facebook.logInWithReadPermissionsAsync({
        permissions: ['public_profile', 'user_link'],
      });
      if (type === 'success') {
        const params = {
          client_id: Constants.manifest.extra.facebook.clientId,
          client_secret: Constants.manifest.extra.facebook.clientSecret,
          grant_type: 'convert_token',
          backend: 'facebook',
          token,
        };

        //const apiToken = await apiService.convertToken(params);
        const apiToken = await this.httpClient.post(`${Constants.manifest.extra.apiUrl}/auth/convert-token`, params);
        this.apiToken = apiToken.accessToken;
        this.facebookToken = token;
        SecureStore.setItemAsync('apiToken', this.apiToken);
        SecureStore.setItemAsync('facebookToken', this.facebookToken);
      } else {
        // type === 'cancel'
      }
    } catch (error) {
      console.log(`Facebook Login Error: ${error.message}`);
      console.log(error);
    }
  }

  @action.bound async logout() {
    await SecureStore.deleteItemAsync('facebookToken');
    await SecureStore.deleteItemAsync('apiToken');
    this.facebookToken = null;
    this.apiToken = null;
  }
}
