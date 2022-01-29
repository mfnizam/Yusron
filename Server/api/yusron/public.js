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
const Produk = require('../../models/yusron/produk');
const Keranjang = require('../../models/yusron/keranjang');
const Rekening = require('../../models/yusron/rekening');
const Pembelian = require('../../models/yusron/pembelian');

// other server url
const otherServerUrl = "https://mfnizam.com/apps/projectkabeh/";

router.post('/rekening', (req, res) => {
	m.customModelFindByQuery(Rekening, {}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, rekening: data})
	})
})

router.post('/topup/tambah', (req, res) => {
	let rekening = req.body.rekening,
	user = req.body.user,
	jumlah = req.body.jumlah;

	if(!rekening || !user || jumlah < 0) return res.json({success: false, msg: 'Mohon Isikan Data Topup Dengan Benar'});

	m.customModelFindById(Rekening, rekening, (err, rekeningBackup) => {
		if(err) return res.status(500).send({ error : err });
		if(!rekeningBackup) return res.json({success: false, msg: 'Rekening tidak terdaftar'});

		let ndate = Date.now();
		let tgl = new Date(ndate);
		let newPembelian = new Pembelian({
			jenis: 2,
			invoice: 'INV/' + ('0' + tgl.getDate()).slice(-2) + '/' + ('0' + (tgl.getMonth()+1)).slice(-2) + '/' + tgl.getFullYear() + '/' + ndate,
			user,
			rekening,
			rekeningBackup,
			jumlah
		})

		m.generalCreateDoc(newPembelian, (err, data) => {
			if(err) return res.status(500).send({ error : err });

			m.customModelFindByIdPopulate(Pembelian, data._id, ['rekening'], (err, data) => {
				if(err) return res.status(500).send({ error : err });
				if(!data) return res.json({success: false, msg: 'Pembelian tidak terdaftar'});

				return res.json({success: true, pembelian: data})
			})
		})
	})
})

router.post('/produk', (req, res) => {
	let idUser = req.body.idUser;

	// 	{
	//   from: 'yusron_pembelians',
	// 	let: {'id': '$_id'},
	// 	pipeline: [{
	// 		$match:{
	// 			"produk.produk": ObjectId('60bd88c396d4d20017ad0f42'),
	// 			"status": 5
	// 		}
	// 	}],
	//   as: 'terjual'
	// }

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

router.post('/keranjang', (req, res) => {
	let idUser = req.body.idUser;

	m.customModelFindByQuerySelectPopulate(Keranjang, {user: idUser}, ['-user'], [{ 
		path: 'produk', 
		populate: {
			path: 'kategori'
		} 
	}], (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, keranjang: data})
	})
})
router.post('/keranjang/tambah', (req, res) => {
	let idUser = req.body.idUser,
	idProduk = req.body.idProduk,
	jumlah = req.body.jumlah;

	if(!idUser || !idProduk) return res.json({success: false, msg: 'Mohon Isikan Data Keranjang'});
	let newKeranjang = new Keranjang({
		produk: idProduk,
		user: idUser,
		jumlah: jumlah
	})

	m.generalCreateDoc(newKeranjang, (err, data) => {
		if(err) return res.status(500).send({ error : err });

		m.customModelFindByIdSelectPopulate(Keranjang, data._id, ['-user'], [{ 
			path: 'produk', 
			populate: {
				path: 'kategori'
			} 
		}], (err, data) => {
			if(err) return res.status(500).send({ error : err });
			if(!data) return res.json({success: false, msg: 'Keranjang tidak terdaftar'});
			return res.json({success: true, keranjang: data});
		})
	});
})
router.post('/keranjang/hapus', (req, res) => {
	let idUser = req.body.idUser,
	idProduk = req.body.idProduk;

	if(!idUser || !idProduk) return res.json({success: false, msg: 'Mohon Isikan Data Keranjang'});
	m.customModelDeleteByQuery(Keranjang, {user: idUser, produk: idProduk}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, keranjang: data});
	})
})
router.post('/keranjang/edit', (req, res) => {
	let idUser = req.body.idUser,
	idProduk = req.body.idProduk,
	jumlah = req.body.jumlah;

	m.customModelUpdateByQueryPopulate(Keranjang, {user: idUser, produk: idProduk}, {jumlah: jumlah}, { new: true}, [{ 
		path: 'produk', 
		populate: {
			path: 'kategori'
		} 
	}], (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(!data) return res.json({success: false, msg: 'Keranjang tidak terdaftar'});
		return res.json({success: true, keranjang: data})
	})
})

