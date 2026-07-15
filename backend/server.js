const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const masterDataRoutes = require('./routes/masterDataRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend BTMS jalan normal', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/dashboard', analyticsRoutes);
app.use('/api/master', masterDataRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await testConnection();

  // Sync model ke tabel yang sudah ada (tidak akan overwrite/drop tabel)
  await sequelize.sync({ alter: false });
  console.log('✅ Models synced.');
});

const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await testConnection();
  await sequelize.sync({ alter: false });
  console.log('✅ Models synced.');
});

server.timeout = 10 * 60 * 1000; // 10 menit