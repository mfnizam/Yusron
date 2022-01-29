const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

//moduls
const m = require('../../module');

// models
const Kode = require('../../models/kode');
const User = require('../../models/quran/user');

router.post('/predaftar', (req, res) => {
	const eAn = req.body.eAn,
				namaLengkap = req.body.namaLengkap,
				password = req.body.password,
				isEmail = req.body.isEmail;

	m.customModelFindOneByQuery(User, {$or: [{email: eAn}, {noTlp: eAn}]}, (err, data) => {
		if(err) return res.status(500).json({error: err});
		if(data) return res.json({success: false, msg: 'Sudah Digunakan', iseAn: true, isEmail: isEmail});

		if(isEmail){
			let newUser = new User({
				email: eAn,
				namaLengkap: namaLengkap,
				password: password
			})

			m.generatePassHash(newUser, (err, data) => {
				if(err) return res.status(500).send({ error : err });

				m.generalCreateDoc(data, (err, data) => {
					if(err) return res.status(500).send({ error : err });

					let populate = []
					m.customModelFindByIdPopulate(User, data._id, populate, (err, data) => {
						if(err) return res.status(500).send({ error : err });

						data = data.toJSON();
						if(data.daya) data.daya = Number(data.daya.toString());
						delete data.password;
						delete data.__v;
						const token = jwt.sign(data, '21061996', {
							expiresIn: 60 * 60 * 24 * 30
						});
						return res.json({success: true, token: token, isEmail: true});
					})
				})
			})
		}else{
			let now = new Date(),
			kadaluarsa = new Date();
			kadaluarsa.setTime(now.getTime() + (30 * 60 * 1000));

			m.generateRandonNum(Kode, 'kode', 5, (err, num) => {
				if(err) return res.status(500).json({error: err});
				let newDoc = {
					kode: num,
					kadaluarsa: kadaluarsa,
					keperluan: 0,
					noTlp: eAn
				};
				let option = { upsert: true, new: true, setDefaultsOnInsert: true };
				m.customModelUpdateByQuery(Kode, {$and: [{ noTlp: eAn }, { done: false }]}, newDoc, option, (err, data) => {
					if(err) return res.status(500).json({error: err});

					// data = data.toJSON();
					// data['success'] = true;
					return res.json({ success: true, isEmail: false });
				});
			})
		}
	})
})

router.post('/masuk', (req, res) => {
	const eAn = req.body.eAn,
				password = req.body.password,
				isEmail = req.body.isEmail;

	if(isEmail && (!eAn || !password)) return res.json({success: false, msg: 'Mohon Isikan Email / Nomor Tlp dan Password'});

	let populate = [{path: 'siswa', populate: 'kelas'}]

	m.customModelFindOneByQueryPopulate(User, {$or: [{email: eAn}, {noTlp: eAn}]}, populate, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(!data) return res.json({success: false, msg: 'Email tidak terdaftar, daftar dulu yukk.', errCol: 'eAn'});

		if(isEmail){
			m.comparePassHash(password, data.password, (err, isMatch) => {
				if(err) return res.status(500).send(err);
				if(!isMatch) return res.json({success: false, msg: 'Password salah', iseAn: false});

				data = data.toJSON();
				if(data.daya) data.daya = Number(data.daya.toString()) / 1000;
				delete data.password;
				delete data.__v;
				const token = jwt.sign(data, '21061996', {
					expiresIn: 60 * 60 * 24 * 30
				});
				return res.json({success: true, token: token, isEmail: true});
			})
		}else{
			m.generateRandonNum(Kode, 'kode', 5, (err, num) => {
				if(err) return res.status(500).json({error: err});

				let now = new Date(),
				kadaluarsa = new Date();
				kadaluarsa.setTime(now.getTime() + (30 * 60 * 1000));

				let query = { noTlp: eAn},
				newDoc = {
					noTlp: eAn,
					kode: num,
					kadaluarsa: kadaluarsa,
					keperluan: 1
				},
				option = { upsert: true, new: true, setDefaultsOnInsert: true };

				m.customModelUpdateByQuery(Kode, {$and: [query, {done: false}]}, newDoc, option, (err, data) => {
					if(err) return res.status(500).json({error: err});
					return res.json({ success: true, isEmail: false });
				});
			})
		}
	})
})

