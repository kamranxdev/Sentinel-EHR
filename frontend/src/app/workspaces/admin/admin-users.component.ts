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
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ActionButtonComponent,
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
            User Identity & Access Management
            <span hlmBadge variant="secondary" class="text-[10px]">Live Database Sync</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Provision staff credentials, role-based access control, medical licenses, and patient account management.
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
            (click)="openCreateModal('ROLE_DOCTOR')"
            class="gap-1.5 text-xs font-semibold h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ng-icon name="lucideStethoscope" size="14" /> + Doctor User
          </button>

          <button
            hlmBtn
            variant="default"
            size="sm"
            (click)="openCreateModal('ROLE_NURSE')"
            class="gap-1.5 text-xs font-semibold h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <ng-icon name="lucideUserPlus" size="14" /> + Nurse User
          </button>

          <button
            hlmBtn
            variant="default"
            size="sm"
            (click)="openCreateModal('ROLE_ADMIN')"
            class="gap-1.5 text-xs font-semibold h-9 px-3 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <ng-icon name="lucideShieldCheck" size="14" /> + Staff / Admin
          </button>

          <button
            hlmBtn
            variant="outline"
            size="sm"
            (click)="openCreateModal('ROLE_PATIENT')"
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
                    <span>Loading users from database...</span>
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

      <!-- CREATE USER MODAL -->
      <div *ngIf="showCreateModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div class="w-full max-w-xl bg-card border border-border rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
          <div class="p-4 border-b border-border flex items-center justify-between bg-muted/30">
            <div>
              <h3 class="font-bold text-base text-foreground flex items-center gap-2">
                Provision New Account
                <span hlmBadge variant="secondary" class="text-[10px]">{{ getPresetRoleLabel() }}</span>
              </h3>
              <p class="text-xs text-muted-foreground">Fill in credentials and role parameters to create system identity.</p>
            </div>
            <button (click)="showCreateModal.set(false)" class="text-muted-foreground hover:text-foreground">
              <ng-icon name="lucideX" size="18" />
            </button>
          </div>

          <div class="p-5 space-y-4 overflow-y-auto">
            <!-- Role Selection -->
            <div>
              <label class="block text-xs font-semibold text-foreground mb-1">Account Role Type *</label>
              <select
                [(ngModel)]="newUserForm.role"
                (change)="onFormRoleChange()"
                class="w-full h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground"
              >
                <option value="ROLE_DOCTOR">Physician / Doctor (ROLE_DOCTOR)</option>
                <option value="ROLE_NURSE">Nursing Staff (ROLE_NURSE)</option>
                <option value="ROLE_ADMIN">Facility Admin (ROLE_ADMIN)</option>
                <option value="ROLE_SYS_ADMIN">System Administrator (ROLE_SYS_ADMIN)</option>
                <option value="ROLE_RECEPTIONIST">Receptionist / Front Desk (ROLE_RECEPTIONIST)</option>
                <option value="ROLE_PHARMACIST">Pharmacist (ROLE_PHARMACIST)</option>
                <option value="ROLE_LAB_TECH">Lab Technician (ROLE_LAB_TECH)</option>
                <option value="ROLE_PATIENT">Patient Account (ROLE_PATIENT)</option>
              </select>
            </div>

            <!-- Standard Credentials -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-foreground mb-1">Full Name *</label>
                <input hlmInput type="text" [(ngModel)]="newUserForm.fullName" placeholder="e.g. Dr. Sarah Jenkins" class="w-full h-9 text-xs" />
              </div>
              <div>
                <label class="block text-xs font-medium text-foreground mb-1">Username *</label>
                <input hlmInput type="text" [(ngModel)]="newUserForm.username" placeholder="e.g. sjenkins" class="w-full h-9 text-xs" />
              </div>
              <div>
                <label class="block text-xs font-medium text-foreground mb-1">Email Address *</label>
                <input hlmInput type="email" [(ngModel)]="newUserForm.email" placeholder="e.g. sjenkins@sentinel.org" class="w-full h-9 text-xs" />
              </div>
              <div>
                <label class="block text-xs font-medium text-foreground mb-1">Password *</label>
                <input hlmInput type="password" [(ngModel)]="newUserForm.password" placeholder="••••••••" class="w-full h-9 text-xs" />
              </div>
            </div>

            <!-- Clinical & Doctor Specific Fields -->
            <div *ngIf="isDoctorRole(newUserForm.role)" class="p-3.5 rounded-lg border border-blue-500/30 bg-blue-500/5 space-y-3">
              <h4 class="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <ng-icon name="lucideStethoscope" size="14" /> Doctor Clinical Licensing Requirements
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-semibold text-foreground mb-1">Medical License / NPI Number *</label>
                  <input hlmInput type="text" [(ngModel)]="newUserForm.licenseNumber" placeholder="MD-8849201" class="w-full h-8 text-xs bg-background" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-foreground mb-1">Qualifications *</label>
                  <input hlmInput type="text" [(ngModel)]="newUserForm.qualifications" placeholder="MD, FACC, Board Certified" class="w-full h-8 text-xs bg-background" />
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-foreground mb-1">Specialization</label>
                  <input hlmInput type="text" [(ngModel)]="newUserForm.specialization" placeholder="Cardiology / Internal Medicine" class="w-full h-8 text-xs bg-background" />
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-foreground mb-1">Department</label>
                  <input hlmInput type="text" [(ngModel)]="newUserForm.department" placeholder="Cardiovascular Medicine" class="w-full h-8 text-xs bg-background" />
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-foreground mb-1">Years of Experience</label>
                  <input hlmInput type="number" [(ngModel)]="newUserForm.yearsOfExperience" placeholder="10" class="w-full h-8 text-xs bg-background" />
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-foreground mb-1">Medical Board State</label>
                  <input hlmInput type="text" [(ngModel)]="newUserForm.medicalBoardState" placeholder="State Medical Board" class="w-full h-8 text-xs bg-background" />
                </div>
              </div>
            </div>

            <!-- Non-Doctor Department Field -->
            <div *ngIf="!isDoctorRole(newUserForm.role) && newUserForm.role !== 'ROLE_PATIENT'">
              <label class="block text-xs font-medium text-foreground mb-1">Department / Unit</label>
              <input hlmInput type="text" [(ngModel)]="newUserForm.department" placeholder="e.g. Intensive Care Unit / Front Desk" class="w-full h-9 text-xs" />
            </div>
          </div>

          <div class="p-4 border-t border-border flex justify-end gap-2 bg-muted/20">
            <button hlmBtn variant="outline" size="sm" (click)="showCreateModal.set(false)" class="text-xs">Cancel</button>
            <app-action-button
              variant="default"
              size="sm"
              [loading]="saving()"
              (action)="submitCreateUser()"
              customClass="text-xs font-semibold px-4"
            >
              Create Account
            </app-action-button>
          </div>
        </div>
      </div>

      <!-- VIEW USER DETAILS MODAL -->
      <div *ngIf="showViewModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div class="w-full max-w-lg bg-card border border-border rounded-xl shadow-xl overflow-hidden flex flex-col">
          <div class="p-4 border-b border-border flex items-center justify-between bg-muted/30">
            <h3 class="font-bold text-base text-foreground flex items-center gap-2">
              User Profile & Identity Details
            </h3>
            <button (click)="showViewModal.set(false)" class="text-muted-foreground hover:text-foreground">
              <ng-icon name="lucideX" size="18" />
            </button>
          </div>

          <div *ngIf="selectedUserForView() as u" class="p-5 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
            <div class="flex items-center gap-3 pb-3 border-b border-border">
              <div [ngClass]="getUserAvatarBg(u)" class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shadow-xs">
                {{ getInitials(u.fullName || u.username) }}
              </div>
              <div>
                <h4 class="font-bold text-sm text-foreground flex items-center gap-1.5">
                  {{ u.fullName }}
                </h4>
                <p class="text-muted-foreground font-mono">&#64;{{ u.username }} &bull; {{ u.email }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="p-2.5 rounded-lg bg-muted/40 space-y-1">
                <span class="text-[10px] text-muted-foreground uppercase font-semibold">Verification Status</span>
                <div>
                  <span [ngClass]="getStatusBadgeClass(u.verificationStatus)" class="px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {{ u.verificationStatus || 'VERIFIED' }}
                  </span>
                </div>
              </div>

              <div class="p-2.5 rounded-lg bg-muted/40 space-y-1">
                <span class="text-[10px] text-muted-foreground uppercase font-semibold">User ID</span>
                <p class="font-mono font-bold text-foreground">#{{ u.id }}</p>
              </div>
            </div>

            <div class="space-y-2">
              <span class="text-[10px] text-muted-foreground uppercase font-semibold">Assigned Roles</span>
              <div class="flex flex-wrap gap-1">
                <span *ngFor="let r of getUserRoleNames(u)" [ngClass]="getRoleBadgeClass(r)" class="px-2.5 py-1 rounded-md font-medium border text-xs">
                  {{ r }}
                </span>
              </div>
            </div>

            <div class="space-y-2 pt-2 border-t border-border">
              <span class="text-[10px] text-muted-foreground uppercase font-semibold">Clinical & Department Metadata</span>
              <div class="space-y-1.5 text-foreground">
                <div class="flex justify-between"><span class="text-muted-foreground">Department:</span> <span class="font-medium">{{ u.department || 'N/A' }}</span></div>
                <div class="flex justify-between"><span class="text-muted-foreground">Specialization:</span> <span class="font-medium">{{ u.specialization || 'N/A' }}</span></div>
                <div class="flex justify-between"><span class="text-muted-foreground">Medical License / NPI:</span> <span class="font-mono font-semibold text-blue-600 dark:text-blue-400">{{ u.licenseNumber || 'N/A' }}</span></div>
                <div class="flex justify-between"><span class="text-muted-foreground">Qualifications:</span> <span class="font-medium">{{ u.qualifications || 'N/A' }}</span></div>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-border flex justify-end bg-muted/20">
            <button hlmBtn variant="outline" size="sm" (click)="showViewModal.set(false)" class="text-xs">Close</button>
          </div>
        </div>
      </div>

      <!-- EDIT USER MODAL -->
      <div *ngIf="showEditModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div class="w-full max-w-lg bg-card border border-border rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
          <div class="p-4 border-b border-border flex items-center justify-between bg-muted/30">
            <h3 class="font-bold text-base text-foreground flex items-center gap-2">
              Edit Account & Role Assignment
            </h3>
            <button (click)="showEditModal.set(false)" class="text-muted-foreground hover:text-foreground">
              <ng-icon name="lucideX" size="18" />
            </button>
          </div>

          <div class="p-5 space-y-4 text-xs overflow-y-auto">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-foreground mb-1">Full Name</label>
                <input hlmInput type="text" [(ngModel)]="editUserForm.fullName" class="w-full h-9 text-xs" />
              </div>
              <div>
                <label class="block font-medium text-foreground mb-1">Email Address</label>
                <input hlmInput type="email" [(ngModel)]="editUserForm.email" class="w-full h-9 text-xs" />
              </div>
              <div>
                <label class="block font-medium text-foreground mb-1">Department</label>
                <input hlmInput type="text" [(ngModel)]="editUserForm.department" class="w-full h-9 text-xs" />
              </div>
              <div>
                <label class="block font-medium text-foreground mb-1">Specialization</label>
                <input hlmInput type="text" [(ngModel)]="editUserForm.specialization" class="w-full h-9 text-xs" />
              </div>
              <div>
                <label class="block font-medium text-foreground mb-1">Medical License Number</label>
                <input hlmInput type="text" [(ngModel)]="editUserForm.licenseNumber" class="w-full h-9 text-xs" />
              </div>
              <div>
                <label class="block font-medium text-foreground mb-1">Qualifications</label>
                <input hlmInput type="text" [(ngModel)]="editUserForm.qualifications" class="w-full h-9 text-xs" />
              </div>
            </div>

            <div>
              <label class="block font-medium text-foreground mb-1">Verification Status</label>
              <select [(ngModel)]="editUserForm.verificationStatus" class="w-full h-9 px-3 text-xs rounded-md border border-input bg-background">
                <option value="VERIFIED">VERIFIED</option>
                <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-foreground mb-2">Role Assignments</label>
              <div class="grid grid-cols-2 gap-2 p-3 rounded-lg border border-border bg-muted/20">
                <label *ngFor="let roleOpt of availableRoleOptions" class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    [checked]="editUserForm.roles.includes(roleOpt.value)"
                    (change)="toggleRoleInEditForm(roleOpt.value)"
                    class="rounded border-input text-primary focus:ring-primary"
                  />
                  <span>{{ roleOpt.label }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-border flex justify-end gap-2 bg-muted/20">
            <button hlmBtn variant="outline" size="sm" (click)="showEditModal.set(false)" class="text-xs">Cancel</button>
            <app-action-button variant="default" size="sm" [loading]="saving()" (action)="submitEditUser()" customClass="text-xs font-semibold px-4">
              Save Changes
            </app-action-button>
          </div>
        </div>
      </div>

      <!-- RESET PASSWORD MODAL -->
      <div *ngIf="showResetPasswordModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div class="w-full max-w-md bg-card border border-border rounded-xl shadow-xl overflow-hidden flex flex-col">
          <div class="p-4 border-b border-border flex items-center justify-between bg-muted/30">
            <h3 class="font-bold text-base text-foreground flex items-center gap-2">
              <ng-icon name="lucideKey" size="16" class="text-amber-500" />
              Reset Account Password
            </h3>
            <button (click)="showResetPasswordModal.set(false)" class="text-muted-foreground hover:text-foreground">
              <ng-icon name="lucideX" size="18" />
            </button>
          </div>

          <div class="p-5 space-y-4 text-xs">
            <p class="text-muted-foreground">
              Reset credential password for user <strong class="text-foreground">&#64;{{ selectedUserForReset()?.username }}</strong>.
            </p>

            <div>
              <label class="block font-medium text-foreground mb-1">New Custom Password (Optional)</label>
              <input
                hlmInput
                type="text"
                [(ngModel)]="newPasswordInput"
                placeholder="Leave blank to generate temporary password"
                class="w-full h-9 text-xs font-mono"
              />
            </div>

            <div *ngIf="generatedTempPassword" class="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 space-y-1">
              <span class="text-[10px] font-bold text-amber-700 dark:text-amber-300">Generated Temporary Password:</span>
              <p class="font-mono text-sm font-bold text-foreground select-all">{{ generatedTempPassword }}</p>
              <p class="text-[10px] text-muted-foreground">Provide this key securely to the account owner.</p>
            </div>
          </div>

          <div class="p-4 border-t border-border flex justify-end gap-2 bg-muted/20">
            <button hlmBtn variant="outline" size="sm" (click)="showResetPasswordModal.set(false)" class="text-xs">Cancel</button>
            <app-action-button variant="default" size="sm" [loading]="saving()" (action)="submitResetPassword()" customClass="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-4">
              Execute Reset
            </app-action-button>
          </div>
        </div>
      </div>

      <!-- DELETE USER MODAL -->
      <div *ngIf="showDeleteModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div class="w-full max-w-md bg-card border border-border rounded-xl shadow-xl overflow-hidden flex flex-col">
          <div class="p-4 border-b border-border flex items-center justify-between bg-destructive/10">
            <h3 class="font-bold text-base text-destructive flex items-center gap-2">
              <ng-icon name="lucideAlertCircle" size="18" /> Confirm Account Removal
            </h3>
            <button (click)="showDeleteModal.set(false)" class="text-muted-foreground hover:text-foreground">
              <ng-icon name="lucideX" size="18" />
            </button>
          </div>

          <div class="p-5 space-y-3 text-xs">
            <p class="text-foreground">
              Are you sure you want to permanently delete account <strong>{{ selectedUserForDelete()?.fullName }}</strong> (&#64;{{ selectedUserForDelete()?.username }})?
            </p>
            <p class="text-muted-foreground text-[11px]">This action cannot be undone. Any linked authorizations or roles will be revoked.</p>
          </div>

          <div class="p-4 border-t border-border flex justify-end gap-2 bg-muted/20">
            <button hlmBtn variant="outline" size="sm" (click)="showDeleteModal.set(false)" class="text-xs">Cancel</button>
            <app-action-button variant="destructive" size="sm" [loading]="saving()" (action)="confirmDeleteUser()" customClass="text-xs font-semibold px-4">
              Delete Account
            </app-action-button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);

  searchQuery = '';
  selectedRoleTab = signal<RoleCategoryTab>('ALL');
  selectedStatusFilter = 'ALL';
  toastMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals
  showCreateModal = signal(false);
  showViewModal = signal(false);
  showEditModal = signal(false);
  showResetPasswordModal = signal(false);
  showDeleteModal = signal(false);

  selectedUserForView = signal<User | null>(null);
  selectedUserForReset = signal<User | null>(null);
  selectedUserForDelete = signal<User | null>(null);

  newPasswordInput = '';
  generatedTempPassword: string | null = null;

  newUserForm = {
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'ROLE_DOCTOR',
    department: '',
    specialization: '',
    licenseNumber: '',
    qualifications: '',
    yearsOfExperience: 5,
    medicalBoardState: 'State Licensing Board',
  };

  editUserForm = {
    id: 0,
    fullName: '',
    email: '',
    department: '',
    specialization: '',
    licenseNumber: '',
    qualifications: '',
    verificationStatus: 'VERIFIED',
    roles: [] as string[],
  };

  availableRoleOptions = [
    { value: 'ROLE_DOCTOR', label: 'Doctor / Physician' },
    { value: 'ROLE_NURSE', label: 'Nurse / Nursing' },
    { value: 'ROLE_ADMIN', label: 'Facility Admin' },
    { value: 'ROLE_SYS_ADMIN', label: 'System Administrator' },
    { value: 'ROLE_RECEPTIONIST', label: 'Receptionist' },
    { value: 'ROLE_PHARMACIST', label: 'Pharmacist' },
    { value: 'ROLE_LAB_TECH', label: 'Lab Technician' },
    { value: 'ROLE_PATIENT', label: 'Patient Account' },
  ];

  // Helper to extract role name strings whether roles array contains string[] or { name: string }[]
  getUserRoleNames(user: User): string[] {
    if (!user || !user.roles) return [];
    return user.roles.map((r: any) => {
      if (typeof r === 'string') return r;
      if (r && typeof r === 'object' && r.name) return r.name;
      return String(r);
    });
  }

  // Computed metrics
  totalUsersCount = computed(() => this.users().length);

  doctorsCount = computed(
    () => this.users().filter((u) => this.getUserRoleNames(u).some((r) => r.includes('DOCTOR'))).length
  );

  nursesCount = computed(
    () => this.users().filter((u) => this.getUserRoleNames(u).some((r) => r.includes('NURSE'))).length
  );

  staffCount = computed(
    () =>
      this.users().filter((u) =>
        this.getUserRoleNames(u).some(
          (r) =>
            r.includes('ADMIN') ||
            r.includes('RECEPTIONIST') ||
            r.includes('PHARMACIST') ||
            r.includes('LAB')
        )
      ).length
  );

  patientsCount = computed(
    () => this.users().filter((u) => this.getUserRoleNames(u).some((r) => r.includes('PATIENT'))).length
  );

  // Computed Filtered List
  filteredUsers = computed(() => {
    let list = this.users();
    const tab = this.selectedRoleTab();
    const status = this.selectedStatusFilter;
    const query = this.searchQuery.toLowerCase().trim();

    // 1. Filter by Role Tab
    if (tab === 'DOCTOR') {
      list = list.filter((u) => this.getUserRoleNames(u).some((r) => r.includes('DOCTOR')));
    } else if (tab === 'NURSE') {
      list = list.filter((u) => this.getUserRoleNames(u).some((r) => r.includes('NURSE')));
    } else if (tab === 'STAFF') {
      list = list.filter((u) =>
        this.getUserRoleNames(u).some(
          (r) =>
            r.includes('ADMIN') ||
            r.includes('RECEPTIONIST') ||
            r.includes('PHARMACIST') ||
            r.includes('LAB')
        )
      );
    } else if (tab === 'PATIENT') {
      list = list.filter((u) => this.getUserRoleNames(u).some((r) => r.includes('PATIENT')));
    }

    // 2. Filter by Verification Status
    if (status !== 'ALL') {
      list = list.filter((u) => (u.verificationStatus || 'VERIFIED') === status);
    }

    // 3. Search query
    if (query) {
      list = list.filter(
        (u) =>
          (u.fullName && u.fullName.toLowerCase().includes(query)) ||
          (u.username && u.username.toLowerCase().includes(query)) ||
          (u.email && u.email.toLowerCase().includes(query)) ||
          (u.department && u.department.toLowerCase().includes(query)) ||
          (u.specialization && u.specialization.toLowerCase().includes(query)) ||
          (u.licenseNumber && u.licenseNumber.toLowerCase().includes(query))
      );
    }

    return list;
  });

  constructor(
    private apiService: ApiService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.apiService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed to load user accounts from backend database.', 'error');
        this.loading.set(false);
      },
    });
  }

  showToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage.set({ text, type });
    setTimeout(() => {
      if (this.toastMessage()?.text === text) {
        this.toastMessage.set(null);
      }
    }, 4500);
  }

  // Preset Role Creator Modal Opener
  openCreateModal(defaultRole = 'ROLE_DOCTOR'): void {
    this.newUserForm = {
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: defaultRole,
      department: defaultRole === 'ROLE_DOCTOR' ? 'Cardiovascular Medicine' : defaultRole === 'ROLE_NURSE' ? 'Emergency Department' : '',
      specialization: defaultRole === 'ROLE_DOCTOR' ? 'General Cardiology' : '',
      licenseNumber: defaultRole === 'ROLE_DOCTOR' ? 'MD-' + Math.floor(100000 + Math.random() * 900000) : '',
      qualifications: defaultRole === 'ROLE_DOCTOR' ? 'MD, Board Certified' : '',
      yearsOfExperience: 5,
      medicalBoardState: 'State Medical Board',
    };
    this.showCreateModal.set(true);
  }

  onFormRoleChange(): void {
    if (this.isDoctorRole(this.newUserForm.role)) {
      if (!this.newUserForm.licenseNumber) {
        this.newUserForm.licenseNumber = 'MD-' + Math.floor(100000 + Math.random() * 900000);
      }
      if (!this.newUserForm.qualifications) {
        this.newUserForm.qualifications = 'MD, MBBS';
      }
    }
  }

  isDoctorRole(role: string): boolean {
    return role === 'ROLE_DOCTOR' || role === 'DOCTOR';
  }

  getPresetRoleLabel(): string {
    const r = this.newUserForm.role;
    if (r === 'ROLE_DOCTOR') return 'Doctor Account';
    if (r === 'ROLE_NURSE') return 'Nurse Account';
    if (r === 'ROLE_PATIENT') return 'Patient Account';
    return 'Staff Account';
  }

  submitCreateUser(): void {
    if (!this.newUserForm.username || !this.newUserForm.email || !this.newUserForm.password || !this.newUserForm.fullName) {
      this.showToast('Please fill in all required user credential fields.', 'error');
      return;
    }

    if (this.isDoctorRole(this.newUserForm.role)) {
      if (!this.newUserForm.licenseNumber || !this.newUserForm.qualifications) {
        this.showToast('Doctor registration requires Medical License # and Qualifications.', 'error');
        return;
      }
    }

    this.saving.set(true);
    const payload = {
      username: this.newUserForm.username,
      email: this.newUserForm.email,
      password: this.newUserForm.password,
      fullName: this.newUserForm.fullName,
      roles: [this.newUserForm.role],
      department: this.newUserForm.department,
      specialization: this.newUserForm.specialization,
      licenseNumber: this.newUserForm.licenseNumber,
      qualifications: this.newUserForm.qualifications,
      yearsOfExperience: this.newUserForm.yearsOfExperience,
      medicalBoardState: this.newUserForm.medicalBoardState,
    };

    this.authService.createStaffUser(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.showCreateModal.set(false);
        this.showToast(`Account for ${this.newUserForm.fullName} created successfully in database!`, 'success');
        this.loadUsers();
      },
      error: (err) => {
        this.saving.set(false);
        this.showToast(err.error?.message || 'Failed to create user account.', 'error');
      },
    });
  }

  // View Details Modal
  openViewModal(user: User): void {
    this.selectedUserForView.set(user);
    this.showViewModal.set(true);
  }

  // Edit User Modal
  openEditModal(user: User): void {
    this.editUserForm = {
      id: user.id,
      fullName: user.fullName || '',
      email: user.email || '',
      department: user.department || '',
      specialization: user.specialization || '',
      licenseNumber: user.licenseNumber || '',
      qualifications: user.qualifications || '',
      verificationStatus: user.verificationStatus || 'VERIFIED',
      roles: this.getUserRoleNames(user),
    };
    this.showEditModal.set(true);
  }

  toggleRoleInEditForm(roleValue: string): void {
    const idx = this.editUserForm.roles.indexOf(roleValue);
    if (idx > -1) {
      this.editUserForm.roles.splice(idx, 1);
    } else {
      this.editUserForm.roles.push(roleValue);
    }
  }

  submitEditUser(): void {
    this.saving.set(true);
    this.apiService.updateUser(this.editUserForm.id, this.editUserForm).subscribe({
      next: () => {
        this.saving.set(false);
        this.showEditModal.set(false);
        this.showToast('User account updated successfully in database!', 'success');
        this.loadUsers();
      },
      error: (err) => {
        this.saving.set(false);
        this.showToast(err.error?.message || 'Failed to update user account.', 'error');
      },
    });
  }

  // Reset Password Modal
  openResetPasswordModal(user: User): void {
    this.selectedUserForReset.set(user);
    this.newPasswordInput = '';
    this.generatedTempPassword = null;
    this.showResetPasswordModal.set(true);
  }

  submitResetPassword(): void {
    const user = this.selectedUserForReset();
    if (!user) return;

    this.saving.set(true);
    this.apiService.resetUserPassword(user.id, this.newPasswordInput).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.generatedTempPassword = res.temporaryPassword;
        this.showToast(`Password for ${user.username} reset successfully!`, 'success');
      },
      error: (err) => {
        this.saving.set(false);
        this.showToast(err.error?.message || 'Failed to reset password.', 'error');
      },
    });
  }

  // Lock / Unlock Status Toggle
  toggleUserStatus(user: User): void {
    const nextStatus = user.verificationStatus === 'SUSPENDED' ? 'VERIFIED' : 'SUSPENDED';
    this.apiService.updateUserStatus(user.id, nextStatus).subscribe({
      next: () => {
        this.showToast(`Account status for ${user.username} changed to ${nextStatus}`, 'success');
        this.loadUsers();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed to toggle status.', 'error');
      },
    });
  }

  // Delete User Modal
  openDeleteModal(user: User): void {
    this.selectedUserForDelete.set(user);
    this.showDeleteModal.set(true);
  }

  confirmDeleteUser(): void {
    const user = this.selectedUserForDelete();
    if (!user) return;

    this.saving.set(true);
    this.apiService.deleteUser(user.id).subscribe({
      next: () => {
        this.saving.set(false);
        this.showDeleteModal.set(false);
        this.showToast(`Account ${user.username} deleted successfully from database.`, 'success');
        this.loadUsers();
      },
      error: (err) => {
        this.saving.set(false);
        this.showToast(err.error?.message || 'Failed to delete account.', 'error');
      },
    });
  }

  // UI Formatters
  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  getUserAvatarBg(user: User): string {
    const roles = this.getUserRoleNames(user);
    if (roles.some((r) => r.includes('DOCTOR'))) {
      return 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30';
    }
    if (roles.some((r) => r.includes('NURSE'))) {
      return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30';
    }
    if (roles.some((r) => r.includes('ADMIN'))) {
      return 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30';
    }
    if (roles.some((r) => r.includes('PATIENT'))) {
      return 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30';
    }
    return 'bg-muted text-foreground border border-border';
  }

  formatRoleName(role: string): string {
    return role.replace('ROLE_', '');
  }

  getRoleBadgeClass(role: string): string {
    if (role.includes('DOCTOR')) return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
    if (role.includes('NURSE')) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    if (role.includes('ADMIN') || role.includes('SYS_ADMIN')) return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
    if (role.includes('RECEPTIONIST')) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    if (role.includes('PATIENT')) return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
    return 'bg-muted/50 text-muted-foreground border-border';
  }

  getStatusBadgeClass(status?: string): string {
    if (status === 'SUSPENDED') return 'bg-destructive/15 text-destructive border-destructive/40';
    if (status === 'PENDING_VERIFICATION') return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40';
    return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40';
  }

  isUserVerified(user: User): boolean {
    return !user.verificationStatus || user.verificationStatus === 'VERIFIED';
  }
}
