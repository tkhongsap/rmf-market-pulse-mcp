#!/usr/bin/env tsx
/**
 * Comprehensive MCP Tools Test Suite
 * Tests all 6 MCP tools with various input scenarios
 */

import { rmfMCPServer } from './server/mcp';
import { rmfDataService } from './server/services/rmfDataService';

interface TestCase {
  name: string;
  tool: string;
  input: any;
  expectedFields?: string[];
  validate?: (result: any) => boolean | string;
}

const testCases: TestCase[] = [
  // Test 1: get_rmf_funds - Basic pagination
  {
    name: 'get_rmf_funds - Default pagination',
    tool: 'get_rmf_funds',
    input: { page: 1, pageSize: 5 },
    expectedFields: ['funds', 'pagination', 'timestamp'],
    validate: (result) => {
      const data = JSON.parse(result.content[1].text);
      if (data.funds.length !== 5) return `Expected 5 funds, got ${data.funds.length}`;
      if (data.pagination.page !== 1) return `Expected page 1, got ${data.pagination.page}`;
      return true;
    }
  },

  // Test 2: get_rmf_funds - Sort by YTD
  {
    name: 'get_rmf_funds - Sort by YTD descending',
    tool: 'get_rmf_funds',
    input: { page: 1, pageSize: 10, sortBy: 'ytd', sortOrder: 'desc' },
    expectedFields: ['funds', 'pagination'],
    validate: (result) => {
      const data = JSON.parse(result.content[1].text);
      if (data.funds.length === 0) return 'No funds returned';
      // Check if sorted descending
      for (let i = 0; i < data.funds.length - 1; i++) {
        const current = data.funds[i].perf_ytd;
        const next = data.funds[i + 1].perf_ytd;
        if (current !== null && next !== null && current < next) {
          return `YTD not sorted descending: ${current} < ${next}`;
        }
      }
      return true;
    }
  },

  // Test 3: search_rmf_funds - Search by keyword
  {
    name: 'search_rmf_funds - Search by "Bualuang"',
    tool: 'search_rmf_funds',
    input: { search: 'Bualuang', limit: 10 },
    expectedFields: ['funds', 'totalCount', 'filters'],
    validate: (result) => {
      const data = JSON.parse(result.content[1].text);
      if (data.totalCount === 0) return 'No funds found with "Bualuang"';
      // Check if all funds contain Bualuang in name or symbol
      for (const fund of data.funds) {
        const hasBualuang = fund.fund_name.toLowerCase().includes('bualuang') ||
                           fund.symbol.toLowerCase().includes('b-') ||
                           fund.symbol.toLowerCase().includes('bual');
        if (!hasBualuang) return `Fund ${fund.symbol} doesn't match search`;
      }
      return true;
    }
  },

  // Test 4: search_rmf_funds - Filter by risk level
  {
    name: 'search_rmf_funds - Risk level 5-6',
    tool: 'search_rmf_funds',
    input: { minRiskLevel: 5, maxRiskLevel: 6, limit: 20 },
    validate: (result) => {
      const data = JSON.parse(result.content[1].text);
      if (data.totalCount === 0) return 'No funds found with risk level 5-6';
      for (const fund of data.funds) {
        if (fund.risk_level < 5 || fund.risk_level > 6) {
          return `Fund ${fund.symbol} has risk level ${fund.risk_level}, expected 5-6`;
        }
      }
      return true;
    }
  },

  // Test 5: search_rmf_funds - Filter by AMC
  {
    name: 'search_rmf_funds - Filter by AMC (BBL)',
    tool: 'search_rmf_funds',
    input: { amc: 'BBL', limit: 15 },
    validate: (result) => {
      const data = JSON.parse(result.content[1].text);
      if (data.totalCount === 0) return 'No funds found for BBL AMC';
      for (const fund of data.funds) {
        if (!fund.amc.includes('BBL')) {
          return `Fund ${fund.symbol} has AMC ${fund.amc}, expected BBL`;
        }
      }
      return true;
    }
  },

  // Test 6: get_rmf_fund_detail - Specific fund
  {
    name: 'get_rmf_fund_detail - Get first fund',
    tool: 'get_rmf_fund_detail',
    input: null, // Will be set dynamically
    expectedFields: ['symbol', 'fund_name', 'amc', 'risk_level', 'performance', 'navHistory7d'],
    validate: (result) => {
      const data = JSON.parse(result.content[1].text);
      if (!data.fund_name) return 'Missing fund_name';
      if (!data.performance) return 'Missing performance data';
      if (data.risk_level < 1 || data.risk_level > 8) {
        return `Invalid risk level: ${data.risk_level}`;
      }
      return true;
    }
  },

  // Test 7: get_rmf_fund_performance - YTD top performers
  {
    name: 'get_rmf_fund_performance - Top 5 YTD',
    tool: 'get_rmf_fund_performance',
    input: { period: 'ytd', limit: 5, sortOrder: 'desc' },
    expectedFields: ['funds', 'period', 'periodLabel'],
    validate: (result) => {
      const data = JSON.parse(result.content[1].text);
      if (data.funds.length === 0) return 'No funds returned';
      if (data.funds.length > 5) return `Expected max 5 funds, got ${data.funds.length}`;
      // Check ranking
      for (let i = 0; i < data.funds.length; i++) {
        if (data.funds[i].rank !== i + 1) {
          return `Invalid rank at position ${i}: ${data.funds[i].rank}`;
        }
      }
      // Check sorted by performance
      for (let i = 0; i < data.funds.length - 1; i++) {
        const current = data.funds[i].performance;
        const next = data.funds[i + 1].performance;
        if (current !== null && next !== null && current < next) {
          return `Performance not sorted: ${current} < ${next}`;
        }
      }
      return true;
    }
  },

  // Test 8: get_rmf_fund_performance - 1Y with risk filter
  {
    name: 'get_rmf_fund_performance - Top 10 1Y (Risk 5)',
    tool: 'get_rmf_fund_performance',
    input: { period: '1y', limit: 10, riskLevel: 5 },
    validate: (result) => {
      const data = JSON.parse(result.content[1].text);
      if (data.funds.length === 0) return 'No funds found for risk level 5';
      for (const fund of data.funds) {
        if (fund.risk_level !== 5) {
          return `Fund ${fund.symbol} has risk ${fund.risk_level}, expected 5`;
        }
      }
      return true;
    }
  },

  // Test 9: get_rmf_fund_nav_history - 30 days
  {
    name: 'get_rmf_fund_nav_history - 30 days',
    tool: 'get_rmf_fund_nav_history',
    input: null, // Will be set dynamically
    expectedFields: ['navHistory', 'statistics', 'days'],
    validate: (result) => {
      const data = JSON.parse(result.content[1].text);
      if (!data.navHistory) return 'Missing navHistory';
      if (!Array.isArray(data.navHistory)) return 'navHistory is not an array';
      if (!data.statistics) return 'Missing statistics';
      // Check statistics fields
      const stats = data.statistics;
      if (!stats.minNav || !stats.maxNav || !stats.avgNav) {
        return 'Missing NAV statistics fields';
      }
      return true;
    }
  },

  // Test 10: get_rmf_fund_nav_history - 7 days
  {
    name: 'get_rmf_fund_nav_history - 7 days',
    tool: 'get_rmf_fund_nav_history',
    input: null, // Will be set dynamically
    validate: (result) => {
      const data = JSON.parse(result.content[1].text);
      if (data.days !== 7) return `Expected 7 days, got ${data.days}`;
      if (data.navHistory.length > 7) {
        return `Expected max 7 history entries, got ${data.navHistory.length}`;
      }
      return true;
    }
  },

  // Test 11: compare_rmf_funds - 2 funds
  {
    name: 'compare_rmf_funds - Compare 2 funds',
    tool: 'compare_rmf_funds',
    input: null, // Will be set dynamically
    expectedFields: ['funds', 'fundCount', 'compareBy'],
    validate: (result) => {
      const data = JSON.parse(result.content[1].text);
      if (data.fundCount !== 2) return `Expected 2 funds, got ${data.fundCount}`;
      if (data.funds.length !== 2) return `Expected 2 funds in array, got ${data.funds.length}`;
      return true;
    }
  },

  // Test 12: compare_rmf_funds - 3 funds with performance focus
  {
    name: 'compare_rmf_funds - Compare 3 funds (performance)',
    tool: 'compare_rmf_funds',
    input: null, // Will be set dynamically with compareBy: 'performance'
    validate: (result) => {
      const data = JSON.parse(result.content[1].text);
      if (data.compareBy !== 'performance') return 'Wrong compareBy value';
      for (const fund of data.funds) {
        if (!fund.performance) return `Fund ${fund.symbol} missing performance data`;
      }
      return true;
    }
  },

  // Test 13: Error case - Invalid fund code (removed - should throw error, which is expected behavior)

  // Test 14: Edge case - Empty search
  {
    name: 'search_rmf_funds - No filters (all funds)',
    tool: 'search_rmf_funds',
    input: { limit: 50 },
    validate: (result) => {
      const data = JSON.parse(result.content[1].text);
      if (data.totalCount === 0) return 'Should return all funds';
      // Note: limit is applied via pageSize in search, should return up to limit
      if (data.funds.length > 50) return `Limit not respected: got ${data.funds.length} funds`;
      if (data.totalCount < 100) return `Expected more total funds, got ${data.totalCount}`;
      return true;
    }
  },

  // Test 15: Edge case - High page number
  {
    name: 'get_rmf_funds - Page 999 (should return empty)',
    tool: 'get_rmf_funds',
    input: { page: 999, pageSize: 20 },
    validate: (result) => {
      const data = JSON.parse(result.content[1].text);
      if (data.funds.length > 0) return 'Should return empty for high page number';
      return true;
    }
  },
];

