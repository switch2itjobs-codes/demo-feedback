#!/usr/bin/env node

/**
 * Script to add environment variables to Vercel using the Vercel API
 * This requires VERCEL_TOKEN to be set in environment
 */

const https = require('https');

const PROJECT_ID = 'prj_DJBkVdTprLNSlaV26vvz7jWlZxLg';
const TEAM_ID = 'team_rZ0Krgnx7nLsUDAH1Nuo1SsZ';
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

if (!VERCEL_TOKEN) {
  console.error('❌ Error: VERCEL_TOKEN environment variable is not set');
  console.log('\nTo set it up:');
  console.log('1. Get your token from: https://vercel.com/account/tokens');
  console.log('2. Run: export VERCEL_TOKEN=your_token_here');
  console.log('3. Then run this script again\n');
  process.exit(1);
}

const envVars = [
  {
    key: 'SUPABASE_URL',
    value: 'https://bwuydoljkgiawackigzj.supabase.co',
    type: 'plain',
    target: ['production', 'preview', 'development']
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dXlkb2xqa2dpYXdhY2tpZ3pqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTcxOTQzNiwiZXhwIjoyMDc3Mjk1NDM2fQ.WVNTM9uR7KJy_w6-opLN7i8bjaznXEe0j7JfKQ7sfJE',
    type: 'encrypted',
    target: ['production', 'preview', 'development']
  }
];

function addEnvVar(envVar) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(envVar);
    
    const options = {
      hostname: 'api.vercel.com',
      port: 443,
      path: `/v10/projects/${PROJECT_ID}/env?upsert=true&teamId=${TEAM_ID}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ Added ${envVar.key} successfully`);
          resolve(JSON.parse(body));
        } else {
          console.error(`❌ Failed to add ${envVar.key}:`, body);
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Error adding ${envVar.key}:`, error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🚀 Adding environment variables to Vercel...\n');
  
  for (const envVar of envVars) {
    try {
      await addEnvVar(envVar);
    } catch (error) {
      console.error(`Failed to add ${envVar.key}:`, error.message);
      process.exit(1);
    }
  }
  
  console.log('\n✅ All environment variables added successfully!');
  console.log('\n📝 Next step: Redeploy your project from the Vercel dashboard');
  console.log('   Or trigger a new deployment by pushing to GitHub\n');
}

main();

