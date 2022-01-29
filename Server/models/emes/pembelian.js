const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmesPembelianSchema = mongoose.Schema({
	pembeli: {
		type: Schema.Types.ObjectId, 
		ref: 'Emes_User',
		required: true
	},
	token: {
		type: Schema.Types.ObjectId, 
		ref: 'Emes_Token',
		required: true
	},
	nominal: {
		type: Number
	},
	daya: {
		type: Number
	},
	tgl: {
		type: Date,
		default: Date.now
	},
	delete: {
		type: Boolean
	}
})

module.exports = mongoose.model("Emes_Pembelian", EmesPembelianSchema);