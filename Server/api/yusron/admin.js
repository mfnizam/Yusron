const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const multer = require('multer');
const request = require('request');

//moduls
const m = require('../../module');

// models
const User = require('../../models/yusron/user');
const Kategori = require('../../models/yusron/kategori');
const Rekening = require('../../models/yusron/rekening');
const Produk =  require('../../models/yusron/produk');
const Pembelian =  require('../../models/yusron/pembelian');

// other server url
const otherServerUrl = "https://mfnizam.com/apps/projectkabeh/";

router.post('/kurir', (req, res) => {
	m.customModelFindByQuerySelectPopulateLean(
		User, {$and: [{$or: [{isAdmin: false}, {isAdmin: undefined}]}, {status: 1}]}, ['-isAdmin'], [], (err, data) => {
		if(err) return res.status(500).send({ error : err });

		data.forEach(v => {
			v.hasPassword = v.password? true : false;
			delete v.password;
		})
		return res.json({success: true, kurir: data})
	})
})
router.post('/kurir/tambah', (req, res) => {
	let namaLengkap = req.body.namaLengkap,
			email = req.body.email,
			noTlp = req.body.noTlp,
			tglLahir = req.body.tglLahir,
			jenisKelamin = req.body.jenisKelamin,
			alamat = req.body.alamat,
			password = req.body.password;

	if(!email || !password) return res.json({success: false, msg: 'Data Kurir Tidak Lengkap'});
	let newUser = new User({
		namaLengkap: namaLengkap,
		email: email,
		noTlp: noTlp,
		tglLahir: tglLahir,
		jenisKelamin: jenisKelamin,
		alamat: alamat,
		status: 1,
		password: password
	})

	m.customModelFindByQuery(User, {email: email},(err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(data.length > 0) return res.send({success: false, msg: 'Email Sudah Digunakan', errCol: 'email'})

		m.generatePassHash(newUser, (err, data) => {
			if(err) return res.status(500).send({ error : err });

			m.generalCreateDoc(data, (err, data) => {
				if(err) return res.status(500).send({ error : err });		
				return res.json({success: true, kurir: data});
			})
		})
	})
})
router.post('/kurir/hapus', (req, res) => {
	let id = req.body._id;
	if(!id) return res.json({success: false, msg: 'Mohon Isikan Data Kurir'});
	m.customModelDeleteById(User, id, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, kurir: data});
	})
})
router.post('/kurir/edit', (req, res) => {
	let id = req.body._id,
			namaLengkap = req.body.namaLengkap,
			email = req.body.email,
			noTlp = req.body.noTlp,
			tglLahir = req.body.tglLahir,
			jenisKelamin = req.body.jenisKelamin,
			alamat = req.body.alamat,
			password = req.body.password;

	if(!id || !namaLengkap || !email || jenisKelamin == null || jenisKelamin == undefined) return res.json({success: false, msg: 'Mohon Lengkapi Data Kurir'});
	let update = {
		namaLengkap: namaLengkap,
		email: email,
		noTlp: noTlp,
		tglLahir: tglLahir,
		jenisKelamin: jenisKelamin,
		alamat: alamat,
	}

	if(password){
		update.password = password;
		m.customModelFindById(User, id, (err, wdata) => {
			if(err) return res.status(500).send({ error : err });
			if(!wdata) return res.json({success: false, msg: 'Kurir tidak terdaftar'});

			m.generatePassHash(update, (err, data) => {
				if(err) return res.status(500).send({ error : err });

				m.customModelUpdateById(User, id, data, { new: true, setDefaultsOnInsert: true }, (err, data) => {
					if(err) return res.status(500).send({ error : err });
					if(!data) return res.json({success: false, msg: 'Kurir tidak terdaftar'});
					
					data = data.toJSON();
					data.hasPassword = data.password? true : false;
					delete data.password;
					delete data.__v;
					return res.json({success: true, kurir: data})
				})
			})
		})
	}else{
		m.customModelFindById(User, id, (err, wdata) => {
			if(err) return res.status(500).send({ error : err });
			if(!wdata) return res.json({success: false, msg: 'Kurir tidak terdaftar'});

			m.customModelUpdateById(User, id, update, { new: true, setDefaultsOnInsert: true }, (err, data) => {
				if(err) return res.status(500).send({ error : err });
				if(!data) return res.json({success: false, msg: 'Kurir tidak terdaftar'});

				data = data.toJSON();
				data.hasPassword = data.password? true : false;
				delete data.password;
				delete data.__v;
				return res.json({success: true, kurir: data})
			})
		})
	}
})

