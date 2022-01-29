const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AndySettingSchema = mongoose.Schema({
	jenis: {
		type: String,
		required: true
	},
	nilai: {
		type: Number,
		required: true
	},
	delete: {
		type: Boolean
	}
})

module.exports = mongoose.model("Andy_Setting", AndySettingSchema);