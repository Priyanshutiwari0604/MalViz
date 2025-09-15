// test-virustotal-simple.js
import { lookupHash, uploadAndAnalyzeFile, getAnalysisResults } from '../backend/analysis/threatIntels/VirusTotal.threat.js';

console.log('🚀 Starting VirusTotal API Tests\n');

// Test 1: API Key Check
console.log('🧪 Test 1: API Key Check');
if (!process.env.VIRUSTOTAL_API_KEY) {
  console.log('❌ VIRUSTOTAL_API_KEY not found in environment');
  process.exit(1);
} else {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  console.log(`✅ API Key found (length: ${apiKey.length})`);
  console.log(`   Format: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 8)}`);
}

// Test 2: EICAR Hash Lookup
console.log('\n🧪 Test 2: EICAR Hash Lookup (Known Malicious)');
const EICAR_HASH = '275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f';

try {
  console.log(`Looking up hash: ${EICAR_HASH}`);
  const result = await lookupHash(EICAR_HASH);
  
  console.log('Result:', JSON.stringify(result, null, 2));
  
  if (result.found) {
    console.log('✅ Hash lookup successful!');
    console.log(`   Detection ratio: ${result.detectionRatio}`);
    console.log(`   Malicious engines: ${result.malicious}`);
    console.log(`   Total engines: ${result.totalEngines}`);
    console.log(`   File name: ${result.meaningfulName}`);
    console.log(`   Reputation: ${result.reputation}`);
  } else {
    console.log('❌ Hash not found or error occurred');
    console.log(`   Message: ${result.message || 'No message'}`);
    console.log(`   Error: ${result.error || 'No error'}`);
  }
} catch (error) {
  console.error('❌ Exception during hash lookup:');
  console.error('   Error:', error.message);
  console.error('   Stack:', error.stack);
}

// Test 3: Non-existent Hash (404 test)
console.log('\n🧪 Test 3: Non-existent Hash (404 test)');
const FAKE_HASH = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

try {
  console.log(`Looking up fake hash: ${FAKE_HASH}`);
  const result = await lookupHash(FAKE_HASH);
  
  if (!result.found) {
    console.log('✅ Correctly handled non-existent hash');
    console.log(`   Message: ${result.message}`);
  } else {
    console.log('⚠️  Unexpected: fake hash was found');
  }
} catch (error) {
  console.error('❌ Exception during fake hash lookup:', error.message);
}

console.log('\n🏁 Tests completed');