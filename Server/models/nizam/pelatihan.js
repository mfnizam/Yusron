const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NizamPelatihanSchema = mongoose.Schema({
	kode: { // this must be autogenerate
		type: String,
		required: true
	},
	nama: {
		type: String,
		required: true
	},
	tglPendaftaranMulai: {
		type: Date,
		required: true
	},
	tglPendaftaranAkhir: {
		type: Date,
		required: true
	},
	tglPelaksanaanMulai: {
		type: Date,
		required: true
	},
	tglPelaksanaanAkhir: {
		type: Date,
		required: true
	},
	tingkatan: {
		type: Schema.Types.ObjectId, 
		ref: 'Nizam_Tingkatan',
		required: true
	},
	imgUrl: { // for logo
		type: String, 
	},
	deskripsi: {
		type: String
	},
	biaya: {
		type: Number
	},
	pemateri: [{
		type: Schema.Types.ObjectId, 
		ref: 'Nizam_User',
	}],
	peserta: [{
		type: Schema.Types.ObjectId, 
		ref: 'Nizam_User',
	}],
	delete: Boolean,
	status: {
		type: Number,
		default: 0, // 0 tidak aktif, 1 masa pendaftaran, 2 sedang berlangsung, 3 batal
	},
	pelajaran: [{
		type: Schema.Types.ObjectId, 
		ref: 'Nizam_Pelajaran',
	}]
})

module.exports = mongoose.model("Nizam_Pelatihan", NizamPelatihanSchema);