const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AndyUserSchema = mongoose.Schema({
	namaLengkap: {
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
	delete: {
		type: Boolean
	}
})

module.exports = mongoose.model("Andy_User", AndyUserSchema);