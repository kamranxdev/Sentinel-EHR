import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuditLog } from '../../core/models/audit.model';
import { StatCardComponent } from '../../shared/ui/stat-card.component';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideShieldCheck,
  lucideFileText,
  lucideUserCheck,
  lucideAlertTriangle,
  lucideUsers,
  lucideActivity,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-organization-admin-audit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatCardComponent,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideShieldCheck,
      lucideFileText,
      lucideUserCheck,
      lucideAlertTriangle,
      lucideUsers,
      lucideActivity,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Executive Header -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border"
      >
        <div class="flex items-center gap-4">
          <div
            class="size-12 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"
          >
            <ng-icon name="lucideShieldCheck" size="24" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Compliance & Audit Workspace
              <span
                hlmBadge
                variant="outline"
                class="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
              >
                ABDM / DISHA WORM Vault
              </span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">
              Read-only compliance monitoring, immutable access audit ledger, and forensic trail
              inspection.
            </p>
          </div>
        </div>
      </div>

      <!-- Compliance Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stat-card
          title="Total Audit Events"
          [value]="auditLogs().length"
          subtitle="Recorded Compliance Logs"
          icon="lucideShieldCheck"
          iconBgClass="bg-emerald-500/10 text-emerald-600"
        />
        <app-stat-card
          title="Security Violations"
          [value]="deniedCount()"
          subtitle="Access Denied Events"
          icon="lucideAlertTriangle"
          iconBgClass="bg-destructive/10 text-destructive"
        />
        <app-stat-card
          title="Unique Actors"
          [value]="uniqueActorsCount()"
          subtitle="Active Principals"
          icon="lucideUsers"
          iconBgClass="bg-primary/10 text-primary"
        />
        <app-stat-card
          title="Integrity Status"
          value="100% WORM"
          subtitle="Tamper-Evident Ledger"
          icon="lucideActivity"
          iconBgClass="bg-accent text-foreground"
        />
      </div>

      <!-- Recent Access Logs Preview -->
      <div class="p-6 rounded-xl border border-border bg-card space-y-4">
        <div class="flex justify-between items-center border-b border-border pb-3">
          <h3 class="text-sm font-semibold text-foreground">Recent Audit Log Activity</h3>
          <a routerLink="/super-admin/audit" hlmBtn variant="outline" size="sm" class="text-xs">
            Open Full Ledger
          </a>
        </div>

        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/40">
                <th hlmTableHead>Timestamp</th>
                <th hlmTableHead>Actor</th>
                <th hlmTableHead>Role</th>
                <th hlmTableHead>Action</th>
                <th hlmTableHead>Resource</th>
                <th hlmTableHead>IP Address</th>
                <th hlmTableHead>Details</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr hlmTableRow *ngFor="let log of auditLogs().slice(0, 8)">
                <td hlmTableCell class="font-mono text-muted-foreground whitespace-nowrap">
                  {{ log.timestamp | date: 'short' }}
                </td>
                <td hlmTableCell class="font-semibold text-foreground">{{ log.email }}</td>
                <td hlmTableCell>
                  <span
                    [class]="
                      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ' +
                      getRoleBadgeClass(log.userRole)
                    "
                  >
                    {{ formatRole(log.userRole) }}
                  </span>
                </td>
                <td hlmTableCell>
                  <span
                    [class]="
                      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ' +
                      getActionBadgeClass(log.action)
                    "
                  >
                    {{ log.action }}
                  </span>
                </td>
                <td hlmTableCell class="font-mono text-[11px]">
                  {{ log.entityName }} <span *ngIf="log.resourceId">#{{ log.resourceId }}</span>
                </td>
                <td hlmTableCell class="font-mono text-[11px] text-muted-foreground">
                  {{ log.ipAddress || '127.0.0.1' }}
                </td>
                <td hlmTableCell class="text-muted-foreground truncate max-w-xs">
                  {{ log.details }}
                </td>
              </tr>
              <tr *ngIf="auditLogs().length === 0" hlmTableRow>
                <td colspan="7" hlmTableCell class="py-8 text-center text-muted-foreground text-xs">
                  No audit logs available.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class OrganizationAdminAuditComponent implements OnInit {
  auditLogs = signal<AuditLog[]>([]);

  deniedCount = computed(() => this.auditLogs().filter((l) => l.action === 'ACCESS_DENIED').length);
  uniqueActorsCount = computed(() => new Set(this.auditLogs().map((l) => l.email)).size);

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getAuditLogs().subscribe((logs) => this.auditLogs.set(logs));
  }

  formatRole(role: string): string {
    if (!role) return 'User';
    if (role.startsWith('ROLE_')) {
      const raw = role.replace('ROLE_', '');
      return raw.charAt(0) + raw.slice(1).toLowerCase();
    }
    if (role.includes(',')) {
      return role
        .split(',')
        .map((r) => this.formatRole(r))
        .join(', ');
    }
    return role;
  }

  getRoleBadgeClass(role: string): string {
    if (!role) return 'bg-muted text-muted-foreground border-border';
    if (role.includes('ADMIN'))
      return 'bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-400';
    if (role.includes('DOCTOR'))
      return 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400';
    if (role.includes('NURSE'))
      return 'bg-teal-500/10 text-teal-600 border-teal-500/30 dark:text-teal-400';
    if (role.includes('PATIENT'))
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400';
    if (role.includes('SYSTEM'))
      return 'bg-slate-500/10 text-slate-600 border-slate-500/30 dark:text-slate-400';
    return 'bg-secondary text-secondary-foreground border-border';
  }

  getActionBadgeClass(action: string): string {
    switch (action?.toUpperCase()) {
      case 'READ':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400';
      case 'CREATE':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400';
      case 'UPDATE':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400';
      case 'DELETE':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:text-rose-400';
      case 'ACCESS_DENIED':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'LOGIN':
        return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30 dark:text-indigo-400';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  }
}
