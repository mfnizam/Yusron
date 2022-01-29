const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmesReservasiSchema = mongoose.Schema({
	pelanggan: {
		type: Schema.Types.ObjectId, 
		ref: 'Emes_User',
		required: true
	},
	properti: {
		type: Schema.Types.ObjectId, 
		ref: 'Emes_Properti',
		required: true
	},
	tglCheckIn: {
		type: Date,
		required: true
	},
	waktuCheckIn: {
		type: Date,
		required: true
	},
	tglWaktuCheckOut:{
		type: Date
	},
	// tglCheckOut: {
	// 	type: Date
	// },
	// waktuCheckOut: {
	// 	type: Date
	// }
})

module.exports = mongoose.model("Emes_Reservasi", EmesReservasiSchema);