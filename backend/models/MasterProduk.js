const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MasterProduk = sequelize.define('MasterProduk', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama_produk: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  kategori: { type: DataTypes.STRING(50), allowNull: false },
  keterangan: DataTypes.STRING(255),
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'master_produk', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at',
});

module.exports = MasterProduk;