import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/auth-user.model';
import { ActionButtonComponent } from '../../shared/ui/action-button.component';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
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
} from '@ng-icons/lucide';

type RoleCategoryTab = 'ALL' | 'DOCTOR' | 'NURSE' | 'STAFF' | 'PATIENT';

@Component({
  selector: 'app-org-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmCardImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmDialogImports,
    HlmInputImports,
    HlmSelectImports,
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
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Toast Alert Banner -->
      <div
        *ngIf="toastMessage()"
        [ngClass]="{
          'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300': toastMessage()?.type === 'success',
          'bg-destructive/15 border-destructive/40 text-destructive': toastMessage()?.type === 'error'
        }"
        class="flex items-center justify-between p-3.5 rounded-lg border text-xs font-medium transition-all shadow-xs"
      >
        <div class="flex items-center gap-2">
          <ng-icon [name]="toastMessage()?.type === 'success' ? 'lucideCheck' : 'lucideAlertCircle'" size="16" />
          <span>{{ toastMessage()?.text }}</span>
        </div>
        <button (click)="toastMessage.set(null)" class="text-muted-foreground hover:text-foreground">
          <ng-icon name="lucideX" size="14" />
        </button>
      </div>

      <!-- Header & Action Toolbar -->
      <div class="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Facility Staff Roster & User Management
            <span hlmBadge variant="secondary" class="text-[10px]">ORGANIZATION_ADMIN</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Manage clinic staff accounts, doctor/nurse credentials, medical licenses, and patient accounts.
          </p>
        </div>

        <!-- Role Creation Buttons & Reload -->
        <div class="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <button
            hlmBtn
            variant="outline"
            size="sm"
            (click)="loadUsers()"
            [disabled]="loading()"
            class="gap-1.5 text-xs h-9 px-3"
            title="Refresh Users from Backend"
          >
            <ng-icon name="lucideRefreshCw" size="14" [class.animate-spin]="loading()" />
            Refresh API
          </button>

          <button
            hlmBtn
            variant="default"
            size="sm"
            (click)="openCreateModal('PHYSICIAN')"
            class="gap-1.5 text-xs font-semibold h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ng-icon name="lucideStethoscope" size="14" /> + Doctor User
          </button>

          <button
            hlmBtn
            variant="default"
            size="sm"
            (click)="openCreateModal('NURSE')"
            class="gap-1.5 text-xs font-semibold h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <ng-icon name="lucideUserPlus" size="14" /> + Nurse User
          </button>

          <button
            hlmBtn
            variant="default"
            size="sm"
            (click)="openCreateModal('ORGANIZATION_ADMIN')"
            class="gap-1.5 text-xs font-semibold h-9 px-3 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <ng-icon name="lucideShieldCheck" size="14" /> + Staff / Admin
          </button>

          <button
            hlmBtn
            variant="outline"
            size="sm"
            (click)="openCreateModal('PATIENT')"
            class="gap-1.5 text-xs font-semibold h-9 px-3 border-cyan-600/40 hover:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
          >
            <ng-icon name="lucideUser" size="14" /> + Patient Account
          </button>
        </div>
      </div>

      <!-- Metrics KPI Summary Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div class="p-3.5 rounded-xl border border-border bg-card shadow-2xs flex flex-col justify-between">
          <div class="flex items-center justify-between text-muted-foreground">
            <span class="text-xs font-medium">Total Accounts</span>
            <ng-icon name="lucideUsers" size="16" class="text-foreground/70" />
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="text-xl font-bold text-foreground">{{ totalUsersCount() }}</span>
            <span class="text-[10px] text-muted-foreground">Database Records</span>
          </div>
        </div>

        <div class="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 dark:bg-blue-950/20 shadow-2xs flex flex-col justify-between">
          <div class="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span class="text-xs font-medium">Doctors</span>
            <ng-icon name="lucideStethoscope" size="16" />
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="text-xl font-bold text-blue-700 dark:text-blue-300">{{ doctorsCount() }}</span>
            <span hlmBadge variant="outline" class="text-[9px] border-blue-500/30 text-blue-600">MD / Specialists</span>
          </div>
        </div>

        <div class="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 shadow-2xs flex flex-col justify-between">
          <div class="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span class="text-xs font-medium">Nurses</span>
            <ng-icon name="lucideUserPlus" size="16" />
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="text-xl font-bold text-emerald-700 dark:text-emerald-300">{{ nursesCount() }}</span>
            <span hlmBadge variant="outline" class="text-[9px] border-emerald-500/30 text-emerald-600">Nursing Staff</span>
          </div>
        </div>

        <div class="p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 dark:bg-purple-950/20 shadow-2xs flex flex-col justify-between">
          <div class="flex items-center justify-between text-purple-600 dark:text-purple-400">
            <span class="text-xs font-medium">Staff & Admins</span>
            <ng-icon name="lucideShieldCheck" size="16" />
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="text-xl font-bold text-purple-700 dark:text-purple-300">{{ staffCount() }}</span>
            <span hlmBadge variant="outline" class="text-[9px] border-purple-500/30 text-purple-600">Admin / Support</span>
          </div>
        </div>

        <div class="p-3.5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 dark:bg-cyan-950/20 shadow-2xs flex flex-col justify-between">
          <div class="flex items-center justify-between text-cyan-600 dark:text-cyan-400">
            <span class="text-xs font-medium">Patients</span>
            <ng-icon name="lucideUser" size="16" />
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="text-xl font-bold text-cyan-700 dark:text-cyan-300">{{ patientsCount() }}</span>
            <span hlmBadge variant="outline" class="text-[9px] border-cyan-500/30 text-cyan-600">Patient Accounts</span>
          </div>
        </div>
      </div>

      <!-- Role Views Category Navigation Tabs -->
      <div class="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border overflow-x-auto text-xs">
        <button
          (click)="selectedRoleTab.set('ALL')"
          [ngClass]="{
            'bg-background font-bold text-foreground shadow-xs': selectedRoleTab() === 'ALL',
            'text-muted-foreground hover:text-foreground': selectedRoleTab() !== 'ALL'
          }"
          class="px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <ng-icon name="lucideUsers" size="14" />
          All Accounts ({{ totalUsersCount() }})
        </button>

        <button
          (click)="selectedRoleTab.set('DOCTOR')"
          [ngClass]="{
            'bg-background font-bold text-blue-600 dark:text-blue-400 shadow-xs': selectedRoleTab() === 'DOCTOR',
            'text-muted-foreground hover:text-foreground': selectedRoleTab() !== 'DOCTOR'
          }"
          class="px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <ng-icon name="lucideStethoscope" size="14" />
          Doctors ({{ doctorsCount() }})
        </button>

        <button
          (click)="selectedRoleTab.set('NURSE')"
          [ngClass]="{
            'bg-background font-bold text-emerald-600 dark:text-emerald-400 shadow-xs': selectedRoleTab() === 'NURSE',
            'text-muted-foreground hover:text-foreground': selectedRoleTab() !== 'NURSE'
          }"
          class="px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <ng-icon name="lucideUserPlus" size="14" />
          Nurses ({{ nursesCount() }})
        </button>

        <button
          (click)="selectedRoleTab.set('STAFF')"
          [ngClass]="{
            'bg-background font-bold text-purple-600 dark:text-purple-400 shadow-xs': selectedRoleTab() === 'STAFF',
            'text-muted-foreground hover:text-foreground': selectedRoleTab() !== 'STAFF'
          }"
          class="px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <ng-icon name="lucideShieldCheck" size="14" />
          Staff & Admins ({{ staffCount() }})
        </button>

        <button
          (click)="selectedRoleTab.set('PATIENT')"
          [ngClass]="{
            'bg-background font-bold text-cyan-600 dark:text-cyan-400 shadow-xs': selectedRoleTab() === 'PATIENT',
            'text-muted-foreground hover:text-foreground': selectedRoleTab() !== 'PATIENT'
          }"
          class="px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <ng-icon name="lucideUser" size="14" />
          Patient Accounts ({{ patientsCount() }})
        </button>
      </div>

      <!-- Search & Filters Control Bar -->
      <div class="p-3.5 rounded-xl border border-border bg-card shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div class="relative w-full md:w-96">
          <ng-icon name="lucideSearch" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            hlmInput
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search by name, username, email, dept, specialization, license..."
            class="pl-9 h-9 w-full text-xs bg-background"
          />
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted-foreground whitespace-nowrap">Verification Status:</span>
            <select
              [(ngModel)]="selectedStatusFilter"
              class="h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="SUSPENDED">Suspended / Locked</option>
            </select>
          </div>

          <span hlmBadge variant="outline" class="text-[11px] px-2.5 py-1">
            Showing {{ filteredUsers().length }} of {{ users().length }}
          </span>
        </div>
      </div>

      <!-- Users Table -->
      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">User / Account Info</th>
                <th hlmTableHead class="py-3 px-4 text-left">Assigned Roles</th>
                <th hlmTableHead class="py-3 px-4 text-left">Department / Specialization / License</th>
                <th hlmTableHead class="py-3 px-4 text-left">Security Status</th>
                <th hlmTableHead class="py-3 px-4 text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngIf="loading()" hlmTableRow>
                <td colspan="5" class="py-8 text-center text-muted-foreground">
                  <div class="flex items-center justify-center gap-2">
                    <ng-icon name="lucideRefreshCw" class="animate-spin" size="16" />
                    <span>Loading facility staff from database...</span>
                  </div>
                </td>
              </tr>

              <tr *ngIf="!loading() && filteredUsers().length === 0" hlmTableRow>
                <td colspan="5" class="py-8 text-center text-muted-foreground">
                  <p class="font-semibold text-foreground">No database accounts match the criteria.</p>
                  <p class="text-[11px] text-muted-foreground mt-0.5">Try adjusting your role view tab or search terms.</p>
                </td>
              </tr>

              <tr *ngFor="let u of filteredUsers()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <!-- User Info -->
                <td hlmTableCell class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <div
                      [ngClass]="getUserAvatarBg(u)"
                      class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs"
                    >
                      {{ getInitials(u.fullName || u.username) }}
                    </div>
                    <div>
                      <div class="font-semibold text-foreground flex items-center gap-1.5">
                        {{ u.fullName }}
                        <ng-icon *ngIf="isUserVerified(u)" name="lucideBadgeCheck" class="text-emerald-500" size="14" />
                      </div>
                      <div class="text-[11px] text-muted-foreground flex items-center gap-2">
                        <span class="font-mono text-muted-foreground/80">&#64;{{ u.username }}</span>
                        <span>&bull;</span>
                        <span>{{ u.email }}</span>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Roles -->
                <td hlmTableCell class="py-3 px-4">
                  <div class="flex flex-wrap gap-1">
                    <span
                      *ngFor="let r of getUserRoleNames(u)"
                      [ngClass]="getRoleBadgeClass(r)"
                      class="px-2 py-0.5 rounded-md text-[10px] font-medium border"
                    >
                      {{ formatRoleName(r) }}
                    </span>
                  </div>
                </td>

                <!-- Dept / Specialization / License -->
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">
                  <div class="space-y-0.5">
                    <div class="font-medium text-foreground">
                      {{ u.specialization || u.department || 'General Practice / Patient Account' }}
                    </div>
                    <div *ngIf="u.licenseNumber" class="text-[10px] flex items-center gap-1 text-blue-600 dark:text-blue-400 font-mono">
                      <ng-icon name="lucideBadgeCheck" size="12" />
                      License/NPI: {{ u.licenseNumber }}
                      <span *ngIf="u.qualifications" class="text-muted-foreground font-sans">({{ u.qualifications }})</span>
                    </div>
                  </div>
                </td>

                <!-- Status -->
                <td hlmTableCell class="py-3 px-4">
                  <span [ngClass]="getStatusBadgeClass(u.verificationStatus)" class="px-2.5 py-1 rounded-full text-[10px] font-semibold border flex items-center gap-1.5 w-fit">
                    <ng-icon [name]="u.verificationStatus === 'SUSPENDED' ? 'lucideLock' : 'lucideCheck'" size="12" />
                    {{ u.verificationStatus || 'VERIFIED' }}
                  </span>
                </td>

                <!-- Action Buttons -->
                <td hlmTableCell class="py-3 px-4 text-center">
                  <div class="flex items-center justify-center gap-1">
                    <button
                      hlmBtn
                      variant="ghost"
                      size="icon"
                      (click)="openViewModal(u)"
                      title="View Details"
                      class="h-7 w-7 text-muted-foreground hover:text-foreground"
                    >
                      <ng-icon name="lucideEye" size="14" />
                    </button>

                    <button
                      hlmBtn
                      variant="ghost"
                      size="icon"
                      (click)="openEditModal(u)"
                      title="Edit Account & Roles"
                      class="h-7 w-7 text-muted-foreground hover:text-blue-600"
                    >
                      <ng-icon name="lucideEdit" size="14" />
                    </button>

                    <button
                      hlmBtn
                      variant="ghost"
                      size="icon"
                      (click)="openResetPasswordModal(u)"
                      title="Reset Password"
                      class="h-7 w-7 text-muted-foreground hover:text-amber-600"
                    >
                      <ng-icon name="lucideKey" size="14" />
                    </button>

                    <button
                      hlmBtn
                      variant="ghost"
                      size="icon"
                      (click)="toggleUserStatus(u)"
                      [title]="u.verificationStatus === 'SUSPENDED' ? 'Unlock / Verify' : 'Lock / Suspend Account'"
                      class="h-7 w-7 text-muted-foreground hover:text-purple-600"
                    >
                      <ng-icon [name]="u.verificationStatus === 'SUSPENDED' ? 'lucideUnlock' : 'lucideLock'" size="14" />
                    </button>

                    <button
                      hlmBtn
                      variant="ghost"
                      size="icon"
                      (click)="openDeleteModal(u)"
                      title="Delete User"
                      class="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <ng-icon name="lucideTrash2" size="14" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class OrgAdminUsersComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  toastMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  searchQuery = signal<string>('');
  selectedRoleTab = signal<RoleCategoryTab>('ALL');
  selectedStatusFilter = signal<string>('ALL');

  showCreateModal = signal<boolean>(false);
  showViewModal = signal<boolean>(false);
  showEditModal = signal<boolean>(false);
  showResetPasswordModal = signal<boolean>(false);
  showDeleteModal = signal<boolean>(false);

  selectedUserForView = signal<User | null>(null);
  selectedUserForEdit = signal<User | null>(null);
  selectedUserForReset = signal<User | null>(null);
  selectedUserForDelete = signal<User | null>(null);

  newPasswordInput = '';
  generatedTempPassword = '';

  newUserForm: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    role: string;
    department: string;
    specialization: string;
    licenseNumber: string;
    qualifications: string;
    yearsOfExperience?: number;
    medicalBoardState?: string;
  } = {
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'PHYSICIAN',
    department: '',
    specialization: '',
    licenseNumber: '',
    qualifications: '',
  };

  editUserForm: {
    id: string | number;
    fullName: string;
    email: string;
    department: string;
    specialization: string;
    licenseNumber: string;
    qualifications: string;
    verificationStatus: string;
    roles: string[];
  } = {
    id: 0,
    fullName: '',
    email: '',
    department: '',
    specialization: '',
    licenseNumber: '',
    qualifications: '',
    verificationStatus: 'VERIFIED',
    roles: [],
  };

  availableRoleOptions = [
    { value: 'ORGANIZATION_ADMIN', label: 'Organization Admin' },
    { value: 'PHYSICIAN', label: 'Doctor' },
    { value: 'NURSE', label: 'Nurse' },
    { value: 'RECEPTIONIST', label: 'Receptionist' },
    { value: 'PHARMACIST', label: 'Pharmacist' },
    { value: 'LAB_TECHNICIAN', label: 'Lab Tech' },
    { value: 'BILLING_STAFF', label: 'Billing Officer' },
    { value: 'AUDITOR', label: 'Auditor' },
    { value: 'PATIENT', label: 'Patient' },
  ];

  totalUsersCount = computed(() => this.users().length);
  doctorsCount = computed(() => this.users().filter((u) => this.getUserRoleNames(u).includes('PHYSICIAN')).length);
  nursesCount = computed(() => this.users().filter((u) => this.getUserRoleNames(u).includes('NURSE')).length);
  staffCount = computed(() => this.users().filter((u) => {
    const roles = this.getUserRoleNames(u);
    return roles.includes('ORGANIZATION_ADMIN') || roles.includes('ORGANIZATION_ADMIN') || roles.includes('RECEPTIONIST');
  }).length);
  patientsCount = computed(() => this.users().filter((u) => this.getUserRoleNames(u).includes('PATIENT')).length);

  filteredUsers = computed(() => {
    let list = this.users();
    const q = this.searchQuery().toLowerCase().trim();
    const tab = this.selectedRoleTab();
    const status = this.selectedStatusFilter();

    if (tab === 'DOCTOR') list = list.filter((u) => this.getUserRoleNames(u).includes('PHYSICIAN'));
    else if (tab === 'NURSE') list = list.filter((u) => this.getUserRoleNames(u).includes('NURSE'));
    else if (tab === 'STAFF') list = list.filter((u) => {
      const r = this.getUserRoleNames(u);
      return r.includes('ORGANIZATION_ADMIN') || r.includes('ORGANIZATION_ADMIN') || r.includes('RECEPTIONIST');
    });
    else if (tab === 'PATIENT') list = list.filter((u) => this.getUserRoleNames(u).includes('PATIENT'));

    if (status !== 'ALL') {
      list = list.filter((u) => (u.verificationStatus || 'VERIFIED') === status);
    }

    if (q) {
      list = list.filter((u) =>
        (u.fullName || '').toLowerCase().includes(q) ||
        (u.username || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.department || '').toLowerCase().includes(q) ||
        (u.specialization || '').toLowerCase().includes(q) ||
        (u.licenseNumber || '').toLowerCase().includes(q)
      );
    }

    return list;
  });

  constructor(private apiService: ApiService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.apiService.getUsers().subscribe({
      next: (res) => {
        this.users.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getUserRoleNames(u: User): string[] {
    if (Array.isArray(u.roles) && u.roles.length > 0) return u.roles;
    return ['PATIENT'];
  }

  formatRoleName(role: string): string {
    return role.replace('ROLE_', '');
  }

  getRoleBadgeClass(role: string): string {
    if (role.includes('ADMIN')) return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
    if (role.includes('DOCTOR')) return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
    if (role.includes('NURSE')) return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
    if (role.includes('PATIENT')) return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30';
    return 'bg-secondary text-secondary-foreground border-border';
  }

  getStatusBadgeClass(status?: string): string {
    if (status === 'SUSPENDED') return 'bg-destructive/10 text-destructive border-destructive/30';
    if (status === 'PENDING_VERIFICATION') return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
    return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
  }

  getUserAvatarBg(u: User): string {
    const roles = this.getUserRoleNames(u);
    if (roles.includes('PHYSICIAN')) return 'bg-blue-500/20 text-blue-600';
    if (roles.includes('NURSE')) return 'bg-emerald-500/20 text-emerald-600';
    if (roles.includes('ORGANIZATION_ADMIN')) return 'bg-purple-500/20 text-purple-600';
    return 'bg-secondary text-secondary-foreground';
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  isUserVerified(u: User): boolean {
    return u.verificationStatus === 'VERIFIED' || !u.verificationStatus;
  }

  openCreateModal(defaultRole = 'PHYSICIAN'): void {
    this.newUserForm = {
      fullName: '',
      username: '',
      email: '',
      password: '',
      role: defaultRole,
      department: '',
      specialization: '',
      licenseNumber: '',
      qualifications: '',
    };
    this.showCreateModal.set(true);
  }

  onFormRoleChange(): void {}
  isDoctorRole(role: string): boolean {
    return role === 'PHYSICIAN';
  }

  getPresetRoleLabel(): string {
    return this.formatRoleName(this.newUserForm.role);
  }

  submitCreateUser(): void {
    if (!this.newUserForm.username || !this.newUserForm.email || !this.newUserForm.password) {
      this.toastMessage.set({ text: 'Username, Email, and Password are required.', type: 'error' });
      return;
    }

    this.saving.set(true);
    this.authService.createStaffUser(this.newUserForm).subscribe({
      next: () => {
        this.saving.set(false);
        this.showCreateModal.set(false);
        this.toastMessage.set({ text: `Account for ${this.newUserForm.fullName || this.newUserForm.username} created successfully.`, type: 'success' });
        this.loadUsers();
      },
      error: (err: any) => {
        this.saving.set(false);
        this.toastMessage.set({ text: err.error?.message || 'Failed to create user account.', type: 'error' });
      },
    });
  }

  openViewModal(u: User): void {
    this.selectedUserForView.set(u);
    this.showViewModal.set(true);
  }

  openEditModal(u: User): void {
    this.selectedUserForEdit.set(u);
    this.editUserForm = {
      id: u.id,
      fullName: u.fullName || '',
      email: u.email || '',
      department: u.department || '',
      specialization: u.specialization || '',
      licenseNumber: u.licenseNumber || '',
      qualifications: u.qualifications || '',
      verificationStatus: u.verificationStatus || 'VERIFIED',
      roles: [...this.getUserRoleNames(u)],
    };
    this.showEditModal.set(true);
  }

  toggleRoleInEditForm(role: string): void {
    const idx = this.editUserForm.roles.indexOf(role);
    if (idx >= 0) this.editUserForm.roles.splice(idx, 1);
    else this.editUserForm.roles.push(role);
  }

  submitEditUser(): void {
    const user = this.selectedUserForEdit();
    if (!user) return;

    this.saving.set(true);
    this.apiService.updateUser(user.id, this.editUserForm).subscribe({
      next: () => {
        this.saving.set(false);
        this.showEditModal.set(false);
        this.toastMessage.set({ text: 'User details & permissions updated successfully.', type: 'success' });
        this.loadUsers();
      },
      error: () => {
        this.saving.set(false);
        this.toastMessage.set({ text: 'Failed to update user details.', type: 'error' });
      },
    });
  }

  openResetPasswordModal(u: User): void {
    this.selectedUserForReset.set(u);
    this.newPasswordInput = '';
    this.generatedTempPassword = '';
    this.showResetPasswordModal.set(true);
  }

  submitResetPassword(): void {
    const u = this.selectedUserForReset();
    if (!u) return;

    const pass = this.newPasswordInput || Math.random().toString(36).slice(-8) + '!A1';
    this.saving.set(true);
    this.apiService.resetUserPassword(u.id, pass).subscribe({
      next: () => {
        this.saving.set(false);
        this.generatedTempPassword = pass;
        this.toastMessage.set({ text: `Password reset successfully for @${u.username}.`, type: 'success' });
      },
      error: () => {
        this.saving.set(false);
        this.toastMessage.set({ text: 'Password reset failed.', type: 'error' });
      },
    });
  }

  toggleUserStatus(u: User): void {
    const newStatus = u.verificationStatus === 'SUSPENDED' ? 'VERIFIED' : 'SUSPENDED';
    this.apiService.updateUserStatus(u.id, newStatus).subscribe({
      next: () => {
        this.toastMessage.set({ text: `Account @${u.username} status updated to ${newStatus}.`, type: 'success' });
        this.loadUsers();
      },
    });
  }

  openDeleteModal(u: User): void {
    this.selectedUserForDelete.set(u);
    this.showDeleteModal.set(true);
  }
}
