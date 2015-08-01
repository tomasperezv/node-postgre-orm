/**
 * Handles the creational logic, allowing to extend the functionality
 * with other DB engines.
 *
 * @author tom@0x101.com
 */

var DataBaseFactory = function() {
  this.POSTGRE = 'postgresql-connection';
};

/**
 * @method get
 * @param {String} type Identifier of the type of DB.
 * @return {DataBaseConnection}
 * @public
 */
DataBaseFactory.prototype.get = function(type) {

  var connection = null;

  switch(type) {
    default:
      case this.POSTGRE:
        var config = require("../config/database.json"),
            database = require('./' + this.POSTGRE);
            connection = new database.PostgreSQLConnection(config);
    break;
  }

  return connection;

};

module.exports = new DataBaseFactory();
