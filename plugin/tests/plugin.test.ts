/**
 * Plugin Integration Tests
 * Tests the threat-model and security-assessment tools
 */

import { ThreatModelGenerator } from '../src/tools/threat-model-generator';
import { SecurityAssessment } from '../src/tools/security-assessment';

describe('Plugin Tools', () => {
  describe('Threat Model Generator', () => {
    it('should generate threats for a component', async () => {
      const generator = new ThreatModelGenerator();
      const result = await generator.generate(
        'REST API with JWT authentication',
        'component'
      );

      expect(result.status).toBe('success');
      expect(result.threats).toHaveLength(3);
      expect(result.threats[0]).toHaveProperty('id');
      expect(result.threats[0]).toHaveProperty('category');
      expect(result.threats[0]).toHaveProperty('mitigation');
    });

    it('should cover multiple STRIDE categories', async () => {
      const generator = new ThreatModelGenerator();
      const result = await generator.generate(
        'Multi-tier web application',
        'full-system'
      );

      const categories = result.threats.map(t => t.category);
      expect(categories).toContain('Spoofing');
      expect(categories).toContain('Tampering');
      expect(categories).toContain('Information_Disclosure');
    });

    it('should throw error for empty description', async () => {
      const generator = new ThreatModelGenerator();
      await expect(generator.generate('', 'component')).rejects.toThrow(
        'INVALID_INPUT'
      );
    });

    it('should have mitigations for all threats', async () => {
      const generator = new ThreatModelGenerator();
      const result = await generator.generate(
        'Spring Boot REST API with Spring Security',
        'layer'
      );

      expect(result.has_mitigations).toBe(true);
      result.threats.forEach(threat => {
        expect(threat.mitigation).toBeTruthy();
        expect(threat.mitigation.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Security Assessment', () => {
    it('should assess architecture against NIST framework', async () => {
      const assessor = new SecurityAssessment();
      const result = await assessor.assess(
        'Angular frontend with Spring Boot backend and SQL Server database',
        'NIST'
      );

      expect(result.status).toBe('success');
      expect(result.framework).toBe('NIST');
      expect(result.controls_assessed).toBeGreaterThan(0);
      expect(result.compliance_percentage).toBeGreaterThanOrEqual(0);
      expect(result.compliance_percentage).toBeLessThanOrEqual(100);
    });

    it('should identify compliance gaps', async () => {
      const assessor = new SecurityAssessment();
      const result = await assessor.assess(
        'Basic REST API without security controls',
        'ISO27001'
      );

      expect(result.has_gaps).toBe(true);
      expect(result.gaps).toBeDefined();
      expect(result.gaps!.length).toBeGreaterThan(0);
      expect(result.gaps![0]).toHaveProperty('control_id');
      expect(result.gaps![0]).toHaveProperty('description');
      expect(result.gaps![0]).toHaveProperty('severity');
    });

    it('should support multiple compliance frameworks', async () => {
      const assessor = new SecurityAssessment();
      const frameworks: Array<'NIST' | 'ISO27001' | 'PCI-DSS' | 'GDPR'> = [
        'NIST',
        'ISO27001',
        'PCI-DSS',
        'GDPR'
      ];

      for (const framework of frameworks) {
        const result = await assessor.assess('Test architecture', framework);
        expect(result.status).toBe('success');
        expect(result.framework).toBe(framework);
      }
    });

    it('should throw error for empty architecture', async () => {
      const assessor = new SecurityAssessment();
      await expect(assessor.assess('', 'NIST')).rejects.toThrow(
        'INVALID_INPUT'
      );
    });
  });

  describe('Plugin Integration', () => {
    it('should have threat model and security assessment tools', async () => {
      const generator = new ThreatModelGenerator();
      const assessor = new SecurityAssessment();

      const threats = await generator.generate('Test system', 'component');
      const assessment = await assessor.assess('Test system', 'NIST');

      expect(threats.status).toBe('success');
      expect(assessment.status).toBe('success');
    });
  });
});
