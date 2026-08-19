export interface AuditLog {
  id: string;
  organizationId?: string;
  userId?: string;
  patientId?: string;
  encounterId?: string;
  email: string;
  userRole: string;
  action: string;
  resourceType?: string;
  entityName: string;
  resourceId?: string;
  purposeOfUse?: string;
  result?: string;
  ipAddress?: string;
  userAgent?: string;
  details: string;
  occurredAt?: string;
  timestamp: string;
}
