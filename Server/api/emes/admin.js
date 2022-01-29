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
const User = require('../../models/emes/user');
const Properti = require('../../models/emes/properti');
const Device = require('../../models/emes/device');
const Pembelian = require('../../models/emes/pembelian');
const Token = require('../../models/emes/token');
const Reservasi = require('../../models/emes/reservasi');

// other server url
const otherServerUrl = "https://mfnizam.com/apps/projectkabeh/emes";

router.post('/properti', (req, res) => {
	m.customModelFindByQueryPopulate(Properti, {delete: {$ne: true}}, 'device', (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, properti: data})
	})
})
router.post('/properti/filter', (req, res) => {
	let filter = req.body.filter;
	if(!filter) return res.json({success: false, msg: 'Lengkapi filter'})

	m.customModelFindByQueryPopulate(Properti, {delete: {$ne: true}, filter}, 'device', (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, properti: data})
	})
})
router.post('/properti/tambah', (req, res) => {
	let nama = req.body.namaProperti,
			device = req.body.deviceProperti,
			alamat = req.body.alamatProperti;

	if(!nama || !device || !alamat) return res.json({success: false, msg: 'Lengkapi data properti'})

	m.customModelFindOneByQuery(Device, {kode: device}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(!data) return res.json({success: false, msg: 'ID Device Tidak Terdaftar', errCol: 'deviceProperti'})


		m.customModelFindOneByQueryPopulate(Properti, {device: data._id}, [], (err, pdata) => {
			if(err) return res.status(500).send({ error : err });
			if(pdata) return res.json({success: false, msg: 'Device Sudah Digunakan', errCol: 'deviceProperti'})

			let newProperti = new Properti({
				nama,
				device: data._id,
				alamat
			})

			m.generalCreateDoc(newProperti, (err, data) => {
				if(err) return res.status(500).send({ error : err });

				m.customModelFindByIdPopulate(Properti, data._id, ['device'], (err, data) => {
					if(err) return res.status(500).send({ error : err });
					return res.json({success: true, properti: data})
				})
			})
		})
	})
})
router.post('/properti/hapus', (req, res) => {
	let id = req.body._id;

	if(!id) return res.json({success: false, msg: 'Id tidak terdatar'});
	m.customModelUpdateById(Properti, id, {delete: true}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, properti: data});
	})
})
router.post('/properti/edit', (req, res) => {
	let id = req.body._id,
			nama = req.body.namaProperti,
			device = req.body.deviceProperti,
			alamat = req.body.alamatProperti;

	if(!id) return res.json({success: false, msg: 'Lengkapi data device'})
	
	if(device){
		m.customModelFindOneByQuery(Device, {kode: device}, (err, data) => {
			if(err) return res.status(500).send({ error : err });
			if(!data) return res.json({success: false, msg: 'ID Device Tidak Terdaftar', errCol: 'deviceProperti'})

			let update = {
				nama,
				device: data._id,
				alamat
			}
			m.customModelUpdateByIdPopulate(Properti, id, update, { new: true, setDefaultsOnInsert: true }, ['device'], (err, data) => {
				if(err) return res.status(500).send({ error : err });
				if(!data) return res.send({success: false, msg: 'Kode Device Tidak Terdaftar', errCol: 'kodeDevice'})

				return res.json({success: true, properti: data})
			})
		})
	}else{
		let update = {
			nama,
			alamat
		}
		m.customModelUpdateByIdPopulate(Properti, id, update, { new: true, setDefaultsOnInsert: true }, ['device'], (err, data) => {
			if(err) return res.status(500).send({ error : err });
			if(!data) return res.send({success: false, msg: 'Kode Device Tidak Terdaftar', errCol: 'kodeDevice'})

			return res.json({success: true, properti: data})
		})
	}
})

