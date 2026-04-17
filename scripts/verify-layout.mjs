import { existsSync } from 'node:fs';

const required = [
  'frontend/pages/index.tsx',
  'frontend/pages/dashboard.tsx',
  'frontend/components/ScoreCard.tsx',
  'frontend/hooks/useAuth.ts',
  'backend/pages/api/auth/[...supabase].ts',
  'backend/pages/api/analyze/profile.ts',
  'backend/pages/api/chat/message.ts',
  'backend/lib/gemini.ts',
  'backend/services/analyzeProfile.ts',
  'backend/utils/rateLimiter.ts'
];

const missing = required.filter((file) => !existsSync(file));
if (missing.length > 0) {
  console.error('Missing files:');
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log('Layout verification passed.');
console.log(`Checked ${required.length} required files.`);

