var config = require('./config.json');
var telegramToken = config.telegramToken;
var fbToken = config.fbToken;

var TelegramBot = require('node-telegram-bot-api');
var token = telegramToken;
var bot = new TelegramBot(token, {polling: true});

var http = require('http');
var https = require('https');

// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function (msg, match) {
  var fromId = msg.from.id;
  var resp = match[1];
  bot.sendMessage(fromId, resp);
});

// Any kind of message
bot.on('message', function (msg) {
  var chatId = msg.chat.id;

  if(msg.location != null) {
    var locationLatitude = msg.location.latitude;
    var locationLongitude = msg.location.longitude;

    console.log('latitude : ' + locationLatitude + ' longitude : ' + locationLongitude);
    bot.sendMessage(chatId, 'you entered a location :)');
  }

  if(msg.text != null) {
    var responseText = analyseText(msg.text);
    bot.sendMessage(chatId, responseText);
  }

});

//FB Messenger

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const request = require('request');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

/* For Facebook Validation */
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'tuxedo_cat') {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});

/* Handling all messenges */
app.post('/webhook', (req, res) => {
  console.log(req.body);
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
          // sendMessage(event);
          processMessage(event);
        }
      });
    });
    res.status(200).end();
  }
});

function processMessage(event) {
  var sender = event.sender.id;
  var text = event.message.text;
  var responseText = analyseText(text);
  var reply = responseText;

  console.log("reply : " + reply);
  sendMessage(event, reply);
}

function analyseText(text) {
  console.log("analyseText : " + text);
  return "howdy";
}

// function sendMessage(event) {
function sendMessage(event, reply) {
  var sender = event.sender.id;
  var text = event.message.text;

  console.log("sender : " + sender);
  console.log("text : " + text);

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: fbToken},
    method: 'POST',
    json: {
      recipient: {id: sender},
      // message: {text: 'reply'}
      message: {text: reply}
    }
  }, function (error, response) {
    if (error) {
        console.log('Error sending message: ', error);
    } else if (response.body.error) {
        console.log('Error: ', response.body.error);
    }
  });
}