router.post('/pembelian', (req, res) => {
	let user = req.body.user,
	kurir = req.body.kurir;

	if(!user && !kurir) return res.json({success: false, msg: 'Mohon Isikan Data Pembelian Dengan Benar'});
	
	let find = {};
	if(user) find.user = user;
	if(kurir) find.kurir = kurir;

	let populate = ['kurir', {path: 'produk', populate: { path: 'produk', populate: 'kategori'}}, 'rekening'];
	if(kurir) populate.push('user')

		m.customModelFindByQueryPopulate(Pembelian, find, populate, (err, data) => {
			if(err) return res.status(500).send({ error : err });
			return res.json({success: true, pembelian: data, kurir});
		})
})
router.post('/pembelian/tambah', (req, res) => {
	let user = req.body.user,
	produk = req.body.produk,
	jumlah = req.body.jumlah;

	if(!user || !produk || !jumlah) return res.json({success: false, msg: 'Mohon Isikan Data Pembelian Dengan Benar'});

	let ndate = Date.now();
	let tgl = new Date(ndate);
	let newPembelian = new Pembelian({
		jenis: 1,
		status: 3,
		invoice: 'INV/' + ('0' + tgl.getDate()).slice(-2) + '/' + ('0' + (tgl.getMonth()+1)).slice(-2) + '/' + tgl.getFullYear() + '/' + ndate,
		user,
		produk,
		produkBackup: produk,
		jumlah
	})

	m.generalCreateDoc(newPembelian, (err, data) => {
		if(err) return res.status(500).send({ error : err });

		m.customModelDeleteByQuery(Keranjang, {_id: {$in: produk.map(v => v._id)}}, (err, kdata) => {
			if(err) return res.status(500).send({ error : err });

			m.customModelUpdateById(User, user, {$inc : {saldo : -jumlah}}, {new: true}, (err, udata) => {
				if(err) return res.status(500).send({ error : err });
				if(!udata) return res.json({success: false, msg: 'Penguuna tidak terdaftar'});

				m.customModelFindByIdPopulate(Pembelian, data._id, [{path: 'produk', populate: { path: 'produk', populate: 'kategori'}}, 'rekening'], (err, data) => {
					if(err) return res.status(500).send({ error : err });
					if(!data) return res.json({success: false, msg: 'Pembelian tidak terdaftar'});

					return res.json({success: true, pembelian: data})
				})
			})

		})
	})
})
router.post('/pembelian/bukti/upload', multer().single('foto'), (req, res) => {
	let idUser = req.body.idUser,
	idPembelian = req.body.idPembelian,
	file = req.file,
	path = 'yusron/images/pembelian/bukti';

	if (!file) return res.status(500).json({success: false, msg: "Mohon Sertakan Foto Bukti Pembelian"});

	const reqOptions = {
		url: otherServerUrl + 'upload.php',
		method: "POST",
		formData: {
			file: {
				value: req.file.buffer,
				options: {
					filename: req.file.originalname,
					contentType: req.file.mimetype
				}
			},
			destination : path,
			idUser: idUser
		}
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

		m.customModelUpdateByQueryPopulate(
			Pembelian, 
			{_id: idPembelian, user: idUser}, 
			{ $push: { buktiPembayaran:  { verify: 0, imgUrl: body.path }}, status: 1}, 
			{new: true},
			['kurir', {path: 'produk', populate: { path: 'produk', populate: 'kategori'}}, 'rekening'],
			(err, data) => {
				if(err) return res.status(500).json({error: err});

				return res.json({success: true, pembelian: data})
			})
	})
})
router.post('/pengambilan/bukti/upload', multer().single('foto'), (req, res) => {
	let idUser = req.body.idUser,
	idPembelian = req.body.idPembelian,
	file = req.file,
	path = 'yusron/images/pengambilan/bukti';

	if(!idUser || !idPembelian){ res.status(500).json({success: false, msg: "Mohon Sertakan User dan Pembelian"}); }
	if (!file) return res.status(500).json({success: false, msg: "Mohon Sertakan Foto Bukti Pengambilan"});

	const reqOptions = {
		url: otherServerUrl + 'upload.php',
		method: "POST",
		formData: {
			file: {
				value: req.file.buffer,
				options: {
					filename: req.file.originalname,
					contentType: req.file.mimetype
				}
			},
			destination : path,
			idUser: idUser
		}
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

		m.customModelUpdateByQueryPopulate(
			Pembelian,
			{_id: idPembelian, user: idUser}, 
			{ buktiPengambilan: body.path, status: 5 }, 
			{new: true},
			['kurir', 'user', {path: 'produk', populate: { path: 'produk', populate: 'kategori'}}, 'rekening'],
			(err, data) => {
				if(err) return res.status(500).json({error: err});

				return res.json({success: true, pembelian: data})
			})
	})
})
router.post('/pembelian/verifikasi', (req, res) => {
	let idPembelian = req.body.idPembelian,
	user = req.body.idUser;

	if(!user && !idPembelian) return res.json({success: false, msg: 'Mohon Isikan Data Verifikasi Pembelian Dengan Benar'});

	m.customModelUpdateByQueryPopulate(Pembelian, {_id: idPembelian, user: user}, {status: 6, waktuPenyelesaian: Date.now()}, {new: true, setDefaultsOnInsert: true},  [{path: 'produk', populate: { path: 'produk', populate: 'kategori'}}, 'rekening'], (err, data) => {

		if(err) return res.status(500).send({ error : err });
		if(!data) return res.json({success: false, msg: 'Pembelian tidak terdaftar'});
		return res.json({success: true, pembelian: data})
	})
})


module.exports = router;