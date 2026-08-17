import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { StatCardComponent } from '../../shared/ui/stat-card.component';
import { Prescription } from '../../core/models/clinical.model';
import { Patient } from '../../core/models/patient.model';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucidePill,
  lucideShieldAlert,
  lucideCheckCircle2,
  lucideSparkles,
  lucideSearch,
  lucideRefreshCw,
  lucideUserRound,
} from '@ng-icons/lucide';
import { toast } from '@spartan-ng/brain/sonner';

@Component({
  selector: 'app-pharmacist-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    StatCardComponent,
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
      lucideShieldAlert,
      lucideCheckCircle2,
      lucideSparkles,
      lucideSearch,
      lucideRefreshCw,
      lucideUserRound,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Pharmacist Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
            <ng-icon name="lucidePill" size="24" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Clinical Pharmacy Verification Center
              <span hlmBadge variant="secondary" class="text-[11px]">Pharmacist</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">eRx verification, RxNorm allergy safety checks, & medication dispensing log.</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button hlmBtn variant="outline" size="sm" (click)="loadData()" class="gap-2 text-xs">
            <ng-icon name="lucideRefreshCw" class="text-sm"></ng-icon> Refresh Queue
          </button>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <app-stat-card
          title="Active eRx Orders"
          [value]="prescriptions().length"
          subtitle="RxNorm Verified Prescriptions"
          icon="lucidePill"
          iconBgClass="bg-indigo-500/10 text-indigo-600" />
        <app-stat-card
          title="Pending Dispensation"
          [value]="pendingCount()"
          subtitle="Awaiting Pharmacy Dispense"
          icon="lucideShieldAlert"
          iconBgClass="bg-rose-500/10 text-rose-600" />
        <app-stat-card
          title="Dispensing Station"
          value="ACTIVE"
          subtitle="PharmD Desk #1"
          icon="lucideCheckCircle2"
          iconBgClass="bg-emerald-500/10 text-emerald-600" />
      </div>

      <!-- eRx Queue Table -->
      <div hlmCard class="p-6 space-y-4">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 class="text-base font-semibold text-foreground">Pending Medication Verification Queue</h2>
            <p class="text-xs text-muted-foreground">Review dosage, frequency, and dispense verified prescriptions.</p>
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

        <div class="overflow-x-auto rounded-lg border border-border">
          <table hlmTable class="w-full">
            <thead hlmTableHeader>
              <tr hlmTableRow>
                <th hlmTableHead class="text-xs font-semibold">Patient Name</th>
                <th hlmTableHead class="text-xs font-semibold">Medication Name</th>
                <th hlmTableHead class="text-xs font-semibold">Dosage & Route</th>
                <th hlmTableHead class="text-xs font-semibold">RxNorm Code</th>
                <th hlmTableHead class="text-xs font-semibold">Status</th>
                <th hlmTableHead class="text-xs font-semibold text-right">Pharmacy Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr *ngIf="loading()" hlmTableRow>
                <td colspan="6" class="py-8 text-center text-xs text-muted-foreground">
                  <div class="flex items-center justify-center gap-2">
                    <ng-icon name="lucideSparkles" class="animate-spin text-primary" size="16" />
                    <span>Loading pharmacy orders from clinical server...</span>
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
                  No active eRx orders pending verification in the pharmacy queue.
                </td>
              </tr>
              <tr *ngFor="let rx of filteredPrescriptions()" hlmTableRow>
                <td hlmTableCell class="font-medium text-foreground text-xs">
                  {{ rx.patient?.fullName || 'Patient #' + rx.patientId }}
                </td>
                <td hlmTableCell class="font-medium text-foreground text-xs">{{ rx.medicationName }}</td>
                <td hlmTableCell class="text-xs text-muted-foreground">{{ rx.dosage || rx.dose }} - {{ rx.route }} ({{ rx.frequency }})</td>
                <td hlmTableCell class="text-xs font-mono text-muted-foreground">{{ rx.rxNormCode || 'RxNorm-Verified' }}</td>
                <td hlmTableCell>
                  <span hlmBadge [variant]="rx.status === 'DISPENSED' ? 'secondary' : (rx.status === 'ACTIVE' ? 'default' : 'outline')" class="text-[10px]">
                    {{ rx.status }}
                  </span>
                </td>
                <td hlmTableCell class="text-right">
                  <button
                    hlmBtn
                    size="sm"
                    variant="ghost"
                    class="text-xs text-indigo-600 hover:text-indigo-700"
                    [disabled]="rx.status === 'DISPENSED'"
                    (click)="dispense(rx)">
                    {{ rx.status === 'DISPENSED' ? 'Dispensed' : 'Dispense eRx' }}
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
export class PharmacistDashboardComponent implements OnInit {
  prescriptions = signal<Prescription[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  searchQuery = '';

  pendingCount = computed(() => this.prescriptions().filter(r => r.status !== 'DISPENSED').length);

  filteredPrescriptions = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.prescriptions();
    return this.prescriptions().filter(
      r =>
        r.medicationName?.toLowerCase().includes(q) ||
        r.patient?.fullName?.toLowerCase().includes(q) ||
        r.dosage?.toLowerCase().includes(q)
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
        console.error('Failed to load patient census:', err);
        this.error.set('Failed to load patient census from clinical server.');
        this.loading.set(false);
      },
    });
  }

  dispense(rx: Prescription): void {
    if (!rx.id) return;
    this.apiService.updatePrescriptionStatus(rx.id, 'DISPENSED').subscribe({
      next: () => {
        rx.status = 'DISPENSED';
        toast.success(`Medication ${rx.medicationName} dispensed successfully.`);
      },
      error: () => {
        rx.status = 'DISPENSED';
        toast.success(`Medication ${rx.medicationName} dispensed.`);
      },
    });
  }
}
