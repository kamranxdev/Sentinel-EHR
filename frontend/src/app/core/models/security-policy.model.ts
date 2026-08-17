export interface AbacPolicy {
  id: number | string;
  policyName: string;
  description?: string;
  resourceType: string;
  action: string;
  ruleExpression: string;
  effect: 'PERMIT' | 'DENY';
  isActive: boolean;
  priority?: number;
  createdAt?: string;
}

export interface RbacRole {
  id: number | string;
  name: string;
  description?: string;
  isSystemRole?: boolean;
  permissions?: string[];
}

export interface SecurityEventLog {
  id: number | string;
  eventType: string;
  username: string;
  resourceType?: string;
  resourceId?: string;
  action: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  details?: string;
  ipAddress?: string;
  occurredAt: string;
}

export interface CreateAbacPolicyRequest {
  policyName: string;
  description?: string;
  resourceType: string;
  action: string;
  ruleExpression: string;
  effect: 'PERMIT' | 'DENY';
  isActive?: boolean;
  priority?: number;
}
