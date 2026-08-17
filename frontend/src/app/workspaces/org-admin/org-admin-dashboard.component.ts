import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { User } from '../../core/models/auth-user.model';
import { Patient } from '../../core/models/patient.model';
import { Appointment } from '../../core/models/appointment.model';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2,
  lucideUsers,
  lucideHeartPulse,
  lucideCalendarClock,
  lucideBed,
  lucideShieldCheck,
  lucideArrowUpRight,
  lucideChevronRight,
  lucideSettings,
  lucideClock,
  lucideCheckCircle2,
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
  selector: 'app-org-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideBuilding2,
      lucideUsers,
      lucideHeartPulse,
      lucideCalendarClock,
      lucideBed,
      lucideShieldCheck,
      lucideArrowUpRight,
      lucideChevronRight,
      lucideSettings,
      lucideClock,
      lucideCheckCircle2,
      lucideActivity,
      lucideRefreshCw,
      lucideAlertCircle,
      lucideCheck,
    }),
  ],
  template: `
    <div class="space-y-6 font-sans">
      <!-- Toast Alert Banner -->
      <div
        *ngIf="toastMessage()"
        [ngClass]="{
          'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300': toastMessage()?.type === 'success',
          'bg-destructive/15 border-destructive/40 text-destructive': toastMessage()?.type === 'error'
        }"
        class="flex items-center justify-between p-3.5 rounded-xl border text-xs font-medium transition-all shadow-xs">
        <div class="flex items-center gap-2">
          <ng-icon [name]="toastMessage()?.type === 'success' ? 'lucideCheck' : 'lucideAlertCircle'" size="16" />
          <span>{{ toastMessage()?.message }}</span>
        </div>
        <button (click)="toastMessage.set(null)" class="text-xs opacity-70 hover:opacity-100 font-mono">Dismiss</button>
      </div>

      <!-- Executive Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-emerald-500/5 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
            <ng-icon name="lucideBuilding2" size="26" />
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-xl font-bold tracking-tight text-foreground">
                Organization Operations Center
              </h1>
              <span hlmBadge variant="secondary" class="text-[10px] uppercase font-mono tracking-wider">
                Org Admin
              </span>
            </div>
            <p class="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
              <span class="inline-flex items-center gap-1.5 text-emerald-500 font-semibold">
                <span class="relative flex size-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                </span>
                Facility Operations Active
              </span>
              <span>•</span>
              <span>Clinical staff roster, MPI census, facility bed management & schedule loading</span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            (click)="loadData()"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground transition-all">
            <ng-icon name="lucideRefreshCw" size="14" />
            <span>Refresh</span>
          </button>
          <a
            routerLink="/org-admin/facility-settings"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary text-foreground hover:bg-secondary/80 border border-border transition-all">
            <ng-icon name="lucideSettings" size="14" />
            <span>Facility Settings</span>
          </a>
          <a
            routerLink="/org-admin/users"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs">
            <ng-icon name="lucideUsers" size="14" />
            <span>Staff Roster</span>
          </a>
        </div>
      </div>

      <!-- Facility Operational KPI Summary (4 Cards) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Staff Roster Card -->
        <a routerLink="/org-admin/users" class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-primary/40 transition-all group">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Clinical Staff</span>
            <div class="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <ng-icon name="lucideUsers" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-foreground font-mono">{{ staffCount() }}</div>
            <span class="text-[11px] font-medium text-emerald-500 flex items-center gap-0.5">
              <ng-icon name="lucideArrowUpRight" size="12" /> Active
            </span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Physicians, Nurses & Support</p>
        </a>

        <!-- Facility Settings Card -->
        <a routerLink="/org-admin/facility-settings" class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-emerald-500/40 transition-all group">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Facility Profile</span>
            <div class="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ng-icon name="lucideBuilding2" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-emerald-600 font-mono">VERIFIED</div>
            <span class="text-[11px] font-medium text-emerald-500 font-mono">Active</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Clinic demographics & license</p>
        </a>

        <!-- Master Patient Index Card -->
        <a routerLink="/org-admin/patients" class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-sky-500/40 transition-all group">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">MPI Census</span>
            <div class="size-9 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ng-icon name="lucideHeartPulse" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-foreground font-mono">{{ patients().length }}</div>
            <span class="text-[11px] font-medium text-sky-600 font-mono">FHIR R4</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Patient identity roster</p>
        </a>

        <!-- Schedule Capacity Card -->
        <a routerLink="/org-admin/schedule-analytics" class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-amber-500/40 transition-all group">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Consultation Load</span>
            <div class="size-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ng-icon name="lucideCalendarClock" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-amber-600 font-mono">{{ appointments().length }}</div>
            <span class="text-[11px] font-medium text-amber-600 font-mono">{{ completionRate() }}% Rate</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Provider shift loading</p>
        </a>
      </div>

      <!-- Core Facility Management Workspaces -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <!-- Staff Roster & Provisioning -->
        <div class="p-5 rounded-xl border border-border bg-card space-y-4 flex flex-col justify-between shadow-xs">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <ng-icon name="lucideUsers" size="20" />
              </div>
              <span hlmBadge variant="outline" class="text-[10px]">Staff Management</span>
            </div>
            <div>
              <h3 class="text-base font-semibold text-foreground">Facility Staff Roster</h3>
              <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
                View on-duty physicians, nurses, receptionists, and laboratory technicians. Provision credentials & assign clinical roles.
              </p>
            </div>
          </div>
          <div class="pt-3 border-t border-border flex items-center justify-between text-xs">
            <span class="text-muted-foreground">Active Staff: {{ staffCount() }}</span>
            <a routerLink="/org-admin/users" hlmBtn variant="link" size="sm" class="text-xs text-primary gap-1 p-0 h-auto">
              View Roster <ng-icon name="lucideChevronRight" size="14" />
            </a>
          </div>
        </div>

        <!-- Facility Demographics & Settings -->
        <div class="p-5 rounded-xl border border-border bg-card space-y-4 flex flex-col justify-between shadow-xs">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="size-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <ng-icon name="lucideBuilding2" size="20" />
              </div>
              <span hlmBadge variant="outline" class="text-[10px]">Facility Profile</span>
            </div>
            <div>
              <h3 class="text-base font-semibold text-foreground">Facility Profile & Settings</h3>
              <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
                Update hospital demographics, contact numbers, official address, operating hours, and medical board licenses.
              </p>
            </div>
          </div>
          <div class="pt-3 border-t border-border flex items-center justify-between text-xs">
            <span class="text-muted-foreground">Status: VERIFIED</span>
            <a routerLink="/org-admin/facility-settings" hlmBtn variant="link" size="sm" class="text-xs text-emerald-600 gap-1 p-0 h-auto">
              Edit Settings <ng-icon name="lucideChevronRight" size="14" />
            </a>
          </div>
        </div>

        <!-- Schedule Analytics -->
        <div class="p-5 rounded-xl border border-border bg-card space-y-4 flex flex-col justify-between shadow-xs">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="size-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <ng-icon name="lucideCalendarClock" size="20" />
              </div>
              <span hlmBadge variant="outline" class="text-[10px]">Capacity Load</span>
            </div>
            <div>
              <h3 class="text-base font-semibold text-foreground">Facility Schedule Analytics</h3>
              <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
                Monitor appointment queue volume, provider shift capacity utilization, fulfillment metrics, and cancellation trends.
              </p>
            </div>
          </div>
          <div class="pt-3 border-t border-border flex items-center justify-between text-xs">
            <span class="text-muted-foreground">Fulfillment: {{ completionRate() }}%</span>
            <a routerLink="/org-admin/schedule-analytics" hlmBtn variant="link" size="sm" class="text-xs text-amber-600 gap-1 p-0 h-auto">
              Open Analytics <ng-icon name="lucideChevronRight" size="14" />
            </a>
          </div>
        </div>
      </div>

      <!-- Quick Access Links & Security Governance -->
      <div class="p-5 rounded-xl border border-border bg-card shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b border-border pb-3">
          <h2 class="text-sm font-semibold text-foreground flex items-center gap-2">
            <ng-icon name="lucideShieldCheck" size="16" class="text-purple-600" />
            Facility Compliance & Quick Navigation
          </h2>
          <span hlmBadge variant="secondary" class="text-[10px]">ORGANIZATION_ADMIN Authorized</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a routerLink="/org-admin/patients" class="p-3.5 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/40 transition-all space-y-1 block">
            <div class="flex items-center gap-2 text-xs font-semibold text-foreground">
              <ng-icon name="lucideHeartPulse" size="15" class="text-sky-600" />
              Master Patient Index (MPI)
            </div>
            <p class="text-[11px] text-muted-foreground">Search patient MRN census, demographics, and clinical alerts.</p>
          </a>

          <a routerLink="/nurse/beds" class="p-3.5 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/40 transition-all space-y-1 block">
            <div class="flex items-center gap-2 text-xs font-semibold text-foreground">
              <ng-icon name="lucideBed" size="15" class="text-emerald-600" />
              Inpatient Bed Management
            </div>
            <p class="text-[11px] text-muted-foreground">Check ward bed occupancy, admissions, and availability roster.</p>
          </a>

          <a routerLink="/auditor/ledger" class="p-3.5 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/40 transition-all space-y-1 block">
            <div class="flex items-center gap-2 text-xs font-semibold text-foreground">
              <ng-icon name="lucideShieldCheck" size="15" class="text-purple-600" />
              ABDM & DPDP Audit Ledger
            </div>
            <p class="text-[11px] text-muted-foreground">Inspect immutable WORM access logs for statutory compliance.</p>
          </a>
        </div>
      </div>
    </div>
  `,
})
export class OrgAdminDashboardComponent implements OnInit {
  users = signal<User[]>([]);
  patients = signal<Patient[]>([]);
  appointments = signal<Appointment[]>([]);
  toastMessage = signal<ToastAlert | null>(null);

  staffCount = computed(() => {
    return this.users().filter((u) => {
      const roles = Array.isArray(u.roles) ? u.roles.join(',') : '';
      return (
        roles.includes('ADMIN') ||
        roles.includes('DOCTOR') ||
        roles.includes('NURSE') ||
        roles.includes('RECEPTIONIST')
      );
    }).length;
  });

  completionRate = computed(() => {
    const total = this.appointments().length;
    if (!total) return 0;
    const completed = this.appointments().filter(
      (a) => a.status === 'COMPLETED' || a.status === 'CHECKED_IN'
    ).length;
    return Math.round((completed / total) * 100);
  });

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getUsers().subscribe({
      next: (u) => this.users.set(u),
      error: () => {},
    });

    this.apiService.getPatients().subscribe({
      next: (p) => this.patients.set(p),
      error: () => {},
    });

    this.apiService.getAppointments().subscribe({
      next: (a) => this.appointments.set(a),
      error: () => {},
    });
  }
}
