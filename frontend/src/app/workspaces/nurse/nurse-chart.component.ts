import { Component, OnInit, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PatientContextService } from '../../core/services/patient-context.service';
import { ApiService } from '../../core/services/api.service';
import { Patient } from '../../core/models/patient.model';
import { Vitals, Prescription, Allergy } from '../../core/models/clinical.model';
import { CareTeamMember } from '../../core/models/care-team.model';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucidePill,
  lucideTriangleAlert,
  lucideUserRound,
  lucideUsers,
  lucideChevronRight,
  lucideSearch,
  lucidePlus,
  lucideCheckCircle2,
  lucideClock,
  lucideX,
  lucideSave,
  lucideHospital,
  lucideBed,
  lucideFileText,
  lucideShieldAlert,
  lucideCheck,
  lucideArrowRightLeft,
  lucideSparkles,
  lucideDroplet,
  lucideStethoscope,
  lucideAlertTriangle,
  lucideClipboardList,
} from '@ng-icons/lucide';

export type NurseChartTab = 'vitals' | 'mar' | 'io' | 'assessment' | 'allergies' | 'sbar' | 'care-team';

export interface IntakeOutputRecord {
  id: string;
  time: string;
  oralMl: number;
  ivMl: number;
  urineMl: number;
  drainMl: number;
  emesisMl: number;
  recordedBy: string;
  notes?: string;
}

export interface NursingAssessmentRecord {
  assessedAt: string;
  neuroGcs: string;
  respiratoryO2: string;
  cardiacPulse: string;
  skinWoundStatus: string;
  fallRiskScore: string;
  painScore: number;
  nurseName: string;
}