router.post('/pembeli', (req, res) => {
	m.customModelFindByQuerySelectPopulateLean(
		User, {$and: [{$or: [{isAdmin: false}, {isAdmin: undefined}]}, {status: 2}]}, ['-isAdmin'], [], (err, data) => {
		if(err) return res.status(500).send({ error : err });

		data.forEach(v => {
			v.hasPassword = v.password? true : false;
			delete v.password;
		})
		return res.json({success: true, pembeli: data})
	})
})
router.post('/pembeli/tambah', (req, res) => {
	let namaLengkap = req.body.namaLengkap,
			email = req.body.email,
			noTlp = req.body.noTlp,
			tglLahir = req.body.tglLahir,
			jenisKelamin = req.body.jenisKelamin,
			alamat = req.body.alamat,
			password = req.body.password;

	if(!email || !password) return res.json({success: false, msg: 'Data Pembeli Tidak Lengkap'});
	let newUser = new User({
		namaLengkap: namaLengkap,
		email: email,
		noTlp: noTlp,
		tglLahir: tglLahir,
		jenisKelamin: jenisKelamin,
		alamat: alamat,
		status: 2,
		password: password
	})

	m.customModelFindByQuery(User, {email: email},(err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(data.length > 0) return res.send({success: false, msg: 'Email Sudah Digunakan', errCol: 'email'})

		m.generatePassHash(newUser, (err, data) => {
			if(err) return res.status(500).send({ error : err });

			m.generalCreateDoc(data, (err, data) => {
				if(err) return res.status(500).send({ error : err });		
				return res.json({success: true, pembeli: data});
			})
		})
	})
})
router.post('/pembeli/hapus', (req, res) => {
	let id = req.body._id;
	if(!id) return res.json({success: false, msg: 'Mohon Isikan Data Pembeli'});
	m.customModelDeleteById(User, id, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, pembeli: data});
	})
})
router.post('/pembeli/edit', (req, res) => {
	let id = req.body._id,
			namaLengkap = req.body.namaLengkap,
			email = req.body.email,
			noTlp = req.body.noTlp,
			tglLahir = req.body.tglLahir,
			jenisKelamin = req.body.jenisKelamin,
			alamat = req.body.alamat,
			password = req.body.password;

	if(!id || !namaLengkap || !email || jenisKelamin == null || jenisKelamin == undefined) return res.json({success: false, msg: 'Mohon Lengkapi Data Pembeli'});
	let update = {
		namaLengkap: namaLengkap,
		email: email,
		noTlp: noTlp,
		tglLahir: tglLahir,
		jenisKelamin: jenisKelamin,
		alamat: alamat,
	}

	if(password){
		update.password = password;
		m.customModelFindById(User, id, (err, wdata) => {
			if(err) return res.status(500).send({ error : err });
			if(!wdata) return res.json({success: false, msg: 'Pembeli tidak terdaftar'});

			m.generatePassHash(update, (err, data) => {
				if(err) return res.status(500).send({ error : err });

				m.customModelUpdateById(User, id, data, { new: true, setDefaultsOnInsert: true }, (err, data) => {
					if(err) return res.status(500).send({ error : err });
					if(!data) return res.json({success: false, msg: 'Pembeli tidak terdaftar'});
					
					data = data.toJSON();
					data.hasPassword = data.password? true : false;
					delete data.password;
					delete data.__v;
					return res.json({success: true, pembeli: data})
				})
			})
		})
	}else{
		m.customModelFindById(User, id, (err, wdata) => {
			if(err) return res.status(500).send({ error : err });
			if(!wdata) return res.json({success: false, msg: 'Pembeli tidak terdaftar'});

			m.customModelUpdateById(User, id, update, { new: true, setDefaultsOnInsert: true }, (err, data) => {
				if(err) return res.status(500).send({ error : err });
				if(!data) return res.json({success: false, msg: 'Pembeli tidak terdaftar'});

				data = data.toJSON();
				data.hasPassword = data.password? true : false;
				delete data.password;
				delete data.__v;
				return res.json({success: true, pembeli: data})
			})
		})
	}
})

