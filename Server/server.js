const app = require('express')(),
			path = require('path'),
			http = require('http').Server(app),
			bodyParse = require('body-parser'),
			cors = require('cors'),
			passport = require('passport'),
			util = require('util'),
			mongoose = require('mongoose'),
			io = require('socket.io')(http, /*{ cors: { origin: "*:*", methods: ["GET", "POST"] }}*/),
			mqtt = require('mqtt'),
			schedule = require('node-schedule');

const m = require('./module'),
			Histori = require('./models/andy/histori'),
			Setting = require('./models/andy/setting'),
			Device = require('./models/emes/device'),
			Properti = require('./models/emes/properti'),
			Reservasi = require('./models/emes/reservasi'),
			Pemakaian = require('./models/emes/pemakaian'),
			User = require('./models/emes/user');

// ========= MongoDB Setup ==========
mongoose.connect(
	// "mongodb+srv://nizam:nizam@projectone.wyqkm.mongodb.net/projectkabeh?ssl=true&retryWrites=true&w=majority", 
	"mongodb://nizam:nizam@projectone-shard-00-00.wyqkm.mongodb.net:27017,projectone-shard-00-01.wyqkm.mongodb.net:27017,projectone-shard-00-02.wyqkm.mongodb.net:27017/projectkabeh?ssl=true&replicaSet=atlas-ut9g1l-shard-0&authSource=admin&retryWrites=true&w=majority",
{ 
	useNewUrlParser: true, 
	useUnifiedTopology: true, 
	useFindAndModify: false,
	// socketTimeoutMS: 45000,
  keepAlive: true,
});

mongoose.connection.on('connected', () => { console.log('database connected'); });
mongoose.connection.on('error', (err) => { console.log('database error ' + err); });
// ========== Server Main ===========
app.use(cors());
app.options('*', cors());
app.use(bodyParse.json());
app.use(passport.initialize());
app.use(passport.session());
require('./passport')(passport);

// nizam
const nizamauth = require('./api/nizam/auth');
app.use('/nizam/auth', nizamauth);
const nizamadmin = require('./api/nizam/admin');
app.use('/nizam/api/admin', nizamadmin);
const nizampublic = require('./api/nizam/public');
app.use('/nizam/api', nizampublic);

// yusron
const yusronauth = require('./api/yusron/auth');
app.use('/yusron/auth', yusronauth);
const yusronadmin = require('./api/yusron/admin');
app.use('/yusron/api/admin', yusronadmin);
const yusronpublic = require('./api/yusron/public');
app.use('/yusron/api', yusronpublic);

//emes
const emesauth = require('./api/emes/auth');
app.use('/emes/auth', emesauth);
const emesadmin = require('./api/emes/admin');
app.use('/emes/api/admin', emesadmin);
const emespublic = require('./api/emes/public');
app.use('/emes/api', emespublic);

//andy
const andyauth = require('./api/andy/auth');
app.use('/andy/auth', andyauth);
const andypublic = require('./api/andy/public');
app.use('/andy/api', andypublic);

//quran
const quranauth = require('./api/quran/auth');
app.use('/quran/auth', quranauth);
const quranadmin = require('./api/quran/admin');
app.use('/quran/api/admin', quranadmin);
const quranpublic = require('./api/quran/public');
app.use('/quran/api', quranpublic);

//wawan
const wawanauth = require('./api/wawan/backend');
app.use('/wawan/backend', wawanauth);


// socket all
let andy_status = false,
		andy_suhu = 0.00,
		andy_kelembaban = 0.00,
		andy_s_kipas = 0,
		andy_s_lampu = 0,
		andy_s_mist = 0,
		// emes_daya_saatini = {},
		// emes_daya_rata = {},
		emes_s_relay = 0;

