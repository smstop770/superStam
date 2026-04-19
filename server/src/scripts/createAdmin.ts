import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { AdminUser } from '../models';

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.error('Usage: npm run create-admin <username> <password>');
  process.exit(1);
}

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/super-stam';
  await mongoose.connect(uri);

  const existing = await AdminUser.findOne({ username });
  if (existing) {
    console.log(`User "${username}" already exists`);
    process.exit(0);
  }

  const password_hash = await bcrypt.hash(password, 10);
  await new AdminUser({ _id: uuidv4(), username, password_hash }).save();
  console.log(`Admin created: ${username}`);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
