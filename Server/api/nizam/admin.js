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
const User = require('../../models/nizam/user');
const Tingkatan = require('../../models/nizam/tingkatan');
const Pelatihan = require('../../models/nizam/pelatihan');
const Pelajaran = require('../../models/nizam/pelajaran');
const Materi = require('../../models/nizam/materi');

// other server url
const otherServerUrl = "https://mfnizam.com/apps/projectkabeh/nizam";

router.post('/pemateri', (req, res) => {
	m.customModelFindByQuerySelectPopulateLean(
		User, {isAdmin: {$ne: true}, status: 1}, ['-isAdmin'], [], (err, data) => {
		if(err) return res.status(500).send({ error : err });

		data.forEach(v => {
			v.hasPassword = v.password? true : false;
			delete v.password;
		})
		return res.json({success: true, pemateri: data})
	})
})
router.post('/pemateri/tambah', (req, res) => {
	let namaLengkap = req.body.namaLengkap,
			email = req.body.email,
			noKta = req.body.noKta,
			kwarcab = req.body.kwarcab,
			jenisKelamin = req.body.jenisKelamin,
			tglLahir = req.body.tglLahir,
			noTlp = req.body.noTlp,
			alamat = req.body.alamat,
			password = req.body.password;

	if(!email || !noKta || !kwarcab || !password) return res.json({success: false, msg: 'Data Pemateri Tidak Lengkap'});
	let newUser = new User({
		namaLengkap: namaLengkap,
		email: email,
		noKta: noKta,
		kwarcab: kwarcab,
		jenisKelamin: jenisKelamin,
		tglLahir: tglLahir,
		noTlp: noTlp,
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
				return res.json({success: true, pemateri: data});
			})
		})
	})
})
router.post('/pemateri/hapus', (req, res) => {
	let id = req.body._id;
	if(!id) return res.json({success: false, msg: 'Mohon Isikan Data Pemateri'});
	m.customModelDeleteById(User, id, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, pemateri: data});
	})
})
router.post('/pemateri/edit', (req, res) => {
	let id = req.body._id,
			namaLengkap = req.body.namaLengkap,
			email = req.body.email,
			noKta = req.body.noKta,
			kwarcab = req.body.kwarcab,
			jenisKelamin = req.body.jenisKelamin,
			tglLahir = req.body.tglLahir,
			noTlp = req.body.noTlp,
			alamat = req.body.alamat,
			password = req.body.password;

	if(!id || !namaLengkap || !email || !noKta || !kwarcab || jenisKelamin == null || jenisKelamin == undefined) return res.json({success: false, msg: 'Mohon Lengkapi Data Pemateri'});
	let update = {
		namaLengkap: namaLengkap,
		email: email,
		noKta: noKta,
		kwarcab: kwarcab,
		jenisKelamin: jenisKelamin,
		tglLahir: tglLahir,
		noTlp: noTlp,
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
					return res.json({success: true, pemateri: data})
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
				return res.json({success: true, pemateri: data})
			})
		})
	}
})

router.post('/peserta', (req, res) => {
	m.customModelFindByQuerySelectPopulateLean(
		User, {$and: [{$or: [{isAdmin: false}, {isAdmin: undefined}]}, {status: 2}]}, ['-isAdmin'], [], (err, data) => {
		if(err) return res.status(500).send({ error : err });

		data.forEach(v => {
			v.hasPassword = v.password? true : false;
			delete v.password;
		})
		return res.json({success: true, peserta: data})
	})
})
router.post('/peserta/tambah', (req, res) => {
	let namaLengkap = req.body.namaLengkap,
			email = req.body.email,
			noKta = req.body.noKta,
			kwarcab = req.body.kwarcab,
			jenisKelamin = req.body.jenisKelamin,
			tglLahir = req.body.tglLahir,
			noTlp = req.body.noTlp,
			alamat = req.body.alamat,
			password = req.body.password;

	if(!email || !noKta || !kwarcab || !password/* || jenisKelamin == null || jenisKelamin == undefined*/) return res.json({success: false, msg: 'Data Peserta Tidak Lengkap'});
	let newUser = new User({
		namaLengkap: namaLengkap,
		email: email,
		noKta: noKta,
		kwarcab: kwarcab,
		jenisKelamin: jenisKelamin,
		tglLahir: tglLahir,
		noTlp: noTlp,
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
				return res.json({success: true, peserta: data});
			})
		})
	})
})
router.post('/peserta/hapus', (req, res) => {
	let id = req.body._id;
	if(!id) return res.json({success: false, msg: 'Mohon Isikan Data Peserta'});
	m.customModelDeleteById(User, id, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, peserta: data});
	})
})
router.post('/peserta/edit', (req, res) => {
	let id = req.body._id,
			namaLengkap = req.body.namaLengkap,
			email = req.body.email,
			noKta = req.body.noKta,
			kwarcab = req.body.kwarcab,
			jenisKelamin = req.body.jenisKelamin,
			tglLahir = req.body.tglLahir,
			noTlp = req.body.noTlp,
			alamat = req.body.alamat,
			password = req.body.password;

	if(!id || !namaLengkap || !email || !noKta || !kwarcab || jenisKelamin == null || jenisKelamin == undefined) return res.json({success: false, msg: 'Mohon Lengkapi Data Peserta'});
	let update = {
		namaLengkap: namaLengkap,
		email: email,
		noKta: noKta,
		kwarcab: kwarcab,
		jenisKelamin: jenisKelamin,
		tglLahir: tglLahir,
		noTlp: noTlp,
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
					return res.json({success: true, peserta: data})
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
				return res.json({success: true, peserta: data})
			})
		})
	}
})

