const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const YusronProdukSchema = mongoose.Schema({
	imgUrl: [{
		type: String
	}],
	nama: {
		type: String,
		required: true
	},
	deskripsi: {
		type: String
	},
	harga: {
		type: Number,
		required: true
	},
	kategori: {
		type: Schema.Types.ObjectId, 
		ref: 'Yusron_Kategori',
		required: true
	},
	diskon: {
		type: Number
	},
	stok: {
		type: Number,
		required: true,
		default: 1
	},
	terjual: {
		type: Number,
		default: 0
	},
	rating: {
		type: Number,
		default: 0
	},
	delete: {
		type: Boolean
	}
})

module.exports = mongoose.model("Yusron_Produk", YusronProdukSchema);