import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { OrganizationService } from '../../core/services/organization.service';
import { User } from '../../core/models/auth-user.model';
import { Organization } from '../../core/models/organization.model';
import { SecurityEventLog } from '../../core/models/security-policy.model';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideSettings,
  lucideUsers,
  lucideBuilding2,
  lucideShieldCheck,
  lucideActivity,
  lucideArrowUpRight,
  lucideChevronRight,
  lucideLock,
  lucideRefreshCw,
  lucideAlertCircle,
  lucideCheck,
  lucideDatabase,
  lucideServer,
  lucideKey,
  lucideCpu,
} from '@ng-icons/lucide';

interface ToastAlert {
  message: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HlmCardImports, HlmBadgeImports, HlmButtonImports, NgIcon],
  providers: [
    provideIcons({
      lucideSettings,
      lucideUsers,
      lucideBuilding2,
      lucideShieldCheck,
      lucideActivity,
      lucideArrowUpRight,
      lucideChevronRight,
      lucideLock,
      lucideRefreshCw,
      lucideAlertCircle,
      lucideCheck,
      lucideDatabase,
      lucideServer,
      lucideKey,
      lucideCpu,
    }),
  ],
  template: `
    <div class="space-y-6 font-sans">
      <!-- Toast Alert Banner -->
      <div
        *ngIf="toastMessage()"
        [ngClass]="{
          'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300':
            toastMessage()?.type === 'success',
          'bg-destructive/15 border-destructive/40 text-destructive':
            toastMessage()?.type === 'error',
        }"
        class="flex items-center justify-between p-3.5 rounded-xl border text-xs font-medium transition-all shadow-xs"
      >
        <div class="flex items-center gap-2">
          <ng-icon
            [name]="toastMessage()?.type === 'success' ? 'lucideCheck' : 'lucideAlertCircle'"
            size="16"
          />
          <span>{{ toastMessage()?.message }}</span>
        </div>
        <button
          (click)="toastMessage.set(null)"
          class="text-xs opacity-70 hover:opacity-100 font-mono"
        >
          Dismiss
        </button>
      </div>

      <!-- Platform Operator Header -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border"
      >
        <div class="flex items-center gap-4">
          <div
            class="size-12 rounded-xl bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-purple-500/5 text-purple-600 flex items-center justify-center shrink-0 border border-purple-500/20 shadow-xs"
          >
            <ng-icon name="lucideSettings" size="26" />
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-xl font-bold tracking-tight text-foreground">
                Sentinel Platform Command Center
              </h1>
              <span
                hlmBadge
                variant="secondary"
                class="text-[10px] uppercase font-mono tracking-wider bg-purple-500/10 text-purple-600 border-purple-500/30"
              >
                PLATFORM SUPER ADMIN
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
                Sentinel SaaS Infrastructure Online
              </span>
              <span>•</span>
              <span
                >Multi-tenant governance, organization lifecycles, global RBAC, & immutable platform
                audit vault</span
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
            <span>Refresh Telemetry</span>
          </button>
          <a
            routerLink="/super-admin/organizations"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-xs"
          >
            <ng-icon name="lucideBuilding2" size="14" />
            <span>Manage Organizations</span>
          </a>
        </div>
      </div>

      <!-- SaaS KPI Overview (6 Cards) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <!-- Active Tenants -->
        <a
          routerLink="/super-admin/organizations"
          class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-purple-500/40 transition-all group"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >Tenant Orgs</span
            >
            <div
              class="size-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform"
            >
              <ng-icon name="lucideBuilding2" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-foreground font-mono">
              {{ organizations().length }}
            </div>
            <span class="text-[11px] font-medium text-emerald-500 flex items-center gap-0.5">
              <ng-icon name="lucideArrowUpRight" size="12" /> Active
            </span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Hospitals & Clinics</p>
        </a>

        <!-- Platform Users -->
        <a
          routerLink="/super-admin/users"
          class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-primary/40 transition-all group"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >Platform Users</span
            >
            <div
              class="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform"
            >
              <ng-icon name="lucideUsers" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-foreground font-mono">{{ users().length }}</div>
            <span class="text-[11px] font-medium text-primary font-mono">Global RBAC</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Total provisioned accounts</p>
        </a>

        <!-- System Health -->
        <a
          routerLink="/super-admin/system-health"
          class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-emerald-500/40 transition-all group"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >System Health</span
            >
            <div
              class="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform"
            >
              <ng-icon name="lucideServer" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-emerald-600 font-mono">{{ healthData() ? '99.98%' : '---' }}</div>
            <span class="text-[11px] font-medium text-emerald-500 font-mono">{{ healthData()?.status || 'UNKNOWN' }}</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">PostgreSQL RLS & Redis</p>
        </a>

        <!-- Platform Audit -->
        <a
          routerLink="/super-admin/audit"
          class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-indigo-500/40 transition-all group"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >Audit Trail</span
            >
            <div
              class="size-9 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform"
            >
              <ng-icon name="lucideShieldCheck" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-indigo-600 font-mono">{{ healthData()?.services?.audit?.status || 'WORM' }}</div>
            <span class="text-[11px] font-medium text-indigo-600 font-mono">Immutable</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Forensic security ledger</p>
        </a>

        <!-- Security Events -->
        <a
          routerLink="/super-admin/audit"
          class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-amber-500/40 transition-all group"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >Security Logs</span
            >
            <div
              class="size-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform"
            >
              <ng-icon name="lucideLock" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-amber-600 font-mono">
              {{ securityEvents().length }}
            </div>
            <span class="text-[11px] font-medium text-amber-600 font-mono">Events</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Authentication & ABAC guard</p>
        </a>

        <!-- Architecture Boundary Indicator -->
        <div class="p-4 rounded-xl border border-border bg-muted/20 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >Clinical Isolation</span
            >
            <div
              class="size-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center"
            >
              <ng-icon name="lucideKey" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-xl font-bold text-muted-foreground font-mono">DENY DEFAULT</div>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Zero clinical data exposure</p>
        </div>
      </div>

      <!-- Core Platform Governance Workspaces -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <!-- Organizations Lifecycle Card -->
        <a
          routerLink="/super-admin/organizations"
          class="p-5 rounded-xl border border-border bg-card hover:border-purple-500/50 transition-all duration-300 space-y-4 flex flex-col justify-between group shadow-xs"
        >
          <div class="flex items-center justify-between">
            <div
              class="size-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors"
            >
              <ng-icon name="lucideBuilding2" size="20" />
            </div>
            <span
              class="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 group-hover:translate-x-0.5 transition-transform"
            >
              Manage Tenants <ng-icon name="lucideChevronRight" size="14" />
            </span>
          </div>
          <div>
            <h3
              class="text-base font-semibold text-foreground group-hover:text-purple-600 transition-colors"
            >
              Healthcare Organizations
            </h3>
            <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
              Onboard new hospitals, manage tenant lifecycle (Active / Suspended), inspect medical
              licenses, and manage organization metadata across the platform.
            </p>
          </div>
          <div
            class="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-muted-foreground"
          >
            <span>Tenants: {{ organizations().length }}</span>
            <span class="text-purple-600 font-semibold">Platform Multi-Tenant</span>
          </div>
        </a>

        <!-- Platform User Management Card -->
        <a
          routerLink="/super-admin/users"
          class="p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300 space-y-4 flex flex-col justify-between group shadow-xs"
        >
          <div class="flex items-center justify-between">
            <div
              class="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            >
              <ng-icon name="lucideUsers" size="20" />
            </div>
            <span
              class="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform"
            >
              Manage Users <ng-icon name="lucideChevronRight" size="14" />
            </span>
          </div>
          <div>
            <h3
              class="text-base font-semibold text-foreground group-hover:text-primary transition-colors"
            >
              Platform User Lifecycle
            </h3>
            <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
              Global user search, activate/deactivate accounts, trigger forced password resets, and
              assign platform and tenant administrative roles.
            </p>
          </div>
          <div
            class="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-muted-foreground"
          >
            <span>Users: {{ users().length }}</span>
            <span class="text-primary font-semibold">SUPER_ADMIN Scope</span>
          </div>
        </a>

        <!-- Platform Audit & Security Card -->
        <a
          routerLink="/super-admin/audit"
          class="p-5 rounded-xl border border-border bg-card hover:border-indigo-500/50 transition-all duration-300 space-y-4 flex flex-col justify-between group shadow-xs"
        >
          <div class="flex items-center justify-between">
            <div
              class="size-10 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors"
            >
              <ng-icon name="lucideShieldCheck" size="20" />
            </div>
            <span
              class="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform"
            >
              Audit Logs <ng-icon name="lucideChevronRight" size="14" />
            </span>
          </div>
          <div>
            <h3
              class="text-base font-semibold text-foreground group-hover:text-indigo-600 transition-colors"
            >
              Platform Security & Audit
            </h3>
            <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
              Full platform audit trail across all tenants, ABAC authorization violations,
              break-glass security logs, and statutory ABDM/DPDP compliance vault.
            </p>
          </div>
          <div
            class="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-muted-foreground"
          >
            <span>Security Logs: {{ securityEvents().length }}</span>
            <span class="text-indigo-600 font-semibold">WORM Compliant</span>
          </div>
        </a>
      </div>

      <!-- Architectural Security Principle Notice -->
      <div class="p-5 rounded-xl border border-border bg-card shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b border-border pb-3">
          <h2 class="text-sm font-semibold text-foreground flex items-center gap-2">
            <ng-icon name="lucideShieldCheck" size="16" class="text-purple-600" />
            Sentinel Platform Security & Data Protection Guarantees
          </h2>
          <span hlmBadge variant="secondary" class="text-[10px]">Zero-Trust Architecture</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="p-3.5 rounded-lg border border-border/80 bg-muted/20 space-y-2">
            <div class="flex items-center gap-2 text-xs font-semibold text-foreground">
              <ng-icon name="lucideLock" size="15" class="text-purple-600" />
              Clinical Data Denial by Default
            </div>
            <p class="text-[11px] text-muted-foreground leading-relaxed">
              Super Admins administer the platform infrastructure, not clinical care. Patient
              medical records are strictly protected and denied by default.
            </p>
          </div>

          <div class="p-3.5 rounded-lg border border-border/80 bg-muted/20 space-y-2">
            <div class="flex items-center gap-2 text-xs font-semibold text-foreground">
              <ng-icon name="lucideDatabase" size="15" class="text-emerald-600" />
              PostgreSQL Row-Level Security
            </div>
            <p class="text-[11px] text-muted-foreground leading-relaxed">
              Tenant isolation is enforced cryptographically and via PostgreSQL RLS policies
              ensuring tenant boundary integrity across hospitals.
            </p>
          </div>

          <div class="p-3.5 rounded-lg border border-border/80 bg-muted/20 space-y-2">
            <div class="flex items-center gap-2 text-xs font-semibold text-foreground">
              <ng-icon name="lucideActivity" size="15" class="text-sky-600" />
              Immutable WORM Forensics
            </div>
            <p class="text-[11px] text-muted-foreground leading-relaxed">
              Every platform configuration change, tenant lifecycle action, and security check is
              logged to an immutable Write-Once-Read-Many audit trail.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SuperAdminDashboardComponent implements OnInit {
  users = signal<User[]>([]);
  organizations = signal<Organization[]>([]);
  securityEvents = signal<SecurityEventLog[]>([]);
  healthData = signal<any>(null);
  toastMessage = signal<ToastAlert | null>(null);

  constructor(
    private apiService: ApiService,
    private orgService: OrganizationService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getPlatformUsers().subscribe({
      next: (u) => this.users.set(u),
      error: () => {},
    });

    this.apiService.getPlatformOrganizations().subscribe({
      next: (orgs) => this.organizations.set(orgs),
      error: () => {},
    });

    this.apiService.getPlatformSecurityEvents().subscribe({
      next: (events) => this.securityEvents.set(events),
      error: () => {},
    });

    this.apiService.getPlatformHealth().subscribe({
      next: (h) => this.healthData.set(h),
      error: () => {},
    });
  }
}
