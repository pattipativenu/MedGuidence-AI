#!/usr/bin/env ts-node
/**
 * Verification Script: Evidence-Only Configuration
 * 
 * This script verifies that MedGuidence AI is configured to use
 * ONLY evidence-based databases and NOT Google Search.
 */

import * as fs from 'fs';
import * as path from 'path';

type CheckStatus = 'PASS' | 'FAIL' | 'WARNING';

interface CheckResult {
  name: string;
  status: CheckStatus;
  message: string;
}

// File path constants
const PATHS = {
  CHAT_ROUTE: 'app/api/chat/route.ts',
  EVIDENCE_ENGINE: 'lib/evidence/engine.ts',
} as const;

// File cache to avoid repeated reads
class FileCache {
  private static cache = new Map<string, string>();
  
  static read(filePath: string): string {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!this.cache.has(filePath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        this.cache.set(filePath, content);
      } catch (error) {
        throw new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return this.cache.get(filePath)!;
  }
  
  static exists(filePath: string): boolean {
    const fullPath = path.join(process.cwd(), filePath);
    return fs.existsSync(fullPath);
  }
}

const results: CheckResult[] = [];

// Check 1: Verify Google Search is commented out in chat route
function checkChatRoute(): CheckResult {
  try {
    const content = FileCache.read(PATHS.CHAT_ROUTE);
    
    // Check if the Google Search block is commented out
    const hasCommentedSearch = content.includes('// DISABLED: Google Search');
    const hasActiveSearch = content.includes('useGoogleSearch = true') && 
                            !content.match(/\/\*[\s\S]*?useGoogleSearch = true[\s\S]*?\*\//);
    
    if (hasCommentedSearch && !hasActiveSearch) {
      return {
        name: 'Chat Route Configuration',
        status: 'PASS',
        message: 'Google Search is properly disabled (commented out)'
      };
    } else if (hasActiveSearch) {
      return {
        name: 'Chat Route Configuration',
        status: 'FAIL',
        message: 'WARNING: Google Search appears to be active!'
      };
    } else {
      return {
        name: 'Chat Route Configuration',
        status: 'WARNING',
        message: 'Could not verify Google Search status'
      };
    }
  } catch (error) {
    return {
      name: 'Chat Route Configuration',
      status: 'FAIL',
      message: `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Check 2: Verify evidence databases are configured
function checkEvidenceEngine(): CheckResult {
  if (!FileCache.exists(PATHS.EVIDENCE_ENGINE)) {
    return {
      name: 'Evidence Engine',
      status: 'FAIL',
      message: 'Evidence engine file not found!'
    };
  }
  
  try {
    const content = FileCache.read(PATHS.EVIDENCE_ENGINE);
    
    // Check for key evidence sources
    const hasPubMed = content.includes('pubmed') || content.includes('PubMed');
    const hasCochrane = content.includes('cochrane') || content.includes('Cochrane');
    const hasGuidelines = content.includes('guideline') || content.includes('Guidelines');
    
    if (hasPubMed && hasCochrane && hasGuidelines) {
      return {
        name: 'Evidence Engine',
        status: 'PASS',
        message: 'Evidence databases are properly configured'
      };
    } else {
      return {
        name: 'Evidence Engine',
        status: 'WARNING',
        message: 'Some evidence sources may be missing'
      };
    }
  } catch (error) {
    return {
      name: 'Evidence Engine',
      status: 'FAIL',
      message: `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Check 3: Verify system prompts enforce evidence-only
function checkSystemPrompts(): CheckResult {
  try {
    const content = FileCache.read(PATHS.CHAT_ROUTE);
    
    const hasEvidenceRules = content.includes('ONLY USE PROVIDED EVIDENCE') ||
                             content.includes('DO NOT make up PMIDs');
    
    if (hasEvidenceRules) {
      return {
        name: 'System Prompts',
        status: 'PASS',
        message: 'System prompts enforce evidence-only citations'
      };
    } else {
      return {
        name: 'System Prompts',
        status: 'WARNING',
        message: 'Evidence-only rules may not be enforced in prompts'
      };
    }
  } catch (error) {
    return {
      name: 'System Prompts',
      status: 'FAIL',
      message: `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Check 4: Verify getGeminiWithSearch is not called
function checkSearchUsage(): CheckResult {
  try {
    const content = FileCache.read(PATHS.CHAT_ROUTE);
    
    // Remove comments to check actual code
    const codeOnly = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
    
    const callsSearch = codeOnly.includes('getGeminiWithSearch()');
    
    if (!callsSearch) {
      return {
        name: 'Search Function Usage',
        status: 'PASS',
        message: 'getGeminiWithSearch() is not called in active code'
      };
    } else {
      return {
        name: 'Search Function Usage',
        status: 'FAIL',
        message: 'WARNING: getGeminiWithSearch() is being called!'
      };
    }
  } catch (error) {
    return {
      name: 'Search Function Usage',
      status: 'FAIL',
      message: `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Display results helper
function displayResults(results: CheckResult[]): void {
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : 
                 result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${result.name}: ${result.message}`);
  });
}

// Calculate summary statistics
function getSummary(results: CheckResult[]): { pass: number; fail: number; warn: number } {
  return {
    pass: results.filter(r => r.status === 'PASS').length,
    fail: results.filter(r => r.status === 'FAIL').length,
    warn: results.filter(r => r.status === 'WARNING').length,
  };
}

// Determine exit code based on results
function getExitCode(summary: { pass: number; fail: number; warn: number }): number {
  if (summary.fail > 0) {
    console.log('❌ CRITICAL: Some checks failed. Google Search may be active!');
    return 1;
  } else if (summary.warn > 0) {
    console.log('⚠️  Some warnings detected. Review configuration.');
    return 0;
  } else {
    console.log('✅ All checks passed! System is configured for evidence-only mode.');
    return 0;
  }
}

// Main execution
function main(): void {
  console.log('\n🔍 Verifying Evidence-Only Configuration...\n');

  // Run all checks
  results.push(checkChatRoute());
  results.push(checkEvidenceEngine());
  results.push(checkSystemPrompts());
  results.push(checkSearchUsage());

  // Display results
  displayResults(results);

  // Summary
  const summary = getSummary(results);
  console.log('\n' + '='.repeat(60));
  console.log(`Summary: ${summary.pass} passed, ${summary.fail} failed, ${summary.warn} warnings`);
  console.log('='.repeat(60) + '\n');

  // Exit with appropriate code
  const exitCode = getExitCode(summary);
  process.exit(exitCode);
}

// Run the script
main();
