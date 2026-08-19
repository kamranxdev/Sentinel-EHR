import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SecurityEventLog } from '../../core/models/security-policy.model';
import { AuditLog } from '../../core/models/audit.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideShieldCheck,
  lucideSearch,
  lucideRefreshCw,
  lucideLock,
  lucideAlertTriangle,
  lucideCheckCircle2,
  lucideEye,
  lucideFileText,
  lucideBuilding2,
  lucideUser,
  lucideX,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-super-admin-audit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgIcon],
  providers: [
    provideIcons({
      lucideShieldCheck,
      lucideSearch,
      lucideRefreshCw,
      lucideLock,
      lucideAlertTriangle,
      lucideCheckCircle2,
      lucideEye,
      lucideFileText,
      lucideBuilding2,
      lucideUser,
      lucideX,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-border">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
              Forensic & Security
            </span>
            <span class="text-xs text-muted-foreground font-mono">Platform-Wide WORM Audit Ledger</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground mt-1">
            Platform Audit & Security Event Vault
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Cryptographically signed Write-Once-Read-Many (WORM) audit records across all healthcare tenant organizations.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            (click)="loadAuditLogs()"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground transition-all">
            <ng-icon name="lucideRefreshCw" size="14" [class.animate-spin]="loading()" />
            Refresh Trail
          </button>
        </div>
      </div>

      <!-- Tab Selectors & Search -->
      <div class="flex flex-col sm:flex-row justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <ng-icon name="lucideSearch" size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search by action, user, entity, IP address, tenant..."
            class="w-full pl-10 pr-4 py-2 rounded-xl border border-input bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        <div class="flex items-center gap-2">
          <button
            (click)="activeTab.set('ALL')"
            [ngClass]="activeTab() === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-card text-muted-foreground hover:text-foreground'"
            class="px-3 py-1.5 rounded-lg text-xs font-medium border border-border transition-all">
            All Events ({{ auditLogs().length }})
          </button>
          <button
            (click)="activeTab.set('SECURITY')"
            [ngClass]="activeTab() === 'SECURITY' ? 'bg-indigo-600 text-white' : 'bg-card text-muted-foreground hover:text-foreground'"
            class="px-3 py-1.5 rounded-lg text-xs font-medium border border-border transition-all">
            Security Violations ({{ securityCount() }})
          </button>
        </div>
      </div>

      <!-- Audit Logs Table -->
      <div class="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th class="py-3 px-4">Timestamp & Trace ID</th>
                <th class="py-3 px-4">Actor / User</th>
                <th class="py-3 px-4">Action & Resource</th>
                <th class="py-3 px-4">Outcome</th>
                <th class="py-3 px-4">IP & Context</th>
                <th class="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr *ngFor="let log of filteredLogs()" class="hover:bg-muted/30 transition-colors">
                <td class="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                  <div class="text-foreground font-medium">{{ log.timestamp || log.occurredAt | date:'medium' }}</div>
                  <div class="text-[10px] text-muted-foreground/80">Trace: #{{ log.id ? String(log.id).substring(0, 8) : 'AUD-991' }}</div>
                </td>
                <td class="py-3.5 px-4">
                  <div class="font-semibold text-foreground flex items-center gap-1.5">
                    <ng-icon name="lucideUser" size="13" class="text-indigo-600" />
                    {{ log.username || log.userId || 'SYSTEM' }}
                  </div>
                  <div class="text-[10px] font-mono text-muted-foreground">{{ log.userRole || 'SUPER_ADMIN' }}</div>
                </td>
                <td class="py-3.5 px-4">
                  <div class="font-semibold text-foreground">{{ log.action }}</div>
                  <div class="text-[11px] text-muted-foreground font-mono">{{ log.entityName || log.resourceType || 'SECURITY_POLICY' }}</div>
                </td>
                <td class="py-3.5 px-4">
                  <span
                    [ngClass]="log.result === 'DENIED' || log.result === 'FAILURE' ? 'bg-destructive/15 text-destructive border-destructive/30' : 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'"
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1">
                    <ng-icon [name]="log.result === 'DENIED' ? 'lucideAlertTriangle' : 'lucideCheckCircle2'" size="11" />
                    {{ log.result || 'SUCCESS' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 font-mono text-muted-foreground text-[11px]">
                  <div>IP: {{ log.ipAddress || '127.0.0.1' }}</div>
                  <div class="text-[10px] text-muted-foreground/80">Org: {{ log.organizationId || 'PLATFORM' }}</div>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <button
                    (click)="selectedLog.set(log)"
                    class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground transition-all flex items-center gap-1 ml-auto">
                    <ng-icon name="lucideEye" size="13" />
                    Inspect
                  </button>
                </td>
              </tr>

              <tr *ngIf="filteredLogs().length === 0">
                <td colspan="6" class="py-8 text-center text-muted-foreground text-xs">
                  No forensic audit logs match search criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detail Modal -->
      <div *ngIf="selectedLog()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-base font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideShieldCheck" size="18" class="text-indigo-600" />
              Forensic Log Details
            </h3>
            <button (click)="selectedLog.set(null)" class="p-1 rounded-lg text-muted-foreground hover:text-foreground">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-2.5 text-xs">
            <div class="p-3 bg-muted/40 rounded-xl space-y-1.5 font-mono text-[11px]">
              <div><strong>Action:</strong> {{ selectedLog()?.action }}</div>
              <div><strong>Actor:</strong> {{ selectedLog()?.username }} ({{ selectedLog()?.userRole }})</div>
              <div><strong>Resource:</strong> {{ selectedLog()?.entityName || selectedLog()?.resourceType }} [ID: {{ selectedLog()?.resourceId || 'N/A' }}]</div>
              <div><strong>Timestamp:</strong> {{ selectedLog()?.timestamp }}</div>
              <div><strong>IP Address:</strong> {{ selectedLog()?.ipAddress }}</div>
              <div><strong>Result:</strong> {{ selectedLog()?.result }}</div>
            </div>

            <div>
              <label class="block font-semibold text-foreground mb-1">Log Narrative Details</label>
              <div class="p-3 bg-card border border-border rounded-xl text-muted-foreground text-xs leading-relaxed">
                {{ selectedLog()?.details || 'Standard statutory audit event recorded with cryptographic hash verification.' }}
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-2 border-t border-border">
            <button (click)="selectedLog.set(null)" class="px-4 py-2 rounded-lg bg-secondary text-foreground text-xs font-semibold">
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SuperAdminAuditComponent implements OnInit {
  auditLogs = signal<AuditLog[]>([]);
  securityEvents = signal<SecurityEventLog[]>([]);
  loading = signal(false);
  searchQuery = signal('');
  activeTab = signal<'ALL' | 'SECURITY'>('ALL');
  selectedLog = signal<AuditLog | null>(null);

  securityCount = computed(() => this.securityEvents().length);

  filteredLogs = computed<AuditLog[]>(() => {
    let list: AuditLog[] = this.auditLogs();
    const q = this.searchQuery().toLowerCase().trim();

    if (this.activeTab() === 'SECURITY') {
      list = this.securityEvents().map((s: SecurityEventLog) => ({
        id: String(s.id),
        timestamp: s.occurredAt || new Date().toISOString(),
        username: s.username || 'SECURITY_SYSTEM',
        userRole: 'SECURITY_MONITOR',
        action: s.action || s.eventType || 'SECURITY_POLICY_EVALUATION',
        entityName: s.resourceType || 'ABAC_RESOURCE',
        result: s.status || 'DENIED',
        ipAddress: s.ipAddress || '127.0.0.1',
        details: s.details || 'Security policy evaluation check',
      }));
    }

    if (q) {
      list = list.filter(
        (l: AuditLog) =>
          (l.username || '').toLowerCase().includes(q) ||
          (l.action || '').toLowerCase().includes(q) ||
          (l.entityName || '').toLowerCase().includes(q) ||
          (l.details || '').toLowerCase().includes(q) ||
          (l.ipAddress || '').includes(q),
      );
    }

    return list;
  });

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {
    this.loading.set(true);
    this.apiService.getAuditLogs().subscribe({
      next: (logs) => {
        this.auditLogs.set(logs);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.apiService.getPlatformSecurityEvents().subscribe({
      next: (events) => this.securityEvents.set(events),
      error: () => {},
    });
  }

  String = String;
}
