const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');
//user scheme
const WawanDataSchema = mongoose.Schema({
	// deviceId: { 
	// 	type: String,
	// 	required: true 
	// },
	suhu: { 
		type: String,
		required: true 
	},
	kelembaban: {
		type: String,
		required: true
	},
	api: {
		type: String,
		required: true
	},
	asap: {
		type: String,
		required: true
	},
	statusDevice: {
		type: Boolean,
		required: true
	},
	tgl: { 
		type: Date, 
		default: Date.now
	}
});

//export mongoDB scheme dan user file sebagai User
const WawanData = mongoose.model('Wawan_Data', WawanDataSchema);
module.exports = WawanData;