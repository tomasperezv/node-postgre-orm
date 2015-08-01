/**
 * @author tom@0x101.com
 *
 * Base object for representing tables in the DB and perform operations with
 * them.
 *
 * Example: (for a given Post object)
 *
 * posts.load({id: 1},function(data) {
 *  console.log(data);
 * });
 *
 * posts.create({text: 'test'}, function(id) {
 *  console.log('created blog post: ' + id);
 * })
 */

var DataBaseFactory = require('../core/database-factory'),
    DataBaseFormat = require('../core/database-format'),
    cache = require('./cache');

// By default selecting the postgre sql connector.
this.databaseType = DataBaseFactory.POSTGRE;

var DataBaseModel = function(params) {

  if (typeof params === 'undefined') {
    params = {};
  }

  this.options = {
    enableCache: (params.enableCache ? params.enableCache : false)
  };

  this.table = '';
  this.lastQuery = '';
  this.data = [];

  // Store a reference to the cache strategy layer
  this.cache = cache.CacheStrategy;

};

/**
 * Return the contents of the last query executed in the DB as an array of
 * objects. (Each element of the array is a row)
 * @return {Array}
 */
DataBaseModel.prototype.getData = function() {
  var data = [];

  if (this.data.length > 0) {
    data = this.data[0];
  }

  return data;
};

/**
 * Performs a load from the DB depending on the filters that we specify.
 *
 * Example:
 *
 * posts.load({id: 2},function(data) {
 * 	console.log(data);
 * });
 *
 * @param {Array} filters
 * @param {Function} onSuccess
 * @param {Integer} maxItems
 */
DataBaseModel.prototype.load = function(filters, onSuccess, maxItems, orderBy, offset) {

  if (typeof filters === 'undefined') {
    filters = {};
  }

  var cachedData = null;
  var cacheKey = this.cache.getKey(this.table, filters);

  if (this.options.enableCache) {
    // Try to retrieve the data from the cache layer
    cachedData = this.cache.get(cacheKey);
  }

  if (cachedData === null) {

    // The data is not stored in the cache, we need to perform the DB query
    this.lastQuery = this.getLoadQuery(filters, maxItems, orderBy, offset);

    var dataBaseConnection = DataBaseFactory.get(this.databaseType);

    var model = this;

    dataBaseConnection.select(this.lastQuery, function(rows) {
      // Store the result in the cache
      model.cache.set(cacheKey, rows);

      model.data = rows;
      onSuccess(model);

    });

  } else {
    this.data = cachedData;
    onSuccess(this);
  }


};

/**
 * @author tom@0x101.com
 * @param {Object} data
 * @param {Function} onSuccess
 * @public
 */
DataBaseModel.prototype.createAndLoad = function(data, onSuccess) {

  var self = this;
  this.create(data, function(id) {

    self.lastQuery = self.getLoadQuery({id: id}, 1);

    var dataBaseConnection = DataBaseFactory.get(this.databaseType);

    dataBaseConnection.select(self.lastQuery, function(rows) {
      onSuccess(rows.length > 0 ? rows[0] : {});
    });

  });
};

/**
 * Add a new register in the DB:
 *
 * posts.create({text: 'test'}, function(id) {
 * 	console.log('created: ' + id);
 * })
 *
 * It passes the id of the row created to the callback.
 *
 * @param {Object} data
 * @param {Function} onSuccess
 */
DataBaseModel.prototype.create = function(data, onSuccess) {

  this.lastQuery = this.getInsertQuery(data);

  var dataBaseConnection = DataBaseFactory.get(this.databaseType);
  dataBaseConnection.insert(this.lastQuery, function(result) {
    if (typeof onSuccess === 'function') {
      onSuccess(result[0].id);
    }
  });
};

/**
 * Performs an update operation.
 * @param {Object} data
 * @param {Function} onSuccess
 */
DataBaseModel.prototype.update = function(data, onSuccess) {

  this.lastQuery = this.getUpdateQuery(data);

  var dataBaseConnection = DataBaseFactory.get(this.databaseType);
  dataBaseConnection.insert(this.lastQuery, function() {
    onSuccess(data);
  });
};

/**
 * Performs a remove operation.
 * @param {Object} data
 * @param {Function} onSuccess
 */
DataBaseModel.prototype.remove = function(data, onSuccess) {
  this.lastQuery = this.getRemoveQuery(data);

  var dataBaseConnection = DataBaseFactory.get(this.databaseType);
  dataBaseConnection.select(this.lastQuery, function() {
    if (typeof onSuccess === 'function') {
      onSuccess(data.id);
    }
  });
};

/**
 * Performs a count operation.
 * @param {Object} data
 * @param {Function} onSuccess
 */
