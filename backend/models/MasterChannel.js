const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MasterChannel = sequelize.define('MasterChannel', {
  kode_channel: { type: DataTypes.STRING(20), primaryKey: true },
  nama_channel: { type: DataTypes.STRING(100), allowNull: false },
  keterangan: DataTypes.STRING(255),
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'master_channel', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at',
});

module.exports = MasterChannel;