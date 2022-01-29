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
const Pelatihan = require('../../models/nizam/pelatihan');
const Pelajaran = require('../../models/nizam/pelajaran');
const Materi = require('../../models/nizam/materi');
const Soal = require('../../models/nizam/soal');
const Pilihan = require('../../models/nizam/pilihan');
const Pengacakan = require('../../models/nizam/pengacakan');

// other server url
const otherServerUrl = "https://mfnizam.com/apps/projectkabeh/";

router.post('/pelatihan', (req, res) => {
	let idUser = req.body.idUser;

	m.customModelFindByQueryPopulate(Pelatihan, {delete: {$ne: true}, $or: [{pemateri: {$in: [idUser]}}, {peserta: {$in: [idUser]}}]}, ['tingkatan', 'pemateri'], (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, pelatihan: data})
	})
})

router.post('/pelajaran', (req, res) => {
	let idPelatihan = req.body.idPelatihan,
			idUser = req.body.idUser;

	if(!idPelatihan || !idUser) return res.json({success: false, msg: 'Mohon isikan data pelajaran'})

	m.customModelFindById(User, idUser, (err, udata) => {
		if(err) return res.status(500).send({ error : err });
		if(!udata) return res.json({success: false, msg: 'User tidak terdaftar'});

		m.customModelFindOneByQuery(Pelatihan, {_id: idPelatihan, delete: {$ne: true}, $or: [{pemateri: {$in: [idUser]}}, {peserta: {$in: [idUser]}}] }, (err, data) => {
			if(err) return res.status(500).send({ error : err });
			if(!data) return res.json({success: false, msg: 'Pelatihan tidak terdaftar'});

			let match = {
				_id: {$in: data.pelajaran},
			}

			if(udata.status == 1) match.pengajar = ObjectId(idUser)
			m.customModelFindByQueryPopulateLean(Pelajaran, match, [{path: 'materi', populate: 'soal'}, 'pengajar'], (err, data) => {
				if(err) return res.status(500).send({ error : err });

				return res.json({success: true, pelajaran: data});
				// m.customModelFindByQueryLean(Pengacakan, {peserta: idUser, materi: {$in: data.map(v => v.materi).flat().map(v => v._id)}}, (err, pdata) => {
				// 	if(err) return res.status(500).send({ error : err });
					
				// 	data.forEach(v => {
				// 		v.materi.forEach(m => {
				// 			let u = pdata.find(p => p.materi == m._id.toString());
				// 			if(u){
				// 				m.soal = m.soal.sort((a, b) => {
				// 					return u.urutan.indexOf(a._id.toString()) - u.urutan.indexOf(b._id.toString());
				// 				});
				// 				m.urutan = u.urutan;
				// 			}
				// 		})
				// 	})
				// 	return res.json({success: true, pelajaran: data});
				// })	
			})

			// m.customModelAggregate(Pelajaran, [{
			// 	$match: match
			// }, {
			// 	$lookup: {
			// 		from: 'nizam_materis',
			// 		let: {'pelajaran': '$_id'},
			// 		pipeline: [{
			// 			$match:{ 
			// 				$expr:{ 
			// 					$and:[
			// 					{ $eq: [ "$pelajaran",  "$$pelajaran" ] },
			// 					{ $ne: [ "$delete", true ] }
			// 					]
			// 				}
			// 			}
			// 		}],
			// 		as: 'materi'
			// 	}
			// }, {
			// 	$lookup: {
			// 		from: 'nizam_users',
			// 		localField: 'pengajar',
			// 		foreignField: '_id',
			// 		as: 'pengajar'
			// 	}
			// }, {
			// 	$addFields: {
			// 		pengajar: {
			// 			"$arrayElemAt": ["$pengajar", 0]
			// 		}
			// 	}
			// }], (err, data) => {
			// 	if(err) return res.status(500).send({ error : err });
			// 	return res.json({success: true, pelajaran: data});
			// })
		})
	})
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


	m.customModelFindOneByQuery(Pelatihan, {_id: idPelatihan, pemateri: {$in: [idUser]}, delete: {$ne: true}}, (err, pdata) => {
		if(err) return res.status(500).send({ error : err });
		if(!pdata) return res.json({success: false, msg: 'Pelatihan tidak terdaftar'});
		
		m.generalCreateDoc(newPelajaran, (err, data) => {
			if(err) return res.status(500).send({ error : err });			

			pdata.pelajaran = [...pdata.pelajaran, data];
			pdata.save((err, sdata) => {
				if(err) return res.status(500).send({ error : err });
				return res.json({success: true, pelajaran: data});
			})
		})
	})
})
router.post('/pelajaran/hapus', (req, res) => {
	let id = req.body._id;

	if(!id) return res.json({success: false, msg: 'Mohon Isikan Pelajaran'});
	m.customModelUpdateById(Pelajaran, id, {delete: true}, (err, data) => {
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
		// return res.json({success: true, pelajaran: data})
		m.customModelAggregate(Pelajaran, [{
			$match: {
				_id: ObjectId(id)
			}
		}, {
			$lookup: {
				from: 'nizam_materis',
				let: {'pelajaran': '$_id'},
				pipeline: [{
					$match:{ 
						$expr:{ 
							$and:[
							{ $eq: [ "$pelajaran",  "$$pelajaran" ] },
							{ $ne: [ "$delete", true ] }
							]
						}
					}
				}],
				as: 'materi'
			}
		}], (err, data) => {
			if(err) return res.status(500).send({ error : err });
			return res.json({success: true, pelajaran: data[0]})
		})
	})
})
router.post('/pelajaran/hasil', (req, res) => {
	let idPelatihan = req.body.idPelatihan,
			idUser = req.body.idUser;

	if(!idPelatihan || !idUser) return res.json({success: false, msg: 'Mohon isikan data pelajaran'})

	m.customModelFindById(User, idUser, (err, udata) => {
		if(err) return res.status(500).send({ error : err });
		if(!udata) return res.json({success: false, msg: 'User tidak terdaftar'});

		m.customModelFindOneByQueryPopulateLean(Pelatihan, {_id: idPelatihan, delete: {$ne: true}, $or: [{pemateri: {$in: [idUser]}}, {peserta: {$in: [idUser]}}] }, ['peserta'], (err, pdata) => {
			if(err) return res.status(500).send({ error : err });
			if(!pdata) return res.json({success: false, msg: 'Pelatihan tidak terdaftar'});

			let match = {
				_id: {$in: pdata.pelajaran},
			}

			if(udata.status == 1) match.pengajar = ObjectId(idUser)
			m.customModelFindByQueryPopulateLean(Pelajaran, match, [{path: 'materi', populate: 'soal'}, 'pengajar'], (err, data) => {
				if(err) return res.status(500).send({ error : err });
				
				m.customModelFindByQueryLean(Pilihan, {peserta: {$in: pdata.peserta}}, (err, ldata) => {
					if(err) return res.status(500).send({ error : err });

					data.forEach(d => {
						d.materi.forEach(m => {
							if(m.jenis > 3) return;
							m['mengerjakan'] = 0;
							m['peserta'] = JSON.parse(JSON.stringify(pdata.peserta)).map(p => {
								let l = ldata.find(v => v.materi.toString() == m._id && v.peserta.toString() == p._id)
								if(l){
									p['penilaian'] = l.penilaian || 0;
									m['mengerjakan'] += l? 1 : 0;
								// 	p['pilihan'] = l.pilihan.map(b => {
								// 		b['penilaian'] = m.soal.find(s => s._id.toString() == b.soal)?.kunci == b.pilihan;
								// 		return b;
								// 	});
								}else{
									p['penilaian'] = null;
								}
								return p;
							})
						})
					})

					return res.json({success: true, pelajaran: data});
				})
			})
		})
	})
})
router.post('/pelajaran/pengacakan', (req, res) => {
	let idPelatihan = req.body.idPelatihan,
			idUser = req.body.idUser;

	if(!idPelatihan || !idUser) return res.json({success: false, msg: 'Mohon isikan data pelajaran'})

	m.customModelFindById(User, idUser, (err, udata) => {
		if(err) return res.status(500).send({ error : err });
		if(!udata) return res.json({success: false, msg: 'User tidak terdaftar'});

		m.customModelFindOneByQuery(Pelatihan, {_id: idPelatihan, delete: {$ne: true}, $or: [{pemateri: {$in: [idUser]}}, {peserta: {$in: [idUser]}}] }, (err, data) => {
			if(err) return res.status(500).send({ error : err });
			if(!data) return res.json({success: false, msg: 'Pelatihan tidak terdaftar'});

			let match = {
				_id: {$in: data.pelajaran},
			}

			if(udata.status == 1) match.pengajar = ObjectId(idUser)
			m.customModelFindByQueryPopulateLean(Pelajaran, match, [{path: 'materi', populate: 'soal'}, 'pengajar'], (err, data) => {
				if(err) return res.status(500).send({ error : err });

				m.customModelFindByQueryLean(Pengacakan, {peserta: idUser, materi: {$in: data.map(v => v.materi).flat().map(v => v._id)}}, (err, pdata) => {
					if(err) return res.status(500).send({ error : err });
					
					data.forEach(v => {
						v.materi.forEach(m => {
							let u = pdata.find(p => p.materi == m._id.toString());
							if(u){
								m.soal = m.soal.sort((a, b) => {
									return u.urutan.indexOf(a._id.toString()) - u.urutan.indexOf(b._id.toString());
								});
								// m.urutan = u.urutan;
							}
						})
					})
					return res.json({success: true, pelajaran: data});
				})	
			})
		})
	})
})

