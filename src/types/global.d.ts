declare global {
    namespace NodeJS {
      interface ProcessEnv {
        NODE_ENV: 'development' | 'production' | 'test';
        PORT?: string;
        JWT_SECRET: string;
        DB_CONNECTION_STRING: string;
        // Add any additional environment variables here
      }
    }
  }
  
  export {};
  