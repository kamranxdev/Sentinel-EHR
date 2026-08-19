import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient, BreakGlassRecord } from '../../core/models/patient.model';
import { BreakGlassModalComponent } from '../../shared/break-glass-modal.component';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideShieldAlert,
  lucideSearch,
  lucideLock,
  lucideAlertTriangle,
  lucideClock,
  lucideHistory,
  lucideCheckCircle2,
  lucideChevronRight,
  lucideRefreshCw,
  lucideStethoscope,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-physician-break-glass',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HlmCardImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    BreakGlassModalComponent,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideShieldAlert,
      lucideSearch,
      lucideLock,
      lucideAlertTriangle,
      lucideClock,
      lucideHistory,
      lucideCheckCircle2,
      lucideChevronRight,
      lucideRefreshCw,
      lucideStethoscope,
    }),
  ],
  template: `
    <div class="w-full space-y-6">
      <!-- Header -->
      <div
        class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5 border-b border-border"
      >
        <div class="space-y-1">
          <div class="flex items-center flex-wrap gap-2.5">
            <h1
              class="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2"
            >
              Emergency Break-Glass Protocol
            </h1>
            <span hlmBadge variant="destructive" class="text-[11px] font-semibold py-0.5 px-2.5">
              WORM Audited Clinical Override
            </span>
          </div>
          <p class="text-xs text-muted-foreground">
            Execute temporary emergency clinical record leases for unassigned emergency patients,
            trauma resuscitations, and rapid responses.
          </p>
        </div>

        <div class="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <button
            hlmBtn
            variant="outline"
            size="sm"
            (click)="loadAuditHistory()"
            class="gap-1.5 text-xs flex-1 sm:flex-initial"
          >
            <ng-icon name="lucideRefreshCw" [class.animate-spin]="loadingHistory()" size="14" />
            <span>Refresh Audit Logs</span>
          </button>
        </div>
      </div>

      <!-- Security Guidance Banner -->
      <div class="p-5 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-3">
        <div class="flex items-start gap-3.5">
          <div
            class="size-10 rounded-xl bg-rose-500/20 text-rose-600 flex items-center justify-center shrink-0"
          >
            <ng-icon name="lucideShieldAlert" size="22" />
          </div>
          <div class="space-y-1 text-xs">
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Legal & ABDM Compliance Notice</span>
              <span hlmBadge variant="destructive" class="text-[10px]">Immutable Ledger</span>
            </h3>
            <p class="text-muted-foreground leading-relaxed">
              In accordance with DPDP and ABDM data governance regulations, physicians may only
              access patient records within an active clinical relationship (Appointment, Inpatient
              Care Team, or Outpatient Encounter). Executing Break-Glass overrides ABAC policies for
              a temporary 4-hour lease. Every read, write, and order executed is stamped to the
              immutable compliance ledger.
            </p>
          </div>
        </div>
      </div>

      <!-- Emergency Patient Discovery & Override Card -->
      <div class="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 class="text-sm font-bold text-foreground">Emergency Patient Lookup</h3>
            <p class="text-xs text-muted-foreground">
              Search by Patient Full Name, MRN Code, or National ID
            </p>
          </div>
          <div class="relative w-full sm:w-80">
            <ng-icon
              name="lucideSearch"
              size="14"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              hlmInput
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearch()"
              placeholder="Enter patient name or MRN..."
              class="pl-9 h-9 w-full text-xs bg-background"
            />
          </div>
        </div>

        <!-- Search Results List -->
        <div
          *ngIf="searchResults().length > 0"
          class="divide-y divide-border border rounded-xl overflow-hidden"
        >
          <div
            *ngFor="let p of searchResults()"
            class="p-4 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2 font-bold text-foreground text-sm">
                <span>{{ p.fullName }}</span>
                <span hlmBadge variant="outline" class="text-[10px] font-mono">{{
                  p.patientCode
                }}</span>
              </div>
              <div class="text-muted-foreground text-[11px]">
                DOB: {{ p.dateOfBirth || 'N/A' }} • Gender: {{ p.gender || 'N/A' }} • Blood:
                {{ p.bloodType || 'A+' }}
              </div>
            </div>

            <button
              hlmBtn
              variant="default"
              size="sm"
              (click)="triggerBreakGlass(p)"
              class="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1.5 shadow-xs shrink-0 self-end sm:self-center"
            >
              <ng-icon name="lucideLock" size="13" />
              <span>Request Break-Glass Override</span>
            </button>
          </div>
        </div>

        <div
          *ngIf="searchQuery && searchResults().length === 0"
          class="py-8 text-center text-xs text-muted-foreground"
        >
          No patient found matching "{{ searchQuery }}". Verify MRN or national ID.
        </div>
      </div>

      <!-- Historical Break-Glass Overrides Log -->
      <div class="rounded-2xl border border-border bg-card overflow-hidden shadow-xs space-y-0">
        <div class="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <ng-icon name="lucideHistory" size="16" class="text-rose-600" />
            <h3 class="text-sm font-bold text-foreground">
              Recent Emergency Access Overrides & Active Leases
            </h3>
          </div>
          <span hlmBadge variant="outline" class="text-[10px] font-mono">
            {{ auditRecords().length }} Recorded Overrides
          </span>
        </div>

        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Timestamp</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Patient ID / Context</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Category</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">
                  Clinical Justification
                </th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Lease Status</th>
                <th hlmTableHead class="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr
                *ngFor="let rec of auditRecords()"
                hlmTableRow
                class="hover:bg-muted/30 transition-colors"
              >
                <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">
                  {{ rec.requestedAt || rec.id | date: 'medium' }}
                </td>
                <td hlmTableCell class="py-3 px-4 font-mono font-semibold text-foreground">
                  {{ rec.patientId || rec.patient?.patientCode || 'N/A' }}
                </td>
                <td hlmTableCell class="py-3 px-4 font-semibold text-rose-600 dark:text-rose-400">
                  {{ rec.category }}
                </td>
                <td hlmTableCell class="py-3 px-4 max-w-xs truncate text-muted-foreground">
                  {{ rec.justification }}
                </td>
                <td hlmTableCell class="py-3 px-4">
                  <span
                    hlmBadge
                    variant="secondary"
                    class="text-[10px] font-mono bg-emerald-500/10 text-emerald-600"
                  >
                    {{ rec.status || 'LEASE_ACTIVE (4h)' }}
                  </span>
                </td>
                <td hlmTableCell class="py-3 px-4 text-right">
                  <button
                    hlmBtn
                    variant="outline"
                    size="sm"
                    class="h-7 text-xs gap-1"
                    (click)="openChartById(rec.patientId)"
                  >
                    <ng-icon name="lucideStethoscope" size="12" />
                    <span>Open Chart</span>
                  </button>
                </td>
              </tr>

              <tr *ngIf="auditRecords().length === 0" hlmTableRow>
                <td colspan="6" class="py-12 text-center text-xs text-muted-foreground space-y-1">
                  <ng-icon name="lucideCheckCircle2" class="text-emerald-500 mx-auto" size="24" />
                  <p>No active Break-Glass override leases recorded for this session.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Break-Glass Modal Component -->
      <app-break-glass-modal
        [isOpen]="isModalOpen"
        [patientId]="selectedPatient?.id || null"
        [patientName]="selectedPatient?.fullName || ''"
        (closed)="isModalOpen = false"
        (granted)="onOverrideGranted($event)"
      ></app-break-glass-modal>
    </div>
  `,
})
export class PhysicianBreakGlassComponent implements OnInit {
  searchQuery = '';
  searchResults = signal<Patient[]>([]);
  auditRecords = signal<BreakGlassRecord[]>([]);
  loadingHistory = signal<boolean>(false);

