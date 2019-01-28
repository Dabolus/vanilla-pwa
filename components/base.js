const supportsAdoptingStyleSheets = 'adoptedStyleSheets' in Document.prototype;

class BaseElement extends HTMLElement {
  constructor(templateUrl, stylesUrl) {
    super();
    this.readyPromise = Promise.all([
      fetch(templateUrl).then((res) => res.text()),
      fetch(stylesUrl).then((res) => res.text()),
      fetch('/components/shared-styles.css').then((res) => res.text()),
    ]).then(([template, styles, sharedStyles]) => {
      this._styles = `${sharedStyles} ${styles}`;
      this._tmpl = document.createElement('template');
      this._tmpl.innerHTML = `${supportsAdoptingStyleSheets ? '' : `<style>${this._styles}</style>`}${template}`;
      this._root = this.attachShadow({ mode: 'open' });
      if (supportsAdoptingStyleSheets) {
        this.constructor.prototype.stylesheet = new CSSStyleSheet();
        this.shadowRoot.adoptedStyleSheets = [this.constructor.prototype.stylesheet];
      }
      this._root.appendChild(this._tmpl.content.cloneNode(true));
    });
  }

  connectedCallback() {
    this.readyPromise.then(() => {
      if (
        supportsAdoptingStyleSheets &&
        this.constructor.prototype.stylesheet &&
        this.constructor.prototype.stylesheet.cssRules.length === 0
      ) {
        return this.constructor.prototype.stylesheet.replace(this._styles);
      }
    });
  }
}

export default BaseElement;