router.post('/tingkatan', (req, res) => {
	m.customModelFindByQuery(Tingkatan, {}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, tingkatan: data})
	})
})
router.post('/tingkatan/tambah', (req, res) => {
	let title = req.body.title;

	if(!title) return res.json({success: false, msg: 'Mohon Isikan Title'});
	let newTingkatan = new Tingkatan({
		title: title
	});

	m.generalCreateDoc(newTingkatan, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, tingkatan: data});
	})
})
router.post('/tingkatan/hapus', (req, res) => {
	let id = req.body._id;

	if(!id) return res.json({success: false, msg: 'Mohon Isikan Tingkatan'});
	m.customModelDeleteById(Tingkatan, id, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, tingkatan: data});
	})
})
router.post('/tingkatan/edit', (req, res) => {
	let id = req.body._id,
			title = req.body.title;

	if(!id || !title) return res.json({success: false, msg: 'Mohon Isikan Data Tingkatan'});
	m.customModelUpdateById(Tingkatan, id, {title: title}, { new: true, setDefaultsOnInsert: true }, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(!data) return res.json({success: false, msg: 'Tingkatan tidak terdaftar'});
		return res.json({success: true, tingkatan: data})
	})
})

router.post('/pelatihan', (req, res) => {
	m.customModelFindByQueryPopulate(Pelatihan, {delete: {$ne: true}}, ['tingkatan', 'pemateri', 'peserta'], (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, pelatihan: data})
	})
})
router.post('/pelatihan/kode', (req, res) => {
	setTimeout(_ => {
		return res.json({success: true, kode: 'HG45TR'})
	}, 15000)
})
router.post('/pelatihan/tambah', (req, res) => {
	let nama = req.body.nama,
			tglPendaftaranMulai = req.body.tglPendaftaranMulai,
			tglPendaftaranAkhir = req.body.tglPendaftaranAkhir,
			tglPelaksanaanMulai = req.body.tglPelaksanaanMulai,
			tglPelaksanaanAkhir = req.body.tglPelaksanaanAkhir,
			tingkatan = req.body.tingkatan,
			imgUrl = req.body.imgUrl,
			deskripsi = req.body.deskripsi,
			biaya = req.body.biaya,
			pemateri = req.body.pemateri,
			peserta = req.body.peserta;

	if(!nama || !tglPendaftaranMulai || !tglPendaftaranAkhir || !tglPelaksanaanMulai || !tglPelaksanaanAkhir || !tingkatan) return res.json({success: false, msg: 'Mohon Isikan Title'});
	let newPelatihan = new Pelatihan({
		nama: nama,
		tglPendaftaranMulai: tglPendaftaranMulai,
		tglPendaftaranAkhir: tglPendaftaranAkhir,
		tglPelaksanaanMulai: tglPelaksanaanMulai,
		tglPelaksanaanAkhir: tglPelaksanaanAkhir,
		tingkatan: tingkatan,
		imgUrl: imgUrl,
		deskripsi: deskripsi,
		biaya: biaya,
		pemateri: pemateri
	});

	if(peserta) newPelatihan['peserta'] = peserta

	m.generateRandonNum(Pelatihan, 'kode', 5, (err, num) => {
		if(err) return res.status(500).json({error: err});
		newPelatihan['kode'] = "PL" + num;

		m.generalCreateDoc(newPelatihan, (err, data) => {
			if(err) return res.status(500).send({ error : err });

			m.customModelFindByIdPopulate(Pelatihan, data._id, ['tingkatan', 'pemateri', 'peserta'], (err, data) => {
				if(err) return res.status(500).send({ error : err });
				return res.json({success: true, pelatihan: data});

				// pengacakan pada saat penambahan peserta di pelatiha. ============
			})
		})
	})
})
router.post('/pelatihan/hapus', (req, res) => {
	let id = req.body._id;

	if(!id) return res.json({success: false, msg: 'Mohon Isikan Data Pelatihan'});
	m.customModelUpdateById(Pelatihan, id, {delete: true}, {new: true}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, pelatihan: data});
	})
})
router.post('/pelatihan/edit', (req, res) => {
	let id = req.body._id,
			nama = req.body.nama,
			tglPendaftaranMulai = req.body.tglPendaftaranMulai,
			tglPendaftaranAkhir = req.body.tglPendaftaranAkhir,
			tglPelaksanaanMulai = req.body.tglPelaksanaanMulai,
			tglPelaksanaanAkhir = req.body.tglPelaksanaanAkhir,
			tingkatan = req.body.tingkatan,
			imgUrl = req.body.imgUrl,
			deskripsi = req.body.deskripsi,
			biaya = req.body.biaya,
			pemateri = req.body.pemateri,
			peserta = req.body.peserta;

	if(!id) return res.json({success: false, msg: 'Mohon Isikan Data Pelatihan'});
	let update = {};
	if(nama) update.nama = nama;
	if(tglPendaftaranMulai) update.tglPendaftaranMulai = tglPendaftaranMulai;
	if(tglPendaftaranAkhir) update.tglPendaftaranAkhir = tglPendaftaranAkhir;
	if(tglPelaksanaanMulai) update.tglPelaksanaanMulai = tglPelaksanaanMulai;
	if(tglPelaksanaanAkhir) update.tglPelaksanaanAkhir = tglPelaksanaanAkhir;
	if(tingkatan) update.tingkatan = tingkatan;
	if(imgUrl) update.imgUrl = imgUrl;
	if(deskripsi) update.deskripsi = deskripsi;
	if(biaya) update.biaya = biaya;
	if(pemateri) update.pemateri = pemateri;
	if(peserta) update.peserta = peserta;
	
	m.customModelUpdateByIdPopulate(Pelatihan, id, update, { new: true, setDefaultsOnInsert: true }, ['tingkatan', 'pemateri', 'peserta'], (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(!data) return res.json({success: false, msg: 'Pelatihan tidak terdaftar'});
		return res.json({success: true, pelatihan: data})

		// pengacakan pada saat penambahan peserta di pelatiha. ============
	})
})
router.post('/pelatihan/pemateri/edit', (req, res) => {
	let id = req.body._id,
			pemateri = req.body.pemateri;

	if(!id || !pemateri) return res.json({success: false, msg: 'Mohon Isikan Data Pelatihan', body: req.body});
	m.customModelUpdateByIdPopulate(Pelatihan, id, {pemateri: pemateri}, { new: true, setDefaultsOnInsert: true }, ['tingkatan', 'pemateri', 'peserta'], (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(!data) return res.json({success: false, msg: 'Pelatihan tidak terdaftar'});
		return res.json({success: true, pelatihan: data})
	})
})
router.post('/pelatihan/peserta/edit', (req, res) => {
	let id = req.body._id,
			peserta = req.body.peserta;

	if(!id || !peserta) return res.json({success: false, msg: 'Mohon Isikan Data Pelatihan', body: req.body});

	m.customModelUpdateByIdPopulate(Pelatihan, id, {peserta: peserta}, { new: true, setDefaultsOnInsert: true }, ['tingkatan', 'pemateri', 'peserta'], (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(!data) return res.json({success: false, msg: 'Pelatihan tidak terdaftar'});
		return res.json({success: true, pelatihan: data});
		// pengacakan pada saat penambahan peserta di pelatiha. ============
	})
})

