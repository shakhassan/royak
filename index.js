var TelegramBot = require('node-telegram-bot-api');

// var token = '265146450:AAG1gKI8FPqNjNDzaHbm5t4BhQkZKT3RTUc';
var token = '296919005:AAHkcOjPaLpTUDY7uy3daEk0H2tc8PS0-QU';

// Setup polling way
var bot = new TelegramBot(token, {polling: true});

var qr = require('qr-image');
var fs = require('fs');

var util = require("util");
var http = require('http');

var main_menu_button = {
 text: 'Hello! Please select option from the menu or you can write / to see available services',
 parse_mode: 'Markdown',
 reply_markup: JSON.stringify({ keyboard: [
   ['🏦 Branch List'], ['⭐️ Suggest Branch']],
   resize_keyboard: true,
   one_time_keyboard: true
 })
}

var inline_keyboard_branch_list = {
 text: '',
 parse_mode: 'Markdown',
 reply_markup: JSON.stringify({ inline_keyboard: [
   [{text: 'KLCC Branch', callback_data:   "QWE"+ '57f89cc08eb54d0d1c746c57'}],
   [{text: 'Jalan Tun H.S. Lee Branch', callback_data: '57f89cc08eb54d0d1c746c58'}],
   [{text: 'Desa Parkcity Branch', callback_data: '57f89cc08eb54d0d1c746c59'}],
   [{text: 'Desa Pandan Branch', callback_data: '57f89cc08eb54d0d1c746c59'}]]
 })
}

var inline_keyboard_activate_q = {
 text: '',
 parse_mode: 'Markdown',
 reply_markup: JSON.stringify({ inline_keyboard: [
   [{text: '🔴 Activate Queue', callback_data: "ASD" +'57f89cc08eb54d0d1c746c57'}]]
 })
}

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

    setTimeout(viewbranchlistAfterProvidedLocation(chatId,msg), 100000);



  }

  if(msg.text == '/start' ) {
      bot.sendMessage(chatId, 'you entered /start', main_menu_button).then(function (sended){});
  }

  if(msg.text == '/help') {
    bot.sendMessage(chatId, "Hello! I'm a chat bot. Please select option from the menu or you can write / to see available services");
  }

  if(msg.text == '/branchlist' ) {

    //1- request location from user
    //2- call API to get branchlist based on distance and pass to

    if(msg.location != null) {
      var locationLatitude = msg.location.latitude;
      var locationLongitude = msg.location.longitude;

      console.log('latitude : ' + locationLatitude + ' longitude : ' + locationLongitude);

      bot.sendMessage(chatId, 'Please tap on branch for details : ', inline_keyboard_branch_list).then(function (sended){});
    }
    else {
      bot.sendMessage(chatId, '❗️ Please share your location first to use branch recommendation engine');
    }

  }

  if(msg.text == '/viewbranch' ) {

    //call API to get branch details based branchId

      bot.sendMessage(chatId, 'Branch details as follow : ' + '\r\n Name : ' + '\r\n Address : '
             + '\r\n Contact Number : ' + '\r\n Queue : '
             + '\r\n', inline_keyboard_activate_q).then(function (sended){});
  }

  if(msg.text == '/suggestbranch' ) {

    //1- request location from user
    //2- call API for branch recommendation

    if(msg.location == null) {
      bot.sendMessage(chatId, '❗️ Please share your location first to use branch recommendation engine');
    }

    // var returnEngine = getRecommendationEngine();

      // bot.sendMessage(chatId, 'Branch details as follow : ' + '\r\n Name : ' + '\r\n Address : '
      //        + '\r\n Contact Number : ' + '\r\n Queue : ' + returnEngine
      //        + '\r\n', inline_keyboard_activate_q).then(function (sended){});
  }

  if(msg.text == '/testqr' ) {

    var code = qr.image('12345', { type: 'png' });
    var qroutput = fs.createWriteStream('qroutput.png')
    code.pipe(qroutput);

    var photo = 'qroutput_1476146226.png';
    bot.sendPhoto(chatId, photo, {caption: 'Please show this at counter'});

    // setTimeout(uploadqr(chatId, qroutput), 10000);

    bot.sendMessage(chatId, '✅ You have activated your queue number ');

  }

});

// Inline button callback queries
bot.on('callback_query', function (msg) {

  var chatId = msg.message.chat.id;

  // if(inline_keyboard_activate_q.reply_markup.inline_keyboard!=null){
  //   console.log('TEST >>> ' + inline_keyboard_activate_q.reply_markup.inline_keyboard.text);
  // }

  if(msg.data.substring(0, 3)=="ASD") {
    var code = qr.image('12345', { type: 'png' });
    var qroutput = fs.createWriteStream('qroutput.png')
    code.pipe(qroutput);

    var photo = 'qroutput_1476146226.png';
    bot.sendPhoto(chatId, photo, {caption: 'Please show this at counter'});

    // setTimeout(uploadqr(chatId, qroutput), 10000);

    bot.sendMessage(chatId, '✅ You have activated your queue number');

    // bot.sendMessage(chatId, '✅ You have activated your queue number' + '\r\n' + uploadqr(chatId, qroutput
    // ));

  }
  else {
    var cleanBranchId = msg.data.substring(3);
    bot.sendMessage(chatId, 'Branch details as follow : ' + '\r\n Branch ID : ' + cleanBranchId  + '\r\n Name : ' + '\r\n Address : '
           + '\r\n Contact Number : ' + '\r\n Queue : '
           + '\r\n', inline_keyboard_activate_q);
  }

});

function viewbranchlist(chatId) {
  bot.sendMessage(chatId, 'Please tap on branch for details : ', inline_keyboard_branch_list).then(function (sended){});
}

function viewbranchlistAfterProvidedLocation(chatId,msg) {
  bot.sendMessage(chatId, 'Please tap on branch for details : ' + getRecommendationEngine(msg), inline_keyboard_branch_list).then(function (sended){});
}

function uploadqr(chatId, photo) {
  bot.sendPhoto(chatId, photo, {caption: 'Please show this at counter'});
}

function getRecommendationEngine(msg) {

  if(msg.location != null) {
    var locationLatitude = msg.location.latitude;
    var locationLongitude = msg.location.longitude;

    console.log('latitude : ' + locationLatitude + ' longitude : ' + locationLongitude);
  }
//   http.get('http://192.168.10.112:8080/api/engine/101.711164/3.154302/500000', (res) => {
//     console.log(`Res: ${res}`);
//   console.log(`Got response: ${res.statusCode}`);
//   // consume response body
//   res.resume();
// }).on('error', (e) => {
//   console.log(`Got error: ${e.message}`);
// });

// return http.get({
//         host: 'http://api.geonames.org',
//         //port: 8080,
//         path: '/citiesJSON'
//     }, function(response) {
//         // Continuously update stream with data
//         var body = '';
//         response.on('data', function(d) {
//             body += d;
//         });
//
//         console.log('data', function(d){body += d;});
//
//         response.on('end', function() {
//
//             // Data reception is done, do whatever with it!
//             var parsed = JSON.parse(body);
//             callback({
//                 email: 'testemail',
//                 password: 'testpass'
//             });
//         });
//     });

// var options = {
//   host: 'https://news.google.com',
//   //port: 8080,
//   path: '/news'
// };
//
// callback = function(response) {
//   var str = '';
//
//   //another chunk of data has been recieved, so append it to `str`
//   response.on('data', function (chunk) {
//     str += chunk;
//   });
//
//   //the whole response has been recieved, so we just print it out here
//   response.on('end', function () {
//     console.log(str);
//   });
// }
//
// http.request(options, callback).end();
//
}
