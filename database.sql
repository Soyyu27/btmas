-- ============================================================
-- Bank Transaction Monitoring System (BTMS)
-- Database: MySQL 8.x
-- Versi LENGKAP — Struktur Tabel (DDL) + Data Awal/Seed Data (DML)
-- ============================================================

CREATE DATABASE IF NOT EXISTS btms_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE btms_db;

-- ------------------------------------------------------------
-- Table: users
-- Role final: admin, cabang, auditor
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,          -- hashed menggunakan bcrypt
    full_name VARCHAR(100),
    role ENUM('admin', 'cabang', 'auditor') NOT NULL DEFAULT 'auditor',
    kode_cabang VARCHAR(3) DEFAULT NULL,     -- diisi HANYA kalau role = 'cabang'
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
    vxlctm VARCHAR(20),                      -- panjang fleksibel
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
-- Histori setiap kali upload file, termasuk status 'processing'
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
-- Master Data Tables
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
-- INITIAL SEED DATA (DATA AWAL SYSTEM & MASTER DATA)
-- ============================================================

-- 1. Default Users (Password Hash menggunakan bcrypt)
-- admin / admin123
-- cabang001 / cabang123
-- auditor / auditor123
INSERT INTO users (username, password, full_name, role, kode_cabang, is_active) VALUES
('admin', '$2b$10$DT1K4wq2wTm72mblagCjLelNbQloF3oyiTDCCj1Dr7LG.KYz8k/ru', 'Administrator BTMS', 'admin', NULL, 1),
('cabang001', '$2b$10$quUX/3oDn1q2ook3ggXOje/gIx6EiZiUbEYKGeGZohsf4JtnuP0Mi', 'Petugas Cabang Utama', 'cabang', '001', 1),
('auditor', '$2b$10$lN6AwrY9yxhr2b9W8Oa.xufl9tOywM54RhGRbkKpjNJcCnqHwKBtG', 'Auditor Internal', 'auditor', NULL, 1)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- 2. Master Cabang
INSERT INTO master_cabang (kode_cabang, nama_cabang, alamat, is_active) VALUES
('001', 'Cabang Utama Pekanbaru', 'Jl. Jend. Sudirman No. 462 Pekanbaru', 1),
('002', 'Cabang Batam', 'Jl. Imam Bonjol No. 12 Batam', 1),
('003', 'Cabang Dumai', 'Jl. Sultan Syarif Kasim No. 88 Dumai', 1),
('004', 'Cabang Tanjung Pinang', 'Jl. Teuku Umar No. 15 Tanjung Pinang', 1)
ON DUPLICATE KEY UPDATE nama_cabang = VALUES(nama_cabang);

-- 3. Master Channel
INSERT INTO master_channel (kode_channel, nama_channel, keterangan, is_active) VALUES
('ATM', 'Automated Teller Machine', 'Transaksi via mesin ATM', 1),
('MOBILE', 'Mobile Banking', 'Transaksi via aplikasi Mobile Banking', 1),
('INTERNET', 'Internet Banking', 'Transaksi via Web Portal Internet Banking', 1),
('EDC', 'Electronic Data Capture', 'Transaksi via mesin EDC Merchant', 1),
('TELLER', 'Teller System', 'Transaksi via loket Cabang', 1)
ON DUPLICATE KEY UPDATE nama_channel = VALUES(nama_channel);

-- 4. Master Produk
INSERT INTO master_produk (nama_produk, kategori, keterangan, is_active) VALUES
('Transfer Antar Bank', 'Transfer', 'Transfer dana ke rekening bank lain', 1),
('Transfer Sesama Bank', 'Transfer', 'Transfer dana internal BRK', 1),
('Pembayaran PLN', 'Payment', 'Pembayaran tagihan atau token PLN', 1),
('Tarik Tunai ATM', 'Cash', 'Penarikan uang tunai di mesin ATM', 1),
('Pembelian Pulsa', 'Purchase', 'Pembelian pulsa telco dan paket data', 1)
ON DUPLICATE KEY UPDATE kategori = VALUES(kategori);

-- 5. Master Response Code
INSERT INTO master_response_code (kode, keterangan) VALUES
('00', 'Approve / Success'),
('51', 'Insufficient Balance / Saldo Tidak Cukup'),
('68', 'Time Out / Response Pending'),
('91', 'Issuer / Switch Inoperative'),
('96', 'System Malfunction')
ON DUPLICATE KEY UPDATE keterangan = VALUES(keterangan);

-- 6. Master Error Code
INSERT INTO master_error_code (kode, keterangan) VALUES
('ERR001', 'Connection Timeout'),
('ERR002', 'Invalid Account Number'),
('ERR003', 'Exceed Daily Limit'),
('ERR004', 'System Maintenance')
ON DUPLICATE KEY UPDATE keterangan = VALUES(keterangan);

-- ============================================================
-- Setting Server MySQL (Wajib diaktifkan untuk upload file besar)
-- ============================================================
-- SET GLOBAL local_infile = 1;