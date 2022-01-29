const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const YusronKategoriSchema = mongoose.Schema({
	title: {
		type: String,
		required: true
	}
})

module.exports = mongoose.model("Yusron_Kategori", YusronKategoriSchema);