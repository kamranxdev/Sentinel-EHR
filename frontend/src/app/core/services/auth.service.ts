import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { JwtAuthResponse } from '../models/models';
import { Capability, ROLE_CAPABILITY_MAP, UserRole } from '../models/permissions.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/v1/auth';

  currentUser = signal<JwtAuthResponse | null>(this.getStoredUser());

  constructor(private http: HttpClient) {}

  isTokenExpired(token: string | null, offsetSeconds = 5): boolean {
    if (!token) return true;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      if (payload && payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        return payload.exp < (now + offsetSeconds);
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

  login(credentials: { username: string; password: string }): Observable<JwtAuthResponse> {
    return this.http.post<JwtAuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        const raw = res.userId ?? res.id;
        const uid = raw != null ? Number(raw) : NaN;
        if (!isNaN(uid) && uid > 0) {
          res.userId = uid;
          res.id = uid;
        }
        localStorage.setItem('sentinel_token', res.accessToken);
        localStorage.setItem('sentinel_user', JSON.stringify(res));
        this.currentUser.set(res);
      }),
    );
  }

  register(userData: {
    username: string;
    password: string;
    email: string;
    fullName: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('sentinel_token');
    localStorage.removeItem('sentinel_user');
    this.currentUser.set(null);
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
    if (!data) return null;
    try {
      const user = JSON.parse(data);
      if (user) {
        const raw = user.userId ?? user.id;
        const uid = raw != null ? Number(raw) : NaN;
        if (!isNaN(uid) && uid > 0) {
          user.userId = uid;
          user.id = uid;
        } else {
          delete user.userId;
          delete user.id;
        }
      }
      return user;
    } catch (e) {
      this.logout();
      return null;
    }
  }

  getValidUserId(): number | null {
    const user = this.currentUser();
    if (!user) return null;
    const raw = user.userId ?? user.id;
    if (raw == null) return null;
    const num = Number(raw);
    return !isNaN(num) && num > 0 ? num : null;
  }

  hasRole(role: string): boolean {
    if (!this.isLoggedIn()) return false;
    const user = this.currentUser();
    if (!user) return false;
    const target = role.startsWith('ROLE_') ? role : 'ROLE_' + role.toUpperCase();
    return user.roles.includes(target);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((r) => this.hasRole(r));
  }

  hasCapability(capability: Capability): boolean {
    if (!this.isLoggedIn()) return false;
    const user = this.currentUser();
    if (!user || !user.roles) return false;
    return user.roles.some((roleStr) => {
      const role = roleStr as UserRole;
      const capabilities = ROLE_CAPABILITY_MAP[role];
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
   * Admin/Auditors bypass relationship checks; clinicians match against assigned patient IDs.
   */
  hasActiveRelationship(patientId: number): boolean {
    if (!this.isLoggedIn()) return false;
    if (this.hasAnyRole(['ROLE_SYS_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_ADMIN', 'ROLE_AUDITOR'])) {
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
   * Admin/Auditor roles bypass patient-level ABAC on frontend.
   */
  canAccessPatient(patientId: number, permissionCode: string): boolean {
    if (!this.hasPermission(permissionCode)) return false;
    return this.hasActiveRelationship(patientId);
  }

  isReceptionist(): boolean {
    return this.hasRole('ROLE_RECEPTIONIST') || this.hasRole('ROLE_ADMIN');
  }

  isNurse(): boolean {
    return this.hasRole('ROLE_NURSE') || this.hasRole('ROLE_ADMIN');
  }

  isDoctor(): boolean {
    return this.hasRole('ROLE_DOCTOR') || this.hasRole('ROLE_ADMIN');
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  isPatient(): boolean {
    return this.hasRole('ROLE_PATIENT');
  }

  isAuditor(): boolean {
    return this.hasRole('ROLE_AUDITOR');
  }

  getPrimaryRole(): 'Patient' | 'Doctor' | 'Nurse' | 'Receptionist' | 'Admin' | 'Auditor' {
    if (this.hasRole('ROLE_ADMIN')) return 'Admin';
    if (this.hasRole('ROLE_RECEPTIONIST')) return 'Receptionist';
    if (this.hasRole('ROLE_DOCTOR')) return 'Doctor';
    if (this.hasRole('ROLE_NURSE')) return 'Nurse';
    if (this.hasRole('ROLE_AUDITOR')) return 'Auditor';
    return 'Patient';
  }

  createStaffUser(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/create-user`, payload);
  }
}

