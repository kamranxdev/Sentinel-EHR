import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Organization,
  OrganizationRegistrationRequest,
  OrganizationStatusUpdate,
  SysAdminStatsDTO,
  OrgAdminDashboardStatsDTO,
  StaffOnboardingRequestDTO,
  StaffUpdateRequestDTO,
} from '../models/organization.model';
import { User } from '../models/auth-user.model';
import { AuditLog } from '../models/audit.model';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly apiUrl = `${this.baseUrl}/organizations`;
  private readonly usersUrl = `${this.baseUrl}/users`;
  private readonly auditUrl = `${this.baseUrl}/audit`;

  constructor(private http: HttpClient) { }

  registerOrganization(request: OrganizationRegistrationRequest): Observable<Organization> {
    return this.http
      .post<any>(`${this.apiUrl}/register`, request)
      .pipe(map((res: any) => res?.data || res));
  }

  // --- SUPER ADMIN (Platform-Wide Governance) ---
  getAllOrganizations(): Observable<Organization[]> {
    return this.http.get<any>(this.apiUrl).pipe(map((res: any) => res?.data || res || []));
  }

  getOrganizationById(id: string): Observable<Organization> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(map((res: any) => res?.data || res));
  }

  updateOrganizationStatus(
    id: string,
    statusPayload: OrganizationStatusUpdate,
  ): Observable<Organization> {
    return this.http
      .patch<any>(`${this.apiUrl}/${id}`, statusPayload)
      .pipe(map((res: any) => res?.data || res));
  }

  updateOrganization(id: string, organization: Partial<Organization>): Observable<Organization> {
    return this.http
      .patch<any>(`${this.apiUrl}/${id}`, organization)
      .pipe(map((res: any) => res?.data || res));
  }

  getSuperAdminUsers(): Observable<User[]> {
    return this.http.get<any>(this.usersUrl).pipe(map((res: any) => res?.data || res || []));
  }

  getSysAdminAuditLogs(search?: string): Observable<AuditLog[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http
      .get<any>(`${this.auditUrl}/logs`, { params })
      .pipe(map((res: any) => res?.data || res || []));
  }

  getSuperAdminAuditLogs(search?: string): Observable<AuditLog[]> {
    return this.getSysAdminAuditLogs(search);
  }

  getSysAdminStats(): Observable<SysAdminStatsDTO> {
    return forkJoin({
      organizations: this.getAllOrganizations(),
      users: this.getSuperAdminUsers(),
      auditEvents: this.getSysAdminAuditLogs(),
    }).pipe(
      map(({ organizations, users, auditEvents }) => ({
        totalOrganizations: organizations.length,
        activeOrganizations: organizations.filter((o) => o.status === 'ACTIVE').length,
        totalUsers: users.length,
        totalAuditEvents: auditEvents.length,
      })),
    );
  }

  // --- ORGANIZATION ADMIN (Facility-Scoped Multi-Tenant Workspace) ---
  getOrgAdminFacility(): Observable<Organization> {
    return this.http.get<any>(`${this.apiUrl}/current`).pipe(
      map((res: any) => res?.data || res || ({} as Organization))
    );
  }

  updateOrgAdminFacility(payload: Partial<Organization>): Observable<Organization> {
    return this.http.patch<any>(`${this.apiUrl}/current`, payload).pipe(
      map((res: any) => res?.data || res)
    );
  }

  getOrgAdminUsers(organizationId?: string): Observable<User[]> {
    const url = organizationId
      ? `${this.apiUrl}/${organizationId}/users`
      : `${this.apiUrl}/current/users`;
    return this.http.get<any>(url).pipe(map((res: any) => res?.data || res || []));
  }

  onboardOrgAdminStaff(user: StaffOnboardingRequestDTO): Observable<User> {
    return this.http.post<any>(this.usersUrl, user).pipe(map((res: any) => res?.data || res));
  }

  updateOrgAdminStaff(id: string, user: StaffUpdateRequestDTO): Observable<User> {
    return this.http
      .patch<any>(`${this.usersUrl}/${id}`, user)
      .pipe(map((res: any) => res?.data || res));
  }

  updateOrgAdminStaffStatus(id: string, status: string): Observable<User> {
    return this.http
      .patch<any>(`${this.usersUrl}/${id}`, { status })
      .pipe(map((res: any) => res?.data || res));
  }

  resetOrgAdminStaffPassword(id: string, newPassword?: string): Observable<User> {
    return this.http
      .post<any>(`${this.usersUrl}/${id}/reset-password`, { newPassword })
      .pipe(map((res: any) => res?.data || res));
  }

  deleteOrgAdminStaff(id: string): Observable<User> {
    return this.http
      .delete<any>(`${this.usersUrl}/${id}`)
      .pipe(map((res: any) => res?.data || res));
  }

  getOrgAdminAuditLogs(search?: string): Observable<AuditLog[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http
      .get<any>(`${this.auditUrl}/logs`, { params })
      .pipe(map((res: any) => res?.data || res || []));
  }

  getOrgAdminDashboardStats(): Observable<OrgAdminDashboardStatsDTO> {
    return this.http
      .get<{ data: OrgAdminDashboardStatsDTO }>(`${this.apiUrl}/current/dashboard`)
      .pipe(map((res) => res.data));
  }
}
