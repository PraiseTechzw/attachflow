// Test file for AI configuration
// Run this to verify your AI setup is working

import { generateText, getAIForTask, MODEL_SPECS } from './genkit';

/**
 * Test basic AI functionality
 */
export async function testBasicAI() {
  try {
    console.log('Testing basic AI generation...');
    const response = await generateText('Say hello in a friendly way');
    console.log('✅ Basic AI test successful:', response);
    return true;
  } catch (error) {
    console.error('❌ Basic AI test failed:', error);
    return false;
  }
}

/**
 * Test different AI models
 */
export async function testDifferentModels() {
  const tests = [
    { name: 'Quick AI', model: 'quick' },
    { name: 'Code AI', model: 'code' },
    { name: 'Creative AI', model: 'creative' },
  ];

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const response = await generateText('Write a short greeting', { model: test.model });
      console.log(`✅ ${test.name} test successful:`, response.substring(0, 100) + '...');
    } catch (error) {
      console.error(`❌ ${test.name} test failed:`, error);
    }
  }
}

/**
 * Test task-specific AI
 */
export async function testTaskSpecificAI() {
  try {
    console.log('Testing task-specific AI...');
    const codeAI = getAIForTask('code');
    const response = await codeAI.generate({
      prompt: 'Write a simple TypeScript function that adds two numbers',
      config: { temperature: 0.3, maxOutputTokens: 500 }
    });
    console.log('✅ Task-specific AI test successful:', response.text().substring(0, 100) + '...');
    return true;
  } catch (error) {
    console.error('❌ Task-specific AI test failed:', error);
    return false;
  }
}

/**
 * Display model specifications
 */
export function displayModelSpecs() {
  console.log('\n📊 Available AI Models:');
  console.log('========================');
  
  Object.entries(MODEL_SPECS).forEach(([model, specs]) => {
    console.log(`\n🤖 ${model}:`);
    console.log(`   Speed: ${specs.speed}`);
    console.log(`   Quality: ${specs.quality}`);
    console.log(`   Context: ${specs.contextWindow}`);
    console.log(`   Best for: ${specs.bestFor}`);
    console.log(`   Cost: ${specs.costEfficiency}`);
    console.log(`   Status: ${specs.status}`);
  });
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('🚀 Starting AI Configuration Tests...\n');
  
  displayModelSpecs();
  
  console.log('\n🧪 Running functionality tests...');
  
  await testBasicAI();
  await testDifferentModels();
  await testTaskSpecificAI();
  
  console.log('\n✅ AI Configuration tests completed!');
}

// Uncomment to run tests
// runAllTests();