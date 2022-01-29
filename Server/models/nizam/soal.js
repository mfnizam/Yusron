const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NizamSoalSchema = mongoose.Schema({
	materi: {
		type: Schema.Types.ObjectId, 
		ref: 'Nizam_Materi',
		required: true
	},
	deskripsi: String,
	jawaban: [{
		deskripsi: String
	}],
	kunci: String,
	delete: Boolean
})

module.exports = mongoose.model("Nizam_Soal", NizamSoalSchema);