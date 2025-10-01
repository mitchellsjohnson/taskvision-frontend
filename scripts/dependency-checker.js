#!/usr/bin/env node

/**
 * TaskVision Frontend Dependency Security & Update Checker
 * Uses Seaworthy API to evaluate dependencies and recommend safe updates
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class DependencyChecker {
  constructor() {
    this.packageJson = this.loadPackageJson();
    this.updateRules = this.loadUpdateRules();
    this.results = {
      vulnerabilities: [],
      outdated: [],
      recommendations: [],
      breakingChanges: [],
      summary: {}
    };
  }

  loadPackageJson() {
    const packagePath = path.join(__dirname, '..', 'package.json');
    return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  }

  loadUpdateRules() {
    return {
      // Conservative update rules to avoid breaking changes
      maxMajorVersionJump: 0, // Don't allow major version updates by default
      maxMinorVersionJump: 2, // Allow up to 2 minor version updates
      allowedMajorUpdates: [
        // Specific packages where major updates are safe
      ],
      blockedUpdates: [
        'react-scripts', // Known to have breaking changes
        'typescript@5', // Major version changes can break builds
      ],
      criticalDependencies: [
        'react',
        'react-dom',
        '@auth0/auth0-react',
        'axios',
        'typescript'
      ],
      testingDependencies: [
        '@testing-library/react',
        '@testing-library/jest-dom',
        '@testing-library/user-event',
        'jest'
      ]
    };
  }

  async checkSeaworthy(packageName, currentVersion) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.seaworthy.sonatype.com',
        port: 443,
        path: `/v1/packages/npm/${packageName}`,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TaskVision-DependencyChecker/1.0'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              resolve(JSON.parse(data));
            } else {
              resolve(null);
            }
          } catch (error) {
            resolve(null);
          }
        });
      });

      req.on('error', () => resolve(null));
      req.setTimeout(5000, () => {
        req.destroy();
        resolve(null);
      });
      
      req.end();
    });
  }

  parseVersion(version) {
    const cleaned = version.replace(/^[\^~>=<]/, '');
    const parts = cleaned.split('.').map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0,
      raw: cleaned
    };
  }

  compareVersions(current, latest) {
    const curr = this.parseVersion(current);
    const lat = this.parseVersion(latest);
    
    return {
      majorDiff: lat.major - curr.major,
      minorDiff: lat.minor - curr.minor,
      patchDiff: lat.patch - curr.patch,
      isNewer: lat.major > curr.major || 
               (lat.major === curr.major && lat.minor > curr.minor) ||
               (lat.major === curr.major && lat.minor === curr.minor && lat.patch > curr.patch)
    };
  }

  assessUpdateSafety(packageName, currentVersion, latestVersion, seaworthyData) {
    const versionDiff = this.compareVersions(currentVersion, latestVersion);
    const rules = this.updateRules;
    
    let risk = 'low';
    let recommendation = 'update';
    let reasons = [];

    // Check for major version changes
    if (versionDiff.majorDiff > rules.maxMajorVersionJump) {
      if (!rules.allowedMajorUpdates.includes(packageName)) {
        risk = 'high';
        recommendation = 'review';
        reasons.push(`Major version change (${versionDiff.majorDiff} versions)`);
      }
    }

    // Check for excessive minor version changes
    if (versionDiff.minorDiff > rules.maxMinorVersionJump) {
      risk = Math.max(risk === 'low' ? 'medium' : risk, 'medium');
      reasons.push(`Large minor version jump (${versionDiff.minorDiff} versions)`);
    }

    // Check blocked updates
    const blocked = rules.blockedUpdates.find(blocked => {
      if (blocked.includes('@')) {
        const [pkg, version] = blocked.split('@');
        return pkg === packageName && latestVersion.startsWith(version);
      }
      return blocked === packageName;
    });

    if (blocked) {
      risk = 'high';
      recommendation = 'block';
      reasons.push('Package is in blocked updates list');
    }

    // Critical dependency special handling
    if (rules.criticalDependencies.includes(packageName)) {
      if (versionDiff.majorDiff > 0) {
        risk = 'high';
        recommendation = 'review';
        reasons.push('Critical dependency with major version change');
      }
    }

    // Security considerations from Seaworthy
    if (seaworthyData) {
      if (seaworthyData.vulnerabilities && seaworthyData.vulnerabilities.length > 0) {
        const highSeverity = seaworthyData.vulnerabilities.some(v => 
          v.severity === 'high' || v.severity === 'critical'
        );
        if (highSeverity) {
          recommendation = 'update';
          reasons.push('Security vulnerabilities found');
          risk = 'security';
        }
      }
    }

    return {
      risk,
      recommendation,
      reasons,
      versionDiff,
      safe: risk === 'low' && recommendation === 'update'
    };
  }

  async checkDependency(packageName, currentVersion) {
    console.log(`Checking ${packageName}@${currentVersion}...`);
    
    try {
      const seaworthyData = await this.checkSeaworthy(packageName, currentVersion);
      
      if (!seaworthyData) {
        return {
          package: packageName,
          currentVersion,
          status: 'error',
          message: 'Unable to fetch package data'
        };
      }

      const latestVersion = seaworthyData.latestVersion || currentVersion;
      const assessment = this.assessUpdateSafety(packageName, currentVersion, latestVersion, seaworthyData);

      return {
        package: packageName,
        currentVersion,
        latestVersion,
        assessment,
        seaworthyData: {
          vulnerabilities: seaworthyData.vulnerabilities || [],
          license: seaworthyData.license,
          deprecated: seaworthyData.deprecated
        }
      };
    } catch (error) {
      return {
        package: packageName,
        currentVersion,
        status: 'error',
        message: error.message
      };
    }
  }

  async checkAllDependencies() {
    console.log('🔍 Starting comprehensive dependency check...\n');
    
    const allDeps = {
      ...this.packageJson.dependencies,
      ...this.packageJson.devDependencies
    };

    const checks = [];
    for (const [packageName, version] of Object.entries(allDeps)) {
      checks.push(this.checkDependency(packageName, version));
    }

    // Process in batches to avoid overwhelming the API
    const batchSize = 5;
    const results = [];
    
    for (let i = 0; i < checks.length; i += batchSize) {
      const batch = checks.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
      
      // Rate limiting
      if (i + batchSize < checks.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  generateReport(results) {
    const vulnerabilities = results.filter(r => 
      r.seaworthyData && r.seaworthyData.vulnerabilities.length > 0
    );
    
    const outdated = results.filter(r => 
      r.latestVersion && r.currentVersion !== r.latestVersion
    );
    
    const safeUpdates = results.filter(r => 
      r.assessment && r.assessment.safe
    );
    
    const riskyUpdates = results.filter(r => 
      r.assessment && !r.assessment.safe && r.assessment.recommendation === 'review'
    );

    const blockedUpdates = results.filter(r => 
      r.assessment && r.assessment.recommendation === 'block'
    );

    console.log('\n📊 DEPENDENCY SECURITY & UPDATE REPORT');
    console.log('=' .repeat(50));
    
    console.log(`\n🔴 VULNERABILITIES (${vulnerabilities.length})`);
    vulnerabilities.forEach(dep => {
      console.log(`  ${dep.package}@${dep.currentVersion}`);
      dep.seaworthyData.vulnerabilities.forEach(vuln => {
        console.log(`    ⚠️  ${vuln.severity}: ${vuln.title}`);
      });
    });

    console.log(`\n🟢 SAFE UPDATES (${safeUpdates.length})`);
    safeUpdates.forEach(dep => {
      console.log(`  ${dep.package}: ${dep.currentVersion} → ${dep.latestVersion}`);
    });

    console.log(`\n🟡 REVIEW REQUIRED (${riskyUpdates.length})`);
    riskyUpdates.forEach(dep => {
      console.log(`  ${dep.package}: ${dep.currentVersion} → ${dep.latestVersion}`);
      console.log(`    Risk: ${dep.assessment.risk}`);
      dep.assessment.reasons.forEach(reason => {
        console.log(`    - ${reason}`);
      });
    });

    console.log(`\n🔴 BLOCKED UPDATES (${blockedUpdates.length})`);
    blockedUpdates.forEach(dep => {
      console.log(`  ${dep.package}: ${dep.currentVersion} (blocked)`);
      dep.assessment.reasons.forEach(reason => {
        console.log(`    - ${reason}`);
      });
    });

    // Generate update commands for safe updates
    if (safeUpdates.length > 0) {
      console.log('\n🛠️  RECOMMENDED UPDATE COMMANDS:');
      const updateCommands = safeUpdates.map(dep => 
        `npm install ${dep.package}@${dep.latestVersion}`
      );
      console.log(updateCommands.join('\n'));
    }

    console.log('\n📈 SUMMARY:');
    console.log(`  Total dependencies: ${results.length}`);
    console.log(`  Vulnerabilities: ${vulnerabilities.length}`);
    console.log(`  Safe updates: ${safeUpdates.length}`);
    console.log(`  Require review: ${riskyUpdates.length}`);
    console.log(`  Blocked: ${blockedUpdates.length}`);

    return {
      vulnerabilities,
      safeUpdates,
      riskyUpdates,
      blockedUpdates,
      summary: {
        total: results.length,
        vulnerabilities: vulnerabilities.length,
        safeUpdates: safeUpdates.length,
        riskyUpdates: riskyUpdates.length,
        blockedUpdates: blockedUpdates.length
      }
    };
  }

  async run() {
    try {
      const results = await this.checkAllDependencies();
      const report = this.generateReport(results);
      
      // Save detailed report
      const reportPath = path.join(__dirname, '..', 'dependency-report.json');
      fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        results,
        report
      }, null, 2));
      
      console.log(`\n📄 Detailed report saved to: ${reportPath}`);
      
      // Exit with error code if vulnerabilities found
      if (report.vulnerabilities.length > 0) {
        console.log('\n❌ Vulnerabilities detected - review required!');
        process.exit(1);
      }
      
      console.log('\n✅ Dependency check complete!');
      
    } catch (error) {
      console.error('❌ Error running dependency check:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const checker = new DependencyChecker();
  checker.run();
}

module.exports = DependencyChecker;
