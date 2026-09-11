/**
 * Sarthi Safety & Non-Diagnostic Guardrails
 * 
 * Sarthi is strictly a supportive cognitive-care companion, NOT a medical practitioner.
 * This service ensures all communications remain non-diagnostic, supportive, and safe.
 */

// Forbidden phrases and medical clinical claims that must never be presented
const PROHIBITED_PATTERNS: RegExp[] = [
  /dementia (is )?worsening/i,
  /dementia (has )?progressed/i,
  /alzheimer('?s)? (is )?advancing/i,
  /clinical (deterioration|decline|impairment)/i,
  /medical condition has declined/i,
  /prescribe/i,
  /increase (the )?dose/i,
  /decrease (the )?dose/i,
  /change (your |the )?medication/i,
  /you have dementia/i,
  /diagnosed with/i,
  /cognitive failure/i,
  /brain damage/i,
  /dying/i,
  /fatal/i,
];

export interface SafetyValidationResult {
  isSafe: boolean;
  sanitizedText: string;
  triggeredRules: string[];
}

/**
 * Validates text against strict non-diagnostic rules.
 * If any violation is found, replaces with standardized reassuring caregiver-friendly phrasing.
 */
export function validateAndSanitizeText(text: string): SafetyValidationResult {
  const triggeredRules: string[] = [];
  let sanitized = text;

  for (const pattern of PROHIBITED_PATTERNS) {
    if (pattern.test(sanitized)) {
      triggeredRules.push(pattern.source);
      sanitized = sanitized.replace(
        pattern,
        'activity pattern is different from the usual baseline'
      );
    }
  }

  // Ensure reassurance if repeated deviation is mentioned
  if (sanitized.includes('deviation') || sanitized.includes('struggling')) {
    if (!sanitized.includes('break') && !sanitized.includes('caregiver')) {
      sanitized += ' Remember to take gentle rest and spend relaxed time today.';
    }
  }

  return {
    isSafe: triggeredRules.length === 0,
    sanitizedText: sanitized,
    triggeredRules,
  };
}

export const sarthiSafety = {
  validateAndSanitizeText,
};

export default sarthiSafety;
