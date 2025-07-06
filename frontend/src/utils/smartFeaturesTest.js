// Smart Features API Test
// Run this in browser console to test smart features integration

async function testSmartFeatures() {
  console.log('🤖 Testing FreshGuard 2.0 Smart Features Integration...\n');
  
  const apiService = window.apiService || (await import('./services/api.js')).apiService;
  const testUserId = 'user1';
  
  const tests = [
    {
      name: 'Health Check',
      test: () => apiService.healthCheck()
    },
    {
      name: 'Detailed Health Check',
      test: () => apiService.detailedHealthCheck()
    },
    {
      name: 'Grouped Inventory',
      test: () => apiService.getGroupedInventory()
    },
    {
      name: 'Product Details',
      test: () => apiService.getProductDetails('Bananas')
    },
    {
      name: 'Suggest Cart Item',
      test: () => apiService.suggestCartItem('Bananas')
    },
    {
      name: 'Find Freshest Item',
      test: () => apiService.findFreshestItem('Bananas')
    },
    {
      name: 'Replacement Suggestions',
      test: () => apiService.suggestReplacements('Bananas')
    },
    {
      name: 'Smart Add to Cart',
      test: () => apiService.addToCartWithSuggestions(testUserId, 'Bananas', 1)
    },
    {
      name: 'User Impact',
      test: () => apiService.getUserImpact(testUserId)
    },
    {
      name: 'Loyalty Points',
      test: () => apiService.getLoyaltyPoints(testUserId)
    }
  ];
  
  const results = [];
  
  for (const { name, test } of tests) {
    try {
      console.log(`📋 Testing: ${name}...`);
      const result = await test();
      
      if (result.success) {
        console.log(`✅ ${name}: SUCCESS`);
        results.push({ test: name, status: 'SUCCESS', data: result });
      } else {
        console.log(`⚠️ ${name}: FAILED - ${result.error || 'Unknown error'}`);
        results.push({ test: name, status: 'FAILED', error: result.error });
      }
    } catch (error) {
      console.log(`❌ ${name}: ERROR - ${error.message}`);
      results.push({ test: name, status: 'ERROR', error: error.message });
    }
  }
  
  console.log('\n📊 Smart Features Test Summary:');
  console.log('=====================================');
  
  const successful = results.filter(r => r.status === 'SUCCESS').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  
  console.log(`✅ Successful: ${successful}/${tests.length}`);
  console.log(`⚠️ Failed: ${failed}/${tests.length}`);
  console.log(`❌ Errors: ${errors}/${tests.length}`);
  
  if (successful >= tests.length * 0.8) {
    console.log('\n🎉 Smart Features Integration: EXCELLENT! 🚀');
  } else if (successful >= tests.length * 0.6) {
    console.log('\n👍 Smart Features Integration: GOOD! ✨');
  } else {
    console.log('\n🔧 Smart Features Integration: NEEDS WORK 📝');
  }
  
  return results;
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  console.log('🤖 FreshGuard 2.0 Smart Features Test Ready!');
  console.log('Run testSmartFeatures() to test API integration');
  window.testSmartFeatures = testSmartFeatures;
}

export { testSmartFeatures };
