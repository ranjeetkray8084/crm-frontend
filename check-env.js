// Simple script to check environment variables
import { loadEnv } from 'vite';

const mode = process.env.NODE_ENV || 'development';
const env = loadEnv(mode, process.cwd(), '');

console.log('=== Environment Check ===');
console.log('Mode:', mode);
console.log('VITE_API_BASE_URL:', env.VITE_API_BASE_URL);
console.log('Current working directory:', process.cwd());

// Check if .env files exist
import fs from 'fs';
import path from 'path';

const envFiles = ['.env', '.env.development', '.env.production', '.env.local'];
envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
    const content = fs.readFileSync(filePath, 'utf8');
    const apiUrl = content.match(/VITE_API_BASE_URL=(.+)/);
    if (apiUrl) {
      console.log(`   VITE_API_BASE_URL=${apiUrl[1]}`);
    }
  } else {
    console.log(`❌ ${file} does not exist`);
  }
});