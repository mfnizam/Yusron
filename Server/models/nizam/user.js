const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NizamUserSchema = mongoose.Schema({
	namaLengkap: {
		type: String,
		required: true
	},
	noKta: {
		type: String
	},
	kwarcab: {
		type: String
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
	email: {
		type: String,
		required: true
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
	status: {
		type: Number, // 1 pemateri, 2 peserta
		default: 2
	}
})

module.exports = mongoose.model("Nizam_User", NizamUserSchema);