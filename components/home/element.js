import BaseElement from '../base.js';

class MyHome extends BaseElement {
  constructor() {
    super('/components/home/template.html', '/components/home/styles.css');
  }
}

customElements.define('my-home', MyHome);
export default MyHome;