router.post('/kategori', (req, res) => {
	m.customModelFindByQuery(Kategori, {}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, kategori: data})
	})
})
router.post('/kategori/tambah', (req, res) => {
	let title = req.body.title;

	if(!title) return res.json({success: false, msg: 'Mohon Isikan Title'});
	let newKategori = new Kategori({
		title: title
	});

	m.generalCreateDoc(newKategori, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, kategori: data});
	})
})
router.post('/kategori/hapus', (req, res) => {
	let id = req.body._id;

	if(!id) return res.json({success: false, msg: 'Mohon Isikan Kategori'});
	m.customModelDeleteById(Kategori, id, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, kategori: data});
	})
})
router.post('/kategori/edit', (req, res) => {
	let id = req.body._id,
			title = req.body.title;

	if(!id || !title) return res.json({success: false, msg: 'Mohon Isikan Data Kategori'});
	m.customModelUpdateById(Kategori, id, {title: title}, { new: true, setDefaultsOnInsert: true }, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(!data) return res.json({success: false, msg: 'Kategori tidak terdaftar'});
		return res.json({success: true, kategori: data})
	})
})

router.post('/rekening', (req, res) => {
	m.customModelFindByQuery(Rekening, {}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, rekening: data})
	})
})
router.post('/rekening/tambah', (req, res) => {
	let namaBank = req.body.namaBank,
			noRek = req.body.noRek,
			atasNama = req.body.atasNama;

	if(!noRek || !atasNama) return res.json({success: false, msg: 'Mohon Isikan NoRek dan Atas Nama'});
	let newRekening = new Rekening({
		namaBank: namaBank,
		noRek: noRek,
		atasNama: atasNama
	});

	m.generalCreateDoc(newRekening, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, rekening: data});
	})
})
router.post('/rekening/hapus', (req, res) => {
	let id = req.body._id;
	if(!id) return res.json({success: false, msg: 'Mohon Isikan Rekening'});
	m.customModelDeleteById(Rekening, id, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, data});
	})
})
router.post('/rekening/edit', (req, res) => {
	let id = req.body._id,
			namaBank = req.body.namaBank,
			noRek = req.body.noRek,
			atasNama = req.body.atasNama;

	if(!id) return res.json({success: false, msg: 'Mohon Isikan Data Rekening'});
	m.customModelUpdateById(Rekening, id, {namaBank: namaBank, noRek: noRek, atasNama: atasNama}, { new: true, setDefaultsOnInsert: true }, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(!data) return res.json({success: false, msg: 'Rekening tidak terdaftar'});
		return res.json({success: true, rekening: data})
	})
})

