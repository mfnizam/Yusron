const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NizamMateriSchema = mongoose.Schema({
	pelajaran: {
		type: Schema.Types.ObjectId, 
		ref: 'Nizam_Pelajaran',
		required: true
	},
	namaMateri: {
		type: String
	},
	jenis: {
		type: Number, // 1 pre test, 2 post test, 3 remidi test, 4 materi, 5 lain-lain
		required: true
	},
	tglPelaksanaan: {
		type: Date
	}, 
	waktuPelaksanaanMulai: {
		type: Date
	}, 
	waktuPelaksanaanAkhir: {
		type: Date
	},
	durasiPelaksanaan: {
		type: Date
	},
	soal: [{
		type: Schema.Types.ObjectId, 
		ref: 'Nizam_Soal',
	}],
	// soal: [{
	// 	deskripsi: String,
	// 	jawaban: [{
	// 		deskripsi: String
	// 	}],
	// 	kunci: String
	// }],
	materiUrl: {
		type: String
	},
	delete: Boolean
})

module.exports = mongoose.model("Nizam_Materi", NizamMateriSchema);