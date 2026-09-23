/**
 * AI-SSDLC Claude Plugin
 * Provides tools for secure software development lifecycle assistance:
 * - STRIDE threat modeling
 * - Security architecture assessment
 * - Compliance framework mapping
 */

import { ThreatModelGenerator } from './tools/threat-model-generator';
import { SecurityAssessment } from './tools/security-assessment';

const VERSION = '1.0.0';

/**
 * Initialize plugin with available tools
 */
export async function initialize(): Promise<{
  status: string;
  version: string;
  tools: string[];
}> {
  console.log(`[SSDLC Plugin] Initializing v${VERSION}`);

  return {
    status: 'healthy',
    version: VERSION,
    tools: ['threat_model_generator', 'security_assessment']
  };
}

/**
 * Generate STRIDE threat model for system components
 */
export async function generateThreatModel(input: {
  system_description: string;
  scope: 'component' | 'layer' | 'full-system';
}): Promise<{
  status: string;
  threats: Array<{
    id: string;
    category: string;
    description: string;
    attack_vector: string;
    likelihood: string;
    impact: string;
    mitigation: string;
  }>;
  threat_coverage?: {
    categories: string[];
  };
  has_mitigations?: boolean;
}> {
  if (!input.system_description || input.system_description.trim() === '') {
    throw new Error('INVALID_INPUT: system_description is required');
  }

  if (!['component', 'layer', 'full-system'].includes(input.scope)) {
    throw new Error('INVALID_INPUT: scope must be one of: component, layer, full-system');
  }

  const generator = new ThreatModelGenerator();
  return generator.generate(input.system_description, input.scope);
}

/**
 * Assess security posture against compliance frameworks
 */
export async function assessSecurity(input: {
  architecture_doc: string;
  framework: 'NIST' | 'ISO27001' | 'PCI-DSS' | 'GDPR';
}): Promise<{
  status: string;
  framework: string;
  controls_assessed: number;
  compliance_percentage?: number;
  has_gaps?: boolean;
  gaps?: Array<{
    control_id: string;
    description: string;
    severity: string;
  }>;
  requirements_assessed?: number;
  data_protection_score?: number;
}> {
  if (!input.architecture_doc || input.architecture_doc.trim() === '') {
    throw new Error('INVALID_INPUT: architecture_doc is required');
  }

  if (!['NIST', 'ISO27001', 'PCI-DSS', 'GDPR'].includes(input.framework)) {
    throw new Error('INVALID_INPUT: framework must be one of: NIST, ISO27001, PCI-DSS, GDPR');
  }

  const assessor = new SecurityAssessment();
  return assessor.assess(input.architecture_doc, input.framework);
}

/**
 * List available tools
 */
export async function listTools(): Promise<{
  tool_count: number;
  tools: string[];
}> {
  return {
    tool_count: 2,
    tools: ['threat_model_generator', 'security_assessment']
  };
}

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<{
  status: string;
  version: string;
  timestamp: string;
}> {
  return {
    status: 'healthy',
    version: VERSION,
    timestamp: new Date().toISOString()
  };
}

// Export all functions
export default {
  initialize,
  generateThreatModel,
  assessSecurity,
  listTools,
  healthCheck
};
