const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmesTokenSchema = mongoose.Schema({
	nominal: {
		type: Number,
		required: true
	},
	daya: {
		type: Number,
		required: true
	},
	delete: {
		type: Boolean
	}
})

module.exports = mongoose.model("Emes_Token", EmesTokenSchema);