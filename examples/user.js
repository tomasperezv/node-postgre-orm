/**
 * Example of an object model for a table of users.
 *
 * create table users(
 * 	id int not null,
 *	login string,
 *	password string,
 * 	permissions int
 * );
 */
var DataBaseModel = require('./database-model');

User = function() {

	DataBaseModel.DataBaseModel.call(this);
	this.table = 'users';

}

User.prototype = new DataBaseModel.DataBaseModel(); 

User.prototype.addUser = function(login, password, callback) {

	if (typeof login !== 'undefined' && typeof password !== 'undefined') {

		this.create({login:login, password:password}, function(userId) {
			console.log('Created user ' + userId);
		});

	} else {
		callback({});
	}

};

User.prototype.getByLogin = function(login, callback) {
	this.load({login: login}, function(results) {
		callback(results.data.length > 0 ? results.data[0] : {});
	});	
};

exports.User = User;