io.of('/andy').on('connection', (socket) => { 
	socket.emit('s_kipas', andy_s_kipas);
	socket.emit('s_lampu', andy_s_lampu);
	socket.emit('s_mist', andy_s_mist);
	socket.on('disconnect', () => { 
		socket.of('/andy').removeAllListeners(); 
	}) 
});
io.of('/emes').on('connection', (socket) => { 
	socket.emit('relay', emes_s_relay);
	socket.on('disconnect', () => { io.of('/emes').removeAllListeners(); }) 
});
io.of('/wawan').on('connection', (socket) => {
	console.log('wawan connect')
	socket.on('disconnect', () => { 
		socket.removeAllListeners(); 
	}) 
})
io.of('/air').on('connection', (socket) => {
	console.log('air connect');
	setInterval(_ => {
		socket.emit('device1/ph', (Math.random() * (7.5 - (7)) + (7))); //7,8
		socket.emit('device1/suhu', 26/*(Math.random() * (32 - (28)) + (28))*/);
		socket.emit('device1/salinitas', (Math.random() * (36 - (35)) + (35))); //33, 37
		socket.emit('device1/oksigen', (Math.random() * (5 - (4)) + (4))); //4, 5
	}, 1000)
	socket.on('disconnect', () => { 
		socket.removeAllListeners(); 
		console.log('disconnect air')
	}) 
})
io.of('/radar').on('connection', (socket) => {
	console.log('radar connect');
	socket.on('disconnect', () => { 
		socket.removeAllListeners(); 
	}) 
})


// mqtt all
const mt = mqtt.connect({ port: 15171, host: 'postman.cloudmqtt.com', username: 'cxkxhxmk', password: 'Tg7oEevFtLRS', clientId: 'server',});
app.mt = mt;
mt.on('connect', (data) => { /*console.log('mqtt clien connect')*/ });
mt.on('disconnect', (data) => { /*console.log('mqtt clien disconnect')*/ });
mt.on('error', (data) => { /*console.log('mqtt clien err')*/ });

mt.subscribe('andy/suhu', (err, granted) => {});
mt.subscribe('andy/kelembaban', (err, granted) => {});
mt.subscribe('andy/data-set', (err, granted) => {});
mt.subscribe('andy/s_lampu', (err, granted) => {});
mt.subscribe('andy/s_kipas', (err, granted) => {});
mt.subscribe('andy/s_mist', (err, granted) => {});

mt.subscribe('emes/+/daya', (err, granted) => {});
mt.subscribe('emes/+/daya/+', (err, granted) => {});

// mt.publish('emes/VLBCT6A/daya/menit', null, {retain: true});

mt.subscribe('wawan/api', (err, granted) => {});
mt.subscribe('wawan/kelembaban', (err, granted) => {});
mt.subscribe('wawan/suhu', (err, granted) => {});
mt.subscribe('wawan/asap', (err, granted) => {});


