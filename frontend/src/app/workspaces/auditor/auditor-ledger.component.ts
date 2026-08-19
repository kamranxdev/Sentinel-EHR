import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuditLog } from '../../core/models/audit.model';
import { SecurityEventLog } from '../../core/models/security-policy.model';
import { BreakGlassRecord } from '../../core/models/patient.model';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideShieldCheck,
  lucideSearch,
  lucideRefreshCw,
  lucideFilter,
  lucideX,
  lucideInfo,
  lucideShieldAlert,
  lucideDownload,
  lucideLock,
  lucideFileText,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-auditor-ledger',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    HlmTableImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideShieldCheck,
      lucideSearch,
      lucideRefreshCw,
      lucideFilter,
      lucideX,
      lucideInfo,
      lucideShieldAlert,
      lucideDownload,
      lucideLock,
      lucideFileText,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Compliance Audit & Security Forensics Vault
            <span hlmBadge variant="secondary" class="text-[10px]">WORM Storage</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Immutable log trail for compliance reviews and access audits across the EHR system under ABDM HDMP, HIPAA & DPDP Act.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button hlmBtn variant="outline" size="sm" (click)="exportComplianceReport()" class="gap-1.5 text-xs">
            <ng-icon name="lucideDownload" size="14" />
            Export Compliance Report
          </button>
          <button hlmBtn variant="outline" size="sm" (click)="loadAllData()" [disabled]="loading()" class="gap-1.5 text-xs">
            <ng-icon name="lucideRefreshCw" size="14" [class.animate-spin]="loading()" />
            Refresh Vault
          </button>
        </div>
      </div>

      <!-- Auditor Navigation Tabs -->
      <div class="flex items-center gap-2 border-b border-border pb-1">
        <button
          hlmBtn
          [variant]="activeTab() === 'audit' ? 'default' : 'ghost'"
          size="sm"
          (click)="activeTab.set('audit')"
          class="text-xs gap-1.5"
        >
          <ng-icon name="lucideShieldCheck" size="14" /> Access & Mutation Audit Trail
        </button>

        <button
          hlmBtn
          [variant]="activeTab() === 'security' ? 'default' : 'ghost'"
          size="sm"
          (click)="activeTab.set('security')"
          class="text-xs gap-1.5"
        >
          <ng-icon name="lucideLock" size="14" /> Security Events & Threat Log
        </button>

        <button
          hlmBtn
          [variant]="activeTab() === 'break-glass' ? 'default' : 'ghost'"
          size="sm"
          (click)="activeTab.set('break-glass')"
          class="text-xs gap-1.5"
        >
          <ng-icon name="lucideShieldAlert" size="14" /> Emergency Break-Glass Audits
        </button>
      </div>

      <!-- TAB 1: General Audit Trail -->
      <div *ngIf="activeTab() === 'audit'" class="space-y-4">
        <!-- Controls: Search & Quick Action Filters -->
        <div class="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3">
          <div class="relative">
            <ng-icon name="lucideSearch" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              hlmInput
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Filter audit logs by actor username, role, action, resource, IP address, or details..."
              class="pl-9 h-10 w-full text-xs bg-background" />
          </div>

          <!-- Action Quick Filter Pills -->
          <div class="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span class="text-muted-foreground text-[11px] font-medium flex items-center gap-1 mr-1">
              <ng-icon name="lucideFilter" size="12" /> Filter Action:
            </span>
            <button
              *ngFor="let filter of actionFilters"
              (click)="selectedActionFilter = filter.value"
              [class]="'px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ' + 
                       (selectedActionFilter === filter.value 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-background hover:bg-muted text-muted-foreground border-border')"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>

        <!-- Audit Ledger Table -->
        <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div class="overflow-x-auto">
            <table hlmTable class="w-full text-xs">
              <thead hlmTableHeader>
                <tr hlmTableRow class="bg-muted/50 border-b border-border">
                  <th hlmTableHead class="py-3 px-4 text-left">Timestamp</th>
                  <th hlmTableHead class="py-3 px-4 text-left">User / Actor</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Role</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Action</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Target Resource</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Source IP</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Audit Details</th>
                </tr>
              </thead>
              <tbody hlmTableBody class="divide-y divide-border">
                <tr *ngFor="let log of filteredLogs()" (click)="selectedLog.set(log)" hlmTableRow class="hover:bg-muted/40 cursor-pointer transition-colors">
                  <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground whitespace-nowrap">{{ log.timestamp | date:'medium' }}</td>
                  <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ log.username }}</td>
                  <td hlmTableCell class="py-3 px-4"><span hlmBadge variant="outline" class="text-[10px]">{{ log.userRole }}</span></td>
                  <td hlmTableCell class="py-3 px-4"><span hlmBadge variant="secondary" class="text-[10px] font-mono">{{ log.action }}</span></td>
                  <td hlmTableCell class="py-3 px-4 font-medium text-foreground">{{ log.resourceType || log.entityName }}</td>
                  <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">{{ log.ipAddress }}</td>
                  <td hlmTableCell class="py-3 px-4 text-muted-foreground max-w-xs truncate">{{ log.details }}</td>
                </tr>
                <tr *ngIf="filteredLogs().length === 0" hlmTableRow>
                  <td colspan="7" hlmTableCell class="py-12 text-center text-muted-foreground">No audit entries matching filter.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: Security Events & Threat Log -->
      <div *ngIf="activeTab() === 'security'" class="space-y-4">
        <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div class="p-4 border-b border-border bg-muted/20">
            <h3 class="text-xs font-semibold text-foreground">Security Policy & Threat Detection Events</h3>
          </div>
          <div class="overflow-x-auto">
            <table hlmTable class="w-full text-xs">
              <thead hlmTableHeader>
                <tr hlmTableRow class="bg-muted/50 border-b border-border">
                  <th hlmTableHead class="py-3 px-4 text-left">Occurred At</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Event Type</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Actor Username</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Action</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Status</th>
                  <th hlmTableHead class="py-3 px-4 text-left">IP Address</th>
                </tr>
              </thead>
              <tbody hlmTableBody class="divide-y divide-border">
                <tr *ngFor="let ev of securityEvents()" hlmTableRow class="hover:bg-muted/40">
                  <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">{{ ev.occurredAt | date:'short' }}</td>
                  <td hlmTableCell class="py-3 px-4 font-bold text-foreground">{{ ev.eventType }}</td>
                  <td hlmTableCell class="py-3 px-4 font-medium">{{ ev.username }}</td>
                  <td hlmTableCell class="py-3 px-4 font-mono">{{ ev.action }}</td>
                  <td hlmTableCell class="py-3 px-4">
                    <span hlmBadge [variant]="ev.status === 'SUCCESS' ? 'secondary' : 'destructive'" class="text-[10px]">
                      {{ ev.status }}
                    </span>
                  </td>
                  <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">{{ ev.ipAddress || '127.0.0.1' }}</td>
                </tr>
                <tr *ngIf="securityEvents().length === 0" hlmTableRow>
                  <td colspan="6" hlmTableCell class="py-12 text-center text-muted-foreground">No security warning events recorded.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 3: Emergency Break-Glass Audits -->
      <div *ngIf="activeTab() === 'break-glass'" class="space-y-4">
        <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div class="p-4 border-b border-border bg-muted/20">
            <h3 class="text-xs font-semibold text-foreground">Emergency Access (Break-Glass) Override Log</h3>
          </div>
          <div class="overflow-x-auto">
            <table hlmTable class="w-full text-xs">
              <thead hlmTableHeader>
                <tr hlmTableRow class="bg-muted/50 border-b border-border">
                  <th hlmTableHead class="py-3 px-4 text-left">Requested At</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Clinician</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Patient MRN / ID</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Emergency Justification</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Access Status</th>
                </tr>
              </thead>
              <tbody hlmTableBody class="divide-y divide-border">
                <tr *ngFor="let bg of breakGlassLogs()" hlmTableRow class="hover:bg-muted/40">
                  <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">{{ bg.accessedAt || (bg.createdAt | date:'short') }}</td>
                  <td hlmTableCell class="py-3 px-4 font-bold text-foreground">{{ bg.username || bg.requestedBy }}</td>
                  <td hlmTableCell class="py-3 px-4 font-mono">{{ bg.patientId }}</td>
                  <td hlmTableCell class="py-3 px-4 text-foreground">{{ bg.reason || bg.justification }}</td>
                  <td hlmTableCell class="py-3 px-4">
                    <span hlmBadge variant="destructive" class="text-[10px]">EMERGENCY_OVERRIDE</span>
                  </td>
                </tr>
                <tr *ngIf="breakGlassLogs().length === 0" hlmTableRow>
                  <td colspan="5" hlmTableCell class="py-12 text-center text-muted-foreground">No emergency break-glass overrides recorded.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AuditorLedgerComponent implements OnInit {
  activeTab = signal<'audit' | 'security' | 'break-glass'>('audit');
  loading = signal(false);
  logs = signal<AuditLog[]>([]);
  securityEvents = signal<SecurityEventLog[]>([]);
  breakGlassLogs = signal<BreakGlassRecord[]>([]);
  selectedLog = signal<AuditLog | null>(null);

  searchQuery = '';
  selectedActionFilter = 'ALL';

  actionFilters = [
    { label: 'All Actions', value: 'ALL' },
    { label: 'Create / Insert', value: 'CREATE' },
    { label: 'Read / Access', value: 'READ' },
    { label: 'Update / Patch', value: 'UPDATE' },
    { label: 'Delete / Purge', value: 'DELETE' },
    { label: 'Emergency Override', value: 'BREAK_GLASS' },
  ];

  filteredLogs = computed(() => {
    let result = this.logs();
    if (this.selectedActionFilter !== 'ALL') {
      result = result.filter((l) => l.action?.toUpperCase().includes(this.selectedActionFilter));
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.username?.toLowerCase().includes(q) ||
          l.action?.toLowerCase().includes(q) ||
          l.entityName?.toLowerCase().includes(q) ||
          l.details?.toLowerCase().includes(q) ||
          l.ipAddress?.includes(q),
      );
    }
    return result;
  });

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading.set(true);
    this.apiService.getAuditLogs().subscribe({
      next: (logs) => {
        this.logs.set(logs || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.apiService.getSecurityEvents().subscribe({
      next: (events) => this.securityEvents.set(events || []),
      error: () => this.securityEvents.set([]),
    });

    this.apiService.getBreakGlassByUser('all').subscribe({
      next: (bgs) => this.breakGlassLogs.set(bgs || []),
      error: () => this.breakGlassLogs.set([]),
    });
  }

  exportComplianceReport(): void {
    const reportData = {
      complianceStandard: 'ABDM HDMP & HIPAA Security Rule (45 CFR § 164.312(b))',
      exportedAt: new Date().toISOString(),
      totalAuditEntries: this.logs().length,
      entries: this.logs(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Compliance_Audit_Vault_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Compliance audit vault report exported');
  }
}
