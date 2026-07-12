const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  vxstat: DataTypes.STRING(10),
  vxchnl: { type: DataTypes.STRING(20), allowNull: false },
  vxpcod: DataTypes.STRING(20),
  vxpdes: { type: DataTypes.STRING(255), allowNull: false },
  vxlcdt: { type: DataTypes.STRING(6), allowNull: false },
  vxlctm: DataTypes.STRING(20),
  vxamt: DataTypes.DECIMAL(15, 2),
  vxamfe: DataTypes.DECIMAL(15, 2),
  vxaqbn: DataTypes.STRING(50),
  vxisbn: DataTypes.STRING(50),
  vxdbc_num: DataTypes.STRING(50),
  vxdbac: DataTypes.STRING(50),
  vxb39: DataTypes.STRING(50),
  vxerr: DataTypes.STRING(20),

  tahun: DataTypes.INTEGER,
  bulan: DataTypes.INTEGER,
  tanggal: DataTypes.INTEGER,
  produk: DataTypes.STRING(50),
  kategori: DataTypes.STRING(50),
  kode_cabang: DataTypes.STRING(3),
  tgl_full: DataTypes.DATEONLY,
  row_hash: {
    type: DataTypes.STRING(32),
    unique: true,
  },
}, {
  tableName: 'transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Transaction;