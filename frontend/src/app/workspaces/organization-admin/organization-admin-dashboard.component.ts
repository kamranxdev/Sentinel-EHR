import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrganizationService } from '../../core/services/organization.service';
import { OrgAdminDashboardStatsDTO } from '../../core/models/organization.model';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2,
  lucideUsers,
  lucideCalendarClock,
  lucideBed,
  lucideShieldCheck,
  lucideArrowUpRight,
  lucideChevronRight,
  lucideSettings,
  lucideReceipt,
  lucidePill,
  lucideActivity,
  lucideRefreshCw,
  lucideAlertCircle,
  lucideCheck,
} from '@ng-icons/lucide';

interface ToastAlert {
  message: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-organization-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HlmCardImports, HlmBadgeImports, HlmButtonImports, NgIcon],
  providers: [
    provideIcons({
      lucideBuilding2,
      lucideUsers,
      lucideCalendarClock,
      lucideBed,
      lucideShieldCheck,
      lucideArrowUpRight,
      lucideChevronRight,
      lucideSettings,
      lucideReceipt,
      lucidePill,
      lucideActivity,
      lucideRefreshCw,
      lucideAlertCircle,
      lucideCheck,
    }),
  ],
  template: `
    <div class="space-y-6 font-sans">
      <!-- Header -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border"
      >
        <div class="flex items-center gap-4">
          <div
            class="size-12 rounded-xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-emerald-500/5 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs"
          >
            <ng-icon name="lucideBuilding2" size="26" />
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-xl font-bold tracking-tight text-foreground">
                Healthcare Organization Operations Center
              </h1>
              <span
                hlmBadge
                variant="secondary"
                class="text-[10px] uppercase font-mono tracking-wider bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
              >
                ORGANIZATION ADMIN
              </span>
            </div>
            <p class="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
              <span class="inline-flex items-center gap-1.5 text-emerald-500 font-semibold">
                <span class="relative flex size-2">
                  <span
                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                  ></span>
                  <span class="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                </span>
                Hospital Operations Active
              </span>
              <span>•</span>
              <span
                >Staff roster, spatial hierarchy (Departments, Wards, Beds), appointment capacity, &
                administrative policies</span
              >
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            (click)="loadData()"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground transition-all"
          >
            <ng-icon name="lucideRefreshCw" size="14" />
            <span>Refresh</span>
          </button>
          <a
            routerLink="/organization-admin/facility-settings"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary text-foreground hover:bg-secondary/80 border border-border transition-all"
          >
            <ng-icon name="lucideSettings" size="14" />
            <span>Hospital Spatial Layout</span>
          </a>
          <a
            routerLink="/organization-admin/users"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-xs"
          >
            <ng-icon name="lucideUsers" size="14" />
            <span>Staff Roster</span>
          </a>
        </div>
      </div>

      <!-- State Indicators -->
      <div *ngIf="isLoading()" class="p-4 text-center text-sm text-muted-foreground">
        Loading dashboard data...
      </div>
      <div *ngIf="errorMessage()" class="p-4 mb-4 text-sm text-destructive rounded-lg bg-destructive/10 border border-destructive/20">
        {{ errorMessage() }}
      </div>

      <ng-container *ngIf="!isLoading() && !errorMessage()">
        <!-- Hospital Operational KPI Summary (4 Cards) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Staff Roster Card -->
        <a
          routerLink="/organization-admin/users"
          class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-emerald-500/40 transition-all group"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >Staff Roster</span
            >
            <div
              class="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform"
            >
              <ng-icon name="lucideUsers" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-foreground font-mono">{{ stats()?.totalStaff }}</div>
            <span class="text-[11px] font-medium text-emerald-500 flex items-center gap-0.5">
              <ng-icon name="lucideArrowUpRight" size="12" /> Provisioned
            </span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Doctors, Nurses, Pharmacists, Staff</p>
        </a>

        <!-- Hospital Spatial Layout Card -->
        <a
          routerLink="/organization-admin/facility-settings"
          class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-blue-500/40 transition-all group"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >Spatial Layout</span
            >
            <div
              class="size-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform"
            >
              <ng-icon name="lucideBed" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-blue-600 font-mono">{{ stats()?.totalDepartments }}</div>
            <span class="text-[11px] font-medium text-blue-500 font-mono">{{ stats()?.totalWards }} Wards</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Active departments · {{ stats()?.totalBeds }} beds</p>
        </a>

        <!-- Patient Census Policy Card -->
        <a
          routerLink="/organization-admin/patients"
          class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-sky-500/40 transition-all group"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >Patient Census</span
            >
            <div
              class="size-9 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform"
            >
              <ng-icon name="lucideActivity" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-foreground font-mono">{{ stats()?.registeredPatients }}</div>
            <span class="text-[11px] font-medium text-sky-600 font-mono">Registered</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Persisted patient records</p>
        </a>

        <!-- Consultation Capacity Card -->
        <a
          routerLink="/organization-admin/schedule-analytics"
          class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-amber-500/40 transition-all group"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >Consultation Load</span
            >
            <div
              class="size-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform"
            >
              <ng-icon name="lucideCalendarClock" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-amber-600 font-mono">
              {{ stats()?.appointments }}
            </div>
            <span class="text-[11px] font-medium text-amber-600 font-mono"
              >{{ completionRate() }}% completed</span
            >
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Provider shift loading</p>
        </a>
      </div>

      <!-- Core Hospital Operational Workspaces -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <!-- Staff & Role Management -->
        <div
          class="p-5 rounded-xl border border-border bg-card space-y-4 flex flex-col justify-between shadow-xs"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div
                class="size-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center"
              >
                <ng-icon name="lucideUsers" size="20" />
              </div>
              <span hlmBadge variant="outline" class="text-[10px]">Staff Management</span>
            </div>
            <div>
              <h3 class="text-base font-semibold text-foreground">Hospital Staff & Role Matrix</h3>
              <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
                Onboard clinical practitioners and administrative staff. Assign and revoke scoped
                organization roles (Physician, Nurse, Pharmacist, Receptionist, Billing).
              </p>
            </div>
          </div>
          <div class="pt-3 border-t border-border flex items-center justify-between text-xs">
            <span class="text-muted-foreground">Active Staff: {{ stats()?.totalStaff }}</span>
            <a
              routerLink="/organization-admin/users"
              class="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
            >
              Manage Staff <ng-icon name="lucideChevronRight" size="14" />
            </a>
          </div>
        </div>

        <!-- Facility Spatial Layout -->
        <div
          class="p-5 rounded-xl border border-border bg-card space-y-4 flex flex-col justify-between shadow-xs"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div
                class="size-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center"
              >
                <ng-icon name="lucideBed" size="20" />
              </div>
              <span hlmBadge variant="outline" class="text-[10px]">Spatial Layout</span>
            </div>
            <div>
              <h3 class="text-base font-semibold text-foreground">Departments, Wards & Beds</h3>
              <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
                Configure organizational tree: Departments (ICU, Cardiology, Surgery) $ ightarrow$
                Wards $ ightarrow$ Rooms $ ightarrow$ Physical Beds with operational statuses.
              </p>
            </div>
          </div>
          <div class="pt-3 border-t border-border flex items-center justify-between text-xs">
            <span class="text-muted-foreground">{{ stats()?.occupiedBeds }} / {{ stats()?.totalBeds }} beds occupied</span>
            <a
              routerLink="/organization-admin/facility-settings"
              class="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              Configure Layout <ng-icon name="lucideChevronRight" size="14" />
            </a>
          </div>
        </div>

        <!-- Operational Schedule Analytics -->
        <div
          class="p-5 rounded-xl border border-border bg-card space-y-4 flex flex-col justify-between shadow-xs"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div
                class="size-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center"
              >
                <ng-icon name="lucideCalendarClock" size="20" />
              </div>
              <span hlmBadge variant="outline" class="text-[10px]">Capacity Load</span>
            </div>
            <div>
              <h3 class="text-base font-semibold text-foreground">
                Capacity & Consultation Analytics
              </h3>
              <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
                Monitor clinic load volumes, practitioner scheduling capacity, consultation
                fulfillment percentages, and cancellation risk patterns.
              </p>
            </div>
          </div>
          <div class="pt-3 border-t border-border flex items-center justify-between text-xs">
            <span class="text-muted-foreground">Fulfillment: {{ completionRate() }}%</span>
            <a
              routerLink="/organization-admin/schedule-analytics"
              class="text-xs font-semibold text-amber-600 hover:underline flex items-center gap-1"
            >
              View Analytics <ng-icon name="lucideChevronRight" size="14" />
            </a>
          </div>
        </div>
      </div>
      </ng-container>
    </div>
  `,
})
export class OrganizationAdminDashboardComponent implements OnInit {
  stats = signal<OrgAdminDashboardStatsDTO | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  completionRate(): number {
    const stats = this.stats();
    if (!stats || stats.appointments === 0) return 0;
    return Math.round((stats.completedAppointments / stats.appointments) * 100);
  }

  constructor(private organizationService: OrganizationService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    this.organizationService.getOrgAdminDashboardStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to load organization dashboard data');
        this.isLoading.set(false);
      },
    });
  }
}
