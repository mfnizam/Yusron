const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmesDeviceSchema = mongoose.Schema({
	deskripsi: {
		type: String
	},
	kode: {
		type: String,
		required: true
	},
	delete: {
		type: Boolean
	}
})

module.exports = mongoose.model("Emes_Device", EmesDeviceSchema);