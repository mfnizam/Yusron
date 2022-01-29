const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AndyHistoriSchema = mongoose.Schema({
	nilai: {
		type: Number,
		required: true
	},
	tgl: {
		type: Date,
		default: Date.now,
		required: true
	},
	totalPerjam: {
		type: Number
	},
	selisihWaktu: {
		type: Number
	},
	delete: {
		type: Boolean
	}
})

module.exports = mongoose.model("Andy_Histori", AndyHistoriSchema);