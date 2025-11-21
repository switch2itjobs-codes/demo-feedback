#!/usr/bin/env node

/**
 * Script to trigger a redeploy on Vercel
 * This creates a new deployment from the latest commit
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

function createDeployment() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      name: 'demo-feedback',
      target: 'production',
      gitSource: {
        type: 'github',
        repo: 'switch2itjobs-codes/demo-feedback',
        ref: 'main'
      }
    });
    
    const options = {
      hostname: 'api.vercel.com',
      port: 443,
      path: `/v13/deployments?teamId=${TEAM_ID}`,
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
          const result = JSON.parse(body);
          console.log('✅ Deployment triggered successfully!');
          console.log(`   Deployment ID: ${result.id}`);
          console.log(`   URL: https://${result.url}`);
          console.log(`   Status: ${result.readyState || 'BUILDING'}`);
          resolve(result);
        } else {
          console.error('❌ Failed to trigger deployment:', body);
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error triggering deployment:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🚀 Triggering new deployment on Vercel...\n');
  
  try {
    await createDeployment();
    console.log('\n✅ Deployment is being built!');
    console.log('   Check status at: https://vercel.com/sits-projects-b1a77a2d/demo-feedback/deployments\n');
  } catch (error) {
    console.error('\n❌ Failed to trigger deployment:', error.message);
    process.exit(1);
  }
}

main();

