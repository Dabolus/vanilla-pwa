const express = require('express');
const functions = require('firebase-functions');
const bodyParser = require('body-parser');
const webPush = require('web-push');
const mockData = require('./data.json');

const app = express();
const api = express.Router();
api.use(bodyParser.json());

webPush.setVapidDetails(
  `mailto:${functions.config().webpush.subject}`,
  functions.config().webpush.publickey,
  functions.config().webpush.privatekey
);

api.get('/data', (req, res) => {
  res.json({
    success: true,
    data: mockData,
  });
});

api.post('/post', (req, res) => {
  // For this simple example, we require the user to send its subscription data on each request.
  // In a real world application, you would have another endpoint where the user would send
  // its subscription, and the back end would save it in a DB
  if (
    !req.body ||
    !req.body.subscription ||
    !req.body.subscription.endpoint ||
    !req.body.subscription.keys ||
    !req.body.subscription.keys.p256dh ||
    !req.body.subscription.keys.auth) {
    res.status(400).json({
      success: false,
      data: 'Bad Request',
    });
    return;
  }
  webPush.sendNotification(req.body.subscription, JSON.stringify({
    title: 'Done!',
    body: 'Your POST request has been received successfully',
    actions: [{
      action: 'dismiss',
      title: 'Dismiss',
    }, {
      action: 'open-background-sync-page',
      title: 'Send another',
    }],
  })).then(() => res.json({
    success: true,
    data: 'OK',
  })).catch(() => res.status(500).json({
    success: false,
    data: 'Internal Server Error',
  }));
});

app.use('/api', api);

exports.api = functions.https.onRequest(app);
