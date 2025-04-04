
import { SchemeAdminConfig } from './schemeAdminTypes';

export interface PlanMetadata {
  createdAt: string;
  updatedAt?: string;
  version: number;
  status: string;
}

export interface Tier {
  from: number;
  to: number;
  rate: number;
}

export interface CommissionStructure {
  tiers: Tier[];
}

export interface PrimaryMetric {
  id?: string; // Add id as optional property
  field: string;
  operator: string;
  value: string | number;
  description: string;
}

export interface RuleCondition {
  field: string;
  operator: string;
  value: string | number;
  metric?: string; // Add metric as optional property
  period?: string; // Add period as optional property
}

export interface Adjustment {
  id: string;
  description: string;
  field: string;
  operator: string;
  value: string | number;
  impact?: number;
  type?: string;
  factor?: number;
}

export interface Exclusion {
  field: string;
  operator: string;
  value: string | number;
  description: string;
}

export interface MeasurementRules {
  primaryMetrics: PrimaryMetric[];
  minQualification: number;
  adjustments: Adjustment[];
  exclusions: Exclusion[];
}

export interface CustomRule {
  name: string;
  description: string;
  impactType: string; // e.g., PERCENTAGE, MONETARY
  impactValue: number;
  conditions: RuleCondition[];
  active?: boolean;   // Add active as optional property
  action?: string;    // Add action as optional property
  factor?: number;    // Add factor as optional property
  value?: number;     // Add value as optional property
}

export interface CreditLevel {
  role?: string;
  name?: string;      // Add name as optional property
  percentage: number;
  description?: string;
}

export interface CreditRules {
  levels: CreditLevel[];
}

export interface IncentivePlan {
  _id?: string;
  schemeId: string;
  name: string;
  description?: string;
  effectiveStart?: string;
  effectiveEnd?: string;
  currency: string;
  revenueBase: string; 
  baseField?: string;
  participants: string[];
  salesQuota: number;
  commissionStructure: CommissionStructure;
  measurementRules: MeasurementRules;
  creditRules: CreditRules;
  customRules: CustomRule[];
  status?: string;
  hasBeenExecuted?: boolean;
  metadata?: PlanMetadata;
  selectedSchemeConfig?: SchemeAdminConfig | null;
}
