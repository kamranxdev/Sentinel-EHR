import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/auth-user.model';
import { Patient } from '../../core/models/patient.model';
import { Appointment } from '../../core/models/appointment.model';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideSettings,
  lucideUsers,
  lucideHeartPulse,
  lucideShieldCheck,
  lucideSparkles,
  lucideChevronRight,
  lucideActivity,
  lucideCalendarClock,
  lucideCheckCircle2,
  lucideUserCheck,
  lucideStethoscope,
  lucideBuilding2,
  lucideTrendingUp,
  lucideClock,
  lucideCheck,
  lucideAlertCircle,
  lucideLock,
  lucideKey,
  lucideFileText,
  lucideRefreshCw,
  lucideArrowUpRight,
} from '@ng-icons/lucide';

interface ToastAlert {
  message: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-admin-dashboard',
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
      lucideSettings,
      lucideUsers,
      lucideHeartPulse,
      lucideShieldCheck,
      lucideSparkles,
      lucideChevronRight,
      lucideActivity,
      lucideCalendarClock,
      lucideCheckCircle2,
      lucideUserCheck,
      lucideStethoscope,
      lucideBuilding2,
      lucideTrendingUp,
      lucideClock,
      lucideCheck,
      lucideAlertCircle,
      lucideLock,
      lucideKey,
      lucideFileText,
      lucideRefreshCw,
      lucideArrowUpRight,
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
        class="flex items-center justify-between p-3.5 rounded-lg border text-xs font-medium transition-all shadow-xs">
        <div class="flex items-center gap-2">
          <ng-icon [name]="toastMessage()?.type === 'success' ? 'lucideCheck' : 'lucideAlertCircle'" size="16" />
          <span>{{ toastMessage()?.message }}</span>
        </div>
        <button (click)="toastMessage.set(null)" class="text-xs opacity-70 hover:opacity-100 font-mono">Dismiss</button>
      </div>

      <!-- Executive Header -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
            <ng-icon name="lucideSettings" size="26" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold tracking-tight text-foreground">
                System Administration Command Center
              </h1>
              <span hlmBadge variant="secondary" class="text-[10px] uppercase font-mono tracking-wider">
                System Admin
              </span>
            </div>
            <p class="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 text-emerald-500 font-semibold">
                <span class="relative flex size-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                </span>
                Enterprise Systems Active
              </span>
              <span>•</span>
              <span>RBAC provisioning, MPI patient registry, HIPAA audit vault & capacity analytics</span>
            </p>
          </div>
        </div>


      <!-- System KPI Overview (4 Cards) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Users Card -->
        <a routerLink="/admin/users" class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-primary/40 transition-all group">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Active User Accounts</span>
            <div class="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <ng-icon name="lucideUsers" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-foreground font-mono">{{ users().length }}</div>
            <span class="text-[11px] font-medium text-emerald-500 flex items-center gap-0.5">
              <ng-icon name="lucideArrowUpRight" size="12" /> Provisioned
            </span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Doctors, Nurses, Staff & Patients</p>
        </a>

        <!-- MPI Card -->
        <a routerLink="/admin/patients" class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-emerald-500/40 transition-all group">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">MPI Patient Census</span>
            <div class="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ng-icon name="lucideHeartPulse" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-emerald-600 font-mono">{{ patients().length }}</div>
            <span class="text-[11px] font-medium text-emerald-500 font-mono">FHIR Identities</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Demographics & MRN registry</p>
        </a>

        <!-- Schedule Analytics Card -->
        <a routerLink="/admin/schedule-analytics" class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-sky-500/40 transition-all group">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Facility Schedule Loading</span>
            <div class="size-9 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ng-icon name="lucideCalendarClock" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-foreground font-mono">{{ appointments().length }}</div>
            <span class="text-[11px] font-medium text-sky-600 font-mono">{{ completionRate() }}% Fulfilled</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Capacity & provider loading</p>
        </a>

        <!-- Compliance Vault Card -->
        <a routerLink="/auditor/ledger" class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-purple-500/40 transition-all group">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Compliance Ledger</span>
            <div class="size-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ng-icon name="lucideShieldCheck" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-foreground font-mono">HIPAA WORM</div>
            <span class="text-[11px] font-medium text-purple-600 font-mono">Secured</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Immutable access audit vault</p>
        </a>
      </div>

      <!-- Core Workspaces & System Governance Modules -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <!-- User RBAC Management Card -->
        <a
          routerLink="/admin/users"
          class="p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300 space-y-4 flex flex-col justify-between group shadow-xs">
          <div class="flex items-center justify-between">
            <div class="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <ng-icon name="lucideUsers" size="20" />
            </div>
            <span class="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
              Manage Accounts <ng-icon name="lucideChevronRight" size="14" />
            </span>
          </div>
          <div>
            <h3 class="text-base font-semibold text-foreground group-hover:text-primary transition-colors">User RBAC Management</h3>
            <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
              Provision clinical & staff accounts, assign granular role permissions (Doctor, Nurse, Receptionist, Admin), manage credentials, and lock suspicious activity.
            </p>
          </div>
          <div class="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>Provisioned Staff: {{ staffCount() }}</span>
            <span class="text-primary font-semibold">ROLE_ADMIN Authorized</span>
          </div>
        </a>

