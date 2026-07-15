const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MasterCabang = sequelize.define('MasterCabang', {
  kode_cabang: { type: DataTypes.STRING(3), primaryKey: true },
  nama_cabang: { type: DataTypes.STRING(100), allowNull: false },
  alamat: DataTypes.STRING(255),
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'master_cabang', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at',
});

module.exports = MasterCabang;