router.post('/produk', (req, res) => {
	m.customModelAggregate(Produk, [{
		$match: {
			$or: [{delete: false}, {delete: undefined}, {delete: null}]
		}
	}, {
		$lookup: {
			from: 'yusron_pembelians',
			let: {'id': "$_id"},
			pipeline: [{
				$match: { 
					$expr: {
						$and: [{
							$in: [ "$$id", "$produk.produk" ],
						}, {
							$eq: ["$status", 6]
						}]
					}
				}
			}],
			as: 'terjual'
		}
	}], (err, data) => {
		if(err) return res.status(500).send({ error : err });
		data = data.map(p => {
			p.terjual = p.terjual.map(t => t.produk).flat().filter(f => f.produk == p._id.toString()).reduce((a,c) => a + c.jumlah, 0);
			return p
		})
		return res.json({success: true, produk: data})
	})
	
	// m.customModelFindByQueryPopulate(Produk, {$or: [{delete: false}, {delete: undefined}, {delete: null}]}, ['kategori'], (err, data) => {
	// 	if(err) return res.status(500).send({ error : err });
	// 	return res.json({success: true, produk: data})
	// })
})
router.post('/produk/tambah', multer().array('foto', 12), (req, res) => {
	let nama = req.body.nama,
			deskripsi = req.body.deskripsi,
			harga = req.body.harga,
			kategori = req.body.kategori,
			diskon = req.body.diskon,
			stok = req.body.stok,
			files = req.files,
			path = 'yusron/images/produk/foto',
			sendFiles = {};

	// return res.json({success: false, file: req.file, files: req.files, data: req.body})

	if(!harga || !kategori) return res.json({success: false, msg: 'Mohon Isikan Data Produk'});
	let newProduk = new Produk({
		nama,
		deskripsi,
		harga,
		kategori,
		diskon,
		stok
	});

	files.forEach((v, i) => {
		sendFiles['file[' + i + ']'] = {
			value: v.buffer,
			options: {
				filename: v.originalname,
				contentType: v.mimetype
			}
		}
	})

	sendFiles['destination'] = path;
	sendFiles['idProduk'] = newProduk._id.toString();

	const reqOptions = {
		url: otherServerUrl + 'upload.php',
		method: "POST",
		formData: sendFiles
	}

	request(reqOptions, function (err, resp, body) {
		if(err) return res.status(500).json({error: err});
		try{
			body = JSON.parse(body);
		}catch(e){
			// body = {};
			body.success = false;
			// body.err = 'Gagal parse json'
		}

		if(!body.success) return res.json({ success: false, errupload: true, err: body.err, file: body});

		newProduk['imgUrl'] = body.path;

		m.generalCreateDoc(newProduk, (err, data) => {
			if(err) return res.status(500).send({ error : err });

			m.customModelFindByIdPopulate(Produk, data._id, ['kategori'], (err, data) => {
				if(err) return res.status(500).send({ error : err });
				return res.json({success: true, produk: data});
			})
		})
	})

})
router.post('/produk/hapus', (req, res) => {
	let id = req.body._id;
	if(!id) return res.json({success: false, msg: 'Mohon Isikan Produk'});
	m.customModelUpdateById(Produk, id, {delete: true}, { new: true, setDefaultsOnInsert: true }, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, data});
	})
})
router.post('/produk/edit', multer().array('foto', 12), (req, res) => {
	let id = req.body._id,
			imgUrl = req.body.imgUrl || [],
			nama = req.body.nama,
			deskripsi = req.body.deskripsi,
			harga = req.body.harga,
			kategori = req.body.kategori,
			diskon = req.body.diskon,
			stok = req.body.stok,
			files = req.files,
			path = 'yusron/images/produk/foto',
			sendFiles = {};

	// return res.json({success: false, files: req.files, data: req.body})
	if(!id) return res.json({success: false, msg: 'Mohon Isikan Data Produk'});

	if(files.length > 0){
		files.forEach((v, i) => {
			sendFiles['file[' + i + ']'] = {
				value: v.buffer,
				options: {
					filename: v.originalname,
					contentType: v.mimetype
				}
			}
		})

		sendFiles['destination'] = path;
		sendFiles['idProduk'] = id;

		const reqOptions = {
			url: otherServerUrl + 'upload.php',
			method: "POST",
			formData: sendFiles
		}

		request(reqOptions, function (err, resp, body) {
			if(err) return res.status(500).json({error: err});
			try{
				body = JSON.parse(body);
			}catch(e){
				// body = {};
				body.success = false;
				// body.err = 'Gagal parse json'
			}

			if(!body.success) return res.json({ success: false, errupload: true, err: body.err, file: body});

			m.customModelUpdateByIdPopulate(Produk, id, {
				imgUrl: [...imgUrl, ...body.path],
				nama,
				deskripsi,
				harga,
				kategori,
				diskon,
				stok
			}, { new: true, setDefaultsOnInsert: true }, ['kategori'], (err, data) => {
				if(err) return res.status(500).send({ error : err });
				if(!data) return res.json({success: false, msg: 'Produk tidak terdaftar'});
				return res.json({success: true, produk: data})
			})
		})		
	}else{
		m.customModelUpdateByIdPopulate(Produk, id, {
			imgUrl,
			nama,
			deskripsi,
			harga,
			kategori,
			diskon,
			stok
		}, { new: true, setDefaultsOnInsert: true }, ['kategori'], (err, data) => {
			if(err) return res.status(500).send({ error : err });
			if(!data) return res.json({success: false, msg: 'Produk tidak terdaftar'});
			return res.json({success: true, produk: data})
		})
	}
})
router.post('/produk/edit/stok', (req, res) => {
	let id = req.body._id,
			stok = req.body.stok;

	if(!id) return res.json({success: false, msg: 'Mohon Isikan Data Produk'});
	m.customModelUpdateById(Produk, id, {stok: stok}, {new: true, setDefaultsOnInsert: true}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(!data) return res.json({success: false, msg: 'Produk tidak terdaftar'});
		return res.json({success: true, produk: data})
	})
})

