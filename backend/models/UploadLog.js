const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UploadLog = sequelize.define('UploadLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  filename: { type: DataTypes.STRING(255), allowNull: false },
  uploaded_by: DataTypes.INTEGER,
  total_baris_file: { type: DataTypes.INTEGER, defaultValue: 0 },
  berhasil_insert: { type: DataTypes.INTEGER, defaultValue: 0 },
  baris_tidak_valid: { type: DataTypes.INTEGER, defaultValue: 0 },
  duplikat_diskip: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('processing', 'success', 'partial', 'failed'),
    defaultValue: 'processing',
  },
  total_rows_estimate: DataTypes.INTEGER,
  error_message: DataTypes.TEXT,
}, {
  tableName: 'upload_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = UploadLog;