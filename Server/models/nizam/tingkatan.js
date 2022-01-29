const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NizamTingkatanSchema = mongoose.Schema({
	title: {
		type: String,
		required: true
	}
})

module.exports = mongoose.model("Nizam_Tingkatan", NizamTingkatanSchema);