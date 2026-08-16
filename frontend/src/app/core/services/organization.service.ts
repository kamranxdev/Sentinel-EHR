import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Organization, OrganizationRegistrationRequest, OrganizationStatusUpdate } from '../models/organization.model';
import { User } from '../models/auth-user.model';
import { AuditLog } from '../models/audit.model';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private apiUrl = '/api/v1/organizations';
  private sysAdminUrl = '/api/v1/sys-admin';
  private orgAdminUrl = '/api/v1/org-admin';

  constructor(private http: HttpClient) {}

  registerOrganization(request: OrganizationRegistrationRequest): Observable<Organization> {
    return this.http.post<Organization>(`${this.apiUrl}/register`, request);
  }

  // --- SYS ADMIN (Platform-Wide Governance) ---
  getAllOrganizations(): Observable<Organization[]> {
    return this.http.get<Organization[]>(`${this.sysAdminUrl}/organizations`);
  }

  getOrganizationById(id: string): Observable<Organization> {
    return this.http.get<Organization>(`${this.apiUrl}/${id}`);
  }

  updateOrganizationStatus(id: string, statusPayload: OrganizationStatusUpdate): Observable<Organization> {
    return this.http.patch<Organization>(`${this.sysAdminUrl}/organizations/${id}/status`, statusPayload);
  }

  updateOrganization(id: string, organization: Partial<Organization>): Observable<Organization> {
    return this.http.put<Organization>(`${this.apiUrl}/${id}`, organization);
  }

  getSysAdminUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.sysAdminUrl}/users`);
  }

  getSysAdminAuditLogs(search?: string): Observable<AuditLog[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<AuditLog[]>(`${this.sysAdminUrl}/audit-logs`, { params });
  }

  getSysAdminStats(): Observable<any> {
    return this.http.get<any>(`${this.sysAdminUrl}/system-stats`);
  }

  // --- ORG ADMIN (Facility-Scoped Multi-Tenant Workspace) ---
  getOrgAdminFacility(): Observable<Organization> {
    return this.http.get<Organization>(`${this.orgAdminUrl}/facility`);
  }

  updateOrgAdminFacility(payload: Partial<Organization>): Observable<Organization> {
    return this.http.put<Organization>(`${this.orgAdminUrl}/facility`, payload);
  }

  getOrgAdminUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.orgAdminUrl}/users`);
  }

  onboardOrgAdminStaff(user: any): Observable<User> {
    return this.http.post<User>(`${this.orgAdminUrl}/users`, user);
  }

  updateOrgAdminStaff(id: string, user: any): Observable<User> {
    return this.http.put<User>(`${this.orgAdminUrl}/users/${id}`, user);
  }

  updateOrgAdminStaffStatus(id: string, status: string): Observable<any> {
    return this.http.patch<any>(`${this.orgAdminUrl}/users/${id}/status`, { status });
  }

  resetOrgAdminStaffPassword(id: string, newPassword?: string): Observable<any> {
    return this.http.post<any>(`${this.orgAdminUrl}/users/${id}/reset-password`, { newPassword });
  }

  deleteOrgAdminStaff(id: string): Observable<any> {
    return this.http.delete<any>(`${this.orgAdminUrl}/users/${id}`);
  }

  getOrgAdminAuditLogs(search?: string): Observable<AuditLog[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<AuditLog[]>(`${this.orgAdminUrl}/audit-logs`, { params });
  }

  getOrgAdminDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.orgAdminUrl}/dashboard-stats`);
  }
}
