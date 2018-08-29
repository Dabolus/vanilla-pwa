class BaseElement extends HTMLElement {
  constructor(templateUrl, stylesUrl) {
    super();
    const promises = [
      fetch(templateUrl).then((res) => res.text()),
      fetch(stylesUrl).then((res) => res.text()),
      fetch('/components/shared-styles.css').then((res) => res.text()),
    ];
    this.readyPromise =
      Promise.all(promises)
        .then(([template, styles, sharedStyles]) => {
          this._tmpl = document.createElement('template');
          this._tmpl.innerHTML = `<style>${sharedStyles} ${styles}</style> ${template}`;
          this._root = this.attachShadow({ mode: 'open' });
          this._root.appendChild(this._tmpl.content.cloneNode(true));
        });
  }
}

export default BaseElement;
