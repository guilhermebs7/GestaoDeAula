const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const planosRoutes = require('./routes/planosRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on('finish', () => {
    const latencyMs = Date.now() - startedAt;
    console.log(`[INFO] HTTP Request: Method=${req.method}, Path="${req.originalUrl}", Status=${res.statusCode}, Latency=${latencyMs}ms`);
  });

  next();
});

app.get('/health', (req, res) => {
  console.log('[INFO] Health Check: Status=ok');
  return res.status(200).json({
    status: 'ok',
    message: 'API online',
    uptime: process.uptime()
  });
});

app.use('/planos', planosRoutes);
app.use('/ai', aiRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});