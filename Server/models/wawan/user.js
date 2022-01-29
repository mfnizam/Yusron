const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Data = require('./data');

//Wawanuser scheme
const WawanUserSchema = mongoose.Schema({
	nama: {
		type: String
	},
	email: {
		type: String
	},
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	data : [{ type: Schema.Types.ObjectId, ref: 'Data' }]
});

//export mongoDB scheme dan Wawanuser file sebagai WawanUser
module.exports = mongoose.model('Wawan_User', WawanUserSchema);
