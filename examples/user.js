/**
 * Example of an object model for a table of users.
 *
 * create table users(
 *  id SERIAL PRIMARY KEY,
 *  login text,
 *  password text,
 *  permissions int NULL
 * );
 *
 * GRANT ALL PRIVILEGES ON TABLE users to $user;
 * GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public to $user;
 */
var DataBaseModel = require('../model/database-model');

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

module.exports = User;