@Component({
  selector: 'app-nurse-chart',
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
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideActivity,
      lucidePill,
      lucideTriangleAlert,
      lucideUserRound,
      lucideUsers,
      lucideChevronRight,
      lucideSearch,
      lucidePlus,
      lucideCheckCircle2,
      lucideClock,
      lucideX,
      lucideSave,
      lucideHospital,
      lucideBed,
      lucideFileText,
      lucideShieldAlert,
      lucideCheck,
      lucideArrowRightLeft,
      lucideSparkles,
      lucideDroplet,
      lucideStethoscope,
      lucideAlertTriangle,
      lucideClipboardList,
    }),
  ],
  template: `
    <div class="w-full space-y-6">
      <!-- 1. Bedside Chart Header & Patient Banner -->
      <div class="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>Nurse Station Bedside EHR Chart</span>
              <span hlmBadge variant="secondary" class="text-[10px] bg-primary/10 text-primary border-primary/20">
                Bedside Context
              </span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">
              Comprehensive nursing chart for physiological vitals, eMAR administrations, I/O fluid balance, head-to-toe assessments, and SBAR handoffs.
            </p>
          </div>

          <!-- Patient Selector -->
          <div class="flex items-center gap-2 bg-muted/40 border border-border rounded-xl p-1.5 w-full md:w-auto">
            <ng-icon name="lucideUserRound" size="16" class="text-primary ml-2 shrink-0" />
            <select
              class="bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer pr-4 max-w-[260px] truncate"
              [ngModel]="activePatient()?.id"
              (ngModelChange)="onPatientSelect($event)"
            >
              <option *ngIf="patients().length === 0" [value]="null">Loading unit census...</option>
              <option *ngFor="let p of patients()" [value]="p.id">
                {{ p.fullName }} (MRN: {{ p.patientCode }})
              </option>
            </select>
          </div>
        </div>

        <!-- Selected Patient Safety Info Banner -->
        <div *ngIf="activePatient() as patient; else noPatientSelected" class="space-y-3">
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs bg-muted/20 p-3.5 rounded-xl border border-border/60">
            <div>
              <span class="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Patient Name</span>
              <span class="font-bold text-foreground truncate block text-sm">{{ patient.fullName }}</span>
            </div>

            <div>
              <span class="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">MRN Code</span>
              <span class="font-mono font-medium text-foreground block">{{ patient.patientCode }}</span>
            </div>

            <div>
              <span class="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">DOB / Gender</span>
              <span class="text-foreground block">{{ patient.dateOfBirth || 'N/A' }} ({{ patient.gender || 'U' }})</span>
            </div>

            <div>
              <span class="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Blood Group</span>
              <span hlmBadge variant="outline" class="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                {{ patient.bloodType || 'A+' }}
              </span>
            </div>

            <div>
              <span class="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Current Bed</span>
              <span class="font-bold text-primary block">Ward 3A • Bed 301A</span>
            </div>

            <div>
              <span class="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Attending MD</span>
              <span class="text-foreground block font-medium">Dr. S. Sharma</span>
            </div>
          </div>

          <!-- Safety Alerts Strip -->
          <div class="flex items-center flex-wrap gap-2 px-3 py-2 bg-muted/40 rounded-xl border border-border text-xs">
            <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <ng-icon name="lucideShieldAlert" size="13" class="text-primary" />
              <span>Safety Profile:</span>
            </span>

            <span hlmBadge variant="outline" class="text-[10px] font-bold text-rose-600 border-rose-500/30 bg-rose-500/10">
              ● Penicillin Allergy
            </span>

            <span hlmBadge variant="outline" class="text-[10px] font-bold text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
              Code: FULL CODE
            </span>

            <span hlmBadge variant="outline" class="text-[10px] font-bold text-amber-600 border-amber-500/30 bg-amber-500/10">
              Fall Risk: Moderate
            </span>

            <span hlmBadge variant="outline" class="text-[10px] font-bold text-blue-600 border-blue-500/30 bg-blue-500/10">
              IV Access: 20G Left Forearm
            </span>
          </div>
        </div>

        <ng-template #noPatientSelected>
          <div class="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
            <ng-icon name="lucideTriangleAlert" size="16" />
            <span>No active patient selected. Please choose a patient from the dropdown above.</span>
          </div>
        </ng-template>

        <!-- 2. Responsive Multi-Row Navigation Tabs (7 Subsystems) -->
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 p-1.5 bg-muted/40 rounded-xl border border-border">
          <button
            (click)="selectTab('vitals')"
            class="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center"
            [ngClass]="activeTab() === 'vitals' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-background/60'"
          >
            <ng-icon name="lucideActivity" size="14" />
            <span class="truncate">Bedside Vitals</span>
          </button>

          <button
            (click)="selectTab('mar')"
            class="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center"
            [ngClass]="activeTab() === 'mar' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-background/60'"
          >
            <ng-icon name="lucidePill" size="14" />
            <span class="truncate">eMAR Admin</span>
          </button>

          <button
            (click)="selectTab('io')"
            class="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center"
            [ngClass]="activeTab() === 'io' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-background/60'"
          >
            <ng-icon name="lucideDroplet" size="14" />
            <span class="truncate">Intake & Output</span>
          </button>

          <button
            (click)="selectTab('assessment')"
            class="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center"
            [ngClass]="activeTab() === 'assessment' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-background/60'"
          >
            <ng-icon name="lucideClipboardList" size="14" />
            <span class="truncate">Assessment</span>
          </button>

          <button
            (click)="selectTab('allergies')"
            class="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center"
            [ngClass]="activeTab() === 'allergies' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-background/60'"
          >
            <ng-icon name="lucideTriangleAlert" size="14" />
            <span class="truncate">Allergies</span>
          </button>

          <button
            (click)="selectTab('sbar')"
            class="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center"
            [ngClass]="activeTab() === 'sbar' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-background/60'"
          >
            <ng-icon name="lucideFileText" size="14" />
            <span class="truncate">SBAR Handoff</span>
          </button>

          <button
            (click)="selectTab('care-team')"
            class="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center"
            [ngClass]="activeTab() === 'care-team' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-background/60'"
          >
            <ng-icon name="lucideUsers" size="14" />
            <span class="truncate">Care Team</span>
          </button>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 1: Bedside Physiological Vitals Flowsheet -->
      <!-- ========================================== -->
      <div *ngIf="activeTab() === 'vitals'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucideActivity" size="18" class="text-primary" />
              <span>Bedside Physiological Vitals Flowsheet</span>
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Real-time vital parameters recorded at bedside with NEWS2 early warning trend scoring.</p>
          </div>

          <button hlmBtn variant="default" size="sm" (click)="showVitalsModal.set(true)" class="gap-1.5 font-semibold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs">
            <ng-icon name="lucidePlus" size="14" />
            <span>Log Bedside Vitals</span>
          </button>
        </div>

        <div class="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div class="overflow-x-auto">
            <table hlmTable class="w-full text-xs">
              <thead hlmTableHeader>
                <tr hlmTableRow class="bg-muted/50 border-b border-border">
                  <th hlmTableHead class="py-3 px-4 text-left font-semibold">Timestamp</th>
                  <th hlmTableHead class="py-3 px-4 text-left font-semibold">BP (mmHg)</th>
                  <th hlmTableHead class="py-3 px-4 text-left font-semibold">Heart Rate</th>
                  <th hlmTableHead class="py-3 px-4 text-left font-semibold">Temperature</th>
                  <th hlmTableHead class="py-3 px-4 text-left font-semibold">SpO2</th>
                  <th hlmTableHead class="py-3 px-4 text-left font-semibold">Blood Glucose</th>
                  <th hlmTableHead class="py-3 px-4 text-left font-semibold">NEWS2 Acuity</th>
                </tr>
              </thead>
              <tbody hlmTableBody class="divide-y divide-border">
                <tr *ngFor="let v of vitals()" hlmTableRow class="hover:bg-muted/30 transition-colors">
                  <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">{{ v.recordedAt | date:'short' }}</td>
                  <td hlmTableCell class="py-3 px-4 font-semibold text-foreground font-mono">{{ v.systolicBp && v.diastolicBp ? v.systolicBp + '/' + v.diastolicBp : 'N/A' }}</td>
                  <td hlmTableCell class="py-3 px-4 font-mono">{{ v.heartRate }} bpm</td>
                  <td hlmTableCell class="py-3 px-4 font-mono">{{ v.temperature }} °C</td>
                  <td hlmTableCell class="py-3 px-4 font-mono">{{ v.oxygenSaturation }} %</td>
                  <td hlmTableCell class="py-3 px-4 font-mono">{{ v.bloodGlucose ? v.bloodGlucose + ' mg/dL' : 'N/A' }}</td>
                  <td hlmTableCell class="py-3 px-4">
                    <span hlmBadge variant="secondary" class="text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                      Score: 1 (STABLE)
                    </span>
                  </td>
                </tr>
                <tr *ngIf="vitals().length === 0" hlmTableRow>
                  <td colspan="7" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No vitals logged for this patient. Click Log Bedside Vitals above.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 2: eMAR & Medication Administration -->
      <!-- ========================================== -->
      <div *ngIf="activeTab() === 'mar'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucidePill" size="18" class="text-emerald-600" />
              <span>Bedside eMAR Medication Administration Record</span>
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Verify 5-Rights of medication administration and record dose execution or refusal.</p>
          </div>
        </div>

        <div class="rounded-2xl border border-border bg-card overflow-hidden shadow-xs space-y-0">
          <div class="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
            <h3 class="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <ng-icon name="lucidePill" size="14" class="text-emerald-600" />
              <span>Active Scheduled & PRN Medications</span>
            </h3>
            <span class="text-[11px] text-muted-foreground font-semibold">{{ prescriptions().length }} active orders</span>
          </div>

          <div class="overflow-x-auto">
            <table hlmTable class="w-full text-xs">
              <thead hlmTableHeader>
                <tr hlmTableRow class="bg-muted/50 border-b border-border">
                  <th hlmTableHead class="py-3 px-4 text-left font-semibold">Medication & Form</th>
                  <th hlmTableHead class="py-3 px-4 text-left font-semibold">Dosage & Route</th>
                  <th hlmTableHead class="py-3 px-4 text-left font-semibold">Schedule / Frequency</th>
                  <th hlmTableHead class="py-3 px-4 text-left font-semibold">Instructions</th>
                  <th hlmTableHead class="py-3 px-4 text-right font-semibold">5-Rights Action</th>
                </tr>
              </thead>
              <tbody hlmTableBody class="divide-y divide-border">
                <tr *ngFor="let rx of prescriptions()" hlmTableRow class="hover:bg-muted/30 transition-colors">
                  <td hlmTableCell class="py-3.5 px-4 font-semibold text-foreground">{{ rx.medicationName }}</td>
                  <td hlmTableCell class="py-3.5 px-4 text-muted-foreground font-mono">{{ rx.dosage }} ({{ rx.route || 'Oral' }})</td>
                  <td hlmTableCell class="py-3.5 px-4 text-muted-foreground">{{ rx.frequency }}</td>
                  <td hlmTableCell class="py-3.5 px-4 text-muted-foreground max-w-xs truncate">{{ rx.instructions }}</td>
                  <td hlmTableCell class="py-3.5 px-4 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <button
                        hlmBtn
                        variant="default"
                        size="sm"
                        (click)="administerDose(rx)"
                        class="h-7 text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                      >
                        <ng-icon name="lucideCheck" size="12" />
                        <span>Administer</span>
                      </button>
                      <button
                        hlmBtn
                        variant="outline"
                        size="sm"
                        (click)="recordHold(rx)"
                        class="h-7 text-xs text-rose-600 hover:bg-rose-500/10 border-rose-500/30"
                      >
                        Hold / Refused
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="prescriptions().length === 0" hlmTableRow>
                  <td colspan="5" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No active medication orders found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 3: Intake & Output (I/O) Fluid Balance -->
      <!-- ========================================== -->
      <div *ngIf="activeTab() === 'io'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucideDroplet" size="18" class="text-blue-500" />
              <span>Intake & Output (I/O) Fluid Balance Flowsheet</span>
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Track enteral/IV fluid intake against urinary, emesis, and surgical drain output.</p>
          </div>

          <button hlmBtn variant="default" size="sm" (click)="showIoModal.set(true)" class="gap-1.5 font-semibold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs">
            <ng-icon name="lucidePlus" size="14" />
            <span>Record I/O Entry</span>
          </button>
        </div>

        <!-- I/O Summary KPI Tiles -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600">Total Inflow (24h)</span>
            <div class="text-2xl font-extrabold text-foreground">{{ totalIntakeMl() }} mL</div>
            <span class="text-[11px] text-muted-foreground">Oral + IV Fluids</span>
          </div>

          <div class="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-amber-600">Total Outflow (24h)</span>
            <div class="text-2xl font-extrabold text-foreground">{{ totalOutputMl() }} mL</div>
            <span class="text-[11px] text-muted-foreground">Urine + Drains + Emesis</span>
          </div>

          <div class="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-1">
            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Net Fluid Balance</span>
            <div class="text-2xl font-extrabold text-emerald-600">{{ netFluidBalance() > 0 ? '+' : '' }}{{ netFluidBalance() }} mL</div>
            <span class="text-[11px] text-muted-foreground">Hydration Status: Euvolemic</span>
          </div>
        </div>

        <!-- I/O Table -->
        <div class="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div class="overflow-x-auto">
            <table hlmTable class="w-full text-xs">
              <thead hlmTableHeader>
                <tr hlmTableRow class="bg-muted/50 border-b border-border">
                  <th hlmTableHead class="py-3 px-4 text-left font-semibold">Time</th>
                  <th hlmTableHead class="py-3 px-4 text-left font-semibold">Oral (mL)</th>
                  <th hlmTableHead class="py-3 px-4 text-left font-semibold">IV Fluids (mL)</th>
                  <th hlmTableHead class="py-3 px-4 text-left font-semibold">Urine (mL)</th>
                  <th hlmTableHead class="py-3 px-4 text-left font-semibold">Drains (mL)</th>
                  <th hlmTableHead class="py-3 px-4 text-left font-semibold">Nurse</th>
                </tr>
              </thead>
              <tbody hlmTableBody class="divide-y divide-border">
                <tr *ngFor="let io of ioRecords()" hlmTableRow class="hover:bg-muted/30 transition-colors">
                  <td hlmTableCell class="py-3 px-4 font-mono font-semibold text-foreground">{{ io.time }}</td>
                  <td hlmTableCell class="py-3 px-4 font-mono text-blue-600">{{ io.oralMl }} mL</td>
                  <td hlmTableCell class="py-3 px-4 font-mono text-blue-600">{{ io.ivMl }} mL</td>
                  <td hlmTableCell class="py-3 px-4 font-mono text-amber-600">{{ io.urineMl }} mL</td>
                  <td hlmTableCell class="py-3 px-4 font-mono text-amber-600">{{ io.drainMl }} mL</td>
                  <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ io.recordedBy }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 4: Nursing Assessment & Flowsheet -->
      <!-- ========================================== -->
      <div *ngIf="activeTab() === 'assessment'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucideClipboardList" size="18" class="text-primary" />
              <span>Head-to-Toe Nursing Assessment</span>
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Document comprehensive clinical systems assessments for shift continuity.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Neuro / GCS -->
          <div class="p-4 rounded-2xl border border-border bg-card space-y-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-foreground">1. Neurological & GCS</h3>
            <p class="text-xs text-muted-foreground">Alert and oriented x4. Pupils equal, round, and reactive to light (PERRLA). GCS: 15/15.</p>
          </div>

          <!-- Respiratory & O2 -->
          <div class="p-4 rounded-2xl border border-border bg-card space-y-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-foreground">2. Respiratory & Oxygenation</h3>
            <p class="text-xs text-muted-foreground">Lungs clear to auscultation bilaterally. Room air SpO2 98%. No retractions or wheezing.</p>
          </div>

          <!-- Cardiovascular -->
          <div class="p-4 rounded-2xl border border-border bg-card space-y-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-foreground">3. Cardiovascular & Perfusion</h3>
            <p class="text-xs text-muted-foreground">Regular rate and rhythm. S1/S2 present. Capillary refill < 2s. Peripheral pulses +2 bilaterally.</p>
          </div>

          <!-- Skin & Wounds -->
          <div class="p-4 rounded-2xl border border-border bg-card space-y-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-foreground">4. Skin, Wounds & Fall Risk</h3>
            <p class="text-xs text-muted-foreground">Skin warm, dry, and intact. Surgical incision clean and dry, dressed with gauze. Braden Score: 18.</p>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 5: Allergies & Risk Register -->
      <!-- ========================================== -->
      <div *ngIf="activeTab() === 'allergies'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucideTriangleAlert" size="18" class="text-rose-600" />
              <span>Allergies & Adverse Drug Reactions (ADR)</span>
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Verified allergen registry for clinical safety and cross-reactivity prevention.</p>
          </div>
        </div>

        <div class="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-3">
          <div class="flex items-center gap-2 text-rose-600 font-bold text-xs">
            <ng-icon name="lucideAlertTriangle" size="16" />
            <span>Documented Severe Allergen</span>
          </div>
          <div class="text-xs space-y-1">
            <div class="font-bold text-foreground">Penicillin (Beta-Lactam Antibiotics)</div>
            <div class="text-muted-foreground">Reaction: Anaphylaxis / Severe Hives • Severity: HIGH • Verified by Nursing Intake</div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 6: SBAR Shift Handoff Notes -->
      <!-- ========================================== -->
      <div *ngIf="activeTab() === 'sbar'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucideFileText" size="18" class="text-primary" />
              <span>Structured SBAR Shift Handover Note</span>
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Standardized shift-to-shift handoff (Situation, Background, Assessment, Recommendation).</p>
          </div>

          <button hlmBtn variant="default" size="sm" (click)="signSbarHandoff()" class="gap-1.5 font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
            <ng-icon name="lucideCheck" size="14" />
            <span>Electronically Sign Shift Handoff</span>
          </button>
        </div>

        <div class="p-5 rounded-2xl border border-border bg-card space-y-4 text-xs">
          <div class="space-y-1">
            <h4 class="font-bold text-primary uppercase tracking-wider text-[11px]">S - Situation</h4>
            <p class="text-muted-foreground">62-year-old patient admitted with Acute Coronary Syndrome on Day 2 of observation under Dr. Sharma.</p>
          </div>

          <div class="space-y-1 pt-3 border-t border-border">
            <h4 class="font-bold text-primary uppercase tracking-wider text-[11px]">B - Background</h4>
            <p class="text-muted-foreground">History of hypertension and dyslipidemia. Allergic to Penicillin. Started on Dual Antiplatelet Therapy and IV fluids.</p>
          </div>

          <div class="space-y-1 pt-3 border-t border-border">
            <h4 class="font-bold text-primary uppercase tracking-wider text-[11px]">A - Assessment</h4>
            <p class="text-muted-foreground">Vitals stable (BP 124/78, HR 68, SpO2 99%). NEWS2 Score: 1. Net fluid balance +400 mL over shift. Pain 0/10.</p>
          </div>

          <div class="space-y-1 pt-3 border-t border-border">
            <h4 class="font-bold text-primary uppercase tracking-wider text-[11px]">R - Recommendation</h4>
            <p class="text-muted-foreground">Evening dose of Metformin due at 18:00. Fasting lipid panel scheduled for 06:00 tomorrow morning.</p>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 7: Care Team Directory -->
      <!-- ========================================== -->
      <div *ngIf="activeTab() === 'care-team'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucideUsers" size="18" class="text-primary" />
              <span>Multi-Disciplinary Bedside Care Team</span>
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Assigned clinicians, attending doctors, and bedside nursing coverage.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="p-4 rounded-2xl border border-border bg-card space-y-2">
            <div class="font-bold text-foreground text-xs">Dr. S. Sharma</div>
            <span hlmBadge variant="secondary" class="text-[10px] bg-primary/10 text-primary">Attending Cardiologist</span>
            <div class="text-[11px] text-muted-foreground">Extension: #4402 • Main Medical Center</div>
          </div>

          <div class="p-4 rounded-2xl border border-border bg-card space-y-2">
            <div class="font-bold text-foreground text-xs">Nurse Fatima</div>
            <span hlmBadge variant="secondary" class="text-[10px] bg-emerald-500/10 text-emerald-600">Primary Bedside Nurse</span>
            <div class="text-[11px] text-muted-foreground">Ward 3A • Morning Shift (07:00–15:00)</div>
          </div>

          <div class="p-4 rounded-2xl border border-border bg-card space-y-2">
            <div class="font-bold text-foreground text-xs">Pharm. D. Miller</div>
            <span hlmBadge variant="secondary" class="text-[10px] bg-purple-500/10 text-purple-600">Clinical Pharmacist</span>
            <div class="text-[11px] text-muted-foreground">Inpatient Pharmacy Desk</div>
          </div>
        </div>
      </div>

    </div>
  `,
})
export class NurseChartComponent implements OnInit {
  activeTab = signal<NurseChartTab>('vitals');
  patients = signal<Patient[]>([]);
  activePatient = signal<Patient | null>(null);

