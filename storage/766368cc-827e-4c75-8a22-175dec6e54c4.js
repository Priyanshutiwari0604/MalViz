// malwareAnalyzer.js - Comprehensive Malware Analysis Tool (ES Module)

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MalwareAnalyzer {
    constructor() {
        this.iocs = {
            ipAddresses: new Set(),
            domains: new Set(),
            urls: new Set(),
            fileHashes: new Set(),
            registryKeys: new Set(),
            suspiciousStrings: new Set()
        };
        
        this.yaraRules = [];
        this.analysisResults = {};
    }

    // Main analysis function
    async analyzeFile(filePath) {
        try {
            const buffer = fs.readFileSync(filePath);
            const stats = fs.statSync(filePath);
            
            this.analysisResults = {
                fileInfo: this.getFileInfo(filePath, stats, buffer),
                entropy: this.calculateEntropy(buffer),
                strings: this.extractStrings(buffer),
                iocs: this.extractIOCs(buffer),
                yaraMatches: await this.runYaraScan(buffer, filePath),
                peAnalysis: this.isPEFile(buffer) ? this.parsePEBuffer(buffer) : null,
                threatScore: 0
            };

            this.analysisResults.threatScore = this.calculateThreatScore();
            
            return this.analysisResults;
        } catch (error) {
            console.error('Analysis error:', error);
            throw error;
        }
    }

    // Calculate file entropy
    calculateEntropy(buffer) {
        if (!buffer || buffer.length === 0) return 0;
        
        const byteCounts = new Array(256).fill(0);
        const length = buffer.length;
        
        // Count byte occurrences
        for (let i = 0; i < length; i++) {
            byteCounts[buffer[i]]++;
        }
        
        // Calculate entropy
        let entropy = 0;
        for (let i = 0; i < 256; i++) {
            if (byteCounts[i] > 0) {
                const probability = byteCounts[i] / length;
                entropy -= probability * Math.log2(probability);
            }
        }
        
        return entropy;
    }

    // Extract printable strings
    extractStrings(buffer, minLength = 4) {
        const strings = new Set();
        let currentString = '';
        
        for (let i = 0; i < buffer.length; i++) {
            const char = buffer[i];
            // Printable ASCII range
            if (char >= 32 && char <= 126) {
                currentString += String.fromCharCode(char);
            } else {
                if (currentString.length >= minLength) {
                    strings.add(currentString);
                }
                currentString = '';
            }
        }
        
        // Add last string if any
        if (currentString.length >= minLength) {
            strings.add(currentString);
        }
        
        return Array.from(strings);
    }

    // Extract Indicators of Compromise
    extractIOCs(buffer) {
        const data = buffer.toString('binary');
        
        // IP addresses
        const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
        const ips = data.match(ipRegex) || [];
        ips.forEach(ip => this.iocs.ipAddresses.add(ip));
        
        // Domains (simple regex)
        const domainRegex = /\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b/g;
        const domains = data.match(domainRegex) || [];
        domains.forEach(domain => this.iocs.domains.add(domain));
        
        // URLs
        const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
        const urls = data.match(urlRegex) || [];
        urls.forEach(url => this.iocs.urls.add(url));
        
        // Suspicious strings
        const suspiciousPatterns = [
            /cmd\.exe/gi,
            /powershell/gi,
            /wscript/gi,
            /cscript/gi,
            /regsvr32/gi,
            /schtasks/gi,
            /bitcoin|bc1|[13][a-km-zA-HJ-NP-Z1-9]{25,34}/gi, // Crypto
            /\/tmp\/|\/var\/tmp\//gi, // Temp paths
            /HKEY_/gi // Registry
        ];
        
        suspiciousPatterns.forEach(pattern => {
            const matches = data.match(pattern);
            if (matches) {
                matches.forEach(match => this.iocs.suspiciousStrings.add(match));
            }
        });
        
        return {
            ipAddresses: Array.from(this.iocs.ipAddresses),
            domains: Array.from(this.iocs.domains),
            urls: Array.from(this.iocs.urls),
            suspiciousStrings: Array.from(this.iocs.suspiciousStrings),
            fileHash: this.calculateFileHash(buffer)
        };
    }

    // Calculate file hashes
    calculateFileHash(buffer) {
        return {
            md5: crypto.createHash('md5').update(buffer).digest('hex'),
            sha1: crypto.createHash('sha1').update(buffer).digest('hex'),
            sha256: crypto.createHash('sha256').update(buffer).digest('hex')
        };
    }

    // YARA rule matching (simplified)
    async runYaraScan(buffer, filePath) {
        const matches = [];
        const rules = this.loadYaraRules();
        
        rules.forEach(rule => {
            if (this.checkYaraRule(rule, buffer, filePath)) {
                matches.push({
                    rule: rule.name,
                    description: rule.description,
                    tags: rule.tags || []
                });
            }
        });
        
        return matches;
    }

    loadYaraRules() {
        // Example YARA rules - in real implementation, load from files
        return [
            {
                name: "suspicious_pe_header",
                description: "Suspicious PE header characteristics",
                condition: "pe && pe.number_of_sections > 10",
                tags: ["packed", "obfuscated"]
            },
            {
                name: "high_entropy",
                description: "High entropy section detected",
                condition: "entropy > 7.0",
                tags: ["packed", "encrypted"]
            },
            {
                name: "suspicious_imports",
                description: "Suspicious API imports",
                condition: "imports('VirtualAlloc') && imports('VirtualProtect')",
                tags: ["injection", "malware"]
            }
        ];
    }

    checkYaraRule(rule, buffer, filePath) {
        // Simplified YARA rule checking
        const data = buffer.toString('binary');
        
        if (rule.name === "suspicious_pe_header" && this.isPEFile(buffer)) {
            const peAnalysis = this.parsePEBuffer(buffer);
            return peAnalysis && peAnalysis.sections.length > 10;
        }
        
        if (rule.name === "high_entropy") {
            const entropy = this.calculateEntropy(buffer);
            return entropy > 7.0;
        }
        
        if (rule.name === "suspicious_imports") {
            return data.includes('VirtualAlloc') && data.includes('VirtualProtect');
        }
        
        return false;
    }

    // PE File Parser
    isPEFile(buffer) {
        if (buffer.length < 64) return false;
        return buffer.readUInt16LE(0) === 0x5A4D; // 'MZ'
    }

    parsePEBuffer(buffer) {
        if (!this.isPEFile(buffer)) return null;
        
        try {
            const peOffset = buffer.readUInt32LE(0x3C);
            if (peOffset + 4 > buffer.length || buffer.readUInt32LE(peOffset) !== 0x4550) return null; // 'PE\0\0'
            
            const numberOfSections = buffer.readUInt16LE(peOffset + 6);
            const optionalHeaderSize = buffer.readUInt16LE(peOffset + 20);
            const sectionTableOffset = peOffset + 24 + optionalHeaderSize;
            
            // Validate section table offset
            if (sectionTableOffset + numberOfSections * 40 > buffer.length) {
                return null;
            }
            
            const sections = [];
            for (let i = 0; i < numberOfSections; i++) {
                const sectionOffset = sectionTableOffset + i * 40;
                
                // Validate section data boundaries
                const rawDataPointer = buffer.readUInt32LE(sectionOffset + 20);
                const rawDataSize = buffer.readUInt32LE(sectionOffset + 16);
                
                let sectionData = Buffer.alloc(0);
                if (rawDataPointer + rawDataSize <= buffer.length) {
                    sectionData = buffer.subarray(rawDataPointer, rawDataPointer + rawDataSize);
                }
                
                sections.push({
                    name: buffer.toString('utf8', sectionOffset, sectionOffset + 8).replace(/\0/g, ''),
                    virtualSize: buffer.readUInt32LE(sectionOffset + 8),
                    virtualAddress: buffer.readUInt32LE(sectionOffset + 12),
                    sizeOfRawData: rawDataSize,
                    pointerToRawData: rawDataPointer,
                    characteristics: buffer.readUInt32LE(sectionOffset + 36),
                    entropy: this.calculateEntropy(sectionData)
                });
            }
            
            return {
                isPE: true,
                machineType: buffer.readUInt16LE(peOffset + 4),
                numberOfSections: numberOfSections,
                timestamp: new Date(buffer.readUInt32LE(peOffset + 8) * 1000),
                entryPoint: buffer.readUInt32LE(peOffset + 40),
                imageBase: buffer.readUInt32LE(peOffset + 52),
                sections: sections
            };
        } catch (error) {
            console.error('PE parsing error:', error);
            return null;
        }
    }

    getFileInfo(filePath, stats, buffer) {
        return {
            filename: path.basename(filePath),
            filepath: filePath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            fileType: this.detectFileType(buffer),
            mimeType: this.detectMimeType(buffer)
        };
    }

    detectFileType(buffer) {
        // Simple file type detection
        if (this.isPEFile(buffer)) return 'PE/Executable';
        if (buffer.length >= 4 && buffer.readUInt32BE(0) === 0x89504E47) return 'PNG';
        if (buffer.length >= 2 && buffer.readUInt16BE(0) === 0xFFD8) return 'JPEG';
        if (buffer.length >= 3 && buffer.toString('utf8', 0, 3) === 'GIF') return 'GIF';
        if (buffer.length >= 4 && buffer.toString('utf8', 0, 4) === '%PDF') return 'PDF';
        return 'Unknown';
    }

    detectMimeType(buffer) {
        const fileType = this.detectFileType(buffer);
        const mimeMap = {
            'PE/Executable': 'application/x-msdownload',
            'PNG': 'image/png',
            'JPEG': 'image/jpeg',
            'GIF': 'image/gif',
            'PDF': 'application/pdf'
        };
        return mimeMap[fileType] || 'application/octet-stream';
    }

    calculateThreatScore() {
        if (!this.analysisResults) return 0;
        
        let score = 0;
        
        // High entropy
        if (this.analysisResults.entropy > 7.0) score += 30;
        else if (this.analysisResults.entropy > 6.0) score += 15;
        
        // Many IOCs
        const iocCount = this.analysisResults.iocs.ipAddresses.length + 
                        this.analysisResults.iocs.domains.length + 
                        this.analysisResults.iocs.urls.length;
        if (iocCount > 10) score += 25;
        else if (iocCount > 5) score += 10;
        
        // YARA matches
        score += this.analysisResults.yaraMatches.length * 10;
        
        // Suspicious PE characteristics
        if (this.analysisResults.peAnalysis) {
            if (this.analysisResults.peAnalysis.sections.length > 8) score += 15;
            const highEntropySections = this.analysisResults.peAnalysis.sections.filter(s => s.entropy > 7.0);
            if (highEntropySections.length > 0) score += highEntropySections.length * 5;
        }
        
        return Math.min(score, 100);
    }

    // Generate comprehensive report
    generateReport() {
        if (!this.analysisResults) {
            return { error: 'No analysis results available. Run analyzeFile() first.' };
        }
        
        return {
            summary: {
                filename: this.analysisResults.fileInfo.filename,
                threatScore: this.analysisResults.threatScore,
                verdict: this.analysisResults.threatScore > 50 ? 'SUSPICIOUS' : 'CLEAN',
                analysisTimestamp: new Date().toISOString()
            },
            detailed: this.analysisResults
        };
    }
}

