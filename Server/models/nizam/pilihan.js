const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NizamPilihanSchema = mongoose.Schema({
	peserta: {
		type: Schema.Types.ObjectId, 
		ref: 'Nizam_User',
		required: true
	},
	materi: {
		type: Schema.Types.ObjectId, 
		ref: 'Nizam_Materi',
		required: true
	},
	pilihan: [{
		soal: {
			type: Schema.Types.ObjectId, 
			ref: 'Nizam_Soal',
			required: true
		},
		pilihan: {
			type: String,
			required: true
		},
	}],
	delete: Boolean,
	penilaian: Number
})

module.exports = mongoose.model("Nizam_Pilihan", NizamPilihanSchema);