router.post('/verifykode', (req, res) => {
	const kode = req.body.kode,
				keperluan = req.body.keperluan,
				eAn = req.body.eAn,
				namaLengkap = req.body.namaLengkap;

	m.customModelFindOneByQuery(Kode, {$and: [{$or: [{email: eAn}, {noTlp: eAn}]}, {kode: kode}, {keperluan: keperluan}]}, (err, data) => {
		if(err) return res.status(500).json({error: err});

		if(data){
			if(data.done || new Date() > data.kadaluarsa){
				return res.json({success: false, msg: "Kode Kadaluarsa"})
			}else{
				m.customModelUpdateById(Kode, data._id, {done: true, status: 1}, {new: true}, (err, data) => {
					if(err) return res.status(500).json({error: err});

					if(keperluan == 0){
						let newUser = new User({
							email: eAn,
							namaLengkap: namaLengkap
						})

						m.generalCreateDoc(newUser, (err, data) => {
							if(err) return res.status(500).send({ error : err });

							let populate = []
							m.customModelFindByIdPopulate(User, data._id, populate, (err, data) => {
								if(err) return res.status(500).send({ error : err });

								data = data.toJSON();
								delete data.__v;
								const token = jwt.sign(data, '21061996', {
									expiresIn: 60 * 60 * 24 * 30
								});
								return res.json({success: true, token: token, isEmail: true});
							})
						})
					}else if(keperluan == 1){
						let populate = []
						m.customModelFindOneByQueryPopulate(User, {$or: [{email: eAn}, {noTlp: eAn}]}, populate, (err, data) => {
							if(err) return res.status(500).send({ error : err });
							if(!data) return res.json({success: false, msg: 'Email Atau Nomor Tlp tidak terdaftar', iseAn: true});

							data = data.toJSON();
							delete data.password;
							delete data.__v;
							const token = jwt.sign(data, '21061996', {
								expiresIn: 60 * 60 * 24 * 30
							});
							return res.json({success: true, token: token, isEmail: true});
						})
					}else{
						return res.json({success: false, msg: "keperluan tidak diketahui"})
					}
				});
			}
		}else{
			return res.json({success: false, msg: "Kode Verifikasi Salah"});
		}
	})
})

router.post('/akun/edit', (req, res) => {
	let idUser = req.body.idUser,
			namaLengkap = req.body.namaLengkap,
			noKta = req.body.noKta,
			kwarcab = req.body.kwarcab,
			noTlp = req.body.noTlp,
			alamat = req.body.alamat,
			tglLahir = req.body.tglLahir,
			jenisKelamin = req.body.jenisKelamin,
			email = req.body.email,
			password = req.body.password;

	let update = {
		namaLengkap: namaLengkap,
		noKta: noKta,
		kwarcab: kwarcab,
		noTlp: noTlp,
		alamat: alamat,
		tglLahir: tglLahir,
		jenisKelamin: jenisKelamin,
		email: email
	};

	if(password){ 
		update.password = password;
		m.generatePassHash(update, (err, data) => {
			if(err) return res.status(500).send({ error : err });

			m.customModelUpdateByIdPopulate(User, idUser, data, { upsert: false, new: true, setDefaultsOnInsert: true }, [], (err, data) => {
				if(err) return res.status(500).send({ error : err });

				data = data.toJSON();
				delete data.password;
				delete data.__v;
				if(data.daya) data.daya = Number(data.daya.toString()) / 1000;
				const token = jwt.sign(data, '21061996', {
					expiresIn: 60 * 60 * 24 * 30
				});
				return res.json({success: true, token: token});
			})
		})
	}else{
		m.customModelUpdateByIdPopulate(User, idUser, update, { upsert: false, new: true, setDefaultsOnInsert: true }, [], (err, data) => {
			if(err) return res.status(500).send({ error : err });

			data = data.toJSON();
			delete data.password;
			delete data.__v;
			if(data.daya) data.daya = Number(data.daya.toString()) / 1000;
			const token = jwt.sign(data, '21061996', {
				expiresIn: 60 * 60 * 24 * 30
			});
			return res.json({success: true, token: token});
		})
	}
})
router.post('/akun', (req, res) => {
	let idUser = req.body.idUser;

	if(!idUser) res.json({success: false})
	m.customModelFindById(User, idUser, (err, data) => {
		if(err) return res.status(500).send({ error : err });

		data = data.toJSON();
		if(data.daya) data.daya = Number(data.daya.toString()) / 1000;
		delete data.password;
		delete data.__v;
		const token = jwt.sign(data, '21061996', {
			expiresIn: 60 * 60 * 24 * 30
		});
		return res.json({success: true, token: token});
	})
})

module.exports = router;