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
const User = require('../../models/quran/user');

// other server url
const otherServerUrl = "https://mfnizam.com/apps/projectkabeh";

router.post('/pembelian', (req, res) => {
	return res.send('yaaaay')
})

module.exports = router;