        <!-- Master Patient Index (MPI) Card -->
        <a
          routerLink="/admin/patients"
          class="p-5 rounded-xl border border-border bg-card hover:border-emerald-500/50 transition-all duration-300 space-y-4 flex flex-col justify-between group shadow-xs">
          <div class="flex items-center justify-between">
            <div class="size-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ng-icon name="lucideHeartPulse" size="20" />
            </div>
            <span class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
              MPI Directory <ng-icon name="lucideChevronRight" size="14" />
            </span>
          </div>
          <div>
            <h3 class="text-base font-semibold text-foreground group-hover:text-emerald-600 transition-colors">Master Patient Index (MPI)</h3>
            <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
              Enterprise identity registry, FHIR patient intake, duplicate record resolution, MRN generation, and standalone patient data generator CLI.
            </p>
          </div>
          <div class="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>Patients Registered: {{ patients().length }}</span>
            <span class="text-emerald-600 font-semibold">FHIR R4 Standard</span>
          </div>
        </a>

        <!-- Facility Schedule Analytics Card -->
        <a
          routerLink="/admin/schedule-analytics"
          class="p-5 rounded-xl border border-border bg-card hover:border-sky-500/50 transition-all duration-300 space-y-4 flex flex-col justify-between group shadow-xs">
          <div class="flex items-center justify-between">
            <div class="size-10 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <ng-icon name="lucideCalendarClock" size="20" />
            </div>
            <span class="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 group-hover:translate-x-0.5 transition-transform">
              View Analytics <ng-icon name="lucideChevronRight" size="14" />
            </span>
          </div>
          <div>
            <h3 class="text-base font-semibold text-foreground group-hover:text-sky-600 transition-colors">Facility Schedule Analytics</h3>
            <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
              System-wide appointment loading dashboard, provider shift capacity metrics, fulfillment percentages, and cancellation risk monitoring.
            </p>
          </div>
          <div class="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span>Fulfillment Rate: {{ completionRate() }}%</span>
            <span class="text-sky-600 font-semibold">Read-Only Audit</span>
          </div>
        </a>
      </div>

      <!-- System Governance & Safeguards Panel -->
      <div class="p-5 rounded-xl border border-border bg-card shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b border-border pb-3">
            <h2 class="text-sm font-semibold text-foreground flex items-center gap-2">
              <ng-icon name="lucideShieldCheck" size="16" class="text-purple-600" />
              Enterprise Security & Governance Overview
            </h2>
            <span hlmBadge variant="secondary" class="text-[10px]">HIPAA 164.312 Compliant</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-3.5 rounded-lg border border-border/80 bg-muted/20 space-y-2">
              <div class="flex items-center gap-2 text-xs font-semibold text-foreground">
                <ng-icon name="lucideLock" size="15" class="text-primary" />
                ABAC Care Team Scoping
              </div>
              <p class="text-[11px] text-muted-foreground leading-relaxed">
                Patient PHI charts are isolated by Attribute-Based Access Control. Clinicians can only view assigned patient rosters.
              </p>
            </div>

            <div class="p-3.5 rounded-lg border border-border/80 bg-muted/20 space-y-2">
              <div class="flex items-center gap-2 text-xs font-semibold text-foreground">
                <ng-icon name="lucideFileText" size="15" class="text-emerald-600" />
                FHIR R4 Interoperability
              </div>
              <p class="text-[11px] text-muted-foreground leading-relaxed">
                Standardized REST endpoints for Patient, Observation, DiagnosticReport, and MedicationRequest resources.
              </p>
            </div>

            <div class="p-3.5 rounded-lg border border-border/80 bg-muted/20 space-y-2">
              <div class="flex items-center gap-2 text-xs font-semibold text-foreground">
                <ng-icon name="lucideShieldCheck" size="15" class="text-purple-600" />
                WORM Audit Trail
              </div>
              <p class="text-[11px] text-muted-foreground leading-relaxed">
                Write-Once-Read-Many cryptographic access logging preventing modification or deletion of forensic entries.
              </p>
            </div>

            <div class="p-3.5 rounded-lg border border-border/80 bg-muted/20 space-y-2">
              <div class="flex items-center gap-2 text-xs font-semibold text-foreground">
                <ng-icon name="lucideSparkles" size="15" class="text-amber-500" />
                Standalone Patient Data Generator
              </div>
              <p class="text-[11px] text-muted-foreground leading-relaxed">
                CLI data generation script for populating realistic patient records, clinical encounters, diagnoses, and vitals.
              </p>
            </div>

          </div>
        </div>
      </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  users = signal<User[]>([]);
  patients = signal<Patient[]>([]);
  appointments = signal<Appointment[]>([]);
  toastMessage = signal<ToastAlert | null>(null);

  doctorCount = computed(() =>
    this.users().filter((u) => u.roles.includes('ROLE_DOCTOR')).length
  );

  nurseCount = computed(() =>
    this.users().filter((u) => u.roles.includes('ROLE_NURSE')).length
  );

  staffRoleCount = computed(() =>
    this.users().filter((u) => u.roles.includes('ROLE_RECEPTIONIST')).length
  );

  patientRoleCount = computed(() =>
    this.users().filter((u) => u.roles.includes('ROLE_PATIENT')).length
  );

  staffCount = computed(
    () =>
      this.doctorCount() +
      this.nurseCount() +
      this.staffRoleCount() +
      this.users().filter((u) => u.roles.includes('ROLE_ADMIN')).length
  );

  completionRate = computed(() => {
    const total = this.appointments().length;
    if (!total) return 0;
    const fulfilled = this.appointments().filter(
      (a) => a.status === 'COMPLETED' || a.status === 'CHECKED_IN'
    ).length;
    return Math.round((fulfilled / total) * 100);
  });

  constructor(
    public authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getUsers().subscribe((u) => this.users.set(u));
    this.apiService.getPatients().subscribe((p) => this.patients.set(p));
    this.apiService.getAppointments().subscribe((a) => this.appointments.set(a));
  }

  getRolePct(count: number): number {
    const total = this.users().length;
    if (!total) return 0;
    return Math.round((count / total) * 100);
  }
}
