const { sequelize } = require('../config/database');
const User = require('./User');
const Transaction = require('./Transaction');

module.exports = {
  sequelize,
  User,
  Transaction,
};