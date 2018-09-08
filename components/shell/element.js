import BaseElement from '../base.js';
import { setupRouter } from '../utils.js';

class MyShell extends BaseElement {
  get pages() {
    return {
      'home': 'Home',
      'dynamic-data': 'Dynamic data',
      'background-sync': 'Background sync',
    };
  };

  constructor() {
    super('/components/shell/template.html', '/components/shell/styles.css');
    this.setTheme(localStorage.getItem('theme') || 'light');
    this.page = 'home';
  }

  async connectedCallback() {
    super.connectedCallback();
    setupRouter((location) => this.navigateTo(location));
    await this.readyPromise;
    this._updateNotification = this._root.querySelector('#update-notification');
    this._themesDialog = this._root.querySelector('#themes-dialog');
    this._root.querySelector('#ignore').addEventListener('click', () => this.toggleUpdateNotification(false));
    this._root.querySelector('#update-now').addEventListener('click', () => this.update());
    this._root.querySelector('#theme-selector').addEventListener('click', () => this.toggleThemesDialog());
    this._themesDialog.addEventListener('click', () => this.toggleThemesDialog());
    this._root.querySelectorAll('#themes > li')
      .forEach((li) => li.addEventListener('click', () => this.setTheme(li.dataset.theme)));
    this._root.querySelector('#share-button').addEventListener('click', () => this.share());
    this.checkUpdates();
  }

  setTheme(theme) {
    this.setAttribute('theme', theme);
    localStorage.setItem('theme', theme);
  }

  share() {
    navigator.share({
      title: document.title,
      text: `Check out ${this.pages[this.page]} on Vanilla PWA!`,
      url: window.location.href,
    });
  }

  async navigateTo({ pathname }) {
    let path = decodeURIComponent(pathname).substring(1);
    if (!path || !Object.keys(this.pages).includes(path)) {
      history.replaceState({}, '', '/home');
      path = 'home';
    }
    const elem = await import(`../${path}/element.js`);
    this.page = path;
    // At this point the element should already be ready,
    // but we await its promise just to be sure.
    await this.readyPromise;
    for (const link of this._root.querySelectorAll('nav > *')) {
      if (link.getAttribute('href') === `/${path}`) {
        link.setAttribute('active', '');
      } else {
        link.removeAttribute('active');
      }
    }
    for (const page of this._root.querySelectorAll('main > *')) {
      if (Object.getPrototypeOf(page).constructor.name === elem.default.prototype.constructor.name) {
        page.setAttribute('active', '');
      } else {
        page.removeAttribute('active');
      }
    }
    document.title = `Vanilla PWA - ${this.pages[path]}`;
  }

  toggleUpdateNotification(state) {
    const shouldShow = typeof state === 'undefined' ? !this._updateNotification.className : state;
    this._updateNotification.className = shouldShow ? 'active' : '';
  }

  toggleThemesDialog(state) {
    const shouldShow = typeof state === 'undefined' ? !this._themesDialog.className : state;
    this._themesDialog.className = shouldShow ? 'active' : '';
  }

  async checkUpdates() {
    if (!navigator.serviceWorker.controller) {
      return;
    }
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (!registration) {
      return;
    }
    if (registration.waiting) {
      this.newSw = registration.waiting;
      this.toggleUpdateNotification(true);
      return;
    }
    if (registration.installing) {
      this.trackInstallation(registration.installing);
      return;
    }
    registration.addEventListener('updatefound', () =>
      this.trackInstallation(registration.installing));
    navigator.serviceWorker.addEventListener('controllerchange', () =>
      window.location.reload());
  }

  trackInstallation(sw) {
    sw.addEventListener('statechange', () => {
      if (sw.state === 'installed') {
        this.newSw = sw;
        this.toggleUpdateNotification(true);
      }
    });
  }

  update() {
    this.toggleUpdateNotification(false);
    if (!this.newSw) {
      return;
    }
    this.newSw.postMessage({ action: 'update' });
  }
}

customElements.define('my-shell', MyShell);
export default MyShell;
