const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmesPropertiSchema = mongoose.Schema({
	nama: {
		type: String,
		required: true
	},
	alamat: {
		type: String,
		required: true
	},
	device: {
		type: Schema.Types.ObjectId, 
		ref: 'Emes_Device',
		required: true
	},
	delete: {
		type: Boolean
	}
})

module.exports = mongoose.model("Emes_Properti", EmesPropertiSchema);