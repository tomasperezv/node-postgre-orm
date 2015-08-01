var User = require('./user');

/**
 * 1. Create a new user in the DB.
 */
var userFactory = new User();
userFactory.addUser('username', 'password');
