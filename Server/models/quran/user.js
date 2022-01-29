const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuranUserSchema = mongoose.Schema({
	namaLengkap: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	noTlp: {
		type: String
	},
	alamat: {
		type: String
	},
	tglLahir: {
		type: Date
	},
	jenisKelamin: {
		type: Number // 1 laki-laki, 0 perempuan
	},
	password: {
		type: String
	},
	imgUrl: {
		type: String
	},
	isAdmin: {
		type: Boolean
	},
	delete: {
		type: Boolean
	},
})

module.exports = mongoose.model("Quran_User", QuranUserSchema);