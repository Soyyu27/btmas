const { sequelize } = require('../config/database');
const User = require('./User');
const Transaction = require('./Transaction');
const UploadLog = require('./UploadLog');
const MasterCabang = require('./MasterCabang');
const MasterChannel = require('./MasterChannel');
const MasterProduk = require('./MasterProduk');
const MasterResponseCode = require('./MasterResponseCode');
const MasterErrorCode = require('./MasterErrorCode');

User.hasMany(UploadLog, { foreignKey: 'uploaded_by' });
UploadLog.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

module.exports = {
  sequelize,
  User,
  Transaction,
  UploadLog,
  MasterCabang,
  MasterChannel,
  MasterProduk,
  MasterResponseCode,
  MasterErrorCode,
};