const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const YusronKeranjangSchema = mongoose.Schema({
	produk: {
		type: Schema.Types.ObjectId, 
		ref: 'Yusron_Produk',
		required: true
	},
	jumlah: {
		type: Number,
		required: true,
		default: 1
	},
	user: {
		type: Schema.Types.ObjectId, 
		ref: 'Yusron_User',
		required: true
	}
})

module.exports = mongoose.model("Yusron_Keranjang", YusronKeranjangSchema);