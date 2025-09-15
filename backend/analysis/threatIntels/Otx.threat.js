import dotenv from "dotenv"
dotenv.config();
// backend/analysis/threatIntel/otx.js
import axios from 'axios';

const API_KEY = process.env.OTX_API_KEY;

class OTXAnalyzer {
  constructor() {
    this.baseUrl = 'https://otx.alienvault.com/api/v1';
    this.headers = {
      'X-OTX-API-KEY': API_KEY,
      'Content-Type': 'application/json'
    };
  }

  async analyzeHash(hash) {
    try {
      // Get general info about the hash
      const generalResponse = await axios.get(
        `${this.baseUrl}/indicators/file/${hash}/general`,
        { headers: this.headers }
      );

      // Get malware analysis
      const malwareResponse = await axios.get(
        `${this.baseUrl}/indicators/file/${hash}/malware`,
        { headers: this.headers }
      );

      // Get analysis data
      const analysisResponse = await axios.get(
        `${this.baseUrl}/indicators/file/${hash}/analysis`,
        { headers: this.headers }
      );

      const generalData = generalResponse.data;
      const malwareData = malwareResponse.data;
      const analysisData = analysisResponse.data;

      const matches = [];
      let verdict = 'unknown';

      // Check if hash appears in any pulses (threat intel feeds)
      if (generalData.pulse_info && generalData.pulse_info.count > 0) {
        generalData.pulse_info.pulses.forEach(pulse => {
          matches.push(`Pulse: ${pulse.name} - ${pulse.description}`);
        });
        verdict = 'suspicious';
      }

      // Check malware data
      if (malwareData.data && malwareData.data.length > 0) {
        malwareData.data.forEach(malware => {
          matches.push(`Malware Family: ${malware.detections || 'Unknown'}`);
        });
        verdict = 'malicious';
      }

      // Check analysis data
      if (analysisData.analysis && analysisData.analysis.analysis) {
        const analysis = analysisData.analysis.analysis;
        if (analysis.plugins) {
          Object.keys(analysis.plugins).forEach(plugin => {
            const pluginData = analysis.plugins[plugin];
            if (pluginData.results && pluginData.results.length > 0) {
              matches.push(`${plugin}: ${pluginData.results.length} detections`);
              if (verdict === 'unknown') verdict = 'suspicious';
            }
          });
        }
      }

      return {
        found: matches.length > 0,
        matches,
        pulseCount: generalData.pulse_info ? generalData.pulse_info.count : 0,
        verdict,
        reputation: generalData.reputation || null,
        whitelisted: generalData.whitelisted || false
      };

    } catch (error) {
      if (error.response && error.response.status === 404) {
        return {
          found: false,
          matches: [],
          message: 'Hash not found in OTX database'
        };
      }
      
      console.error('OTX API error:', error.message);
      throw new Error(`OTX lookup failed: ${error.message}`);
    }
  }

  async analyzeIP(ip) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/indicators/IPv4/${ip}/general`,
        { headers: this.headers }
      );

      const data = response.data;
      const matches = [];

      if (data.pulse_info && data.pulse_info.count > 0) {
        data.pulse_info.pulses.forEach(pulse => {
          matches.push(`IP Pulse: ${pulse.name}`);
        });
      }

      return {
        found: matches.length > 0,
        matches,
        pulseCount: data.pulse_info ? data.pulse_info.count : 0,
        reputation: data.reputation || null,
        country: data.country_name || null,
        asn: data.asn || null
      };

    } catch (error) {
      if (error.response && error.response.status === 404) {
        return {
          found: false,
          matches: [],
          message: 'IP not found in OTX database'
        };
      }
      
      console.error('OTX IP API error:', error.message);
      throw new Error(`OTX IP lookup failed: ${error.message}`);
    }
  }

  async analyzeDomain(domain) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/indicators/domain/${domain}/general`,
        { headers: this.headers }
      );

      const data = response.data;
      const matches = [];

      if (data.pulse_info && data.pulse_info.count > 0) {
        data.pulse_info.pulses.forEach(pulse => {
          matches.push(`Domain Pulse: ${pulse.name}`);
        });
      }

      return {
        found: matches.length > 0,
        matches,
        pulseCount: data.pulse_info ? data.pulse_info.count : 0,
        reputation: data.reputation || null,
        alexa: data.alexa || null
      };

    } catch (error) {
      if (error.response && error.response.status === 404) {
        return {
          found: false,
          matches: [],
          message: 'Domain not found in OTX database'
        };
      }
      
      console.error('OTX Domain API error:', error.message);
      throw new Error(`OTX domain lookup failed: ${error.message}`);
    }
  }
}

export default OTXAnalyzer;