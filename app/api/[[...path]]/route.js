import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';
import { v2 as cloudinary } from 'cloudinary';

// Defensive: an undefined MONGO_URL makes the Mongo driver throw the cryptic
// "Cannot read properties of undefined (reading 'startsWith')". Fallback + warn.
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
if (!process.env.MONGO_URL) {
  console.warn('[Config] MONGO_URL no está definida en las variables de entorno. Usando mongodb://localhost:27017 como respaldo.');
}
const DB_NAME = process.env.DB_NAME || 'ubik2_yemg';
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-me';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SEED_SECRET = (process.env.SEED_SECRET || '').trim();
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const RESEND_FROM_NAME = process.env.RESEND_FROM_NAME || 'UBIK2 YEMG';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
