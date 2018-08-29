import BaseElement from '../base.js';
import { setupRouter } from '../utils.js';

class MyShell extends BaseElement {
  get links() {
    if (!this._links) {
      this._links = this._root.querySelectorAll('nav > *');
    }
    return this._links;
  }

  get pages() {
    if (!this._pages) {
      this._pages = this._root.querySelectorAll('main > *');
    }
    return this._pages;
  }

  constructor() {
    super('/components/shell/template.html', '/components/shell/styles.css');
    setupRouter((location) => this.navigateTo(location));
  }

  async navigateTo({ pathname }) {
    let path = decodeURIComponent(pathname).substring(1);
    if (!path) {
      history.replaceState({}, '', '/home');
      path = 'home';
    }
    const [elem] = await Promise.all([
      import(`../${path}/element.js`),
      this.readyPromise,
    ]);
    for (const link of this.links) {
      if (link.getAttribute('href') === `/${path}`) {
        link.setAttribute('active', '');
      } else {
        link.removeAttribute('active');
      }
    }
    for (const page of this.pages) {
      if (Object.getPrototypeOf(page).constructor.name === elem.default.prototype.constructor.name) {
        page.setAttribute('active', '');
      } else {
        page.removeAttribute('active');
      }
    }
  }
}

customElements.define('my-shell', MyShell);
export default MyShell;