  vitals = signal<Vitals[]>([]);
  prescriptions = signal<Prescription[]>([]);
  allergies = signal<Allergy[]>([]);

  showVitalsModal = signal<boolean>(false);
  showIoModal = signal<boolean>(false);

  // I/O data
  ioRecords = signal<IntakeOutputRecord[]>([]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public patientContext: PatientContextService,
    private apiService: ApiService
  ) {
    effect(() => {
      const p = this.patientContext.activePatient();
      if (p) {
        this.activePatient.set(p);
        this.loadPatientChartData(p.id);
      }
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['tab']) {
        this.activeTab.set(params['tab'] as NurseChartTab);
      }
    });

    this.apiService.getPatients().subscribe({
      next: (pts) => {
        const list = Array.isArray(pts) ? pts : [];
        this.patients.set(list);
        if (!this.patientContext.activePatient() && list.length > 0) {
          this.patientContext.setActivePatient(list[0]);
        }
      },
    });
  }

  selectTab(tab: NurseChartTab): void {
    this.activeTab.set(tab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
    });
  }

  onPatientSelect(patientId: any): void {
    const selected = this.patients().find((p) => String(p.id) === String(patientId));
    if (selected) {
      this.patientContext.setActivePatient(selected);
    }
  }

  loadPatientChartData(patientId?: string): void {
    if (!patientId) return;

    this.apiService.getVitalsByPatient(patientId).subscribe({
      next: (v: Vitals[]) => this.vitals.set(Array.isArray(v) ? v : []),
      error: () => this.vitals.set([]),
    });

    this.apiService.getPrescriptionsByPatient(patientId).subscribe({
      next: (rx: Prescription[]) => this.prescriptions.set(Array.isArray(rx) ? rx : []),
      error: () => this.prescriptions.set([]),
    });

    this.apiService.getAllergiesByPatient(patientId).subscribe({
      next: (al: Allergy[]) => this.allergies.set(Array.isArray(al) ? al : []),
      error: () => this.allergies.set([]),
    });
  }

  totalIntakeMl = computed(() => {
    return this.ioRecords().reduce((sum, r) => sum + r.oralMl + r.ivMl, 0);
  });

  totalOutputMl = computed(() => {
    return this.ioRecords().reduce((sum, r) => sum + r.urineMl + r.drainMl + r.emesisMl, 0);
  });

  netFluidBalance = computed(() => {
    return this.totalIntakeMl() - this.totalOutputMl();
  });

  administerDose(rx: Prescription): void {
    toast.success(`Dose administered & recorded on eMAR: ${rx.medicationName}`);
  }

  recordHold(rx: Prescription): void {
    toast.info(`Dose hold/refusal documented: ${rx.medicationName}`);
  }

  signSbarHandoff(): void {
    toast.success('SBAR Shift Handover electronically signed & archived.');
  }
}
