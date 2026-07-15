const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MasterResponseCode = sequelize.define('MasterResponseCode', {
  kode: { type: DataTypes.STRING(20), primaryKey: true },
  keterangan: { type: DataTypes.STRING(255), allowNull: false },
}, {
  tableName: 'master_response_code', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at',
});

module.exports = MasterResponseCode;