const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const randomNumber = require("random-number-csprng");

const mainModuleExports = module.exports = {};

// find module
mainModuleExports.customModelFindById = (model, id, callback) => {
	model.findById(id, callback);
}
mainModuleExports.customModelFindByIdSelect = (model, id, select, callback) => {
	model.findById(id).select(select).exec(callback)
}
mainModuleExports.customModelFindByIdPopulate = (model, id, populateQuery, callback) => {
	model.findById(id).populate(populateQuery).exec(callback);
}
mainModuleExports.customModelFindByIdLean = (model, id, callback) => {
	model.findById(id).lean().exec(callback);
}
mainModuleExports.customModelFindByIdSelectPopulate = (model, id, select, populateQuery, callback) => {
	model.findById(id).select(select).populate(populateQuery).exec(callback)
}
mainModuleExports.customModelFindByIdSelectLean = (model, id, select, callback) => {
	model.findById(id).select(select).lean().exec(callback)
}
mainModuleExports.customModelFindByIdPopulateLean = (model, id, populateQuery, callback) => {
	model.findById(id).populate(populateQuery).lean().exec(callback);
}
mainModuleExports.customModelFindByIdSelectPopulateLean = (model, id, select, populateQuery, callback) => {
	model.findById(id).select(select).populate(populateQuery).lean().exec(callback)
}

mainModuleExports.customModelFindByQuery = (model, query, callback) => {
	model.find(query, callback);
}
mainModuleExports.customModelFindByQuerySelect = (model, query, select, callback) => {
	model.find(query).select(select).exec(callback);
}
mainModuleExports.customModelFindByQueryPopulate = (model, query, populateQuery, callback) => {
	model.find(query).populate(populateQuery).exec(callback);
}
mainModuleExports.customModelFindByQuerySort = (model, query, sort, callback) => {
	model.find(query).sort(sort).exec(callback);
}
mainModuleExports.customModelFindByQueryLean = (model, query, callback) => {
	model.find(query).lean().exec(callback);
}
mainModuleExports.customModelFindByQuerySelectPopulate = (model, query, select, populateQuery, callback) => {
	model.find(query).select(select).populate(populateQuery).exec(callback);
}
mainModuleExports.customModelFindByQuerySelectLean = (model, query, select, callback) => {
	model.find(query).select(select).lean().exec(callback);
}
mainModuleExports.customModelFindByQueryPopulateLean = (model, query, populateQuery, callback) => {
	model.find(query).populate(populateQuery).lean().exec(callback);
}
mainModuleExports.customModelFindByQuerySelectPopulateLean = (model, query, select, populateQuery, callback) => {
	model.find(query).select(select).populate(populateQuery).lean().exec(callback);
}
mainModuleExports.customModelFindOneByQuery = (model, query, callback) => {
	model.findOne(query, callback);	
}
mainModuleExports.customModelFindOneByQueryPopulate = (model, query, populateQuery, callback) => {
	model.findOne(query).populate(populateQuery).exec(callback);
}
mainModuleExports.customModelFindOneByQueryPopulateLean = (model, query, populateQuery, callback) => {
	model.findOne(query).populate(populateQuery).lean().exec(callback);
}

// create module
mainModuleExports.generalCreateDoc = (doc, callback) => {
	doc.save(callback);
}
mainModuleExports.customModelInsertMany = (model, doc, callback) => {
	model.insertMany(doc, callback);
}


// update module
mainModuleExports.customModelUpdateById = (model, id, update, option, callback) => {
	model.findByIdAndUpdate(id, update, option, callback);
}
mainModuleExports.customModelUpdateByIdPopulate = (model, id, update, option, populateQuery, callback) => {
	model.findByIdAndUpdate(id, update, option).populate(populateQuery).exec(callback);
}
mainModuleExports.customModelUpdateByIdSelectAndPopulate = (model, id, update, option, select, populateQuery, callback) => {
	model.findByIdAndUpdate(id, update, option).select(select).populate(populateQuery).exec(callback);
}

mainModuleExports.customModelUpdateByQuery = (model, query, update, option, callback) => {
	model.findOneAndUpdate(query, update, option, callback)
}
mainModuleExports.customModelUpdateByQueryPopulate = (model, query, update, option, populateQuery, callback) => {
	model.findOneAndUpdate(query, update, option).populate(populateQuery).exec(callback);
}

mainModuleExports.customModelUpdateManyByQuery = (model, query, update, option, callback) => {
	model.updateMany(query, update, option, callback)
}


// delete module
mainModuleExports.customModelDeleteById = (model, id, callback) => {
	model.findByIdAndRemove(id, callback);
}
mainModuleExports.customModelDeleteByQuery = (model, query, callback) => {
	model.deleteMany(query, callback)
}
mainModuleExports.customModelDeleteOneByQuery = (model, query, callback) => {
	model.findOneAndRemove(query, callback);
}


// aggregate module
mainModuleExports.customModelAggregate = (model, aggregate, callback) => {
	model.aggregate(aggregate, callback)
}

// bulk write
mainModuleExports.customModelBulkWrite = (model, bulk) => {
	return model.bulkWrite(bulk)
}

// other module
mainModuleExports.generatePassHash = (doc, callback) => {
	bcrypt.genSalt(10, (err, salt) => {
		bcrypt.hash(doc.password, salt, (err, hash) => {
			if(err) return callback(err, null);
			doc.password = hash;
			callback(null, doc);
		});
	})
}
mainModuleExports.comparePassHash = function (pass, hash, callback){
  bcrypt.compare(pass, hash, function(err, ismatch) {
    if(err) throw err;
    callback(null, ismatch);
  });
}
mainModuleExports.generateRandonNum = (model, keyfind, retryTimes, callback) => {
  let cntr = 0;
  function run() {
    ++cntr;
  	randomNumber(1000, 9999, (err, num) => {
			if(err) callback(err);
			
			var query = {};
			query[keyfind] = num;
			
			model.findOne({$and: [query, {done: true}]}, (err, data) => {
				if(err) callback(err);

				if(data && new Date < data.kadaluarsa){
					if (cntr >= retryTimes) {
						callback("sudah dipakai");
					} else {
						run();
					}
				}else{
					callback(null, num);
				}
			});
		})
  }
  run();
}
