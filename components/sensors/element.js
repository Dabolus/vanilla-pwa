import BaseElement from '../base.js';

class MySensors extends BaseElement {
  constructor() {
    super('/components/sensors/template.html', '/components/sensors/styles.css');
    this.setupSensors();
  }

  setupSensors() {
    // TODO: setup sensors
  }
}

customElements.define('my-sensors', MySensors);
export default MySensors;
