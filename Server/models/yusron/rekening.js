const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const YusronRekeningSchema = mongoose.Schema({
	namaBank: {
		type: String,
		required: true
	},
	noRek: {
		type: String,
		required: true
	},
	atasNama: {
		type: String,
	}
})

module.exports = mongoose.model("Yusron_Rekening", YusronRekeningSchema);