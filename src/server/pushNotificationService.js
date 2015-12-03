'use strict';

var extend = require('extend');
var log = require('./logging.js').getLogger('pushNotificationService.js');
var gcm = require('node-gcm-service');
var registration_ids = new Array();

var apikey = 'AIzaSyB-YB5jWd0Sw1MrCeucCr3BCppynl0fGxo';

/**
* @module server
* @submodule
* @class pushNotificationService
* @constructor
* @author Tom Tanaka 2015-09-19 Unionsoft, s.r.o.
* Requires node-gcm-service
*
*/
var pushNotificationService = function() {
	this.sendPushNotification = function(req ,res) {
		if(undefined !== req.body.pushregids  && req.body.pushregids.length > 0) {
			for(var i = 0; i < req.body.pushregids.length; i++) {
				registration_ids.push(req.body.pushregids[i]);
			}
			var url = 'https://unionsoft.tk:3443/dataset/get/mobileContents/banner.jpg';

				var message = new gcm.Message();
				// set data with another object 
				//message.setDataWithObject({
				//	message: req.body.msg
				//});
				var currentdate = new Date(); 
				var datetime = currentdate.getDate() + "/"
					+ (currentdate.getMonth()+1)  + "/" 
					+ currentdate.getFullYear() + " @ "  
					+ currentdate.getHours() + ":"  
					+ currentdate.getMinutes() + ":" 
					+ currentdate.getSeconds();

				// set data with another object
				message.setDataWithObject({
					timeStamp: datetime,
					msgcnt: registration_ids.length,
					title: 'Membery Notification',
					message: req.body.msg,
					bigPicture: url,
					soundname: 'beep.wav'
				});

				// add new key-value to data if key does not exists 
				//message.addDataWithKeyValue('Date/time', datetime);

				// set collapse key 
				message.setCollapseKey('string');

				// set dry run 
				message.setDryRun(false);

				// set delay while idle 
				message.setDelayWhileIdle(true);

				var sender = new gcm.Sender();
				
				// set api key
				sender.setAPIKey(apikey);
				//var dataMSG = '{\"data\": {\"timeStamp\": \"' + datetime + '\", \"msgcnt\": \"' + registration_ids.length +'\", \"title:\": \"Membery Notification\", \"message\": \"' + req.body.msg + '\" }}';
				var dataMSG = '{\"data\": {\"timeStamp\": \"' + datetime + '\", \"msgcnt\": \"' + registration_ids.length +'\", \"title:\": \"Membery Notification\", \"message\": \"' + req.body.msg + '\", \"bigPicture\": \"' + url + '\", \"soundname\": \"beep.wav\" }}';
				//var dataMSG = '{\"data\": {\"timeStamp\": \"' + datetime + '\", \"msgcnt\": \"' + registration_ids.length +'\", \"title:\": \"Membery Notification\", \"message\": \"' + req.body.msg + '\", \"sound\": \"beep.wav\" }}';
				log.debug(message.toString());
				sender.sendMessage(message.toString() , registration_ids, true, function(err, data) {
					if (!err) {
						// do something
						log.info('GCM message sent.' + data);
						res.success = true;
					} else {
						// handle error
		 				log.info('GCM message failed.' + err);
		 				res.success = false;
					}
				});

			res.sendStatus(200);
		} else {
			res.sendStatus(200);
			log.error('GCM message failed.');
		}
	}
}
module.exports = {
		pushNotificationService : pushNotificationService
};