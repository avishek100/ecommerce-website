import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/database.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set to a random value with at least 32 characters.');
}

const port = Number(process.env.PORT ?? 4000);
await connectDatabase(process.env.MONGODB_URI);
app.listen(port, () => console.log(`NovaShop API listening on port ${port}`));
