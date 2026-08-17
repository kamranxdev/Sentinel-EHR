import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuditLog } from '../../core/models/audit.model';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideShieldCheck, lucideSearch, lucideRefreshCw, lucideFilter, lucideX, lucideInfo } from '@ng-icons/lucide';

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
  providers: [provideIcons({ lucideShieldCheck, lucideSearch, lucideRefreshCw, lucideFilter, lucideX, lucideInfo })],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            ABDM & DPDP Compliance Audit Ledger
            <span hlmBadge variant="secondary" class="text-[10px]">WORM Storage</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Immutable log trail for compliance reviews and access audits across the EHR system under ABDM HDMP & DPDP Act 2023.
          </p>
        </div>
        <button hlmBtn variant="outline" size="sm" (click)="loadLogs()" [disabled]="loading()" class="gap-1.5 text-xs">
          <ng-icon name="lucideRefreshCw" size="14" [class.animate-spin]="loading()" />
          Refresh Ledger
        </button>
      </div>

      <!-- Controls: Search & Quick Action Filters -->
      <div class="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3">
        <div class="relative">
          <ng-icon name="lucideSearch" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            hlmInput
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearchChange()"
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
            (click)="selectActionFilter(filter.value)"
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
                <th hlmTableHead class="py-3 px-4 text-left">Resource ID</th>
                <th hlmTableHead class="py-3 px-4 text-left">Source IP</th>
                <th hlmTableHead class="py-3 px-4 text-left">Audit Details</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let log of filteredLogs()" (click)="selectedLog.set(log)" hlmTableRow class="hover:bg-muted/40 cursor-pointer transition-colors">
                <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground whitespace-nowrap">{{ log.timestamp | date:'medium' }}</td>
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ log.username }}</td>
                <td hlmTableCell class="py-3 px-4">
                  <span [class]="'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ' + getRoleBadgeClass(log.userRole)">
                    {{ formatRole(log.userRole) }}
                  </span>
                </td>
                <td hlmTableCell class="py-3 px-4">
                  <span [class]="'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ' + getActionBadgeClass(log.action)">
                    {{ log.action }}
                  </span>
                </td>
                <td hlmTableCell class="py-3 px-4 font-medium text-foreground">{{ log.entityName }}</td>
                <td hlmTableCell class="py-3 px-4 font-mono text-[11px]">{{ log.resourceId || 'N/A' }}</td>
                <td hlmTableCell class="py-3 px-4 font-mono text-[11px] text-muted-foreground">{{ log.ipAddress || '127.0.0.1' }}</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground max-w-xs truncate">{{ log.details }}</td>
              </tr>
              <tr *ngIf="filteredLogs().length === 0" hlmTableRow>
                <td colspan="8" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">
                  No matching audit logs found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detail Modal / Drawer -->
      <div *ngIf="selectedLog()" class="fixed inset-0 bg-background/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-card border border-border rounded-xl shadow-lg max-w-lg w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
          <button (click)="selectedLog.set(null)" class="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
            <ng-icon name="lucideX" size="18" />
          </button>
          
          <div class="flex items-center gap-3 border-b border-border pb-3">
            <div class="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ng-icon name="lucideInfo" size="20" />
            </div>
            <div>
              <h3 class="text-base font-bold text-foreground">Audit Record Inspector</h3>
              <p class="text-xs text-muted-foreground font-mono">Event ID #{{ selectedLog()?.id }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span class="text-muted-foreground font-medium block">Timestamp</span>
              <span class="font-mono text-foreground">{{ selectedLog()?.timestamp | date:'long' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground font-medium block">Actor Principal</span>
              <span class="font-semibold text-foreground">{{ selectedLog()?.username }}</span>
            </div>
            <div>
              <span class="text-muted-foreground font-medium block">Role</span>
              <span [class]="'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border mt-1 ' + getRoleBadgeClass(selectedLog()?.userRole || '')">
                {{ formatRole(selectedLog()?.userRole || '') }}
              </span>
            </div>
            <div>
              <span class="text-muted-foreground font-medium block">Action</span>
              <span [class]="'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border mt-1 ' + getActionBadgeClass(selectedLog()?.action || '')">
                {{ selectedLog()?.action }}
              </span>
            </div>
            <div>
              <span class="text-muted-foreground font-medium block">Entity / Target</span>
              <span class="font-mono text-foreground">{{ selectedLog()?.entityName }} #{{ selectedLog()?.resourceId || 'N/A' }}</span>
            </div>
            <div>
              <span class="text-muted-foreground font-medium block">Client IP Address</span>
              <span class="font-mono text-foreground">{{ selectedLog()?.ipAddress || '127.0.0.1' }}</span>
            </div>
          </div>

          <div class="space-y-1">
            <span class="text-muted-foreground font-medium text-xs">Detailed Narrative</span>
            <p class="text-xs font-mono bg-muted/50 border border-border p-3 rounded-lg text-foreground whitespace-pre-wrap break-all">
              {{ selectedLog()?.details }}
            </p>
          </div>

          <div class="flex justify-end pt-2">
            <button hlmBtn variant="outline" size="sm" (click)="selectedLog.set(null)" class="text-xs">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AuditorLedgerComponent implements OnInit {
  rawAuditLogs = signal<AuditLog[]>([]);
  loading = signal(false);
  searchQuery = '';
  selectedActionFilter = 'ALL';
  selectedLog = signal<AuditLog | null>(null);

  actionFilters = [
    { label: 'All Actions', value: 'ALL' },
    { label: 'Read', value: 'READ' },
    { label: 'Create', value: 'CREATE' },
    { label: 'Update', value: 'UPDATE' },
    { label: 'Delete', value: 'DELETE' },
    { label: 'Access Denied', value: 'ACCESS_DENIED' },
    { label: 'Login', value: 'LOGIN' },
  ];

  filteredLogs = computed(() => {
    let logs = this.rawAuditLogs();
    
    if (this.selectedActionFilter !== 'ALL') {
      logs = logs.filter(l => l.action?.toUpperCase() === this.selectedActionFilter);
    }
    
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      logs = logs.filter(l => 
        l.username?.toLowerCase().includes(q) ||
        l.userRole?.toLowerCase().includes(q) ||
        l.action?.toLowerCase().includes(q) ||
        l.entityName?.toLowerCase().includes(q) ||
        l.resourceId?.toLowerCase().includes(q) ||
        l.ipAddress?.toLowerCase().includes(q) ||
        l.details?.toLowerCase().includes(q)
      );
    }
    
    return logs;
  });

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading.set(true);
    this.apiService.getAuditLogs().subscribe({
      next: (logs) => {
        this.rawAuditLogs.set(logs);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearchChange(): void {
    // Client-side instant filter via computed signal
  }

  selectActionFilter(filterValue: string): void {
    this.selectedActionFilter = filterValue;
  }

  formatRole(role: string): string {
    if (!role) return 'User';
    if (role.startsWith('ROLE_')) {
      const raw = role.replace('ROLE_', '');
      return raw.charAt(0) + raw.slice(1).toLowerCase();
    }
    if (role.includes(',')) {
      return role.split(',').map(r => this.formatRole(r)).join(', ');
    }
    return role;
  }

  getRoleBadgeClass(role: string): string {
    if (!role) return 'bg-muted text-muted-foreground border-border';
    if (role.includes('ADMIN')) return 'bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-400';
    if (role.includes('DOCTOR')) return 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400';
    if (role.includes('NURSE')) return 'bg-teal-500/10 text-teal-600 border-teal-500/30 dark:text-teal-400';
    if (role.includes('PATIENT')) return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400';
    if (role.includes('SYSTEM')) return 'bg-slate-500/10 text-slate-600 border-slate-500/30 dark:text-slate-400';
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
