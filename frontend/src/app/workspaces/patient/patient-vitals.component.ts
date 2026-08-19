import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Vitals } from '../../core/models/clinical.model';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucidePlus,
  lucideHeart,
  lucideThermometer,
  lucideScale,
  lucideTrendingUp,
  lucideClock,
  lucideDroplet,
  lucideX,
  lucideSave,
  lucideCheckCircle,
  lucideAlertTriangle,
  lucideInfo,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-patient-vitals',
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
  providers: [
    provideIcons({
      lucideActivity,
      lucidePlus,
      lucideHeart,
      lucideThermometer,
      lucideScale,
      lucideTrendingUp,
      lucideClock,
      lucideDroplet,
      lucideX,
      lucideSave,
      lucideCheckCircle,
      lucideAlertTriangle,
      lucideInfo,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Top Banner Header -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border"
      >
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ng-icon name="lucideActivity" size="22" class="text-blue-500" />
            My Physiological Vitals & Health Indicators
            <span hlmBadge variant="outline" class="text-[10px]">Patient Portal</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Monitor real-time physiological vitals, auto-calculated BMI, blood pressure, heart rate,
            blood sugar, and SpO2 trends.
          </p>
        </div>

        <button
          hlmBtn
          variant="default"
          size="sm"
          (click)="openVitalsModal()"
          class="gap-1.5 font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
        >
          <ng-icon name="lucidePlus" size="15" /> Log New Vitals
        </button>
      </div>

      <!-- Latest Vitals Key Metric Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
        <!-- Card 1: Blood Pressure -->
        <div class="rounded-xl border border-border bg-card p-4 shadow-xs relative overflow-hidden">
          <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >Blood Pressure</span
            >
            <div class="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
              <ng-icon name="lucideHeart" size="16" />
            </div>
          </div>
          <div class="text-xl font-bold text-foreground font-mono">
            {{
              latestVitals()?.systolicBp && latestVitals()?.diastolicBp
                ? latestVitals()!.systolicBp + '/' + latestVitals()!.diastolicBp
                : '120/80'
            }}
            <span class="text-xs font-normal text-muted-foreground">mmHg</span>
          </div>
          <div class="mt-2 flex items-center gap-1.5">
            <span
              [class]="getBpBadgeClass(latestVitals())"
              class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            >
              {{ getBpCategory(latestVitals()) }}
            </span>
          </div>
        </div>

        <!-- Card 2: Heart Rate -->
        <div class="rounded-xl border border-border bg-card p-4 shadow-xs relative overflow-hidden">
          <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >Heart Rate</span
            >
            <div class="p-1.5 rounded-md bg-rose-500/10 text-rose-500">
              <ng-icon name="lucideActivity" size="16" />
            </div>
          </div>
          <div class="text-xl font-bold text-foreground font-mono">
            {{ latestVitals()?.heartRate || 72 }}
            <span class="text-xs font-normal text-muted-foreground">bpm</span>
          </div>
          <div class="mt-2 flex items-center gap-1.5">
            <span
              [class]="getHeartRateBadgeClass(latestVitals()?.heartRate)"
              class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            >
              {{ getHeartRateCategory(latestVitals()?.heartRate) }}
            </span>
          </div>
        </div>

        <!-- Card 3: Weight, Height & BMI (Auto-Calculated) -->
        <div class="rounded-xl border border-border bg-card p-4 shadow-xs relative overflow-hidden">
          <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >Body Mass Index (BMI)</span
            >
            <div class="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500">
              <ng-icon name="lucideScale" size="16" />
            </div>
          </div>
          <div class="text-xl font-bold text-foreground font-mono">
            {{ latestBmi() || '22.9' }}
            <span class="text-xs font-normal text-muted-foreground">kg/m²</span>
          </div>
          <div class="mt-2 flex items-center gap-1.5">
            <span
              [class]="getBmiBadgeClass(latestBmi())"
              class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            >
              {{ getBmiCategory(latestBmi()) }}
            </span>
            <span
              class="text-[11px] text-muted-foreground font-mono"
              *ngIf="latestVitals()?.weightKg"
            >
              ({{ latestVitals()?.weightKg }} kg / {{ latestVitals()?.heightCm }} cm)
            </span>
          </div>
        </div>

        <!-- Card 4: Temperature -->
        <div class="rounded-xl border border-border bg-card p-4 shadow-xs relative overflow-hidden">
          <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >Temperature</span
            >
            <div class="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
              <ng-icon name="lucideThermometer" size="16" />
            </div>
          </div>
          <div class="text-xl font-bold text-foreground font-mono">
            {{ latestVitals()?.temperature || 36.8 }}
            <span class="text-xs font-normal text-muted-foreground">°C</span>
          </div>
          <div class="mt-2 flex items-center gap-1.5">
            <span
              [class]="getTempBadgeClass(latestVitals()?.temperature)"
              class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            >
              {{ getTempCategory(latestVitals()?.temperature) }}
            </span>
          </div>
        </div>

        <!-- Card 5: Blood Sugar / Glucose -->
        <div class="rounded-xl border border-border bg-card p-4 shadow-xs relative overflow-hidden">
          <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >Blood Sugar</span
            >
            <div class="p-1.5 rounded-md bg-purple-500/10 text-purple-500">
              <ng-icon name="lucideDroplet" size="16" />
            </div>
          </div>
          <div class="text-xl font-bold text-foreground font-mono">
            {{ latestVitals()?.bloodGlucose ? latestVitals()?.bloodGlucose : '95' }}
            <span class="text-xs font-normal text-muted-foreground">mg/dL</span>
          </div>
          <div class="mt-2 flex items-center gap-1.5">
            <span
              [class]="getGlucoseBadgeClass(latestVitals()?.bloodGlucose)"
              class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            >
              {{ getGlucoseCategory(latestVitals()?.bloodGlucose) }}
            </span>
          </div>
        </div>

        <!-- Card 6: SpO2 Oxygen Saturation -->
        <div class="rounded-xl border border-border bg-card p-4 shadow-xs relative overflow-hidden">
          <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >SpO2 Saturation</span
            >
            <div class="p-1.5 rounded-md bg-cyan-500/10 text-cyan-500">
              <ng-icon name="lucideTrendingUp" size="16" />
            </div>
          </div>
          <div class="text-xl font-bold text-foreground font-mono">
            {{ latestVitals()?.oxygenSaturation || 98 }}
            <span class="text-xs font-normal text-muted-foreground">%</span>
          </div>
          <div class="mt-2 flex items-center gap-1.5">
            <span
              [class]="getSpo2BadgeClass(latestVitals()?.oxygenSaturation)"
              class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            >
              {{ getSpo2Category(latestVitals()?.oxygenSaturation) }}
            </span>
          </div>
        </div>

        <!-- Card 7: Vital Taken Time -->
        <div
          class="rounded-xl border border-border bg-card p-4 shadow-xs relative overflow-hidden col-span-2 sm:col-span-2"
        >
          <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >Vital Taken Time</span
            >
            <div class="p-1.5 rounded-md bg-indigo-500/10 text-indigo-500">
              <ng-icon name="lucideClock" size="16" />
            </div>
          </div>
          <div class="text-sm font-bold text-foreground font-mono">
            {{
              latestVitals()?.recordedAt
                ? (latestVitals()?.recordedAt | date: 'medium')
                : (now | date: 'medium')
            }}
          </div>
          <p class="text-[11px] text-muted-foreground mt-1">
            Recorded by {{ latestVitals()?.recordedByName || 'Self Intake / Nurse Triage' }}
          </p>
        </div>
      </div>

      <!-- Vitals History Table -->
      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
          <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
            <ng-icon name="lucideActivity" size="16" class="text-blue-500" />
            Longitudinal Vitals Flowsheet & History
          </h2>
          <span class="text-[11px] font-medium text-muted-foreground"
            >{{ vitals().length }} records log</span
          >
        </div>

        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Vital Taken Time</th>
                <th hlmTableHead class="py-3 px-4 text-left">Blood Pressure</th>
                <th hlmTableHead class="py-3 px-4 text-left">Heart Rate</th>
                <th hlmTableHead class="py-3 px-4 text-left">Temperature</th>
                <th hlmTableHead class="py-3 px-4 text-left">SpO2</th>
                <th hlmTableHead class="py-3 px-4 text-left">Blood Sugar</th>
                <th hlmTableHead class="py-3 px-4 text-left">Weight / Height</th>
                <th hlmTableHead class="py-3 px-4 text-left">BMI (Auto)</th>
                <th hlmTableHead class="py-3 px-4 text-left">Recorded By</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr
                *ngFor="let v of vitals()"
                hlmTableRow
                class="hover:bg-muted/40 transition-colors"
              >
                <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">
                  {{ v.recordedAt | date: 'medium' }}
                </td>
                <td hlmTableCell class="py-3 px-4 font-mono font-semibold text-foreground">
                  {{ v.systolicBp && v.diastolicBp ? v.systolicBp + '/' + v.diastolicBp : 'N/A' }}
                  <span class="text-[10px] ml-1 font-normal" [class]="getBpBadgeClass(v)">
                    {{ getBpCategory(v) }}
                  </span>
                </td>
                <td hlmTableCell class="py-3 px-4 font-mono">
                  {{ v.heartRate ? v.heartRate + ' bpm' : 'N/A' }}
                </td>
                <td hlmTableCell class="py-3 px-4 font-mono">
                  {{ v.temperature ? v.temperature + ' °C' : 'N/A' }}
                </td>
                <td hlmTableCell class="py-3 px-4 font-mono">
                  {{ v.oxygenSaturation ? v.oxygenSaturation + ' %' : 'N/A' }}
                </td>
                <td hlmTableCell class="py-3 px-4 font-mono">
                  {{ v.bloodGlucose ? v.bloodGlucose + ' mg/dL' : 'N/A' }}
                </td>
                <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">
                  {{ v.weightKg ? v.weightKg + ' kg' : '-' }} /
                  {{ v.heightCm ? v.heightCm + ' cm' : '-' }}
                </td>
                <td hlmTableCell class="py-3 px-4 font-mono font-semibold">
                  {{ v.bmi || calculateBmiVal(v.weightKg, v.heightCm) || 'N/A' }}
                  <span
                    *ngIf="v.bmi || calculateBmiVal(v.weightKg, v.heightCm)"
                    class="text-[10px] ml-1 font-normal"
                    [class]="getBmiBadgeClass(v.bmi || calculateBmiVal(v.weightKg, v.heightCm))"
                  >
                    {{ getBmiCategory(v.bmi || calculateBmiVal(v.weightKg, v.heightCm)) }}
                  </span>
                </td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">
                  {{ v.recordedByName || v.recordedBy?.fullName || 'Clinician' }}
                </td>
              </tr>

              <tr *ngIf="vitals().length === 0" hlmTableRow>
                <td
                  colspan="9"
                  hlmTableCell
                  class="py-12 text-center text-muted-foreground text-xs"
                >
                  No vital signs recorded yet. Click "Log New Vitals" above to add an entry.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Log Vitals Modal -->
      <div
        *ngIf="showModal()"
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div
          class="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200"
        >
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-base font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideActivity" size="18" class="text-blue-500" />
              Log Bedside Patient Vitals
            </h3>
            <button
              (click)="showModal.set(false)"
              class="text-muted-foreground hover:text-foreground"
            >
              <ng-icon name="lucideX" size="18" />
            </button>
          </div>

          <form (ngSubmit)="submitVitals()" class="space-y-4 text-xs">
            <!-- Vital Taken Time Picker -->
            <div class="p-3 bg-muted/30 rounded-lg border border-border space-y-1">
              <label class="font-semibold text-foreground block">Vital Taken Time *</label>
              <input
                type="datetime-local"
                [(ngModel)]="formRecordedAt"
                name="formRecordedAt"
                required
                class="w-full h-9 p-2 rounded-md border border-input bg-background font-mono text-xs"
              />
              <p class="text-[10px] text-muted-foreground">
                Specify exact timestamp when measurements were taken.
              </p>
            </div>

            <!-- Systolic & Diastolic BP -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="font-semibold text-foreground block mb-1">Systolic BP (mmHg)</label>
                <input
                  type="number"
                  [(ngModel)]="formSystolic"
                  name="formSystolic"
                  placeholder="e.g. 120"
                  min="30"
                  max="300"
                  class="w-full h-9 p-2 rounded-md border border-input bg-background font-mono text-xs"
                />
              </div>

              <div>
                <label class="font-semibold text-foreground block mb-1">Diastolic BP (mmHg)</label>
                <input
                  type="number"
                  [(ngModel)]="formDiastolic"
                  name="formDiastolic"
                  placeholder="e.g. 80"
                  min="20"
                  max="200"
                  class="w-full h-9 p-2 rounded-md border border-input bg-background font-mono text-xs"
                />
              </div>
            </div>

            <!-- Heart Rate, Temperature, SpO2, Blood Sugar -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label class="font-semibold text-foreground block mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  [(ngModel)]="formHeartRate"
                  name="formHeartRate"
                  placeholder="72"
                  min="20"
                  max="300"
                  class="w-full h-9 p-2 rounded-md border border-input bg-background font-mono text-xs"
                />
              </div>

              <div>
                <label class="font-semibold text-foreground block mb-1">Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  [(ngModel)]="formTemperature"
                  name="formTemperature"
                  placeholder="36.8"
                  min="25"
                  max="45"
                  class="w-full h-9 p-2 rounded-md border border-input bg-background font-mono text-xs"
                />
              </div>

              <div>
                <label class="font-semibold text-foreground block mb-1">SpO2 (%)</label>
                <input
                  type="number"
                  [(ngModel)]="formSpo2"
                  name="formSpo2"
                  placeholder="98"
                  min="0"
                  max="100"
                  class="w-full h-9 p-2 rounded-md border border-input bg-background font-mono text-xs"
                />
              </div>

              <div>
                <label class="font-semibold text-foreground block mb-1">Blood Sugar (mg/dL)</label>
                <input
                  type="number"
                  [(ngModel)]="formBloodGlucose"
                  name="formBloodGlucose"
                  placeholder="95"
                  min="10"
                  max="1000"
                  class="w-full h-9 p-2 rounded-md border border-input bg-background font-mono text-xs"
                />
              </div>
            </div>

            <!-- Weight, Height & Real-Time Auto-Calculated BMI Preview -->
            <div class="grid grid-cols-2 gap-3 pt-2 border-t border-border">
              <div>
                <label class="font-semibold text-foreground block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  [(ngModel)]="formWeight"
                  name="formWeight"
                  placeholder="e.g. 70.0"
                  min="0.1"
                  max="500"
                  class="w-full h-9 p-2 rounded-md border border-input bg-background font-mono text-xs"
                />
              </div>

              <div>
                <label class="font-semibold text-foreground block mb-1">Height (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  [(ngModel)]="formHeight"
                  name="formHeight"
                  placeholder="e.g. 175"
                  min="10"
                  max="300"
                  class="w-full h-9 p-2 rounded-md border border-input bg-background font-mono text-xs"
                />
              </div>
            </div>

            <!-- Live BMI Auto-Calculation Card -->
            <div
              class="p-3 rounded-lg border border-border bg-emerald-500/5 flex justify-between items-center"
            >
              <div>
                <span class="font-bold text-foreground block">Auto-Calculated BMI</span>
                <span class="text-[11px] text-muted-foreground"
                  >Computed automatically from weight & height</span
                >
              </div>
              <div class="text-right">
                <div class="text-lg font-bold font-mono text-foreground">
                  {{ computedFormBmi() ? computedFormBmi() : '--' }}
                  <span class="text-xs text-muted-foreground">kg/m²</span>
                </div>
                <span
                  [class]="getBmiBadgeClass(computedFormBmi())"
                  class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                >
                  {{ getBmiCategory(computedFormBmi()) }}
                </span>
              </div>
            </div>

            <!-- Modal Action Buttons -->
            <div class="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                hlmBtn
                type="button"
                variant="outline"
                size="sm"
                (click)="showModal.set(false)"
              >
                Cancel
              </button>
              <button
                hlmBtn
                type="submit"
                variant="default"
                size="sm"
                [disabled]="isSubmitting()"
                class="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5"
              >
                <ng-icon name="lucideSave" size="14" />
                {{ isSubmitting() ? 'Saving...' : 'Save Vitals Record' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class PatientVitalsComponent implements OnInit {
  vitals = signal<Vitals[]>([]);
  latestVitals = computed(() => (this.vitals().length > 0 ? this.vitals()[0] : null));
  latestBmi = computed(() => {
    const v = this.latestVitals();
    if (!v) return null;
    if (v.bmi) return v.bmi;
    return this.calculateBmiVal(v.weightKg, v.heightCm);
  });

  patientId: string | null = null;
  now = new Date();

  // Modal State & Form inputs
  showModal = signal(false);
  isSubmitting = signal(false);

  formRecordedAt: string = '';
  formSystolic: number | null = null;
  formDiastolic: number | null = null;
  formHeartRate: number | null = null;
  formTemperature: number | null = null;
  formSpo2: number | null = null;
  formBloodGlucose: number | null = null;
  formWeight: number | null = null;
  formHeight: number | null = null;

  computedFormBmi = computed(() => {
    return this.calculateBmiVal(this.formWeight, this.formHeight);
  });

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    public patientContext: PatientContextService,
  ) {}

  ngOnInit(): void {
    this.loadVitals();
  }

  loadVitals(): void {
    this.apiService.getMyPatientProfile().subscribe({
      next: (p) => {
        if (p?.id) {
          this.patientId = p.id;
          this.apiService
            .getVitalsByPatient(p.id)
            .subscribe((v) => this.vitals.set(Array.isArray(v) ? v : []));
        } else {
          console.warn('Patient profile loaded but no ID found.');
          toast.error('Could not verify patient profile identity.');
        }
      },
      error: (err) => {
        console.error('Failed to load patient vitals via API', err);
        toast.error('Failed to load vitals: ' + (err.error?.message || 'Unknown network error'));
      },
    });
  }

  openVitalsModal(): void {
    const localNow = new Date();
    localNow.setMinutes(localNow.getMinutes() - localNow.getTimezoneOffset());
    this.formRecordedAt = localNow.toISOString().slice(0, 16);

    this.formSystolic = null;
    this.formDiastolic = null;
    this.formHeartRate = null;
    this.formTemperature = null;
    this.formSpo2 = null;
    this.formBloodGlucose = null;
    this.formWeight = null;
    this.formHeight = null;

    this.showModal.set(true);
  }

  submitVitals(): void {
    if (!this.patientId || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    const payload: Partial<Vitals> = {
      patient: { id: this.patientId } as any,
      patientId: this.patientId,
      systolicBp: this.formSystolic || undefined,
      diastolicBp: this.formDiastolic || undefined,
      heartRate: this.formHeartRate || undefined,
      temperature: this.formTemperature || undefined,
      oxygenSaturation: this.formSpo2 || undefined,
      bloodGlucose: this.formBloodGlucose || undefined,
      weightKg: this.formWeight || undefined,
      heightCm: this.formHeight || undefined,
      bmi: this.computedFormBmi() || undefined,
      recordedAt: this.formRecordedAt ? new Date(this.formRecordedAt).toISOString() : undefined,
    };

    this.apiService.recordPatientVitals(this.patientId, payload).subscribe({
      next: (saved) => {
        this.isSubmitting.set(false);
        this.showModal.set(false);
        if (saved && saved.systolicBp) {
          this.vitals.update((list) => [saved, ...list]);
        } else {
          this.loadVitals();
        }
      },
      error: (err) => {
        console.error('Failed to save vitals', err);
        this.isSubmitting.set(false);
      },
    });
  }

  calculateBmiVal(
    weightKg: number | null | undefined,
    heightCm: number | null | undefined,
  ): number | null {
    if (weightKg && heightCm && heightCm > 0) {
      const heightM = heightCm / 100.0;
      const bmiVal = weightKg / (heightM * heightM);
      return Math.round(bmiVal * 10) / 10;
    }
    return null;
  }

  getBpCategory(v: Vitals | null | undefined): string {
    if (!v) return 'Normal';
    const sys = v.systolicBp;
    const dia = v.diastolicBp;
    if (!sys || !dia) return 'Normal';
    if (sys < 120 && dia < 80) return 'Normal';
    if (sys >= 120 && sys <= 129 && dia < 80) return 'Elevated';
    if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) return 'Stage 1 HTN';
    if (sys >= 140 || dia >= 90) return 'Stage 2 HTN';
    return 'Normal';
  }

  getBpBadgeClass(v: Vitals | null | undefined): string {
    const cat = this.getBpCategory(v);
    if (cat === 'Normal') return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
    if (cat === 'Elevated') return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
    return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
  }

  getHeartRateCategory(hr: number | null | undefined): string {
    if (!hr) return 'Normal';
    if (hr < 60) return 'Bradycardia';
    if (hr > 100) return 'Tachycardia';
    return 'Normal Pulse';
  }

  getHeartRateBadgeClass(hr: number | null | undefined): string {
    const cat = this.getHeartRateCategory(hr);
    if (cat === 'Normal Pulse')
      return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
    return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
  }

  getBmiCategory(bmi: number | null | undefined): string {
    if (!bmi) return 'Normal weight';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  getBmiBadgeClass(bmi: number | null | undefined): string {
    const cat = this.getBmiCategory(bmi);
    if (cat === 'Normal weight')
      return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
    if (cat === 'Overweight' || cat === 'Underweight')
      return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
    return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
  }

  getTempCategory(temp: number | null | undefined): string {
    if (!temp) return 'Normal';
    if (temp < 35.5) return 'Low Temp';
    if (temp > 37.5) return 'Fever / High';
    return 'Normal';
  }

  getTempBadgeClass(temp: number | null | undefined): string {
    const cat = this.getTempCategory(temp);
    if (cat === 'Normal') return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
    return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
  }

  getGlucoseCategory(g: number | null | undefined): string {
    if (!g) return 'Normal';
    if (g < 70) return 'Hypoglycemia';
    if (g > 140) return 'Elevated';
    return 'Normal';
  }

  getGlucoseBadgeClass(g: number | null | undefined): string {
    const cat = this.getGlucoseCategory(g);
    if (cat === 'Normal') return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
    return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
  }

  getSpo2Category(spo2: number | null | undefined): string {
    if (!spo2) return 'Normal';
    if (spo2 < 95) return 'Low SpO2 Alert';
    return 'Normal';
  }

  getSpo2BadgeClass(spo2: number | null | undefined): string {
    const cat = this.getSpo2Category(spo2);
    if (cat === 'Normal') return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
    return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
  }
}
