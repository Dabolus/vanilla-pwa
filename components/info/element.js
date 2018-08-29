import BaseElement from '../base.js';

class MyInfo extends BaseElement {
  constructor() {
    super('/components/info/template.html', '/components/info/styles.css');
  }
}

customElements.define('my-info', MyInfo);
export default MyInfo;
