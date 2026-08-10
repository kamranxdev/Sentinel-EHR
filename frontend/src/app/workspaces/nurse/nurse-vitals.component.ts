import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Vitals, Patient } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideActivity, lucideUserRound, lucideX, lucideSave } from '@ng-icons/lucide';

@Component({
  selector: 'app-nurse-vitals',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmCardImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmButtonImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucidePlus, lucideActivity, lucideUserRound, lucideX, lucideSave })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <ng-icon name="lucideActivity" size="24" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Bedside Vitals Flowsheet
              <span hlmBadge variant="secondary" class="text-[10px]">Nursing Station</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">Record and monitor physiological vital signs, blood pressure, pulse, temperature, and BMI.</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div *ngIf="activePatient()" class="flex items-center gap-2 p-2 rounded-lg border border-border bg-card">
            <ng-icon name="lucideUserRound" size="16" class="text-muted-foreground" />
            <span class="text-xs font-semibold text-foreground">{{ activePatient()?.fullName }}</span>
          </div>
          <button hlmBtn variant="default" size="sm" (click)="openModal()" class="gap-1.5 font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white">
            <ng-icon name="lucidePlus" size="14" /> Log Bedside Vitals
          </button>
        </div>
      </div>

      <!-- Vitals Table -->
      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
          <h3 class="text-xs font-semibold text-foreground flex items-center gap-2">
            <ng-icon name="lucideActivity" size="14" class="text-blue-500" />
            Vitals History Log
          </h3>
          <span class="text-[11px] text-muted-foreground">{{ vitals().length }} readings</span>
        </div>

        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Timestamp</th>
                <th hlmTableHead class="py-3 px-4 text-left">Blood Pressure</th>
                <th hlmTableHead class="py-3 px-4 text-left">Heart Rate</th>
                <th hlmTableHead class="py-3 px-4 text-left">Temperature</th>
                <th hlmTableHead class="py-3 px-4 text-left">SpO2</th>
                <th hlmTableHead class="py-3 px-4 text-left">Glucose</th>
                <th hlmTableHead class="py-3 px-4 text-left">BMI</th>
                <th hlmTableHead class="py-3 px-4 text-left">Recorded By</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let v of vitals()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">{{ v.recordedAt | date:'short' }}</td>
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground font-mono">{{ v.bloodPressure }}</td>
                <td hlmTableCell class="py-3 px-4 font-mono">{{ v.heartRate }} bpm</td>
                <td hlmTableCell class="py-3 px-4 font-mono">{{ v.temperature }} °C</td>
                <td hlmTableCell class="py-3 px-4 font-mono">{{ v.oxygenSaturation }} %</td>
                <td hlmTableCell class="py-3 px-4 font-mono">{{ v.bloodGlucose ? v.bloodGlucose + ' mg/dL' : 'N/A' }}</td>
                <td hlmTableCell class="py-3 px-4 font-mono font-semibold">{{ v.bmi || 'N/A' }}</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ v.recordedBy?.fullName || 'Nurse' }}</td>
              </tr>
              <tr *ngIf="vitals().length === 0" hlmTableRow>
                <td colspan="8" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No vitals recorded for this patient.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Log Vitals Modal -->
      <div *ngIf="showModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg space-y-5">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideActivity" size="16" class="text-blue-500" />
              Log Bedside Physiological Vitals
            </h3>
            <button hlmBtn variant="ghost" size="sm" (click)="showModal.set(false)" class="size-7 p-0">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label class="font-medium text-foreground block mb-1">Blood Pressure (mmHg)</label>
              <input type="text" [(ngModel)]="newVitals.bloodPressure" placeholder="120/80" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Heart Rate (bpm)</label>
              <input type="number" [(ngModel)]="newVitals.heartRate" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">SpO2 (%)</label>
              <input type="number" [(ngModel)]="newVitals.oxygenSaturation" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Temperature (°C)</label>
              <input type="number" step="0.1" [(ngModel)]="newVitals.temperature" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Blood Glucose (mg/dL)</label>
              <input type="number" [(ngModel)]="newVitals.bloodGlucose" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Respiratory Rate (bpm)</label>
              <input type="number" [(ngModel)]="newVitals.respiratoryRate" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Height (cm)</label>
              <input type="number" [(ngModel)]="newVitals.heightCm" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Weight (kg)</label>
              <input type="number" [(ngModel)]="newVitals.weightKg" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="showModal.set(false)">Cancel</button>
            <button hlmBtn variant="default" size="sm" [disabled]="saving()" (click)="saveVitals()" class="bg-blue-600 text-white">
              <ng-icon name="lucideSave" size="14" class="mr-1" /> {{ saving() ? 'Saving...' : 'Save Vitals Entry' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NurseVitalsComponent implements OnInit {
  vitals = signal<Vitals[]>([]);
  saving = signal(false);
  showModal = signal(false);

  newVitals = {
    bloodPressure: '120/80',
    heartRate: 74,
    temperature: 36.8,
    oxygenSaturation: 98,
    bloodGlucose: 115,
    respiratoryRate: 16,
    heightCm: 170,
    weightKg: 70,
  };

  constructor(
    private apiService: ApiService,
    public patientContext: PatientContextService,
  ) {
    effect(() => {
      const active = this.patientContext.activePatient();
      if (active && active.id) {
        this.loadVitals(active.id);
      }
    });
  }

  activePatient() {
    return this.patientContext.activePatient();
  }

  openModal(): void {
    this.showModal.set(true);
  }

  ngOnInit(): void {
    const active = this.patientContext.activePatient();
    if (active && active.id) {
      this.loadVitals(active.id);
    }
  }

  loadVitals(patientId: number): void {
    this.apiService.getVitalsByPatient(patientId).subscribe((res) => this.vitals.set(res));
  }

  saveVitals(): void {
    const active = this.patientContext.activePatient();
    if (!active || !active.id || this.saving()) return;

    this.saving.set(true);
    this.apiService
      .recordVitals({
        patient: { id: Number(active.id) } as Patient,
        bloodPressure: this.newVitals.bloodPressure,
        heartRate: Number(this.newVitals.heartRate),
        temperature: Number(this.newVitals.temperature),
        oxygenSaturation: Number(this.newVitals.oxygenSaturation),
        bloodGlucose: Number(this.newVitals.bloodGlucose),
        respiratoryRate: Number(this.newVitals.respiratoryRate),
        heightCm: Number(this.newVitals.heightCm),
        weightKg: Number(this.newVitals.weightKg),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.showModal.set(false);
          if (active.id) this.loadVitals(active.id);
        },
        error: () => this.saving.set(false),
      });
  }
}
