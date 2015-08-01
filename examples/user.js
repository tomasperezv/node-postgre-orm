/**
 * Example of an object model for a table of users.
 *
 * create table users(
 *  id int not null,
 *  login string,
 *  password string,
 *  permissions int
 * );
 */
var DataBaseModel = require('./database-model');

var User = function() {

  DataBaseModel.DataBaseModel.call(this);
  this.table = 'users';

};

User.prototype = new DataBaseModel.DataBaseModel();

/**
 * @method addUser
 * @param {String} login
 * @param {String} password
 * @param {Function} callback
 * @public
 */
User.prototype.addUser = function(login, password, callback) {

  if (typeof login !== 'undefined' && typeof password !== 'undefined') {

    this.create({login:login, password:password}, function(userId) {
      console.log('Created user ' + userId);
    });

  } else {
    callback({});
  }

};

/**
 * @method getByLogin
 * @param {String} login
 * @param {Function} callback
 * @public
 */
User.prototype.getByLogin = function(login, callback) {
  this.load({login: login}, function(results) {
    callback(results.data.length > 0 ? results.data[0] : {});
  });
};

exports.User = User;
