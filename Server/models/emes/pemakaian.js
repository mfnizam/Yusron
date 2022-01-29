const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let hourFromNow = function(){
    let date = new Date();
    date.setHours(date.getHours() + 1);
    date.setMinutes(0, 0, 0); // Resets also seconds and milliseconds
    return date;
};

const EmesPemakaianSchema = mongoose.Schema({
	pelanggan: {
		type: Schema.Types.ObjectId, 
		ref: 'Emes_User',
		required: true
	},
	daya: {
		type: Number
	},
	tglStart: {
		type: Date,
		default: Date.now
	},
	tglEnd: {
		type: Date,
		default: hourFromNow
	},
	delete: {
		type: Boolean
	}
})


module.exports = mongoose.model("Emes_Pemakaian", EmesPemakaianSchema);
