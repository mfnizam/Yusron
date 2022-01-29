const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const YusronUserSchema = mongoose.Schema({
	namaLengkap: {
		type: String,
	},
	email: {
		type: String,
		required: true
	},
	noTlp: {
		type: String
	},
	tglLahir: {
		type: Date
	},
	jenisKelamin: {
		type: Number // 1 laki-laki, 0 perempuan
	},
	alamat: {
		type: String
	},
	password: {
		type: String
	},
	imgUrl: {
		type: String
	},
	saldo: {
		type: Number,
		required: true,
		default: 0
	},
	isAdmin: {
		type: Boolean
	},
	status: {
		type: Number, // 1 kurir, 2 pembali
		default: 2
	}
})

module.exports = mongoose.model("Yusron_User", YusronUserSchema);