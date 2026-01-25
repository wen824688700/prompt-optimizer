// Type definitions for the application

export interface Framework {
  id: string;
  name: string;
  description: string;
  match_score?: number;
}

export interface ClarificationAnswers {
  frameworkId: string;
  goalClarity: string;
  targetAudience: string;
  contextCompleteness: string;
  formatRequirements: string;
  constraints: string;
}

export interface Version {
  id: string;
  timestamp: string; // UTC ISO 8601
  type: 'save' | 'optimize';
  content: string;
}

export interface User {
  id: string;
  email: string;
  avatar: string;
  accountType: 'free' | 'pro';
}

export interface SubscriptionInfo {
  status: 'active' | 'cancelled' | 'expired';
  nextBillingDate: string;
  amount: number;
}
