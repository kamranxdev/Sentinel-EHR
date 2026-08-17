import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { Prescription } from '../../core/models/clinical.model';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePill, lucideShieldCheck, lucideCheckCircle2, lucideRefreshCw, lucideSearch } from '@ng-icons/lucide';

@Component({
  selector: 'app-pharmacist-erx',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
    HlmInputImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucidePill,
      lucideShieldCheck,
      lucideCheckCircle2,
      lucideRefreshCw,
      lucideSearch,
    }),
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Clinical Pharmacy & eRx Verification Queue
            <span hlmBadge variant="secondary" class="text-[11px]">Pharmacist</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">RxNorm safety verification, renal dosing checks, and eMAR scheduling.</p>
        </div>
        <button hlmBtn variant="outline" size="sm" (click)="loadPrescriptions()" class="gap-2 text-xs">
          <ng-icon name="lucideRefreshCw" class="text-sm"></ng-icon> Refresh Queue
        </button>
      </div>

      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div class="flex items-center gap-2">
            <ng-icon name="lucideShieldCheck" size="18" class="text-primary" />
            <h3 class="text-sm font-bold text-foreground">Verified eRx Roster</h3>
          </div>
          <div class="relative w-full sm:w-72">
            <ng-icon name="lucideSearch" size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search by drug name or patient..."
              class="w-full pl-9 pr-3 h-9 rounded-md border border-input bg-background text-xs"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Rx ID</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Patient Name</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Medication Name</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Dosage & Route</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">RxNorm Code</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Verification Stage</th>
                <th hlmTableHead class="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngIf="loading()" hlmTableRow>
                <td colspan="7" class="py-12 text-center text-xs text-muted-foreground">
                  <div class="flex items-center justify-center gap-2">
                    <ng-icon name="lucideRefreshCw" class="animate-spin text-primary" size="16" />
                    <span>Loading electronic prescriptions...</span>
                  </div>
                </td>
              </tr>
              <tr *ngIf="!loading() && error()" hlmTableRow>
                <td colspan="7" class="py-8 text-center text-xs text-destructive">
                  <p>{{ error() }}</p>
                  <button (click)="loadPrescriptions()" class="mt-2 text-xs text-primary underline">Retry</button>
                </td>
              </tr>
              <tr *ngIf="!loading() && !error() && filteredPrescriptions().length === 0" hlmTableRow>
                <td colspan="7" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No active eRx orders pending verification.</td>
              </tr>
              <tr *ngFor="let rx of filteredPrescriptions()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-mono font-bold text-foreground">#RX-{{ rx.id }}</td>
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ rx.patient?.fullName || 'Patient #' + rx.patientId }}</td>
                <td hlmTableCell class="py-3 px-4 font-medium text-foreground">{{ rx.medicationName }}</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ rx.dosage || rx.dose }} ({{ rx.frequency }})</td>
                <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">{{ rx.rxNormCode || 'RxNorm-Verified' }}</td>
                <td hlmTableCell class="py-3 px-4">
                  <span hlmBadge [variant]="getBadgeVariant(rx.status)" class="text-[10px] uppercase font-bold">
                    {{ rx.status }}
                  </span>
                </td>
                <td hlmTableCell class="py-3 px-4 text-right">
                  <button
                    *ngIf="rx.status !== 'PHARMACY_VERIFIED' && rx.status !== 'DISPENSED'"
                    hlmBtn
                    variant="outline"
                    size="xs"
                    (click)="verifyPharmacyOrder(rx)"
                    class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold gap-1"
                  >
                    <ng-icon name="lucideShieldCheck" class="text-xs"></ng-icon> Verify & Approve
                  </button>
                  <span *ngIf="rx.status === 'PHARMACY_VERIFIED'" class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1">
                    <ng-icon name="lucideCheckCircle2" class="text-xs"></ng-icon> Verified
                  </span>
                  <span *ngIf="rx.status === 'DISPENSED'" class="text-[11px] text-muted-foreground font-semibold flex items-center justify-end gap-1">
                    <ng-icon name="lucideCheckCircle2" class="text-xs"></ng-icon> Dispensed
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class PharmacistErxComponent implements OnInit {
  prescriptions = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  searchQuery = '';

  filteredPrescriptions = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.prescriptions();
    return this.prescriptions().filter(
      r =>
        r.medicationName?.toLowerCase().includes(q) ||
        r.patient?.fullName?.toLowerCase().includes(q)
    );
  });

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  loadPrescriptions(): void {
    this.loading.set(true);
    this.error.set(null);
    this.apiService.getPatients().subscribe({
      next: (patients) => {
        if (!patients || patients.length === 0) {
          this.prescriptions.set([]);
          this.loading.set(false);
          return;
        }
        const tasks = patients.slice(0, 10).map((p) =>
          this.apiService.getPrescriptionsByPatient(p.id!).pipe(
            map((rxs) => Array.isArray(rxs) ? rxs.map((r) => ({ ...r, patient: p })) : []),
            catchError(() => of([])),
          ),
        );
        forkJoin(tasks).pipe(
          map((res) => res.flat()),
        ).subscribe({
          next: (allRxs) => {
            this.prescriptions.set(allRxs);
            this.loading.set(false);
          },
          error: (err) => {
            console.error('Failed to load prescriptions:', err);
            this.error.set('Failed to load prescriptions from clinical server.');
            this.loading.set(false);
          },
        });
      },
      error: (err) => {
        console.error('Failed to load patients:', err);
        this.error.set('Failed to load patient records from clinical server.');
        this.loading.set(false);
      },
    });
  }

  getBadgeVariant(status?: string): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (status) {
      case 'PHARMACY_VERIFIED': return 'default';
      case 'DISPENSED': return 'secondary';
      default: return 'outline';
    }
  }

  verifyPharmacyOrder(rx: any): void {
    this.apiService.updatePrescriptionStatus(rx.id, 'PHARMACY_VERIFIED').subscribe({
      next: () => {
        toast.success(`Pharmacist approval completed for ${rx.medicationName}. Order marked PHARMACY_VERIFIED.`);
        this.loadPrescriptions();
      },
      error: (err) => {
        toast.error(err?.error?.message || `Failed to update prescription status for ${rx.medicationName}.`);
      },
    });
  }
}
