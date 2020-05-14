import Constants from 'expo-constants';

import api from '../api';

/**
 * Service to abstract api calls to one file - to be used in middleware
 */
class ApiSerice {
  constructor() {
    this.api_url = Constants.manifest.extra.apiUrl;
    console.log("API URL", this.api_url)
  }

  /**
   * Service function to avoid repetition of fetch everywhere
   * @param {string} url - url to fetch
   * @param {string} method - method get or post
   * @param {string|boolean} token  - authentication token
   * @param {object|null} params - params payload
   */
  async apiCall(url, method = 'GET', token = false, params = null) {
    const payload = {
      method,
      mode: 'cors',
      headers: this.buildHeaders(token),
    };
    if (params) {
      payload.body = JSON.stringify(params);
    }
    console.log(payload);
    console.log(`${this.api_url}${url}`);
    const res = await fetch(`${this.api_url}${url}`, payload);
    const { status } = res;
    const body = await res.json();
    return { status, body };
  }

  /**
   * Build  http headers object
   * @param {string|boolean} token
   */
  buildHeaders(token = false) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (token) {
      headers.append('Authorization', `Token ${token}`);
    }
    return headers;
  }

  /**
   * Throw common error on not successful status
   * @param {object} response
   * @param {bool} auth - check for unauth error or not
   */
  handleCommonError(response, auth = false) {
    if (response.status === 401 && auth) {
      StorageService.removeToken();
      window.location(api.login);
    }
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(response.status);
    }
  }

  async register(params) {
    // registration
    const reg = await this.apiCall(api.sign_up, 'POST', false, params);
    return reg;
  }

  // login/register
  async convertToken(params) {
    const res = await this.apiCall(api.convert_token, 'POST', false, params);
    this.handleCommonError(res);
    console.log(res.body);
    return res.body;
  }

  async me(token) {
    const res = await this.apiCall(api.me, 'GET', token);
    this.handleCommonError(res);
    return res.body;
  }

  async login(params) {
    // login
    const res = await this.apiCall(api.login, 'POST', false, params);
    this.handleCommonError(res);
    return res.body;
  }

  async logout(token) {
    // login
    const res = await this.apiCall(api.logout, 'POST', false, null, token);
    return res.status;
  }

  async verify_token(token = false) {
    // verify token on load
    const res = await this.apiCall(api.verify_token, 'POST', false, { token });
    this.handleCommonError(res);
    return res.status;
  }
}

export default new ApiSerice();
