-- ============================================================
-- Bank Transaction Monitoring System (BTMS)
-- Database: MySQL 8.x
-- Versi FINAL — merangkum seluruh perubahan sepanjang pengembangan
-- ============================================================

CREATE DATABASE IF NOT EXISTS btms_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE btms_db;

-- ------------------------------------------------------------
-- Table: users
-- Role final: admin, cabang, auditor (supervisor diganti jadi cabang)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,          -- hashed pakai bcrypt
    full_name VARCHAR(100),
    role ENUM('admin', 'cabang', 'auditor') NOT NULL DEFAULT 'auditor',
    kode_cabang VARCHAR(3) DEFAULT NULL,     -- diisi HANYA kalau role = 'cabang', dipakai untuk filter data otomatis
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Table: transactions
-- 25 kolom: 14 mentah dari file + 7 hasil ETL + id/hash/timestamps
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Kolom mentah dari file upload
    vxstat VARCHAR(10),
    vxchnl VARCHAR(20) NOT NULL,
    vxpcod VARCHAR(20),
    vxpdes VARCHAR(255) NOT NULL,
    vxlcdt VARCHAR(6) NOT NULL,              -- format YYMMDD
    vxlctm VARCHAR(20),                      -- panjang fleksibel (data asli tidak selalu 6 digit)
    vxamt DECIMAL(15,2),
    vxamfe DECIMAL(15,2),
    vxaqbn VARCHAR(50),                      -- acquirer bank number
    vxisbn VARCHAR(50),                      -- issuer bank number
    vxdbc_num VARCHAR(50),                   -- rename dari VXDBC / VXDBC#
    vxdbac VARCHAR(50),
    vxb39 VARCHAR(50),
    vxerr VARCHAR(20),                       -- panjang fleksibel

    -- Kolom hasil ETL
    tahun INT,
    bulan INT,
    tanggal INT,
    produk VARCHAR(50),
    kategori VARCHAR(50),
    kode_cabang VARCHAR(3),                  -- 3 digit pertama dari vxdbac
    tgl_full DATE,
    row_hash VARCHAR(32) UNIQUE,             -- MD5, cegah duplikat

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_tahun_bulan (tahun, bulan),
    INDEX idx_vxchnl (vxchnl),
    INDEX idx_produk (produk),
    INDEX idx_kategori (kategori),
    INDEX idx_kode_cabang (kode_cabang),
    INDEX idx_tgl_full (tgl_full),
    INDEX idx_vxpdes (vxpdes(100)),
    INDEX idx_vxstat (vxstat)
);

-- ------------------------------------------------------------
-- Table: upload_logs
-- Histori setiap kali ada yang upload file, termasuk status
-- 'processing' untuk upload async (file besar diproses background)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS upload_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    total_rows_estimate INT DEFAULT NULL,
    uploaded_by INT,
    total_baris_file INT DEFAULT 0,
    berhasil_insert INT DEFAULT 0,
    baris_tidak_valid INT DEFAULT 0,
    duplikat_diskip INT DEFAULT 0,
    status ENUM('processing', 'success', 'partial', 'failed') NOT NULL DEFAULT 'processing',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_created_at (created_at)
);

-- ------------------------------------------------------------
-- Master Data Tables (CRUD lengkap dari menu Master Data)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS master_cabang (
    kode_cabang VARCHAR(3) PRIMARY KEY,
    nama_cabang VARCHAR(100) NOT NULL,
    alamat VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_channel (
    kode_channel VARCHAR(20) PRIMARY KEY,
    nama_channel VARCHAR(100) NOT NULL,
    keterangan VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_produk (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_produk VARCHAR(100) NOT NULL,
    kategori VARCHAR(50) NOT NULL,
    keterangan VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_nama_produk (nama_produk)
);

CREATE TABLE IF NOT EXISTS master_response_code (
    kode VARCHAR(20) PRIMARY KEY,
    keterangan VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_error_code (
    kode VARCHAR(20) PRIMARY KEY,
    keterangan VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- Setting server yang WAJIB diaktifkan untuk fitur upload file besar
-- (LOAD DATA INFILE, dipakai processUploadInBackground di backend)
-- Jalankan terpisah, atau aktifkan permanen lewat MySQL Workbench
-- Server Administration > Options File > local-infile
-- ============================================================
-- SET GLOBAL local_infile = 1;