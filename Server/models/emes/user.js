const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmesUserSchema = mongoose.Schema({
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
	},
	daya: {
		type: Schema.Types.Decimal
	},
	dayaSemenitLalu: {
		type: Schema.Types.Decimal
	},
	dayaSejamlallu: {
		type: Schema.Types.Decimal
	}
})

module.exports = mongoose.model("Emes_User", EmesUserSchema);