/*router.post('/pelajaran', (req, res) => {
	let idPelatihan = req.body.idPelatihan,
			idUser = req.body.idUser;

	m.customModelAggregate(Pelajaran, [{
    '$lookup': {
      'from': 'nizam_materis', 
      'localField': '_id', 
      'foreignField': 'pelajaran', 
      'as': 'materi'
    }
  }],(err, data) => {
  	if(err) return res.status(500).send({ error : err });
		return res.json({success: true, pelajaran: data})
  })

	// m.customModelFindByQueryPopulate(Pelajaran, {pelatihan: idPelatihan, pengajar: idUser}, ['pelatihan'], (err, data) => {
	// 	if(err) return res.status(500).send({ error : err });
	// 	return res.json({success: true, pelajaran: data})
	// })
})
router.post('/pelajaran/tambah', (req, res) => {
	let nama = req.body.nama,
			idPelatihan = req.body.idPelatihan,
			idUser = req.body.idUser;

	if(!nama || !idPelatihan || !idUser) return res.json({success: false, msg: 'Mohon Isikan Data Lengkap Pelajaran'});
	let newPelajaran = new Pelajaran({
		nama: nama,
		pengajar: idUser,
		pelatihan: idPelatihan
	});

	m.generalCreateDoc(newPelajaran, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, pelajaran: data});
	})
})
router.post('/pelajaran/hapus', (req, res) => {
	let id = req.body._id;

	if(!id) return res.json({success: false, msg: 'Mohon Isikan Pelajaran'});
	m.customModelDeleteById(Pelajaran, id, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, pelajaran: data});
	})
})
router.post('/pelajaran/edit', (req, res) => {
	let id = req.body._id,
			nama = req.body.nama;

	if(!id || !nama) return res.json({success: false, msg: 'Mohon Isikan Data Pelajaran'});
	m.customModelUpdateById(Pelajaran, id, {nama: nama}, { new: true, setDefaultsOnInsert: true }, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(!data) return res.json({success: false, msg: 'Pelajaran tidak terdaftar'});
		return res.json({success: true, pelajaran: data})
	})
})

router.post('/materi', (req, res) => {
	let idPelajaran = req.body.idPelajaran;

	m.customModelFindByQueryPopulate(Materi, {pelajaran: idPelajaran}, [], (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, materi: data})
	})
})
router.post('/materi/tambah', (req, res) => {
	let idPelajaran = req.body.idPelajaran,
			jenis = req.body.jenis,
			tglPelaksanaan = req.body.tglPelaksanaan,
			waktuPelaksanaanMulai = req.body.waktuPelaksanaanMulai,
			waktuPelaksanaanAkhir = req.body.waktuPelaksanaanAkhir,
			durasiPelaksanaan = req.body.durasiPelaksanaan;

	let newMateri = new Materi({
		pelajaran: idPelajaran,
		jenis: jenis,
		tglPelaksanaan: tglPelaksanaan,
		waktuPelaksanaanMulai: waktuPelaksanaanMulai,
		waktuPelaksanaanAkhir: waktuPelaksanaanAkhir,
		durasiPelaksanaan: durasiPelaksanaan
	});

	m.generalCreateDoc(newMateri, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, materi: data});
	})
})
router.post('/materi/hapus', (req, res) => {
	let id = req.body._id;

	if(!id) return res.json({success: false, msg: 'Mohon Isikan Materi'});
	m.customModelDeleteById(Materi, id, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, materi: data});
	})
})
router.post('/materi/edit', (req, res) => {
	let id = req.body._id,
			jenis = req.body.jenis,
			tglPelaksanaan = req.body.tglPelaksanaan,
			waktuPelaksanaanMulai = req.body.waktuPelaksanaanMulai,
			waktuPelaksanaanAkhir = req.body.waktuPelaksanaanAkhir,
			durasiPelaksanaan = req.body.durasiPelaksanaan;

	if(!id) return res.json({success: false, msg: 'Mohon Isikan Data Materi'});
	m.customModelUpdateById(Materi, id, {
		jenis, 
		tglPelaksanaan, 
		waktuPelaksanaanMulai, 
		waktuPelaksanaanAkhir, 
		durasiPelaksanaan
	}, { new: true, setDefaultsOnInsert: true }, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(!data) return res.json({success: false, msg: 'Materi tidak terdaftar'});
		return res.json({success: true, materi: data})
	})
})*/

router.get('/', (req, res) => {
	return res.send('this is admin route');
})

module.exports = router;