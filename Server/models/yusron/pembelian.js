const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const YusronPembelianSchema = mongoose.Schema({
	jenis: {
		type: Number, // 1 belanja, 2 topup
		required: true
	},
	invoice: {
		type: String,
		required: true
	},
	status: {
		type: Number,
		required: true,
		default: 0 /*
		0 belum bayar, 
		1 sudah bayar (menunggu verifikasi), 
		2 gagal verifikasi, 
		3 Diproses, 
		4 proses pengiriman (siap kirim), 
		5 sedang dikirim (sudah diambil)
		6 selesai, 
		7 gagal*/
	},
	user: {
		type: Schema.Types.ObjectId, 
		ref: 'Yusron_User',
		required: true
	},
	rekening: {
		type: Schema.Types.ObjectId, 
		ref: 'Yusron_Rekening'
	},
	rekeningBackup: {
		namaBank: String,
		noRek: String,
		atasNama: String
	},
	produk: [{
		produk: {
			type: Schema.Types.ObjectId, 
			ref: 'Yusron_Produk'
		},
		jumlah: Number
	}],
	produkBackup: [{
		produk: {
			imgUrl: [{
				type: String
			}],
			nama: {
				type: String,
				required: true
			},
			harga: {
				type: Number,
				required: true
			},
			kategori: {
				title: {
					type: String
				}
			},
			diskon: {
				type: Number
			},
		},
		jumlah: Number
	}],
	jumlah: {
		type: Number,
		required: true,
		default: 0
	},
	kurir: {
		type: Schema.Types.ObjectId, 
		ref: 'Yusron_User'
	},
	buktiPembayaran: [{
		verify: {
			type: Number
		},
		imgUrl: {
			type: String
		}
	}],
	buktiPengambilan: String,
	waktuPembelian: {
		type: Date,
		default: Date.now
	},
	waktuPelunasan: Date,
	waktuPenyelesaian: Date
})

module.exports = mongoose.model("Yusron_Pembelian", YusronPembelianSchema);