DataBaseModel.prototype.count = function(filters, onSuccess) {

  // First try to retrieve the data from the cache layer
  var cacheKey = this.cache.getKey(this.table + '_count', filters);
  var cachedData = this.cache.get(cacheKey);

  if (cachedData === null) {

    this.lastQuery = this.getCountQuery(filters);

    var self = this;

    var dataBaseConnection = DataBaseFactory.get(this.databaseType);
    dataBaseConnection.select(this.lastQuery, function(rows) {

      var count = rows.length > 0 ? rows[0].count : 0;

      // Store the result in cache
      self.cache.set(cacheKey, count);
      if (typeof onSuccess === 'function') {
        onSuccess(count);
      }

    });

  } else {
    onSuccess(cachedData);
  }

};

/**
 * Builds and insert query.
 *
 * @param {Object} data
 * @return {String}
 */
DataBaseModel.prototype.getInsertQuery = function(data) {

  var numFields = Object.keys(data).length;

  var query = 'INSERT INTO ' + this.table;

  query += '(id, ';
  var currentPosition = 0;
  for (var fieldName in data) {
    query += fieldName;

    currentPosition++;

    if (currentPosition < numFields) {
      query += ',';
    }
  }

  query += ')';

  query += ' VALUES(DEFAULT, ';

  currentPosition = 0;

  for (fieldName in data) {

    var value = data[fieldName];

    if (typeof value === 'string') {
      // Fix quotes
      query += '\'' + DataBaseFormat.escape(value) + '\'';
    } else {
      query += value;
    }

    currentPosition++;

    if (currentPosition < numFields) {
      query += ',';
    }
  }

  query += ') RETURNING id;';

  return query;	
};

/**
 * Returns a remove operation.
 *
 * @param {Object} data
 * @return {String}
 */
DataBaseModel.prototype.getRemoveQuery = function(data) {
  return 'DELETE FROM ' + this.table + ' WHERE id = ' + data.id;
};

/**
 * Returns an update query.
 *
 * @param {Object} data
 * @return {String}
 */
DataBaseModel.prototype.getUpdateQuery = function(data) {

  var numFields = Object.keys(data).length;

  var query = 'UPDATE ' + this.table;

  query += ' SET ';
  var currentPosition = 0;
  for (var fieldName in data) {

    var value = data[fieldName];

    query += fieldName + ' = ';

    if (typeof value === 'string') {
      query += '\'' + DataBaseFormat.escape(value) + '\'';
    } else {
      query += value;
    }

    currentPosition++;

    if (currentPosition < numFields) {
      query += ',';
    }
  }

  query += ' WHERE id = ' + data.id;

  query += ';';

  return query;	
};

/**
 * Builds a simple SELECT query.
 *
 * @param {Object} filters
 * @param {Integer} maxItems
 * @param {Object} orderBy
 * @param {Number} offset
 * @return {String}
 */
DataBaseModel.prototype.getLoadQuery = function(filters, maxItems, orderBy, offset) {

  var query = 'SELECT * FROM ' + this.table + ' WHERE ';
  query = this._applyFilters(query, filters);

  if (typeof orderBy !== 'undefined') {
    query += ' ORDER BY ' + orderBy.column + " " + orderBy.type;
  }

  if (typeof maxItems !== 'undefined') {
    query += ' LIMIT ' + maxItems;
  }

  if (typeof offset !== 'undefined') {
    query += ' OFFSET ' + offset;
  }

  query += ';';

  return query;
};

/**
 * Extend a query adding information about field filters.
 */
DataBaseModel.prototype._applyFilters = function(query, filters) {

  if (Object.keys(filters).length === 0) {
    query += 'TRUE';
  } else {

    var first = true;

    for (var fieldName in filters) {

      if (typeof filters[fieldName] !== undefined) {
        if (!first) {
          query += ' AND ';
        }

        query += fieldName + ' = ' + "'" + filters[fieldName] + "'";	

        first = false;
      }

    }

    if (first) {
      // No valid filters applied
      query += 'TRUE';
    }

  }

  return query;
};

/**
 * Count the number of rows in a table
 */
DataBaseModel.prototype.getCountQuery = function(filters) {
  var query = 'SELECT COUNT(*) FROM ' + this.table + ' WHERE ';
  query = this._applyFilters(query, filters);

  query += ';';
  return query;
};


/**
 * Generate a random string
 * @method getRandomString
 * @return {String}
 */
DataBaseModel.prototype.getRandomString = function() {

  var chars, rand, i, salt, bits;

  chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  salt = '';
  bits = 512;

  // In v8, Math.random() yields 32 pseudo-random bits (in spidermonkey it gives 53)
  while (bits > 0) {
    rand = Math.floor(Math.random() * 0x100000000);

    for (i = 26; i > 0 && bits > 0; i -= 6, bits -= 6) {
      salt += chars[0x3F & rand >>> i];
    }
  }

  return salt;
};

// Expose the module externally
exports.DataBaseModel = DataBaseModel;
