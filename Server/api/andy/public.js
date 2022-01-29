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
const User = require('../../models/andy/user'),
			Histori = require('../../models/andy/histori'),
			Setting = require('../../models/andy/setting');

// other server url
const otherServerUrl = "https://mfnizam.com/apps/projectkabeh";

router.post('/histori', (req, res) => {
	m.customModelFindByQuery(Histori, {}, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, histori: data})
	})
})

router.post('/setting', (req, res) => {
	m.customModelFindByQuery(Setting, {}, (err, data) => {
		if(err) return res.status(500).send({ error : err });	
		return res.json({success: true, setting: data})
	})
})

router.post('/setting/cu', (req, res) => {
	let jenis = req.body.jenis,
			nilai = req.body.nilai;

	if(!jenis || !nilai) return res.json({success: false, msg: 'Lengkapi Setting'});

	m.customModelUpdateByQuery(Setting, {jenis: jenis}, {jenis: jenis, nilai: nilai}, { upsert: true, new: true, setDefaultsOnInsert: true }, (err, data) => {
		if(err) return res.status(500).send({ error : err });
		req.app.mt.publish('andy/' + jenis, nilai.toString());
		return res.json({success: true, setting: data})
	})
})

module.exports = router;