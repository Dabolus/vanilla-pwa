export const setupRouter = (cb) => {
  document.body.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 ||
      e.metaKey || e.ctrlKey || e.shiftKey) return;

    const anchor = e.composedPath().filter(n => n.tagName === 'A')[0];
    if (!anchor || anchor.target ||
      anchor.hasAttribute('download') ||
      anchor.getAttribute('rel') === 'external') return;

    const href = anchor.href;
    if (!href || href.indexOf('mailto:') !== -1) return;

    const location = window.location;
    const origin = location.origin || location.protocol + '//' + location.host;
    if (href.indexOf(origin) !== 0) return;

    e.preventDefault();
    if (href !== location.href) {
      window.history.pushState({}, '', href);
      cb(location, e);
    }
  });

  window.addEventListener('popstate', e => cb(window.location, e));
  cb(window.location, null);
};
