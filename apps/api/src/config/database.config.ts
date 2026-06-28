export const databaseConfig = () => ({
  databaseUrl: process.env.DATABASE_URL || 'postgresql://roomie:localdevpassword@localhost:5433/roomie',
});
