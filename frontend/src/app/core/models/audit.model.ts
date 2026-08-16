export interface AuditLog {
  id: string;
  username: string;
  userRole: string;
  action: string;
  entityName: string;
  resourceId?: string;
  ipAddress?: string;
  details: string;
  timestamp: string;
}
