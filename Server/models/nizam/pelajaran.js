const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NizamPelajaranSchema = mongoose.Schema({
	nama: {
		type: String,
		required: true
	},
	pelatihan: {
		type: Schema.Types.ObjectId, 
		ref: 'Nizam_Pelatihan',
		required: true
	},
	pengajar: {
		type: Schema.Types.ObjectId, 
		ref: 'Nizam_User',
		required: true
	},
	materi: [{
		type: Schema.Types.ObjectId, 
		ref: 'Nizam_Materi',
	}],
	delete: Boolean
})

module.exports = mongoose.model("Nizam_Pelajaran", NizamPelajaranSchema);