mt.on('message', (topic, message, packet) => {

	topic = topic.split('/');

	if(topic[0] == 'andy'){
		if(topic[1] == 'suhu'){
			let msuhu = message.toString('utf8');
			io.of('/andy').emit('suhu', msuhu);
			andy_suhu = Number(msuhu);
		}else if(topic[1] == 'kelembaban'){
			let mkelembaban = message.toString('utf8');
			io.of('/andy').emit('kelembaban', mkelembaban);
			andy_kelembaban = Number(mkelembaban);
		}else if(topic[1] == 'data-set'){
			console.log('date set requeset')
			m.customModelFindByQuery(Setting, {}, (err, data) => {
				if(err) return console.log('gagal mengambil dataset');
				let kipas = data.find(v => v.jenis == 'kipas'),
				mist = data.find(v => v.jenis == 'mist'),
				lampu = data.find(v => v.jenis == 'lampu');
				mt.publish('andy/kipas', (kipas? kipas.nilai : 0).toString());
				mt.publish('andy/mist', (mist? mist.nilai : 0).toString());
				mt.publish('andy/lampu', (lampu? lampu.nilai : 0).toString());
			})
		}else if(topic[1] == 's_kipas'){
			andy_s_kipas = message.toString('utf8');
			io.of('/andy').emit('s_kipas', andy_s_kipas);
		}else if(topic[1] == 's_lampu'){
			andy_s_lampu = message.toString('utf8')
			io.of('/andy').emit('s_lampu', andy_s_lampu);
		}else if(topic[1] == 's_mist'){
			andy_s_mist = message.toString('utf8')
			io.of('/andy').emit('s_mist', andy_s_mist);
		}	
	}else if(topic[0] == 'emes'){
		if(topic[2] == 'daya'){
			if(!topic[3]){
				io.of('/emes').emit(topic[1] + '/daya', Number(message.toString('utf8')));
			}else if(topic[3] == 'menit'){
				let mdaya = Number(message.toString('utf8'));
				if(isNaN(mdaya)) return;
				// console.log(mdaya, topic)
				m.customModelFindOneByQuery(Device, {kode: topic[1]}, (err, data) => {
					if(err) return console.log(err, 'err penyimpanan penggunaan per menit device ' + topic[1]);
					if(!data) return console.log('device ' + topic[1] + ' tidak terdaftar');

					m.customModelFindOneByQuery(Properti, {device: data._id}, (err, data) => {
						if(err) return console.log(err, 'err penyimpanan penggunaan per menit device ' + topic[1]);
						if(!data) return console.log('properti device ' + topic[1] + ' tidak terdaftar');

						m.customModelFindOneByQuery(Reservasi, {tglWaktuCheckOut: null, properti: data._id, delete: {$ne: true}}, (err, data) => {
							if(err) return console.log(err, 'err penyimpanan penggunaan per menit device ' + topic[1]);
							if(!data) return console.log('Reservasi device ' + topic[1] + ' tidak terdaftar');

							m.customModelUpdateById(User, data.pelanggan, {$inc: {daya: -Math.abs(mdaya)}}, { new: true, setDefaultsOnInsert: true }, (err, data) => {
								if(err) return console.log(err, 'err penyimpanan penggunaan per menit device ' + topic[1]);
								if(!data) return console.log('User ' + topic[1] + ' tidak terdaftar');

								m.customModelUpdateByQuery(Pemakaian, {
									pelanggan: data._id,
									tglStart: { $gte: new Date().setMinutes(0,0,0) }, 
									tglEnd: { $lt: new Date().setHours(new Date().getHours() + 1, 1, 0, 0)}
								}, {
									$inc: {daya: mdaya}
								}, { upsert: true, new: true, setDefaultsOnInsert: true }, (err, data) => {
									if(err) console.log(err, 'err penyimpanan penggunaan per menit untuk perjam device ' + topic[1]);
									if(new Date(data.tglStart).getMinutes() == new Date().getMinutes()){
										io.of('/emes').emit(topic[1] + '/update/jam', true);
									}
									return io.of('/emes').emit(topic[1] + '/update/menit', {_id: data._id, daya: data.daya});
								})

								return io.of('/emes').emit(topic[1] + '/daya/menit', Number(data.daya) / 1000);
							})
						})
					})
				})
			}
		}
	}else if(topic[0] == 'wawan'){
		if(topic[1] == 'api'){
			let wmapi = message.toString('utf8');
			io.of('/wawan').emit('api', wmapi);
		}else if(topic[1] == 'kelembaban'){
			wmkelembaban = Number(Number(scale(message.toString('utf8'), 0, 1023, 100, 0)).toFixed(2));
			wmkelembaban = wmkelembaban > 100? 100 : wmkelembaban < 0? 0 : wmkelembaban;
			io.of('/wawan').emit('kelembaban', wmkelembaban);
		}else if(topic[1] == 'kelembaban'){
			let wmasap = message.toString('utf8');
			io.of('/wawan').emit('asap', wmasap);
		}else if(topic[1] == 'kelembaban'){
			let wmsuhu = message.toString('utf8');
			io.of('/wawan').emit('suhu', wmsuhu);
		}
	}else if(topic[0] == 'air'){
		if(topic[1] == 'ph'){

		}else if(topic[1] == 'suhu'){

		}else if(topic[1] == 'salinitas'){

		}else if(topic[1] == 'oksigen'){
			
		}
	}
});

// scedule job
// const jobHalfHour = schedule.scheduleJob('*/30 * * * *', function(fireDate){
// 	let waktu = new Date();
// 	io.of('/andy').emit('suhu/simpan/setJam', { nilai: andy_suhu, tgl: waktu });

// 	m.customModelUpdateByQuery(Histori, 
// 		{ tgl: { $gte: new Date(waktu.setMinutes(waktu.getMinutes() - 1)), $lt: new Date(waktu.setMinutes(waktu.getMinutes() + 1))} }, 
// 		{ nilai: andy_suhu }, (err, data) => {
// 			if(err) return console.log('err save data on ' + waktu.getHours() + ':' + waktu.getMinutes(), err);
// 		})

// 	// mt.publish("emes/reset/totaldaya", "1");// ganti wild card
// 	// console.log('sudah 30 menit')
// });

app.get('/', function (req, res) { res.send('Hai.. \nPlease go to mfnizam.com') })
var server = http.listen(process.env.PORT || 3000, function () { 
 	console.log('App listening at port 3000');  
});

app.get('*', (req, res) => {
	res.redirect('/');
})