router.post('/pelanggan', (req, res) => {
	m.customModelFindByQuerySelectPopulateLean(User, {isAdmin: {$ne: true}}, ['-isAdmin'], [], (err, data) => {
		if(err) return res.status(500).send({ error : err });

		data.forEach(v => {
			v.hasPassword = v.password? true : false;
			if(v.daya) v.daya = Number(v.daya.toString()) / 1000;
			delete v.password;
		})
		return res.json({success: true, pelanggan: data})
	})
})
router.post('/pelanggan/tambah', (req, res) => {
	let namaLengkap = req.body.namaLengkap,
			noTlp = req.body.noTlp,
			email = req.body.email,
			password = req.body.password,
			jenisKelamin = req.body.jenisKelamin,
			tglLahir = req.body.tglLahir,
			alamat = req.body.alamat;
	if(!namaLengkap || !noTlp || !email || !password || !jenisKelamin) return res.json({success: false, msg: 'Lengkapi data pelanggan'});
	
	m.customModelFindByQuery(User, {email: email, delete: {$ne: true}}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(data.length > 0) return res.send({success: false, msg: 'Email Sudah Digunakan', errCol: 'email'})

		let newUser = new User ({
			namaLengkap,
			noTlp,
			email,
			jenisKelamin,
			password
		})

		m.generatePassHash(newUser, (err, data) => {
			if(err) return res.status(500).send({ error : err });

			m.generalCreateDoc(data, (err, data) => {
				if(err) return res.status(500).send({ error : err });
				
				data = data.toJSON();
				if(data.daya) data.daya = Number(data.daya.toString());
				delete data.password;
				delete data.__v;

				return res.json({success: true, pelanggan: data})
			})
		})
	})
})
router.post('/pelanggan/hapus', (req, res) => {
	let id = req.body._id;

	if(!id) return res.json({success: false, msg: 'Id tidak terdatar'});
	m.customModelUpdateById(User, id, {delete: true}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, pelanggan: data});
	})
})
router.post('/pelanggan/edit', (req, res) => {
	let id = req.body._id,
			namaLengkap = req.body.namaLengkap,
			noTlp = req.body.noTlp,
			email = req.body.email,
			password = req.body.password,
			jenisKelamin = req.body.jenisKelamin,
			tglLahir = req.body.tglLahir,
			alamat = req.body.alamat;

	if(!id || !namaLengkap || !email || jenisKelamin == null || jenisKelamin == undefined) return res.json({success: false, msg: 'Mohon Lengkapi Data Pemateri'});
	let update = {
		namaLengkap: namaLengkap,
		noTlp: noTlp,
		email: email,
		jenisKelamin: jenisKelamin,
		tglLahir: tglLahir,
		alamat: alamat,
	}

	if(password){
		update.password = password;
		m.customModelFindById(User, id, (err, wdata) => {
			if(err) return res.status(500).send({ error : err });
			if(!wdata) return res.json({success: false, msg: 'Peserta tidak terdaftar'});

			m.generatePassHash(update, (err, data) => {
				if(err) return res.status(500).send({ error : err });

				m.customModelUpdateById(User, id, data, { new: true, setDefaultsOnInsert: true }, (err, data) => {
					if(err) return res.status(500).send({ error : err });
					if(!data) return res.json({success: false, msg: 'Peserta tidak terdaftar'});
					
					data = data.toJSON();
					data.hasPassword = data.password? true : false;
					delete data.password;
					delete data.__v;
					return res.json({success: true, pelanggan: data})
				})
			})
		})
	}else{
		m.customModelFindById(User, id, (err, wdata) => {
			if(err) return res.status(500).send({ error : err });
			if(!wdata) return res.json({success: false, msg: 'Peserta tidak terdaftar'});

			m.customModelUpdateById(User, id, update, { new: true, setDefaultsOnInsert: true }, (err, data) => {
				if(err) return res.status(500).send({ error : err });
				if(!data) return res.json({success: false, msg: 'Peserta tidak terdaftar'});

				data = data.toJSON();
				data.hasPassword = data.password? true : false;
				delete data.password;
				delete data.__v;
				return res.json({success: true, pelanggan: data})
			})
		})
	}
})

