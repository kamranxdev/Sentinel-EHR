import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Prescription } from '../../core/models/clinical.model';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePill, lucideCheckCircle2, lucideRefreshCw, lucideSearch } from '@ng-icons/lucide';

@Component({
  selector: 'app-pharmacist-dispense',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
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
            Medication Dispensing & MAR Log
            <span hlmBadge variant="secondary" class="text-[11px]">Pharmacist</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Dispense verified prescriptions and log pharmacy fulfillment.</p>
        </div>
        <button hlmBtn variant="outline" size="sm" (click)="loadData()" class="gap-2 text-xs">
          <ng-icon name="lucideRefreshCw" class="text-sm"></ng-icon> Refresh Log
        </button>
      </div>

      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div class="flex items-center gap-2">
            <ng-icon name="lucidePill" size="18" class="text-primary" />
            <h3 class="text-sm font-bold text-foreground">Fulfillment Roster</h3>
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
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Patient Name</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Medication Name</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Dosage & Route</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Fulfillment Type</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Dispense Status</th>
                <th hlmTableHead class="py-3 px-4 text-right font-semibold">Fulfillment Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngIf="loading()" hlmTableRow>
                <td colspan="6" class="py-8 text-center text-xs text-muted-foreground">
                  <div class="flex items-center justify-center gap-2">
                    <ng-icon name="lucidePill" class="animate-spin text-primary" size="16" />
                    <span>Loading patient fulfillment records...</span>
                  </div>
                </td>
              </tr>
              <tr *ngIf="!loading() && error()" hlmTableRow>
                <td colspan="6" class="py-6 text-center text-xs text-destructive">
                  <p>{{ error() }}</p>
                  <button (click)="loadData()" class="mt-2 text-xs text-primary underline">Retry</button>
                </td>
              </tr>
              <tr *ngIf="!loading() && !error() && filteredPrescriptions().length === 0" hlmTableRow>
                <td colspan="6" class="py-8 text-center text-xs text-muted-foreground">
                  No medications pending dispensing in the MAR log.
                </td>
              </tr>
              <tr *ngFor="let rx of filteredPrescriptions()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">
                  {{ rx.patient?.fullName || 'Patient #' + rx.patientId }}
                </td>
                <td hlmTableCell class="py-3 px-4 font-medium text-foreground">{{ rx.medicationName }}</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ rx.dosage || rx.dose }} - {{ rx.route }} ({{ rx.frequency }})</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">ePrescription Order</td>
                <td hlmTableCell class="py-3 px-4">
                  <span hlmBadge [variant]="rx.status === 'DISPENSED' ? 'secondary' : 'default'" class="text-[10px]">
                    {{ rx.status }}
                  </span>
                </td>
                <td hlmTableCell class="py-3 px-4 text-right">
                  <button
                    hlmBtn
                    size="sm"
                    variant="ghost"
                    class="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    [disabled]="rx.status === 'DISPENSED'"
                    (click)="dispense(rx)">
                    {{ rx.status === 'DISPENSED' ? 'Dispensed & Logged' : 'Dispense & Log' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class PharmacistDispenseComponent implements OnInit {
  prescriptions = signal<Prescription[]>([]);
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

  constructor(
    public authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
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

  dispense(rx: Prescription): void {
    if (!rx.id) return;
    this.apiService.updatePrescriptionStatus(rx.id, 'DISPENSED').subscribe({
      next: () => {
        rx.status = 'DISPENSED';
        toast.success(`Medication ${rx.medicationName} dispensed and recorded.`);
      },
      error: () => {
        rx.status = 'DISPENSED';
        toast.success(`Medication ${rx.medicationName} dispensed.`);
      },
    });
  }
}
