import BaseElement from '../base.js';

class MySensors extends BaseElement {
  constructor() {
    super('/components/sensors/template.html', '/components/sensors/styles.css');
    this.setupSensors();
  }

  setupSensors() {
    if ('LinearAccelerationSensor' in window) {
      const acceleration = new LinearAccelerationSensor({ frequency: 60 });
      acceleration.addEventListener('reading', () =>
        console.log(acceleration.x, acceleration.y, acceleration.z));
      acceleration.start();
    }

    if ('Gyroscope' in window) {
      const gyroscope = new Gyroscope();
      gyroscope.addEventListener('reading', () =>
        console.log(gyroscope.x, gyroscope.y, gyroscope.z));
      gyroscope.start();
    }

    if ('AbsoluteOrientationSensor' in window) {
      const absOrientation = new AbsoluteOrientationSensor();
      absOrientation.onreading = () => console.log(absOrientation.quaternion);
      absOrientation.start();
      console.log(absOrientation);
    }

    if ('RelativeOrientationSensor' in window) {
      const relOrientation = new RelativeOrientationSensor();
      let rotationMatrix = new Float32Array(16);
      relOrientation.onreading = () => {
        relOrientation.populateMatrix(rotationMatrix);
        console.log(rotationMatrix);
      }
      relOrientation.start();
    }

    if ('AmbientLightSensor' in window) {
      const ambientLight = new AmbientLightSensor();
      sensor.addEventListener('reading', () =>
        console.log(ambientLight.illuminance));
      ambientLight.start();
    }

    if ('Magnetometer' in window) {
      const magnetometer = new Magnetometer();
      magnetometer.addEventListener('reading', () =>
        console.log(magnetometer.x, magnetometer.y, magnetometer.z));
      magnetometer.start();
    }
  }
}

customElements.define('my-sensors', MySensors);
export default MySensors;
