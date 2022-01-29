const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// import file
const User = require('../../models/wawan/user');
const Data = require('../../models/wawan/data');
const Module = require('../../models/wawan/module');

//test
router.get('/test-database/:username/:password', (req, res, next) => {
	// express v3
	// const username = req.param("username");
	// const password = req.param("password");

	// express v4
	const username = req.params.username;
	const password = req.params.password;

	Module.cariPenggunaUsername(username, (err, user) => {
		if(err) throw err;
		if(!user){
			return res.json({success: false, msg: 'User tidak ditemukan'});
		}

		Module.comparePassword(password, user.password, (err, isMatch) => {
			if(err) throw err;
			if(isMatch){
				const token = jwt.sign(user.toJSON(), "mfnizam", {
					expiresIn: 604000
				});


				res.json({
					success: true,
					token: 'JWT' + token,
					user: {
						id: user._id,
						nama: user.nama,
						username: user.username,
						email: user.email
					}
				});
			}else{
				return res.json({success: false, msg: 'Password salah'});
			}
		})
	});
});

router.get('/daftar/:nama/:email/:username/:password', (req, res, next) => {
	// router.post('/daftar', (req, res, next) => {
	let userBaru = new User({
		nama: req.params.nama,
		email: req.params.email,
		username: req.params.username,
		password: req.params.password
	});

	Module.tambahUser(userBaru, (err, user) =>{
		if(err){
			res.json({success: false, msg: 'gagal mendaftar'});
		}else{
			res.json({success: true, msg: 'berhasil mendaftar', user })
		}
	});
});

router.get('/masuk/:nama/:password', (req, res, next) => {
	const username = req.params.nama;
	const password = req.params.password;

	Module.cariPenggunaUsername(username, (err, user) => {
		if(err) throw err;
		if(!user){
			return res.json({success: false, msg: 'User ridak ditemukan'});
		}

		Module.comparePassword(password, user.password, (err, isMatch) => {
			if(err) throw err;
			if(isMatch){
				const token = jwt.sign(user.toJSON(), "mfnizam", {
					expiresIn: 604000
				});


				res.json({
					success: true,
					token: 'JWT ' + token,
					user: {
						id: user._id,
						nama: user.nama,
						username: user.username,
						email: user.email
					}
				});
			}else{
				return res.json({success: false, msg: 'Password salah'});
			}
		})
	});
});

router.get('/tambahData', (req, res, next) => {
	let dataBaru = new Data({
		userId : req.query.userId,
		suhu: req.query.suhu,
		kelembaban: req.query.kelembaban,
		ph: req.query.ph,
		tgl: Date.now()
	})

	// let dataBaru = new Data({
	// 	warna: data.warna,
	// 	gas: data.gas,
	// 	dehidrasi: data.dehidrasi,
	// 	tgl: Date.now()
	// });
	
	Module.simpanData(dataBaru, (err, callback) => {
		if(err) throw res.json(err);;
		res.json(callback);
		//console.log(callback);
	});
});

router.get('/getData', (req, res, next) => {
	Module.getData(req.query.userId, (err, data) => {
		if(err) return res.json(err);
		res.json(data);
	})
})

router.get('/', (req,res, next) => {
	res.send('page backend');
});

module.exports = router;