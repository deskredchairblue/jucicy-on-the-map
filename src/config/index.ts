import { env } from './env';

const config = {
  environment: env.NODE_ENV,
  port: env.PORT,
  database: {
    url: env.DATABASE_URL,
  },
  cors: {
    origin: env.CORS_ORIGIN,
  },
  jwt: {
    secret: env.JWT_SECRET,
  },
  // Add further configuration grouping as necessary
};

export default config;