router.post('/device', (req, res) => {
	m.customModelFindByQuery(Device, {delete: {$ne: true}}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, device: data})
	})
})
router.post('/device/tambah', (req, res) => {
	let kode = req.body.kodeDevice,
			deskripsi = req.body.deskripsiDevice;

	if(!kode) return res.json({success: false, msg: 'Lengkapi data device'})

	m.customModelFindByQuery(Device, {kode: kode, delete: {$ne: true}}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(data.length > 0) return res.send({success: false, msg: 'Kode Device Sudah Digunakan', errCol: 'kodeDevice'})

		let newDevice = new Device({
			kode,
			deskripsi
		})

		m.generalCreateDoc(newDevice, (err, data) => {
			if(err) return res.status(500).send({ error : err });
			return res.json({success: true, device: data})
		})
	})
})
router.post('/device/hapus', (req, res) => {
	let id = req.body._id;

	if(!id) return res.json({success: false, msg: 'Id tidak terdatar'});
	m.customModelUpdateById(Device, id, {delete: true}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, device: data});
	})
})
router.post('/device/edit', (req, res) => {
	let id = req.body._id,
			kode = req.body.kodeDevice,
			deskripsi = req.body.deskripsiDevice;

	if(!id || !kode) return res.json({success: false, msg: 'Lengkapi data device'})
	
	let update = {
		kode,
		deskripsi
	}
	m.customModelUpdateById(Device, id, update, { new: true, setDefaultsOnInsert: true }, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(!data) return res.send({success: false, msg: 'Kode Device Tidak Terdaftar', errCol: 'kodeDevice'})

		return res.json({success: true, device: data})
	})
})

router.post('/token', (req, res) => {
	m.customModelFindByQuery(Token, {delete: {$ne: true}}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, token: data.map(v => { v.daya = v.daya / 1000; return v; })})
	})
})
router.post('/token/tambah', (req, res) => {
	let nominal = req.body.nominalToken,
			daya = req.body.dayaToken;

	if(!nominal || !daya) return res.json({success: false, msg: 'Lengkapi data token'})

	m.customModelFindOneByQuery(Token, {nominal: nominal, delete: {$ne: true}}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(data) return res.send({success: false, msg: 'Nominal Token Sudah Digunakan', errCol: 'nominalToken'})

		let newToken = new Token({
			nominal,
			daya: daya * 1000
		})

		m.generalCreateDoc(newToken, (err, data) => {
			if(err) return res.status(500).send({ error : err });
			return res.json({success: true, token: data})
		})
	})
})
router.post('/token/hapus', (req, res) => {
	let id = req.body._id;

	if(!id) return res.json({success: false, msg: 'Id tidak terdatar'});
	m.customModelUpdateById(Token, id, {delete: true}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, token: data});
	})
})
router.post('/token/edit', (req, res) => {
	let id = req.body._id,
			nominal = req.body.nominalToken,
			daya = req.body.dayaToken;

	if(!id || !nominal) return res.json({success: false, msg: 'Lengkapi data token'})
	
	let update = {
		nominal,
		daya: daya * 1000
	}
	m.customModelUpdateById(Token, id, update, { new: true, setDefaultsOnInsert: true }, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(!data) return res.send({success: false, msg: 'Token Tidak Terdaftar', errCol: 'nominalToken'})

		return res.json({success: true, token: data})
	})
})

router.post('/pembelian', (req, res) => {
	m.customModelFindByQueryPopulate(Pembelian, {delete: {$ne: true}}, ['pembeli', 'token'], (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, pembelian: data.map(v => { 
			v.daya = v.daya / 1000;
			if(v.token) v.token.daya = v.token.daya / 1000;
			return v
		})})
	})
})
router.post('/pembelian/tambah', (req, res) => {
	let pembeli = req.body.pembeli,
			token = req.body.token

	if(!pembeli || !token) return res.json({success: false, msg: 'Lengkapi data pembelian'})

	m.customModelFindById(Token, token, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(!data) return res.json({success: false, msg: 'Token tidak terdaftar', errCol: 'token'})

		let newPembelian = new Pembelian({
			pembeli,
			token,
			nominal: data.nominal,
			daya: data.daya
		})

		m.generalCreateDoc(newPembelian, (err, data) => {
			if(err) return res.status(500).send({ error : err });

			m.customModelUpdateByIdSelectAndPopulate(User, pembeli, {$inc : {'daya' : data.daya}}, {new: true, setDefaultsOnInsert: true}, ['-isAdmin'], [], (err, udata) => {
				if(err) return res.status(500).send({ error : err });
				if(!udata)	{
					m.customModelUpdateById(Pembelian, data._id, {delete: true}, {new: true, setDefaultsOnInsert: true}, (err, ddata) => {
						if(err) return res.status(500).send({ error : err });
						return res.json({success: false, msg: 'Pembeli tidak terdaftar', errCol: 'pembeli'})
					})
				}else{
					m.customModelFindByIdPopulate(Pembelian, data._id, ['pembeli', 'token'], (err, data) => {
						if(err) return res.status(500).send({ error : err });
						if(!data)	return res.json({success: false, msg: 'Pembelian tidak terdaftar'})

						udata = udata.toJSON();
						if(udata.daya) udata.daya = Number(udata.daya.toString()) / 1000;
						if(data.token) data.token.daya = Number(data.token.daya) / 1000;
						if(data.daya) data.daya = Number(data.daya) / 1000;

						delete udata.password;
						delete udata.__v;

						return res.json({success: true, pembelian: data, pembeli: udata})
					})
				}

			})

		})
	})
})

