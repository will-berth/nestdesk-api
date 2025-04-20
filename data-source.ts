import 'dotenv/config';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities: [__dirname + '/src/**/models/*.entity{.ts,.js}'],
  migrationsTableName: 'migration',
  migrations: [__dirname + '/src/database/migrations/*{.ts,.js}'],
  synchronize: false,
});