  isModalOpen = false;
  selectedPatient: Patient | null = null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private patientContext: PatientContextService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadAuditHistory();
  }

  onSearch(): void {
    const q = this.searchQuery.trim();
    if (!q || q.length < 2) {
      this.searchResults.set([]);
      return;
    }
    this.apiService.searchPatients(q).subscribe({
      next: (pts) => this.searchResults.set(pts || []),
      error: () => this.searchResults.set([]),
    });
  }

  triggerBreakGlass(patient: Patient): void {
    this.selectedPatient = patient;
    this.isModalOpen = true;
  }

  onOverrideGranted(record: any): void {
    this.isModalOpen = false;
    if (this.selectedPatient) {
      toast.success(`Emergency Break-Glass access granted for ${this.selectedPatient.fullName}`);
      this.patientContext.setActivePatient(this.selectedPatient);
      this.router.navigate(['/physician/chart']);
    }
    this.loadAuditHistory();
  }

  loadAuditHistory(): void {
    const user = this.authService.currentUser();
    if (!user) return;
    this.loadingHistory.set(true);
    this.apiService.getBreakGlassByUser(user.email || user.email || '').subscribe({
      next: (recs) => {
        this.auditRecords.set(recs || []);
        this.loadingHistory.set(false);
      },
      error: () => this.loadingHistory.set(false),
    });
  }

  openChartById(patientId?: string): void {
    if (!patientId) return;
    this.apiService.getPatientById(patientId).subscribe({
      next: (p) => {
        this.patientContext.setActivePatient(p);
        this.router.navigate(['/physician/chart']);
      },
    });
  }
}
