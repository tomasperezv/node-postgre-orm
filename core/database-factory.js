/**
 * Handles the creational logic, allowing to extend the functionality
 * with other DB engines.
 *
 * @author tom@0x101.com
 */

var DataBaseFactory = {};

DataBaseFactory.POSTGRE = 'postgresql-connection';

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
			var Config = require("../../node-config/config"),
				database = require('./' + this.POSTGRE);
			connection = new database.PostgreSQLConnection(Config.get('database'));
			break;
	}

	return connection;

};

module.exports = DataBaseFactory;
