import BaseElement from '../base.js';

class MyDynamicData extends BaseElement {
  constructor() {
    super('/components/dynamic-data/template.html', '/components/dynamic-data/styles.css');
    this.fetchData();
  }

  async fetchData() {
    const [{ data }] = await Promise.all([
      fetch('/api/data').then((res) => res.json()),
      this.readyPromise,
    ]);
    const dataContainer = this._root.querySelector('#data-container');
    data.forEach(({ id, title, description, image }) => {
      const article = document.createElement('article');
      const img = document.createElement('img');
      img.src = image;
      img.alt = img.title = title;
      article.appendChild(img);
      const div = document.createElement('div');
      const h2 = document.createElement('h2');
      h2.textContent = title;
      div.appendChild(h2);
      const span = document.createElement('span');
      span.textContent = description;
      div.appendChild(span);
      article.appendChild(div);
      dataContainer.appendChild(article);
    });
  }
}

customElements.define('my-dynamic-data', MyDynamicData);
export default MyDynamicData;
