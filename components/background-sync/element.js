import BaseElement from '../base.js';
import '../../db-helpers.js';

class MyBackgroundSync extends BaseElement {
  constructor() {
    super('/components/background-sync/template.html', '/components/background-sync/styles.css');
  }

  connectedCallback() {
    super.connectedCallback();
    this.prepareExperiment();
  }

  async prepareExperiment() {
    await this.readyPromise;
    this.notificationsButton = this._root.querySelector('#notifications-button');
    this.postButton = this._root.querySelector('#post-button');
    this.notificationsButton.addEventListener('click', () => this.askForNotifications());
    this.postButton.addEventListener('click', () => this.postToServer());
    this.updateButtons();
  }

  async askForNotifications() {
    if (this.pushSubscription) {
      return;
    }
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (!registration) {
      return;
    }
    this.pushSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      // Insert your public key here
      applicationServerKey: this.urlBase64ToUint8Array('BBs97jHBz23RRCZEPMAmA3VJe4QG7U0tHwBx7WnrChqQtu5s1RQrv-ij7fBfaS7Js176XX2TEGjUWbI0zjxR_G4'),
    }).catch(() => this.updateButtons('denied'));
    this.updateButtons(Notification.permission);
  }

  updateButtons(status) {
    switch (status) {
      case 'denied':
        this.notificationsButton.textContent = this.postButton.textContent = 'Notifications denied';
        this.notificationsButton.disabled = this.postButton.disabled = true;
        break;
      case 'granted':
        this.notificationsButton.textContent = 'Notifications allowed';
        this.notificationsButton.disabled = true;
        this.postButton.textContent = 'Send POST request';
        this.postButton.disabled = false;
        break;
      case 'sent':
        this.postButton.textContent = 'POST request sent';
        this.postButton.disabled = true;
        break;
      default:
        this.notificationsButton.textContent = 'Enable notifications';
        this.notificationsButton.disabled = false;
        this.postButton.textContent = 'You have to enable the notifications first';
        this.postButton.disabled = true;
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async postToServer() {
    if (Notification.permission !== 'granted' || !this.pushSubscription || this.postRequestSent) {
      return;
    }
    if (!navigator.serviceWorker.controller) {
      return;
    }
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (!registration) {
      return;
    }
    // Add the message to the queue on IDB
    await self.putIntoDB('fetch-queue', {
      url: '/api/post',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: this.pushSubscription.toJSON(),
      }),
    });
    // Tell the Service Worker to fire the background sync with the "fetch" tag
    await registration.sync.register('fetch');
    this.postRequestSent = true;
    this.updateButtons('sent');
  }
}

customElements.define('my-background-sync', MyBackgroundSync);
export default MyBackgroundSync;