router.post('/pembelian', (req, res) => {
	let status = req.body.status;
	
	m.customModelFindByQueryPopulate(Pembelian, { status: {$in: status }}, ['user', 'kurir', 'rekening', {path: 'produk', populate: {path: 'produk', populate: 'kategori'}}], (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, pembelian: data})
	})
})
router.post('/pembelian/edit', (req, res) => {
	let idPembelian = req.body.idPembelian,
			rekening = req.body.rekening,
			buktiPembayaran = req.body.buktiPembayaran,
			status = req.body.status,
			kurir = req.body.idKurir;

	let update = {};
	if(rekening) update.rekening = rekening;
	if(buktiPembayaran) update.buktiPembayaran = buktiPembayaran;
	if(status) update.status = status;
	if(kurir) update.kurir = kurir;
	
	m.customModelUpdateByIdPopulate(Pembelian, idPembelian, update, { new: true, setDefaultsOnInsert: true }, ['user', 'kurir', 'rekening', {path: 'produk', populate: {path: 'produk', populate: 'kategori'}}], (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(!data) return res.json({success: false, msg: 'Pembelian tidak terdaftar'});

		if(status == 7){
			m.customModelUpdateById(User, data.user, {$inc : {saldo : data.jumlah}}, { new: true, setDefaultsOnInsert: true }, (err, udata) => {
				if(err) return res.status(500).send({ error : err });
				if(!udata) return res.json({success: false, msg: 'Pengguna tidak terdaftar'});
				return res.json({success: true, pembelian: data});
			})
		}else{
			return res.json({success: true, pembelian: data})
		}
	})
})
router.post('/pembelian/bukti/verifikasi', (req, res) => {
	let idPembelian = req.body.idPembelian,
			statusBukti = req.body.statusBukti,
			idBukti = req.body.idBukti;

	m.customModelFindById(Pembelian, idPembelian, (err, pdata) => {
		if(err) return res.status(500).send({ error : err });
		if(!pdata) return res.json({success: false, msg: 'Data Pembelian Tidak Terdaftar'})

		m.customModelUpdateByQueryPopulate(
			Pembelian, 
			{ _id: idPembelian, 'buktiPembayaran._id': idBukti}, 
			{ status: statusBukti == 1? (pdata.jenis == 1? 3 : 6) : 2, waktuPelunasan: statusBukti == 1? Date.now() : undefined, waktuPenyelesaian: statusBukti == 1? Date.now() : undefined, $set: {'buktiPembayaran.$.verify': statusBukti}}, 
			{new: true, setDefaultsOnInsert: true},
			['user', 'kurir', 'rekening', {path: 'produk', populate: {path: 'produk', populate: 'kategori'}}], 
			(err, updata) => {
			if(err) return res.status(500).send({ error : err });
			if(!updata) return res.json({success: false, msg: 'Data Pembelian Tidak Terdaftar'})

			if(updata.jenis == 2 && statusBukti == 1){
				m.customModelUpdateById(User, pdata.user, {$inc : {saldo : updata.jumlah}}, {new: true, setDefaultsOnInsert: true }, (err, data) => {
					if(err) return res.status(500).send({ error : err });
					if(!data) return res.json({success: false, msg: 'Data Pembelian Tidak Terdaftar'})				
					return res.json({success: true, pembelian: updata})
				})
			}else{
				return res.json({success: true, pembelian: updata})
			}
		})
	})
})

module.exports = router;