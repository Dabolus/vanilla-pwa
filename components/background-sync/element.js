import BaseElement from '../base.js';

class MyBackgroundSync extends BaseElement {
  constructor() {
    super('/components/background-sync/template.html', '/components/background-sync/styles.css');
  }

  async postToServer(msg) {
    if (!navigator.serviceWorker.controller) {
      return;
    }
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (!registration) {
      return;
    }
    // Send the message to send to the Service Worker
    await registration.postMessage({
      action: 'fetch-data',
      options: {
        url: '/api/post',
        method: 'POST',
        body: msg,
      },
    });
    // Tell the Service Worker to fire the background sync with the "fetch" tag
    registration.sync.register('fetch');
  }
}

customElements.define('my-background-sync', MyBackgroundSync);
export default MyBackgroundSync;
