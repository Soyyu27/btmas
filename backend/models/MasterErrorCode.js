const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MasterErrorCode = sequelize.define('MasterErrorCode', {
  kode: { type: DataTypes.STRING(20), primaryKey: true },
  keterangan: { type: DataTypes.STRING(255), allowNull: false },
}, {
  tableName: 'master_error_code', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at',
});

module.exports = MasterErrorCode;