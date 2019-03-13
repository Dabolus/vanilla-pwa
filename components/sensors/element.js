import BaseElement from '../base.js';

class MySensors extends BaseElement {
  constructor() {
    super('/components/sensors/template.html', '/components/sensors/styles.css');
  }

  connectedCallback() {
    super.connectedCallback();
    this.setupSensors();
  }

  async setupSensors() {
    await this.readyPromise;
    if ('LinearAccelerationSensor' in window) {
      const acceleration = new LinearAccelerationSensor({ frequency: 60 });
      const accelerationData = this._root.querySelector('#acceleration-data');
      acceleration.addEventListener('reading', () =>
        accelerationData.innerHTML =
          `<strong>x:</strong> ${acceleration.x}<br>` +
          `<strong>y:</strong> ${acceleration.y}<br>` +
          `<strong>z:</strong> ${acceleration.z}`);
      acceleration.start();
    }

    if ('Gyroscope' in window) {
      const gyroscope = new Gyroscope();
      const gyroscopeData = this._root.querySelector('#gyroscope-data');
      gyroscope.addEventListener('reading', () =>
        gyroscopeData.innerHTML =
          `<strong>x:</strong> ${gyroscope.x}<br>` +
          `<strong>y:</strong> ${gyroscope.y}<br>` +
          `<strong>z:</strong> ${gyroscope.z}`);
      gyroscope.start();
    }

    if ('AbsoluteOrientationSensor' in window) {
      const absOrientation = new AbsoluteOrientationSensor();
      const absOrientationData = this._root.querySelector('#abs-orientation-data');
      absOrientation.addEventListener('reading', () =>
        absOrientationData.innerHTML =
          `<strong>quaternion:</strong> ${absOrientation.quaternion}`);
      absOrientation.start();
    }

    if ('RelativeOrientationSensor' in window) {
      const relOrientation = new RelativeOrientationSensor();
      const relOrientationData = this._root.querySelector('#rel-orientation-data');
      let rotationMatrix = new Float32Array(16);
      relOrientation.addEventListener('reading', () => {
        relOrientation.populateMatrix(rotationMatrix);
        relOrientationData.innerHTML =
          `<strong>rotation matrix:</strong> ${rotationMatrix}`;
      });
      relOrientation.start();
    }

    if ('AmbientLightSensor' in window) {
      const ambientLight = new AmbientLightSensor();
      const ambientLightData = this._root.querySelector('#ambient-light-data');
      sensor.addEventListener('reading', () =>
        ambientLightData.innerHTML =
          `<strong>illuminance:</strong> ${ambientLight.illuminance}`);
      ambientLight.start();
    }

    if ('Magnetometer' in window) {
      const magnetometer = new Magnetometer();
      const magnetometerData = this._root.querySelector('#magnetometer-data');
      magnetometer.addEventListener('reading', () =>
        magnetometerData.innerHTML =
          `<strong>x:</strong> ${magnetometer.x}<br>` +
          `<strong>y:</strong> ${magnetometer.y}<br>` +
          `<strong>z:</strong> ${magnetometer.z}`);
      magnetometer.start();
    }
  }
}

customElements.define('my-sensors', MySensors);
export default MySensors;
