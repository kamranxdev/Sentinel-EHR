import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Prescription } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePill, lucideCheckCircle2, lucideClock } from '@ng-icons/lucide';

@Component({
  selector: 'app-nurse-prescriptions',
  standalone: true,
  imports: [
    CommonModule,
    HlmCardImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmButtonImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucidePill, lucideCheckCircle2, lucideClock })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ng-icon name="lucidePill" size="24" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Medication Administration Record (MAR)
              <span hlmBadge variant="secondary" class="text-[10px]">Bedside eMAR</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">Active physician eRx orders & 1-click bedside dose administration log</p>
          </div>
        </div>

        <div *ngIf="activePatient()" class="flex items-center gap-2 p-2 rounded-lg border border-border bg-card">
          <span class="text-xs font-semibold text-foreground">{{ activePatient()?.fullName }}</span>
          <span class="text-[10px] font-mono text-muted-foreground">MRN: {{ activePatient()?.patientCode }}</span>
        </div>
      </div>

      <!-- eRx Prescriptions Table -->
      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs space-y-0">
        <div class="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
          <h3 class="text-xs font-semibold text-foreground flex items-center gap-2">
            <ng-icon name="lucidePill" size="14" class="text-emerald-500" />
            Active Physician eRx Orders
          </h3>
          <span class="text-[11px] text-muted-foreground">{{ prescriptions().length }} active orders</span>
        </div>

        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Medication</th>
                <th hlmTableHead class="py-3 px-4 text-left">Dosage & Route</th>
                <th hlmTableHead class="py-3 px-4 text-left">Frequency</th>
                <th hlmTableHead class="py-3 px-4 text-left">Instructions</th>
                <th hlmTableHead class="py-3 px-4 text-left">Status</th>
                <th hlmTableHead class="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let rx of prescriptions()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ rx.medicationName }}</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ rx.dosage }} ({{ rx.route || 'Oral' }})</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ rx.frequency }}</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground max-w-xs truncate">{{ rx.instructions }}</td>
                <td hlmTableCell class="py-3 px-4">
                  <span hlmBadge variant="secondary" class="text-[10px] bg-emerald-500/10 text-emerald-600">{{ rx.status }}</span>
                </td>
                <td hlmTableCell class="py-3 px-4 text-right">
                  <button 
                    hlmBtn 
                    variant="default" 
                    size="sm" 
                    class="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white"
                    (click)="administerMedication(rx)"
                  >
                    <ng-icon name="lucideCheckCircle2" size="12" class="mr-1" /> Log Administered
                  </button>
                </td>
              </tr>
              <tr *ngIf="prescriptions().length === 0" hlmTableRow>
                <td colspan="6" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No active eRx orders logged for this patient.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- eMAR Administration History -->
      <div class="p-6 rounded-xl border border-border bg-card space-y-4">
        <div class="flex justify-between items-center border-b border-border pb-3">
          <h3 class="text-sm font-semibold text-foreground flex items-center gap-2">
            <ng-icon name="lucideClock" size="16" class="text-emerald-500" />
            Bedside Administration Log (eMAR History)
          </h3>
        </div>

        <div class="overflow-x-auto" *ngIf="emarHistory().length > 0; else noEmar">
          <table class="w-full text-xs text-left">
            <thead class="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th class="p-3">Administered At</th>
                <th class="p-3">Medication Name</th>
                <th class="p-3">Dose / Route</th>
                <th class="p-3">Status</th>
                <th class="p-3">Administered By</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr *ngFor="let item of emarHistory()" class="hover:bg-muted/20">
                <td class="p-3 text-muted-foreground">{{ item.administeredAt | date:'short' }}</td>
                <td class="p-3 font-semibold text-foreground">{{ item.medicationName }}</td>
                <td class="p-3">{{ item.dose }} • {{ item.route || 'Oral' }}</td>
                <td class="p-3 font-mono font-semibold text-emerald-600">{{ item.status }}</td>
                <td class="p-3 text-muted-foreground">{{ item.administeredBy?.fullName || 'Nurse' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #noEmar>
          <div class="p-6 text-center text-xs text-muted-foreground">
            No medication administration records logged yet.
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class NursePrescriptionsComponent implements OnInit {
  prescriptions = signal<Prescription[]>([]);
  emarHistory = signal<any[]>([]);

  constructor(
    private apiService: ApiService,
    public patientContext: PatientContextService,
  ) {
    effect(() => {
      const active = this.patientContext.activePatient();
      if (active && active.id) {
        this.loadRx(active.id);
        this.loadEmar(active.id);
      }
    });
  }

  activePatient() {
    return this.patientContext.activePatient();
  }

  ngOnInit(): void {
    const active = this.patientContext.activePatient();
    if (active && active.id) {
      this.loadRx(active.id);
      this.loadEmar(active.id);
    }
  }

  loadRx(patientId: number): void {
    this.apiService.getPrescriptionsByPatient(patientId).subscribe((res) => this.prescriptions.set(res));
  }

  loadEmar(patientId: number): void {
    this.apiService.getEmarHistoryForPatient(patientId).subscribe((res) => this.emarHistory.set(res));
  }

  administerMedication(rx: Prescription): void {
    const patient = this.activePatient();
    if (!patient || !patient.id) return;

    const payload = {
      patient: { id: patient.id },
      prescription: { id: rx.id },
      medicationName: rx.medicationName,
      dose: rx.dosage,
      route: rx.route || 'Oral',
      status: 'ADMINISTERED',
    };

    this.apiService.recordEmarAdministration(payload).subscribe({
      next: () => {
        if (patient.id) this.loadEmar(patient.id);
      },
    });
  }
}
