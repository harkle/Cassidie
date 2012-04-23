var events		= require('events'),
	util 		= require('util'),
	mongo		= require('mongodb'),
  	Server		= mongo.Server,
  	Db			= mongo.Db;

var Database = function(server, port, name) {
	events.EventEmitter.call(this);

	this.db = null;

	var database	= new Db(name, new Server(server, port, {auto_reconnect: true}));
	var self 		= this;

	database.open(function(err, database) {
		self.db = database;
		self.emit(Database.IS_READY);
	});

	this.find = function(collection, query, callback) {
		this.db.collection(collection, function(err, collection) {
			if (typeof query === 'function') {
				collection.find().toArray(function(err, docs) {
					query(docs);
				});
			} else {
				collection.find(query).toArray(function(err, doc) {
					callback(doc);
				});
			}
		});
	};

	this.insert = function(collection, data, callback) {
		this.db.collection(collection, function(err, collection) {
		    collection.insert(data, function(err, result) {
		    	callback(result);
		    });
		});
	};

	this.update = function(collection, query, values, callback) {
		this.db.collection(collection, function(err, collection) {
		    collection.update(query, {$set: values}, {upsert: true}, function(err, result) {
		    	callback(result);
		    });
		});
	};

	this.remove = function(collection, query, callback) {
		this.db.collection(collection, function(err, collection) {
		    collection.remove(query, function(err, result) {
		    	callback(result);
		    });
		});		
	};

	this.close = function() {
		if (this.db == undefined) return;
		this.db.close();
	}
}

Database.IS_READY = 'IS_READY';

util.inherits(Database, events.EventEmitter);

module.exports = Database;