router.post('/materi', (req, res) => {
	let idPelajaran = req.body.idPelajaran
			idUser = req.body.idUser;

	if(!idPelajaran || !idUser) return res.json({success: false, msg: 'Lengkapi data'})

	m.customModelFindByQueryPopulate(Materi, {pelajaran: idPelajaran, delete: {$ne: true}}, ['soal'], (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, materi: data})
	})
})
router.post('/materi/tambah', multer().single('file'), (req, res) => {
	let idPelajaran = req.body.idPelajaran,
			jenis = req.body.jenis,
			tglPelaksanaan = req.body.tglPelaksanaan,
			waktuPelaksanaanMulai = req.body.waktuPelaksanaanMulai,
			waktuPelaksanaanAkhir = req.body.waktuPelaksanaanAkhir,
			durasiPelaksanaan = req.body.durasiPelaksanaan,
			namaMateri = req.body.namaMateri,
			file = req.file,
			path = 'nizam/document/materi';

	let newMateri = new Materi({
		pelajaran: idPelajaran,
		jenis: jenis,
	});

	if(jenis > 3){
		if(!file) return res.status(500).json({success: false, msg: "Mohon Sertakan File Materi"});
		// return res.json({success: false, file: req.file, data: req.body});

		const reqOptions = {
			url: otherServerUrl + 'upload.php',
			method: "POST",
			formData: {
				file: {
					value: req.file.buffer,
					options: {
						filename: decodeURIComponent(req.file.originalname).split(' ').join('_'),
						contentType: req.file.mimetype
					}
				},
				destination : path,
				// idUser: idUser
			}
		}

		request(reqOptions, function (err, resp, body) {
			if(err) return res.status(500).json({error: err});
			try{
				body = JSON.parse(body);
			}catch(e){
				body.success = false;
			}

			if(!body.success) return res.json({ success: false, errupload: true, err: body.err, file: body});

			newMateri['materiUrl'] = body.path;
			newMateri['namaMateri'] = namaMateri;

			m.customModelFindOneByQuery(Pelajaran, {_id: idPelajaran, delete: {$ne: true}}, (err, pdata) => {
				if(err) return res.status(500).send({ error : err });
				if(!pdata) return res.json({success: false, msg: 'Pelajaran tidak terdaftar'});

				m.generalCreateDoc(newMateri, (err, data) => {
					if(err) return res.status(500).send({ error : err });

					pdata.materi = [...pdata.materi, data];
					pdata.save((err, sdata) => {
						if(err) return res.status(500).send({ error : err });
						return res.json({success: true, materi: data});
					})
				})
			})
		})

	}else{
		if(tglPelaksanaan) newMateri['tglPelaksanaan'] = tglPelaksanaan;
		if(waktuPelaksanaanMulai) newMateri['waktuPelaksanaanMulai'] = waktuPelaksanaanMulai;
		if(waktuPelaksanaanAkhir) newMateri['waktuPelaksanaanAkhir'] = waktuPelaksanaanAkhir;
		if(durasiPelaksanaan) newMateri['durasiPelaksanaan'] = durasiPelaksanaan;

		m.customModelFindOneByQuery(Pelajaran, {_id: idPelajaran, delete: {$ne: true}}, (err, pdata) => {
			if(err) return res.status(500).send({ error : err });
			if(!pdata) return res.json({success: false, msg: 'Pelajaran tidak terdaftar'});

			m.generalCreateDoc(newMateri, (err, data) => {
				if(err) return res.status(500).send({ error : err });

				pdata.materi = [...pdata.materi, data];
				pdata.save((err, sdata) => {
					if(err) return res.status(500).send({ error : err });
					return res.json({success: true, materi: data});
				})
			})
		})
	}
})
router.post('/materi/hapus', (req, res) => {
	let id = req.body._id;

	if(!id) return res.json({success: false, msg: 'Mohon Isikan Materi'});
	m.customModelUpdateById(Materi, id, {delete: true}, {new: true}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, materi: data});
	})
})
router.post('/materi/edit', (req, res) => {
	let id = req.body.idMateri,
			jenis = req.body.jenis,
			tglPelaksanaan = req.body.tglPelaksanaan,
			waktuPelaksanaanMulai = req.body.waktuPelaksanaanMulai,
			waktuPelaksanaanAkhir = req.body.waktuPelaksanaanAkhir,
			durasiPelaksanaan = req.body.durasiPelaksanaan;

	if(!id) return res.json({success: false, msg: 'Mohon Isikan Data Materi'});
	let update = {}

	if(jenis) update.jenis = jenis;
	if(tglPelaksanaan) update.tglPelaksanaan = tglPelaksanaan;
	if(waktuPelaksanaanMulai) update.waktuPelaksanaanMulai = waktuPelaksanaanMulai;
	if(waktuPelaksanaanAkhir) update.waktuPelaksanaanAkhir = waktuPelaksanaanAkhir;
	if(durasiPelaksanaan) update.durasiPelaksanaan = durasiPelaksanaan;

	m.customModelUpdateById(Materi, id, update, { new: true, setDefaultsOnInsert: true }, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(!data) return res.json({success: false, msg: 'Materi tidak terdaftar'});
		return res.json({success: true, materi: data})
	})
})
router.post('/materi/soal/tambah', (req, res) => {
	let materi = req.body.idMateri,
			deskripsi = req.body.soalDeskripsi,
			jawaban = req.body.soalJawaban,
			kunci = req.body.soalKunci;

	if(!materi || !deskripsi || !jawaban || !kunci) return res.json({success: false, msg: 'Mohon isikan data soal'});
	
	let newSoal = new Soal({
		materi,
		deskripsi,
		jawaban
	})
	
	let iKunci = jawaban.findIndex(v => v.fid == kunci);
	if(iKunci < 0) return res.json({success: false, msg: 'Terjadi Kesalan'});
	newSoal['kunci'] = newSoal.jawaban[iKunci]._id;

	// return res.json(newSoal)
	m.generalCreateDoc(newSoal, (err, data) => {
		if(err) return res.status(500).send({ error : err, newSoal });

		m.customModelUpdateById(Materi, materi, {$push: { soal: data._id }}, {new: true, setDefaultsOnInsert: true}, (err, mdata) => {
			if(err) return res.status(500).send({ error : err });
			if(!mdata) return res.json({success: false, msg: 'Materi tidak terdaftar'});

			m.customModelFindOneByQuery(Pelatihan, {pelajaran: {$in: [mdata.pelajaran]}}, (err, pdata) => {
				if(err) return res.status(500).send({ error : err });
				if(!pdata) return res.json({success: false, msg: 'Pelatihan tidak terdaftar'});

				let pengacakan = pdata.peserta.map(v => {
					return {
						updateOne: {
							filter: { peserta: ObjectId(v), materi: ObjectId(mdata._id) },
							update: { urutan: shuffle(mdata.soal.map(v => v._id)) },
							upsert: true
						}
					}
				})

				m.customModelBulkWrite(Pengacakan, pengacakan).then(cdata => {
					return res.json({success: true, soal: data, pengacakan: pengacakan})
				}).catch(err => {
					return res.status(500).send({ error : err });
				})
			})
		})
	})

	/*let newSoal = new Materi({
		soal: {
			deskripsi: deskripsi,
			jawaban: jawaban
		}
	})

	let iKunci = jawaban.findIndex(v => v._id == kunci);
	if(iKunci < 0) return res.json({success: false, msg: 'Terjadi Kesalan'})
	newSoal.soal[0].kunci = newSoal.soal[0].jawaban[iKunci]._id;

	m.customModelUpdateById(Materi, idMateri, { $push: { soal: newSoal.soal[0]}}, {new: true, setDefaultsOnInsert: true}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(!data) return res.json({success: false, msg: 'Materi tidak terdaftar'});

		m.customModelFindOneByQuery(Pelatihan, {pelajaran: {$in: [data.pelajaran]}}, (err, pdata) => {
			if(err) return res.status(500).send({ error : err });
			if(!data) return res.json({success: false, msg: 'Pelatihan tidak terdaftar'});

			let pengacakan = pdata.peserta.map(v => {
				return {
					updateOne: {
						filter: { peserta: ObjectId(v), materi: ObjectId(data._id) },
						update: { urutan: shuffle(data.soal.map(v => v._id)) },
						upsert: true
					}
				}
			})

			m.customModelBulkWrite(Pengacakan, pengacakan).then(cdata => {
				return res.json({success: true, soal: data.soal[data.soal.length - 1], pengacakan: pengacakan})
			}).catch(err => {
				return res.status(500).send({ error : err });
			})
		})
	})*/
})
router.post('/materi/soal/edit', (req, res) => {
	let idMateri = req.body.idMateri,
			idSoal = req.body.idSoal,
			deskripsi = req.body.soalDeskripsi,
			jawaban = req.body.soalJawaban,
			kunci = req.body.soalKunci;

	if(!idMateri || !idSoal) return res.json({success: false, msg: 'Mohon isikan data soal'});

	m.customModelUpdateByQuery(Soal, {_id: idSoal, materi: idMateri}, {deskripsi, jawaban, kunci}, {new: true, setDefaultsOnInsert: true}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(!data) return res.json({success: false, msg: 'Soal tidak terdaftar'});	
		return res.json({success: true, soal: data});
	})
	// m.customModelFindById(Materi, idMateri, (err, data) => {
	// 	if(err) return res.status(500).send({ error : err });
	// 	if(!data) return res.json({success: false, msg: 'Materi tidak terdaftar'});

	// 	let is = data.soal.findIndex(v => v._id == idSoal);
	// 	data.soal[is].deskripsi = deskripsi;
	// 	data.soal[is].jawaban = jawaban;
	// 	data.soal[is].kunci = kunci;
	// 	data.save((err, sdata) => {
	// 		if(err) return res.status(500).send({ error : err });
	// 		return res.json({success: true, soal: sdata.soal[is]})
	// 	})
	// })
})
router.post('/materi/soal/hapus', (req, res) => {
	let idSoal = req.body.idSoal,
			idMateri = req.body.idMateri;

	if(!idSoal || !idMateri) return res.json({success: false, msg: "Mohon isikan data soal"})

	m.customModelDeleteByQuery(Soal, {_id: idSoal, materi: idMateri}, (err, data) => {
		if(err) return res.status(500).send({ error : err });

		m.customModelUpdateById(Materi, idMateri, {$pull: {soal: idSoal}}, {new: true, setDefaultsOnInsert: true}, (err, mdata) => {
			if(err) return res.status(500).send({ error : err });
			if(!mdata) return res.json({success: false, msg: 'Materi tidak terdaftar'});

			m.customModelFindOneByQuery(Pelatihan, {pelajaran: {$in: [mdata.pelajaran]}}, (err, pdata) => {
				if(err) return res.status(500).send({ error : err });
				if(!pdata) return res.json({success: false, msg: 'Pelatihan tidak terdaftar'});

				let pengacakan = pdata.peserta.map(v => {
					return {
						updateOne: {
							filter: { peserta: ObjectId(v), materi: ObjectId(mdata._id) },
							update: { urutan: shuffle(mdata.soal.map(v => v._id)) },
							upsert: true
						}
					}
				})

				m.customModelBulkWrite(Pengacakan, pengacakan).then(cdata => {
					return res.json({success: true, soal: data})
				}).catch(err => {
					return res.status(500).send({ error : err });
				})
			})
		})
	})
	// m.customModelFindById(Materi, idMateri, (err, data) => {
	// 	if(err) return res.status(500).send({ error : err });
	// 	if(!data) return res.json({success: false, msg: 'Materi tidak terdaftar'});
	// 	if(!data.soal || data.soal.length < 1 || !data.soal.find(v => v._id == idSoal)) return res.json({success: false, msg: 'Soal tidak terdaftar'});
	// 	data.soal = data.soal.filter(v => v._id != idSoal);
	// 	data.save((err, sdata) => {
	// 		if(err) return res.status(500).send({ error : err });
	// 		return res.json({success: true})
	// 	})
	// })
})
router.post('/materi/soal/pilih', (req, res) => {
	let peserta = req.body.idUser,
			materi = req.body.idMateri,
			soal = req.body.idSoal,
			pilihan = req.body.idPilihan;

	if(!materi || !peserta || !pilihan || !soal) return res.json({success: false, msg: 'Lengkapi data jawab'});

	m.customModelFindOneByQuery(Pilihan, {peserta, materi}, (err, data) => {
		if(err) return res.status(500).send({ error : err });

		if(data){
			let c = data.pilihan.find(v => v.soal == soal);
			if(c) {
				data.pilihan = data.pilihan.map(v => { return v.soal == soal? { soal: soal, pilihan: pilihan } : v})
			}else{
				data.pilihan.push({soal: soal, pilihan: pilihan});
			}

			m.customModelFindByQuery(Soal, {_id: {$in: data.pilihan.map(v => v.soal)}, materi}, (err, sdata) => {
				if(err) return res.status(500).send({ error : err });

				data['penilaian'] = data.pilihan.reduce((a, c) => {
					return a + (c.pilihan == sdata.find(v => v._id.toString() == c.soal).kunci? 1 : 0);
				}, 0)

				data.save((err, data) => {
					if(err) return res.status(500).send({ error : err });
					return res.json({success: true, pilih: data})
				})
			})

		}else{
			let newPilihan = new Pilihan({
				peserta,
				materi,
				pilihan: [{
					soal,
					pilihan
				}]
			})

			m.generalCreateDoc(newPilihan, (err, data) => {
				if(err) return res.status(500).send({ error : err });
				return res.json({success: true, pilih: data});
			})
		}
	})
	// m.customModelFindOneByQuery(Pilihan, {peserta: peserta, materi: materi, soal: soal}, (err, data) => {
	// 	if(err) return res.status(500).send({ error : err });

	// 	if(data){
	// 		data['pilihan'] = pilihan;
	// 		data.save((err, data) => {
	// 			if(err) return res.status(500).send({ error : err });
	// 			return res.json({success: true, pilih: data});
	// 		})
	// 	}else{
	// 		let newPilihan = new Pilihan({
	// 			peserta,
	// 			materi,
	// 			soal,
	// 			pilihan
	// 		})

	// 		m.generalCreateDoc(newPilihan, (err, data) => {
	// 			if(err) return res.status(500).send({ error : err });
	// 			return res.json({success: true, pilih: data});
	// 		})
	// 	}
	// })
})
router.post('/materi/soal/pilihan', (req, res) => {
	let idMateri = req.body.idMateri,
			idUser = req.body.idUser;

	if(!idMateri || !idUser) return res.json({success: false, msg: 'Lengkapi pilihan'});
	m.customModelFindByQuerySelect(Pilihan, {peserta: idUser, materi: idMateri}, ['-penilaian'], (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, pilihan: data});
	})
})
router.post('/materi/soal/urutan', (req, res) => {
	let idMateri = req.body.idMateri,
			idUser = req.body.idUser;

	if(!idMateri || !idUser) return res.json({success: false, msg: 'Lengkapi pilihan'});
	m.customModelFindByQuery(Pengacakan, {peserta: idUser, materi: idMateri}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, urutan: data});
	})
})

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


module.exports = router;