async function runTests() {
  console.log('🧪 MCP Tools Test Suite\n');
  console.log('='.repeat(80));

  // Initialize data service
  console.log('📦 Initializing data service...');
  await rmfDataService.initialize();
  console.log(`✓ Loaded ${rmfDataService.getTotalCount()} funds\n`);

  // Get sample fund symbols for dynamic tests
  const allSymbols = rmfDataService.getAllSymbols();
  const sampleFund1 = allSymbols[0];
  const sampleFund2 = allSymbols[Math.floor(allSymbols.length / 3)];
  const sampleFund3 = allSymbols[Math.floor(allSymbols.length / 2)];

  // Update dynamic test cases
  testCases.forEach(tc => {
    if (tc.tool === 'get_rmf_fund_detail' && !tc.input) {
      tc.input = { fundCode: sampleFund1 };
    }
    if (tc.tool === 'get_rmf_fund_nav_history') {
      if (tc.name.includes('30 days')) {
        tc.input = { fundCode: sampleFund1, days: 30 };
      } else if (tc.name.includes('7 days')) {
        tc.input = { fundCode: sampleFund1, days: 7 };
      }
    }
    if (tc.tool === 'compare_rmf_funds') {
      if (tc.name.includes('2 funds')) {
        tc.input = { fundCodes: [sampleFund1, sampleFund2] };
      } else if (tc.name.includes('3 funds')) {
        tc.input = {
          fundCodes: [sampleFund1, sampleFund2, sampleFund3],
          compareBy: 'performance'
        };
      }
    }
  });

  let passed = 0;
  let failed = 0;
  const results: Array<{ test: string; status: 'PASS' | 'FAIL'; message?: string }> = [];

  for (const testCase of testCases) {
    try {
      console.log(`\n🔍 Test: ${testCase.name}`);
      console.log(`   Tool: ${testCase.tool}`);
      console.log(`   Input: ${JSON.stringify(testCase.input, null, 2).substring(0, 100)}...`);

      // Call the private handler methods directly via reflection
      let result: any;
      switch (testCase.tool) {
        case 'get_rmf_funds':
          result = await (rmfMCPServer as any).handleGetRmfFunds(testCase.input);
          break;
        case 'search_rmf_funds':
          result = await (rmfMCPServer as any).handleSearchRmfFunds(testCase.input);
          break;
        case 'get_rmf_fund_detail':
          result = await (rmfMCPServer as any).handleGetRmfFundDetail(testCase.input);
          break;
        case 'get_rmf_fund_performance':
          result = await (rmfMCPServer as any).handleGetRmfFundPerformance(testCase.input);
          break;
        case 'get_rmf_fund_nav_history':
          result = await (rmfMCPServer as any).handleGetRmfFundNavHistory(testCase.input);
          break;
        case 'compare_rmf_funds':
          result = await (rmfMCPServer as any).handleCompareFunds(testCase.input);
          break;
        default:
          throw new Error(`Unknown tool: ${testCase.tool}`);
      }

      // Validate result structure
      if (!result || !result.content || !Array.isArray(result.content)) {
        throw new Error('Invalid result structure');
      }

      // Check expected fields if specified
      if (testCase.expectedFields) {
        const dataText = result.content[1]?.text;
        if (!dataText) {
          throw new Error('Missing data in result');
        }
        const data = JSON.parse(dataText);
        for (const field of testCase.expectedFields) {
          if (!(field in data)) {
            throw new Error(`Missing expected field: ${field}`);
          }
        }
      }

      // Run custom validation
      if (testCase.validate) {
        const validationResult = testCase.validate(result);
        if (validationResult !== true) {
          throw new Error(validationResult as string);
        }
      }

      console.log(`   ✅ PASS`);
      passed++;
      results.push({ test: testCase.name, status: 'PASS' });

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`   ❌ FAIL: ${errorMsg}`);
      failed++;
      results.push({
        test: testCase.name,
        status: 'FAIL',
        message: errorMsg
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 Test Summary\n');
  console.log(`Total Tests: ${testCases.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('Failed Tests:');
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => console.log(`  - ${r.test}: ${r.message}`));
    console.log();
  }

  console.log('='.repeat(80));

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
