/**
 * Handles the creational logic, allowing to extend the functionality
 * with other DB engines.
 *
 * @author tom@0x101.com
 */

this.POSTGRE = 'postgresql-connection';

this.get = function(type) {

	var connection = null;

	switch(type) {
		case this.POSTGRE:
			var Config = require("../config.js"),
				database = require('./' + this.POSTGRE + '.js');
			connection = new database.PostgreSQLConnection(Config.get('database'));
			break;
	}

	return connection;

};
