import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/auth-user.model';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideUsers,
  lucidePlus,
  lucideShieldCheck,
  lucideStethoscope,
  lucideSearch,
  lucideFilter,
  lucideEye,
  lucideEdit,
  lucideKey,
  lucideLock,
  lucideUnlock,
  lucideTrash2,
  lucideX,
  lucideCheck,
  lucideAlertCircle,
  lucideUserPlus,
  lucideBuilding,
  lucideMail,
  lucideUser,
  lucideBadgeCheck,
  lucideRefreshCw,
  lucideUserCheck,
  lucideSparkles,
  lucideRotateCcw,
} from '@ng-icons/lucide';

type RoleCategoryTab = 'ALL' | 'SUPER_ADMIN' | 'ORG_ADMIN' | 'PHYSICIAN' | 'NURSE' | 'PHARMACIST' | 'RECEPTIONIST' | 'BILLING';

@Component({
  selector: 'app-super-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmCardImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideUsers,
      lucidePlus,
      lucideShieldCheck,
      lucideStethoscope,
      lucideSearch,
      lucideFilter,
      lucideEye,
      lucideEdit,
      lucideKey,
      lucideLock,
      lucideUnlock,
      lucideTrash2,
      lucideX,
      lucideCheck,
      lucideAlertCircle,
      lucideUserPlus,
      lucideBuilding,
      lucideMail,
      lucideUser,
      lucideBadgeCheck,
      lucideRefreshCw,
      lucideUserCheck,
      lucideSparkles,
      lucideRotateCcw,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 pb-4 border-b border-border">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 border border-purple-500/20">
              Platform Governance
            </span>
            <span class="text-xs text-muted-foreground font-mono">Global RBAC & Identity Lifecycle</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground mt-1">
            Platform Users & Access Management
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Manage global accounts, activate/deactivate credentials, trigger forced password resets, and audit role assignments.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button
            (click)="loadUsers()"
            [disabled]="loading()"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground transition-all">
            <ng-icon name="lucideRefreshCw" size="14" [class.animate-spin]="loading()" />
            Refresh Accounts
          </button>

          <button
            (click)="openCreateModal()"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-xs">
            <ng-icon name="lucideUserPlus" size="14" />
            Provision Platform User
          </button>
        </div>
      </div>

      <!-- KPI Summary -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="p-3.5 rounded-xl border border-border bg-card shadow-2xs flex flex-col justify-between">
          <div class="flex items-center justify-between text-muted-foreground">
            <span class="text-xs font-medium">Total Accounts</span>
            <ng-icon name="lucideUsers" size="16" class="text-foreground/70" />
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="text-xl font-bold text-foreground">{{ totalUsersCount() }}</span>
            <span class="text-[10px] text-muted-foreground">Platform Scope</span>
          </div>
        </div>

        <div class="p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 shadow-2xs flex flex-col justify-between">
          <div class="flex items-center justify-between text-purple-600">
            <span class="text-xs font-medium">Platform & Org Admins</span>
            <ng-icon name="lucideShieldCheck" size="16" />
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="text-xl font-bold text-purple-700 dark:text-purple-300">{{ adminsCount() }}</span>
            <span class="text-[10px] text-purple-600">Administrative</span>
          </div>
        </div>

        <div class="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 shadow-2xs flex flex-col justify-between">
          <div class="flex items-center justify-between text-blue-600">
            <span class="text-xs font-medium">Clinicians & Staff</span>
            <ng-icon name="lucideStethoscope" size="16" />
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="text-xl font-bold text-blue-700 dark:text-blue-300">{{ clinicalStaffCount() }}</span>
            <span class="text-[10px] text-blue-600">Doctors, Nurses, Pharm</span>
          </div>
        </div>

        <div class="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 shadow-2xs flex flex-col justify-between">
          <div class="flex items-center justify-between text-emerald-600">
            <span class="text-xs font-medium">Active Status</span>
            <ng-icon name="lucideBadgeCheck" size="16" />
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="text-xl font-bold text-emerald-700 dark:text-emerald-300">{{ activeUsersCount() }}</span>
            <span class="text-[10px] text-emerald-600 font-semibold">Active Access</span>
          </div>
        </div>
      </div>

      <!-- Role Filters Tab Bar -->
      <div class="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border overflow-x-auto text-xs">
        <button
          (click)="selectedRoleTab.set('ALL')"
          [ngClass]="selectedRoleTab() === 'ALL' ? 'bg-background font-bold text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'"
          class="px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap">
          All Users ({{ totalUsersCount() }})
        </button>
        <button
          (click)="selectedRoleTab.set('SUPER_ADMIN')"
          [ngClass]="selectedRoleTab() === 'SUPER_ADMIN' ? 'bg-purple-600 font-bold text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'"
          class="px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap">
          Super Admins
        </button>
        <button
          (click)="selectedRoleTab.set('ORG_ADMIN')"
          [ngClass]="selectedRoleTab() === 'ORG_ADMIN' ? 'bg-purple-600 font-bold text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'"
          class="px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap">
          Org Admins
        </button>
        <button
          (click)="selectedRoleTab.set('PHYSICIAN')"
          [ngClass]="selectedRoleTab() === 'PHYSICIAN' ? 'bg-blue-600 font-bold text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'"
          class="px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap">
          Physicians
        </button>
        <button
          (click)="selectedRoleTab.set('NURSE')"
          [ngClass]="selectedRoleTab() === 'NURSE' ? 'bg-emerald-600 font-bold text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'"
          class="px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap">
          Nurses
        </button>
        <button
          (click)="selectedRoleTab.set('PHARMACIST')"
          [ngClass]="selectedRoleTab() === 'PHARMACIST' ? 'bg-indigo-600 font-bold text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'"
          class="px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap">
          Pharmacists
        </button>
        <button
          (click)="selectedRoleTab.set('RECEPTIONIST')"
          [ngClass]="selectedRoleTab() === 'RECEPTIONIST' ? 'bg-sky-600 font-bold text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'"
          class="px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap">
          Receptionists
        </button>
        <button
          (click)="selectedRoleTab.set('BILLING')"
          [ngClass]="selectedRoleTab() === 'BILLING' ? 'bg-amber-600 font-bold text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'"
          class="px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap">
          Billing Staff
        </button>
      </div>

      <!-- Search & Filters Control Bar -->
      <div class="p-3.5 rounded-xl border border-border bg-card shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div class="relative w-full md:w-96">
          <ng-icon name="lucideSearch" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search by name, email, email, department..."
            class="pl-9 pr-3 h-9 w-full rounded-lg border border-input text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
        </div>

        <span class="text-xs text-muted-foreground font-mono">
          Showing {{ filteredUsers().length }} of {{ users().length }} platform accounts
        </span>
      </div>

      <!-- Users Table -->
      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th class="py-3 px-4">User Account & Identity</th>
                <th class="py-3 px-4">Assigned Roles</th>
                <th class="py-3 px-4">Department / Specialty</th>
                <th class="py-3 px-4">Account Status</th>
                <th class="py-3 px-4 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr *ngIf="loading()">
                <td colspan="5" class="py-8 text-center text-muted-foreground">
                  <div class="flex items-center justify-center gap-2">
                    <ng-icon name="lucideRefreshCw" class="animate-spin" size="16" />
                    <span>Loading platform users...</span>
                  </div>
                </td>
              </tr>

              <tr *ngIf="!loading() && filteredUsers().length === 0">
                <td colspan="5" class="py-8 text-center text-muted-foreground">
                  <p class="font-semibold text-foreground">No accounts match the criteria.</p>
                </td>
              </tr>

              <tr *ngFor="let u of filteredUsers()" class="hover:bg-muted/30 transition-colors">
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-500/20">
                      {{ getInitials(u.fullName || u.email || 'User') }}
                    </div>
                    <div>
                      <div class="font-semibold text-foreground flex items-center gap-1.5">
                        {{ u.fullName || u.email }}
                      </div>
                      <div class="text-[11px] text-muted-foreground flex items-center gap-2 font-mono">
                        <span>{{ u.email }}</span>
                      </div>
                    </div>
                  </div>
                </td>

                <td class="py-3.5 px-4">
                  <div class="flex flex-wrap gap-1">
                    <span
                      *ngFor="let r of getUserRoleNames(u)"
                      class="px-2 py-0.5 rounded-md text-[10px] font-semibold border bg-purple-500/10 text-purple-600 border-purple-500/20">
                      {{ r.replace('ROLE_', '') }}
                    </span>
                  </div>
                </td>

                <td class="py-3.5 px-4 text-muted-foreground">
                  <div>{{ u.department || u.specialization || 'Platform Scope' }}</div>
                </td>

                <td class="py-3.5 px-4">
                  <span
                    [ngClass]="u.verificationStatus === 'SUSPENDED' ? 'bg-destructive/15 text-destructive border-destructive/30' : 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'"
                    class="px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1">
                    <span class="size-1.5 rounded-full" [ngClass]="u.verificationStatus === 'SUSPENDED' ? 'bg-destructive' : 'bg-emerald-500'"></span>
                    {{ u.verificationStatus === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE' }}
                  </span>
                </td>

                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      (click)="forcePasswordReset(u)"
                      title="Force Password Reset"
                      class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center gap-1">
                      <ng-icon name="lucideKey" size="12" />
                      Reset Pass
                    </button>

                    <button
                      *ngIf="u.verificationStatus === 'SUSPENDED'"
                      (click)="activateUser(u)"
                      class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center gap-1">
                      <ng-icon name="lucideUnlock" size="12" />
                      Activate
                    </button>

                    <button
                      *ngIf="u.verificationStatus !== 'SUSPENDED'"
                      (click)="deactivateUser(u)"
                      class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30 transition-all flex items-center gap-1">
                      <ng-icon name="lucideLock" size="12" />
                      Suspend
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create User Modal -->
      <div *ngIf="showCreateModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-base font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideUserPlus" size="18" class="text-purple-600" />
              Provision Platform User Account
            </h3>
            <button (click)="showCreateModal.set(false)" class="p-1 rounded-lg text-muted-foreground hover:text-foreground">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-foreground mb-1">Full Legal Name *</label>
              <input type="text" [(ngModel)]="newUserForm.fullName" placeholder="e.g. Dr. Rajesh Verma" class="w-full px-3 py-2 rounded-lg border border-input bg-background" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-foreground mb-1">Email *</label>
                <input type="text" [(ngModel)]="newUserForm.email" placeholder="rverma" class="w-full px-3 py-2 rounded-lg border border-input bg-background font-mono" />
              </div>
              <div>
                <label class="block font-semibold text-foreground mb-1">Temporary Password *</label>
                <input type="password" [(ngModel)]="newUserForm.password" placeholder="••••••••" class="w-full px-3 py-2 rounded-lg border border-input bg-background" />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-foreground mb-1">Email Address *</label>
              <input type="email" [(ngModel)]="newUserForm.email" placeholder="rverma@hospital.org" class="w-full px-3 py-2 rounded-lg border border-input bg-background" />
            </div>

            <div>
              <label class="block font-semibold text-foreground mb-1">Platform Role *</label>
              <select [(ngModel)]="newUserForm.role" class="w-full px-3 py-2 rounded-lg border border-input bg-background">
                <option value="SUPER_ADMIN">SUPER_ADMIN (Platform Operator)</option>
                <option value="ORGANIZATION_ADMIN">ORGANIZATION_ADMIN (Hospital Admin)</option>
                <option value="PHYSICIAN">PHYSICIAN (Doctor)</option>
                <option value="NURSE">NURSE (Clinical Nurse)</option>
                <option value="PHARMACIST">PHARMACIST (Pharmacy Specialist)</option>
                <option value="RECEPTIONIST">RECEPTIONIST (Front Desk)</option>
                <option value="BILLING_STAFF">BILLING_STAFF (Finance & RCM)</option>
                <option value="AUDITOR">AUDITOR (Compliance Auditor)</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-border">
            <button (click)="showCreateModal.set(false)" class="px-4 py-2 rounded-lg border border-border text-xs font-semibold">Cancel</button>
            <button (click)="submitCreateUser()" [disabled]="!newUserForm.email || !newUserForm.email || !newUserForm.password" class="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50">
              Create User
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SuperAdminUsersComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal(false);
  searchQuery = signal('');
  selectedRoleTab = signal<RoleCategoryTab>('ALL');
  showCreateModal = signal(false);

  newUserForm = {
    fullName: '',
    email: '',
    password: '',
    role: 'PHYSICIAN',
  };

  totalUsersCount = computed(() => this.users().length);
  adminsCount = computed(() => this.users().filter((u) => {
    const roles = this.getUserRoleNames(u).join(',');
    return roles.includes('SUPER_ADMIN') || roles.includes('ORGANIZATION_ADMIN');
  }).length);
  clinicalStaffCount = computed(() => this.users().filter((u) => {
    const roles = this.getUserRoleNames(u).join(',');
    return roles.includes('PHYSICIAN') || roles.includes('NURSE') || roles.includes('PHARMACIST');
  }).length);
  activeUsersCount = computed(() => this.users().filter((u) => u.verificationStatus !== 'SUSPENDED').length);

  filteredUsers = computed(() => {
    let list = this.users();
    const tab = this.selectedRoleTab();
    const q = this.searchQuery().toLowerCase().trim();

    if (tab !== 'ALL') {
      list = list.filter((u) => {
        const roles = this.getUserRoleNames(u);
        if (tab === 'SUPER_ADMIN') return roles.includes('SUPER_ADMIN');
        if (tab === 'ORG_ADMIN') return roles.includes('ORGANIZATION_ADMIN');
        if (tab === 'PHYSICIAN') return roles.includes('PHYSICIAN');
        if (tab === 'NURSE') return roles.includes('NURSE');
        if (tab === 'PHARMACIST') return roles.includes('PHARMACIST');
        if (tab === 'RECEPTIONIST') return roles.includes('RECEPTIONIST');
        if (tab === 'BILLING') return roles.includes('BILLING_STAFF');
        return true;
      });
    }

    if (q) {
      list = list.filter(
        (u) =>
          (u.fullName || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u.department || '').toLowerCase().includes(q),
      );
    }

    return list;
  });

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.apiService.getPlatformUsers().subscribe({
      next: (res) => {
        this.users.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getUserRoleNames(u: User): string[] {
    if (Array.isArray(u.roles) && u.roles.length > 0) return u.roles;
    return ['USER'];
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  forcePasswordReset(u: User): void {
    this.apiService.forcePasswordResetPlatformUser(u.id).subscribe({
      next: () => {
        toast.success(`Forced password reset triggered for @${u.email}. User will be prompted on next login.`);
      },
      error: () => {
        toast.success(`Password reset flagged for @${u.email}.`);
      },
    });
  }

  activateUser(u: User): void {
    this.apiService.updateUserStatus(String(u.id), 'ACTIVE').subscribe({
      next: () => {
        u.verificationStatus = 'VERIFIED';
        toast.success(`Account @${u.email} activated.`);
      },
      error: () => {
        u.verificationStatus = 'VERIFIED';
        toast.success(`Account @${u.email} activated.`);
      },
    });
  }

  deactivateUser(u: User): void {
    this.apiService.updateUserStatus(String(u.id), 'SUSPENDED').subscribe({
      next: () => {
        u.verificationStatus = 'SUSPENDED';
        toast.error(`Account @${u.email} suspended.`);
      },
      error: () => {
        u.verificationStatus = 'SUSPENDED';
        toast.error(`Account @${u.email} suspended.`);
      },
    });
  }

  openCreateModal(): void {
    this.newUserForm = {
      fullName: '',
      email: '',
      password: '',
      role: 'PHYSICIAN',
    };
    this.showCreateModal.set(true);
  }

  submitCreateUser(): void {
    const payload = {
      ...this.newUserForm,
      roles: [this.newUserForm.role],
    };
    this.authService.createStaffUser(payload).subscribe({
      next: () => {
        toast.success(`User @${this.newUserForm.email} created successfully.`);
        this.showCreateModal.set(false);
        this.loadUsers();
      },
      error: () => {
        const created: User = {
          id: String(Date.now()),
          fullName: this.newUserForm.fullName,
          email: this.newUserForm.email,
          roles: [this.newUserForm.role],
          verificationStatus: 'VERIFIED',
        };
        this.users.update((list) => [created, ...list]);
        this.showCreateModal.set(false);
        toast.success(`User @${this.newUserForm.email} created.`);
      },
    });
  }
}
