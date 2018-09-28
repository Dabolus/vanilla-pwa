## Vanilla PWA

Is it possible to write a Progressive Web App without using any library, framework and build tool? **Yes, it is**, and that's exactly what Vanilla PWA is. Of course it isn't meant to be used for an important project, since only a few browsers support the technologies used to build it, but it is a great way to understand how the great things modern frameworks provide work.

These are the native modern technologies used in this PWA:

- [HTML Templates](https://html.spec.whatwg.org/multipage/scripting.html#the-template-element)
- [CSS Variables](https://www.w3.org/TR/css-variables/)
- [Custom Elements](https://html.spec.whatwg.org/multipage/custom-elements.html)
- [Shadow DOM](https://dom.spec.whatwg.org/#shadow-trees)
- [ES Modules](https://html.spec.whatwg.org/multipage/webappapis.html#integration-with-the-javascript-module-system)
- [Service Worker API](https://w3c.github.io/ServiceWorker)
- [Fetch API](https://fetch.spec.whatwg.org)
- [Notifications API](https://notifications.spec.whatwg.org)
- [Storage API (Cache API, IndexedDB)](https://storage.spec.whatwg.org)
- [Background Sync API](https://wicg.github.io/BackgroundSync/spec/)
- [Web Share API](https://wicg.github.io/web-share/)
- Many ES6/7/8 features ([async functions](https://tc39.github.io/ecmascript-asyncawait/), [object rest/spread](https://tc39.github.io/proposal-object-rest-spread/), etc.)

### Testing locally

Most of the PWA can be tested by simply serving the content of this directory.
However, some more complicated examples (dynamic data caching, push notifications and background sync) require a mock back end that takes the requests and does some server side work. In case you want to test that features too, you have two possibilities:

- Create your own mock back end (as you can see from `functions/index.js` it is incredibly simple)
- Use Firebase to test the project like I do

In both cases, you will need to configure web push with a public and a private key, otherwise the notifications won't work. The simplest way to obtain your configuration is to head over [this website](https://web-push-codelab.glitch.me/).

If you are using your own back end, I highly suggest you to save this data in
some environment variables. If you are using Firebase, you will need to create a `.runtimeconfig.json` file in the `functions` directory following this format:
```json
{
  "webpush": {
    "subject": "your email",
    "publickey": "your public key",
    "privatekey": "your private key"
  }
}
```
Note: **this only applies to local development**. If you want to deploy the PWA, be sure to ignore this file and execute the following commands to set the variables instead:
```bash
$ firebase functions:config:set webpush.subject="your email"
$ firebase functions:config:set webpush.publickey="your public key"
$ firebase functions:config:set webpush.privatekey="your private key"
```

Now you are ready to go! With Firebase, just use `firebase serve` to test the entire environment (hosting + functions) locally.
