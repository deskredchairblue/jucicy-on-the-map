import http from 'http';
import app from './app';
import { connectDatabase } from './database';

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await connectDatabase();
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log('Core Node running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
