const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NizamPengacakanSchema = mongoose.Schema({
	peserta: {
		type: Schema.Types.ObjectId, 
		ref: 'Nizam_User',
		required: true
	},
	materi: {
		type: Schema.Types.ObjectId, 
		ref: 'Nizam_Materi',
		required: true
	},
	urutan: [{
		type: String
	}]
})

module.exports = mongoose.model("Nizam_Pengacakan", NizamPengacakanSchema);