router.post('/reservasi', (req, res) => {
	m.customModelFindByQueryPopulate(Reservasi, {delete: {$ne: true}}, ['pelanggan', 'properti'], (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, reservasi: data})
	})
})
router.post('/reservasi/filter', (req, res) => {
	let filter = req.body.filter;
	
	if(!filter) return res.json({success: false, msg: "Lengkapi filter"})

	filter.delete = {$ne: true};
	m.customModelFindByQueryPopulateLean(Reservasi, filter, ['pelanggan', 'properti'], (err, data) => {
		if(err) return res.status(500).send({ error : err });
		data = data.map(v => {
			if(v.pelanggan.daya) v.pelanggan.daya = Number(v.pelanggan.daya.toString()) / 1000;
			return v;
		})
		return res.json({success: true, reservasi: data})
	})
})
router.post('/reservasi/tambah', (req, res) => {
	let pelanggan = req.body.pelanggan,
			properti = req.body.properti,
			tglCheckIn = req.body.tglCheckIn,
			waktuCheckIn = req.body.waktuCheckIn;

	if(!pelanggan || !properti || !tglCheckIn || !waktuCheckIn) return res.json({success: false, msg: 'Lengkapi data reservasi'})
	
	m.customModelFindOneByQuery(Reservasi, {pelanggan: pelanggan, tglWaktuCheckOut: null/*$and: [{tglCheckOut: null}, {waktuCheckOut: null}]*/}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(data) return res.json({success: false, msg: "Terdaftar Menghuni, Mohon Check Out Dahulu", errCol: 'pelanggan', data});
		
		m.customModelFindOneByQuery(Reservasi, {properti: properti, tglWaktuCheckOut: null/*$and: [{tglCheckOut: null}, {waktuCheckOut: null}]*/}, (err, data) => {
			if(err) return res.status(500).send({ error : err });
			if(data) return res.json({success: false, msg: "Sedang Dihuni", errCol: 'properti'});

			let newReservasi = new Reservasi({
				pelanggan,
				properti,
				tglCheckIn,
				waktuCheckIn
			})

			m.generalCreateDoc(newReservasi, (err, data) => {
				if(err) return res.status(500).send({ error : err });

				m.customModelFindByIdPopulate(Reservasi, data._id, ['pelanggan', 'properti'], (err, data) => {
					if(err) return res.status(500).send({ error : err });
					return res.json({success: true, reservasi: data})
				})
			})
		})
	})
})
router.post('/reservasi/edit', (req, res) => {
	let id = req.body._id,
			tglWaktuCheckOut = req.body.tglWaktuCheckOut;

	if(!id || !tglWaktuCheckOut) return res.json({success: false, msg: 'Lengkapi data reservasi'})
	
	let update = {
		tglWaktuCheckOut		
	}
	m.customModelUpdateById(Reservasi, id, update, { new: true, setDefaultsOnInsert: true }, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(!data) return res.send({success: false, msg: 'Kode Reservasi Tidak Terdaftar', errCol: 'kodeReservasi'})

		m.customModelFindByIdPopulate(Reservasi, data._id, ['pelanggan', 'properti'], (err, data) => {
			if(err) return res.status(500).send({ error : err });
			return res.json({success: true, reservasi: data})
		})
	})
})
module.exports = router;