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
const Pembelian = require('../../models/emes/pembelian');
const Pemakaian = require('../../models/emes/pemakaian');
const Reservasi = require('../../models/emes/reservasi');

// other server url
const otherServerUrl = "https://mfnizam.com/apps/projectkabeh";

router.post('/pembelian', (req, res) => {
	let idUser = req.body.idUser;

	if(!idUser) return res.json({success: false, msg: "Lengkapi pembelian"})
	m.customModelFindByQueryPopulateLean(Pembelian, {pembeli: idUser}, ['pembeli', 'token'], (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, pembelian: data.map(v => {
			if(v.daya) v.daya = v.daya / 1000;
			if(v.token.daya) v.token.daya = v.token.daya / 1000;
			return v;
		})})
	})
})

router.post('/pemakaian', (req, res) => {
	let idUser = req.body.idUser;

	if(!idUser) return res.json({success: false, msg: "Lengkapi pemakaian"})
	m.customModelFindByQuerySort(Pemakaian, {pelanggan: idUser}, '-tglEnd', (err, data) => {
		if(err) return res.status(500).send({ error : err });
		return res.json({success: true, pemakaian: data })
	})
})

router.post('/reservasi/filter', (req, res) => {
	let filter = req.body.filter;
	
	if(!filter) return res.json({success: false, msg: "Lengkapi filter"})

	filter.delete = {$ne: true};
	m.customModelFindOneByQueryPopulateLean(Reservasi, filter, ['pelanggan', {path: 'properti', populate: 'device'}], (err, data) => {
		if(err) return res.status(500).send({ error : err });
		if(data.pelanggan.daya) data.pelanggan.daya = Number(data.pelanggan.daya.toString()) / 1000;
		return res.json({success: true, reservasi: data})
	})
})

module.exports = router;