// Example usage and testing
async function testAnalyzer() {
    const analyzer = new MalwareAnalyzer();
    
    // Create a simple test file for demonstration
    const testContent = 'This is a test file with some suspicious content.\n' +
                       'Visit http://malicious-domain.com for more info.\n' +
                       'IP: 192.168.1.100\n' +
                       'Run cmd.exe and powershell commands.';
    
    const testFilePath = path.join(__dirname, 'test_file.txt');
    
    try {
        fs.writeFileSync(testFilePath, testContent);
        console.log('Created test file:', testFilePath);
        
        const results = await analyzer.analyzeFile(testFilePath);
        console.log('Analysis Results:', JSON.stringify(analyzer.generateReport(), null, 2));
        
        // Print IOCs
        console.log('\n=== IOCs DETECTED ===');
        console.log('IP Addresses:', results.iocs.ipAddresses);
        console.log('Domains:', results.iocs.domains);
        console.log('URLs:', results.iocs.urls);
        console.log('Suspicious Strings:', results.iocs.suspiciousStrings);
        console.log('File Hashes:', results.iocs.fileHash);
        
        // Clean up test file
        fs.unlinkSync(testFilePath);
        console.log('\nTest file cleaned up.');
        
    } catch (error) {
        console.error('Test failed:', error);
        // Clean up if file was created but analysis failed
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
    }
}

// Export for use in other modules
export default MalwareAnalyzer;

// Run test if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    testAnalyzer();
}