/**
 * Object for representing a communication with a DB.
 *
 * @author tom@0x101.com
 */

var DataBaseConnection = function(config) {

  /**
   * @var {Object} config
   * These properties are initialized in the child classes.
   */
	this.configuration = {
		hostname: '',
		user: '',
		password: '',
		database:''
	};

	this.dsn = null;

	// Override custom properties
	if (typeof config !== 'undefined') {
		for (var customProperty in config) {
			if (this.configuration.hasOwnProperty(customProperty)) {
				this.configuration[customProperty] = config[customProperty];
			}
		}
	}
};

/**
 * Generic Query operation
 *
 * @param {String} queryString
 * @param {Function} onSuccess
 */

DataBaseConnection.prototype.query = function(queryString, onSuccess) {
};

/**
 * Select operation in the DB.
 *
 * @param {String} queryString
 * @param {Function} onSuccess
 */

DataBaseConnection.prototype.select = function(queryString, onSuccess) {
	this.query(queryString, onSuccess);
};

/**
 * Executes an insert in the DB.
 *
 * @param {String queryString
 * @param {Function} onSuccess
 */

DataBaseConnection.prototype.insert = function(queryString, onSuccess) {
	this.query(queryString, onSuccess);
};

exports.DataBaseConnection = DataBaseConnection;
