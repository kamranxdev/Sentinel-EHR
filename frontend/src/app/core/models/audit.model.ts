export interface AuditLog {
  id: number;
  username: string;
  userRole: string;
  action: string;
  entityName: string;
  resourceId?: string;
  ipAddress?: string;
  details: string;
  timestamp: string;
}
