import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import {
  JwtAuthResponse,
  OrganizationContextDTO,
  SelectedContext,
  User,
} from '../models/auth-user.model';
import { StaffOnboardingRequestDTO } from '../models/organization.model';
import { Capability, ROLE_CAPABILITY_MAP, UserRole } from '../models/permissions.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/v1/auth';

  currentUser = signal<JwtAuthResponse | null>(this.getStoredUser());
  activeContext = signal<SelectedContext | null>(this.getStoredContext());

  constructor(private http: HttpClient) {}

  isTokenExpired(token: string | null, offsetSeconds = 5): boolean {
    if (!token || token === 'undefined' || token === 'null') return true;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      const payload = JSON.parse(jsonPayload);
      if (payload && payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        return payload.exp < now + offsetSeconds;
      }
      return false;
    } catch (e) {
      return true;
    }
  }

  isLoggedIn(): boolean {
    const user = this.currentUser();
    const token = localStorage.getItem('sentinel_token');
    if (!user || !token || this.isTokenExpired(token)) {
      if (user || token) {
        this.logout();
      }
      return false;
    }
    return true;
  }

  login(credentials: { email: string; password: string }): Observable<JwtAuthResponse> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      map((res: any) => {
        const authData: JwtAuthResponse = res && res.data ? res.data : res;
        const raw = authData.userId ?? authData.id;
        if (raw != null) {
          authData.userId = raw;
          authData.id = raw;
        }
        localStorage.setItem('sentinel_token', authData.accessToken);
        localStorage.setItem('sentinel_user', JSON.stringify(authData));
        this.currentUser.set(authData);
        return authData;
      }),
    );
  }

  register(userData: {
    email: string;
    password: string;
    fullName: string;
  }): Observable<JwtAuthResponse | { message: string }> {
    return this.http
      .post<JwtAuthResponse | { message: string }>(`${this.apiUrl}/register`, userData)
      .pipe(map((res: any) => (res && res.data ? res.data : res)));
  }

  setContext(context: SelectedContext): void {
    localStorage.setItem('sentinel_context', JSON.stringify(context));
    this.activeContext.set(context);
  }

  clearContext(): void {
    localStorage.removeItem('sentinel_context');
    this.activeContext.set(null);
  }

  getStoredContext(): SelectedContext | null {
    const data = localStorage.getItem('sentinel_context');
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  getActiveOrganizationId(): string | null {
    return this.activeContext()?.organizationId || null;
  }

  logout(): void {
    localStorage.removeItem('sentinel_token');
    localStorage.removeItem('sentinel_user');
    localStorage.removeItem('sentinel_context');
    this.currentUser.set(null);
    this.activeContext.set(null);
  }

  getToken(): string | null {
    const token = localStorage.getItem('sentinel_token');
    if (this.isTokenExpired(token)) {
      this.logout();
      return null;
    }
    return token;
  }

  getStoredUser(): JwtAuthResponse | null {
    const token = localStorage.getItem('sentinel_token');
    if (this.isTokenExpired(token)) {
      localStorage.removeItem('sentinel_token');
      localStorage.removeItem('sentinel_user');
      return null;
    }
    const data = localStorage.getItem('sentinel_user');
    if (!data || data === 'undefined' || data === 'null') return null;
    try {
      let user = JSON.parse(data);
      if (user && user.data) {
        user = user.data;
      }
      if (user) {
        const raw = user.userId ?? user.id;
        if (raw != null) {
          user.userId = raw;
          user.id = raw;
        }
      }
      return user;
    } catch (e) {
      this.logout();
      return null;
    }
  }

  getValidUserId(): string | null {
    const user = this.currentUser();
    if (!user) return null;
    const raw = user.userId ?? user.id;
    return raw ? String(raw) : null;
  }

  /**
   * RBAC: Check if the current user has an exact role match.
   * Compares case-insensitively against canonical role names in security.roles.
   */
  hasRole(role: string): boolean {
    if (!this.isLoggedIn()) return false;
    const user = this.currentUser();
    if (!user || !user.roles || !Array.isArray(user.roles)) return false;
    const target = role.toUpperCase();
    return user.roles.some((r) => r.toUpperCase() === target);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((r) => this.hasRole(r));
  }

  hasCapability(capability: Capability): boolean {
    if (!this.isLoggedIn()) return false;
    const user = this.currentUser();
    if (!user || !user.roles) return false;
    return user.roles.some((roleStr) => {
      const capabilities = ROLE_CAPABILITY_MAP[roleStr as UserRole];
      return capabilities ? capabilities.includes(capability) : false;
    });
  }

  /**
   * RBAC: Checks if the current user has a specific permission code.
   * Derives permissions from the ROLE_CAPABILITY_MAP based on user roles.
   */
  hasPermission(permissionCode: string): boolean {
    return this.hasCapability(permissionCode as Capability);
  }

  /**
   * ABAC: Checks if authenticated user has an active care team relationship with the patient.
   * SUPER_ADMIN and ORGANIZATION_ADMIN bypass patient-level checks.
   */
  hasActiveRelationship(patientId: string): boolean {
    if (!this.isLoggedIn()) return false;
    if (this.hasAnyRole(['SUPER_ADMIN', 'ORGANIZATION_ADMIN'])) {
      return true;
    }
    const user = this.currentUser();
    if (!user) return false;
    if (user.assignedPatientIds && user.assignedPatientIds.length > 0) {
      return user.assignedPatientIds.includes(patientId);
    }
    return true;
  }

  /**
   * Combined RBAC + ABAC: Checks permission AND patient context.
   * Frontend ABAC is advisory — backend enforces the real access decision.
   */
  canAccessPatient(patientId: string, permissionCode: string): boolean {
    if (!this.hasPermission(permissionCode)) return false;
    return this.hasActiveRelationship(patientId);
  }

  isSuperAdmin(): boolean {
    return this.hasRole('SUPER_ADMIN');
  }

  isOrganizationAdmin(): boolean {
    return this.hasRole('ORGANIZATION_ADMIN');
  }

  isAdmin(): boolean {
    return this.isSuperAdmin() || this.isOrganizationAdmin();
  }

  isPhysician(): boolean {
    return this.hasRole('PHYSICIAN');
  }

  isNurse(): boolean {
    return this.hasRole('NURSE');
  }

  isReceptionist(): boolean {
    return this.hasRole('RECEPTIONIST');
  }

  isLabTechnician(): boolean {
    return this.hasRole('LAB_TECHNICIAN');
  }

  isPharmacist(): boolean {
    return this.hasRole('PHARMACIST');
  }

  isBillingStaff(): boolean {
    return this.hasRole('BILLING_STAFF');
  }

  isPatient(): boolean {
    return this.hasRole('PATIENT');
  }

  getPrimaryRole():
    | 'Patient'
    | 'Physician'
    | 'Nurse'
    | 'Receptionist'
    | 'SuperAdmin'
    | 'OrganizationAdmin'
    | 'LabTechnician'
    | 'Pharmacist'
    | 'BillingStaff' {
    if (this.isSuperAdmin()) return 'SuperAdmin';
    if (this.isOrganizationAdmin()) return 'OrganizationAdmin';
    if (this.isPhysician()) return 'Physician';
    if (this.isNurse()) return 'Nurse';
    if (this.isReceptionist()) return 'Receptionist';
    if (this.isLabTechnician()) return 'LabTechnician';
    if (this.isPharmacist()) return 'Pharmacist';
    if (this.isBillingStaff()) return 'BillingStaff';
    return 'Patient';
  }

  createStaffUser(payload: StaffOnboardingRequestDTO): Observable<User> {
    return this.http
      .post<User>(`${this.apiUrl}/admin/create-user`, payload)
      .pipe(map((res: any) => (res && res.data ? res.data : res)));
  }
}
