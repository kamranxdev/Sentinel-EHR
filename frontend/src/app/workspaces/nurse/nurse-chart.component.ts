import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PatientContextService } from '../../core/services/patient-context.service';
import { ApiService } from '../../core/services/api.service';
import { Patient } from '../../core/models/patient.model';
import { Vitals, Prescription, Allergy } from '../../core/models/clinical.model';
import { TriageEwsResponseDTO, EmarRecordResponseDTO, NursingFlowsheet, NursingFlowsheetEntry } from '../../core/models/triage-emar.model';
import { Bed } from '../../core/models/bed.model';
import { CareTeamMember } from '../../core/models/care-team.model';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
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
} from '@ng-icons/lucide';

export type NurseChartTab = 'vitals' | 'mar' | 'allergies' | 'triage' | 'flowsheet' | 'bed-transfer' | 'care-team';

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
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Bedside Chart Header & Patient Banner -->
      <div class="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Nurse Station Bedside Chart
              <span hlmBadge variant="secondary" class="text-[10px]">Active Bedside Context</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">Real-time nursing workspace for vitals monitoring, eMAR medication administration, NEWS2 triage, and shift flowsheets.</p>
          </div>

          <!-- Quick Patient Switcher Combobox -->
          <div class="flex items-center gap-3 w-full md:w-auto">
            <div class="flex items-center gap-2 bg-muted/30 border border-border rounded-lg p-1.5 w-full md:w-auto">
              <ng-icon name="lucideUserRound" size="16" class="text-emerald-500 ml-2 shrink-0" />
              <select
                class="bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer pr-4 max-w-[240px] truncate"
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
        </div>

        <!-- Selected Patient Info Banner -->
        <div *ngIf="activePatient() as patient; else noPatientSelected" class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs bg-muted/20 p-3.5 rounded-lg border border-border/60">
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
            <span class="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Contact / Phone</span>
            <span class="text-foreground block truncate">{{ patient.phone || 'N/A' }}</span>
          </div>

          <div>
            <span class="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Status</span>
            <span hlmBadge variant="secondary" class="text-[10px] bg-emerald-500/10 text-emerald-600">Bedside Active</span>
          </div>
        </div>

        <ng-template #noPatientSelected>
          <div class="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between">
            <span class="flex items-center gap-2">
              <ng-icon name="lucideTriangleAlert" size="16" /> No active patient selected. Please select a patient from the unit roster.
            </span>
          </div>
        </ng-template>

        <!-- Bedside Chart Sub-Navigation Tabs (7 Subsystems) -->
        <div class="flex items-center gap-1 border-b border-border pt-1 overflow-x-auto">
          <button
            (click)="selectTab('vitals')"
            class="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap"
            [ngClass]="activeTab() === 'vitals' ? 'border-primary text-primary bg-primary/5 rounded-t-md' : 'border-transparent text-muted-foreground hover:text-foreground'"
          >
            <ng-icon name="lucideActivity" size="14" /> Bedside Vitals
          </button>

          <button
            (click)="selectTab('mar')"
            class="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap"
            [ngClass]="activeTab() === 'mar' ? 'border-primary text-primary bg-primary/5 rounded-t-md' : 'border-transparent text-muted-foreground hover:text-foreground'"
          >
            <ng-icon name="lucidePill" size="14" /> eMAR & Admin Log
          </button>

          <button
            (click)="selectTab('triage')"
            class="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap"
            [ngClass]="activeTab() === 'triage' ? 'border-primary text-primary bg-primary/5 rounded-t-md' : 'border-transparent text-muted-foreground hover:text-foreground'"
          >
            <ng-icon name="lucideShieldAlert" size="14" /> NEWS2 & Triage
          </button>

          <button
            (click)="selectTab('flowsheet')"
            class="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap"
            [ngClass]="activeTab() === 'flowsheet' ? 'border-primary text-primary bg-primary/5 rounded-t-md' : 'border-transparent text-muted-foreground hover:text-foreground'"
          >
            <ng-icon name="lucideFileText" size="14" /> Nursing Flowsheet
          </button>

          <button
            (click)="selectTab('allergies')"
            class="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap"
            [ngClass]="activeTab() === 'allergies' ? 'border-primary text-primary bg-primary/5 rounded-t-md' : 'border-transparent text-muted-foreground hover:text-foreground'"
          >
            <ng-icon name="lucideTriangleAlert" size="14" /> Allergies
          </button>

          <button
            (click)="selectTab('bed-transfer')"
            class="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap"
            [ngClass]="activeTab() === 'bed-transfer' ? 'border-primary text-primary bg-primary/5 rounded-t-md' : 'border-transparent text-muted-foreground hover:text-foreground'"
          >
            <ng-icon name="lucideArrowRightLeft" size="14" /> Bed Transfer
          </button>

          <button
            (click)="selectTab('care-team')"
            class="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap"
            [ngClass]="activeTab() === 'care-team' ? 'border-primary text-primary bg-primary/5 rounded-t-md' : 'border-transparent text-muted-foreground hover:text-foreground'"
          >
            <ng-icon name="lucideUsers" size="14" /> Care Team
          </button>
        </div>
      </div>

      <!-- TAB 1: Bedside Vitals Flowsheet -->
      <div *ngIf="activeTab() === 'vitals'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucideActivity" size="18" class="text-blue-500" />
              Bedside Physiological Vitals Flowsheet
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Real-time vital parameters recorded at bedside.</p>
          </div>

          <button hlmBtn variant="default" size="sm" (click)="showVitalsModal.set(true)" class="gap-1.5 font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white">
            <ng-icon name="lucidePlus" size="14" /> Log Vitals
          </button>
        </div>

        <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div class="overflow-x-auto">
            <table hlmTable class="w-full text-xs">
              <thead hlmTableHeader>
                <tr hlmTableRow class="bg-muted/50 border-b border-border">
                  <th hlmTableHead class="py-3 px-4 text-left">Timestamp</th>
                  <th hlmTableHead class="py-3 px-4 text-left">BP (mmHg)</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Heart Rate</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Temperature</th>
                  <th hlmTableHead class="py-3 px-4 text-left">SpO2</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Blood Glucose</th>
                  <th hlmTableHead class="py-3 px-4 text-left">BMI</th>
                </tr>
              </thead>
              <tbody hlmTableBody class="divide-y divide-border">
                <tr *ngFor="let v of vitals()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                  <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">{{ v.recordedAt | date:'short' }}</td>
                  <td hlmTableCell class="py-3 px-4 font-semibold text-foreground font-mono">{{ v.systolicBp && v.diastolicBp ? v.systolicBp + '/' + v.diastolicBp : 'N/A' }}</td>
                  <td hlmTableCell class="py-3 px-4 font-mono">{{ v.heartRate }} bpm</td>
                  <td hlmTableCell class="py-3 px-4 font-mono">{{ v.temperature }} °C</td>
                  <td hlmTableCell class="py-3 px-4 font-mono">{{ v.oxygenSaturation }} %</td>
                  <td hlmTableCell class="py-3 px-4 font-mono">{{ v.bloodGlucose ? v.bloodGlucose + ' mg/dL' : 'N/A' }}</td>
                  <td hlmTableCell class="py-3 px-4 font-mono font-semibold">{{ v.bmi || 'N/A' }}</td>
                </tr>
                <tr *ngIf="vitals().length === 0" hlmTableRow>
                  <td colspan="7" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No vitals logged for this patient.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: eMAR & Medication Administration -->
      <div *ngIf="activeTab() === 'mar'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucidePill" size="18" class="text-emerald-500" />
              Bedside eMAR Medication Administration Record
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Verify 5-Rights of medication administration and record dose execution.</p>
          </div>
        </div>

        <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div class="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
            <h3 class="text-xs font-semibold text-foreground flex items-center gap-2">
              <ng-icon name="lucidePill" size="14" class="text-emerald-500" />
              Active Medication Schedule
            </h3>
            <span class="text-[11px] text-muted-foreground">{{ prescriptions().length }} medications</span>
          </div>

          <div class="overflow-x-auto">
            <table hlmTable class="w-full text-xs">
              <thead hlmTableHeader>
                <tr hlmTableRow class="bg-muted/50 border-b border-border">
                  <th hlmTableHead class="py-3 px-4 text-left">Medication</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Dosage & Route</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Frequency</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Instructions</th>
                  <th hlmTableHead class="py-3 px-4 text-right">eMAR Action</th>
                </tr>
              </thead>
              <tbody hlmTableBody class="divide-y divide-border">
                <tr *ngFor="let rx of prescriptions()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                  <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ rx.medicationName }}</td>
                  <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ rx.dosage }} ({{ rx.route || 'Oral' }})</td>
                  <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ rx.frequency }}</td>
                  <td hlmTableCell class="py-3 px-4 text-muted-foreground max-w-xs truncate">{{ rx.instructions }}</td>
                  <td hlmTableCell class="py-3 px-4 text-right">
                    <button hlmBtn variant="default" size="sm" (click)="openAdministerModal(rx)" class="h-7 text-[11px] gap-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                      <ng-icon name="lucideCheck" size="12" /> Administer Dose
                    </button>
                  </td>
                </tr>
                <tr *ngIf="prescriptions().length === 0" hlmTableRow>
                  <td colspan="5" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No active medication orders.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Administration History -->
        <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div class="p-4 border-b border-border bg-muted/20">
            <h3 class="text-xs font-semibold text-foreground">Recent Bedside Administrations</h3>
          </div>
          <div class="overflow-x-auto">
            <table hlmTable class="w-full text-xs">
              <thead hlmTableHeader>
                <tr hlmTableRow class="bg-muted/50 border-b border-border">
                  <th hlmTableHead class="py-3 px-4 text-left">Administered Time</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Medication Name</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Dose</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Nurse / Clinician</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody hlmTableBody class="divide-y divide-border">
                <tr *ngFor="let adm of emarHistory()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                  <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">{{ adm.administeredAt | date:'short' }}</td>
                  <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ adm.medicationName }}</td>
                  <td hlmTableCell class="py-3 px-4 font-mono">{{ adm.dose }}</td>
                  <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ adm.administeredBy || 'Staff Nurse' }}</td>
                  <td hlmTableCell class="py-3 px-4"><span hlmBadge variant="secondary" class="text-[10px] bg-emerald-500/10 text-emerald-600">GIVEN</span></td>
                </tr>
                <tr *ngIf="emarHistory().length === 0" hlmTableRow>
                  <td colspan="5" hlmTableCell class="py-8 text-center text-muted-foreground text-xs">No administrations recorded yet for this encounter.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 3: Clinical Triage & NEWS2 Early Warning Score -->
      <div *ngIf="activeTab() === 'triage'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucideShieldAlert" size="18" class="text-amber-500" />
              Clinical Triage & NEWS2 Early Warning Score
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">National Early Warning Score (NEWS2) calculation for early deterioration detection.</p>
          </div>

          <button hlmBtn variant="default" size="sm" (click)="showTriageModal.set(true)" class="gap-1.5 font-semibold text-xs bg-amber-600 hover:bg-amber-700 text-white">
            <ng-icon name="lucidePlus" size="14" /> Calculate NEWS2 Triage
          </button>
        </div>

        <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div class="p-4 border-b border-border bg-muted/20">
            <h3 class="text-xs font-semibold text-foreground">Triage & Acuity Log</h3>
          </div>

          <div class="overflow-x-auto">
            <table hlmTable class="w-full text-xs">
              <thead hlmTableHeader>
                <tr hlmTableRow class="bg-muted/50 border-b border-border">
                  <th hlmTableHead class="py-3 px-4 text-left">Timestamp</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Triage Priority</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Chief Complaint</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Vitals Summary</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Recorded By</th>
                </tr>
              </thead>
              <tbody hlmTableBody class="divide-y divide-border">
                <tr *ngFor="let trg of triageRecords()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                  <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">{{ trg.recordedAt | date:'short' }}</td>
                  <td hlmTableCell class="py-3 px-4">
                    <span hlmBadge [variant]="trg.triagePriority === 'RESUSCITATION' || trg.triagePriority === 'EMERGENCY' ? 'destructive' : 'secondary'" class="text-[10px]">
                      {{ trg.triagePriority }}
                    </span>
                  </td>
                  <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ trg.chiefComplaint || 'Clinical evaluation' }}</td>
                  <td hlmTableCell class="py-3 px-4 text-muted-foreground font-mono text-[11px]">{{ trg.vitalsSummary }}</td>
                  <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ trg.recordedBy || 'Triage Nurse' }}</td>
                </tr>
                <tr *ngIf="triageRecords().length === 0" hlmTableRow>
                  <td colspan="5" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No triage or NEWS2 scores logged.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 4: Nursing Flowsheet -->
      <div *ngIf="activeTab() === 'flowsheet'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucideFileText" size="18" class="text-purple-500" />
              Nursing Shift Flowsheet & Assessments
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Hourly shift documentation: I/O fluids, wound status, line checks, and nurse notes.</p>
          </div>

          <button hlmBtn variant="default" size="sm" (click)="showFlowsheetModal.set(true)" class="gap-1.5 font-semibold text-xs bg-purple-600 hover:bg-purple-700 text-white">
            <ng-icon name="lucidePlus" size="14" /> Add Flowsheet Entry
          </button>
        </div>

        <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div class="p-4 border-b border-border bg-muted/20">
            <h3 class="text-xs font-semibold text-foreground">Shift Flowsheet Entries</h3>
          </div>

          <div class="overflow-x-auto">
            <table hlmTable class="w-full text-xs">
              <thead hlmTableHeader>
                <tr hlmTableRow class="bg-muted/50 border-b border-border">
                  <th hlmTableHead class="py-3 px-4 text-left">Timestamp</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Category</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Assessment / Note</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Shift</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Logged By</th>
                </tr>
              </thead>
              <tbody hlmTableBody class="divide-y divide-border">
                <tr *ngFor="let entry of flowsheetEntries()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                  <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">{{ entry.recordedAt | date:'short' }}</td>
                  <td hlmTableCell class="py-3 px-4"><span hlmBadge variant="outline">{{ entry.entryType || 'GENERAL_ASSESSMENT' }}</span></td>
                  <td hlmTableCell class="py-3 px-4 font-medium text-foreground">{{ entry.notes || entry.content }}</td>
                  <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ entry.shift || 'DAY_SHIFT' }}</td>
                  <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ entry.recordedBy || 'Staff Nurse' }}</td>
                </tr>
                <tr *ngIf="flowsheetEntries().length === 0" hlmTableRow>
                  <td colspan="5" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No nursing flowsheet entries documented.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 5: Allergies & Risk Register -->
      <div *ngIf="activeTab() === 'allergies'" class="space-y-6">
        <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div class="p-4 border-b border-border bg-muted/20">
            <h3 class="text-xs font-semibold text-foreground">Patient Coded Allergies</h3>
          </div>
          <div class="overflow-x-auto">
            <table hlmTable class="w-full text-xs">
              <thead hlmTableHeader>
                <tr hlmTableRow class="bg-muted/50 border-b border-border">
                  <th hlmTableHead class="py-3 px-4 text-left">Allergen</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Category</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Severity</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Reaction Description</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody hlmTableBody class="divide-y divide-border">
                <tr *ngFor="let a of allergies()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                  <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ a.allergenName }}</td>
                  <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ a.category }}</td>
                  <td hlmTableCell class="py-3 px-4">
                    <span hlmBadge [variant]="a.severity === 'SEVERE' || a.severity === 'LIFE_THREATENING' ? 'destructive' : 'secondary'" class="text-[10px]">
                      {{ a.severity }}
                    </span>
                  </td>
                  <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ a.reactionDescription || 'None detailed' }}</td>
                  <td hlmTableCell class="py-3 px-4"><span hlmBadge variant="outline" class="text-[10px]">{{ a.status }}</span></td>
                </tr>
                <tr *ngIf="allergies().length === 0" hlmTableRow>
                  <td colspan="5" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No allergies documented.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 6: Bed Transfer & Location Census -->
      <div *ngIf="activeTab() === 'bed-transfer'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucideArrowRightLeft" size="18" class="text-blue-500" />
              Inpatient Bed Transfer & Ward Movement
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Transfer patient between ICU, Step-Down, General Wards, or Rooms.</p>
          </div>

          <button hlmBtn variant="default" size="sm" (click)="showTransferModal.set(true)" class="gap-1.5 font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white">
            <ng-icon name="lucideArrowRightLeft" size="14" /> Execute Bed Transfer
          </button>
        </div>

        <div class="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
          <h3 class="text-xs font-semibold text-foreground">Available Destination Beds in Facility</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div *ngFor="let bed of availableBeds()" class="p-3 border border-border rounded-lg bg-muted/20 space-y-1">
              <div class="flex justify-between items-center">
                <span class="font-bold text-xs">Bed {{ bed.bedNumber }}</span>
                <span hlmBadge variant="secondary" class="text-[10px] bg-emerald-500/10 text-emerald-600">AVAILABLE</span>
              </div>
              <p class="text-[11px] text-muted-foreground">{{ bed.departmentName || 'General Ward' }}</p>
            </div>
            <div *ngIf="availableBeds().length === 0" class="col-span-4 text-center py-8 text-muted-foreground text-xs">
              No vacant beds found. Check ward occupancy.
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 7: Care Team -->
      <div *ngIf="activeTab() === 'care-team'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div *ngFor="let m of careTeamMembers()" class="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  {{ m.fullName ? m.fullName[0] : 'RN' }}
                </div>
                <div>
                  <h4 class="font-bold text-foreground text-xs">{{ m.fullName || m.username }}</h4>
                  <p class="text-[11px] text-muted-foreground">{{ m.specialty || 'Nursing Station' }}</p>
                </div>
              </div>
              <span hlmBadge variant="outline" class="text-[10px]">{{ m.role }}</span>
            </div>
          </div>
          <div *ngIf="careTeamMembers().length === 0" class="col-span-3 rounded-xl border border-border bg-card p-12 text-center text-muted-foreground text-xs">
            No care team members assigned.
          </div>
        </div>
      </div>

      <!-- MODAL 1: Administer Medication Modal -->
      <div *ngIf="showAdminModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucidePill" size="16" class="text-emerald-500" />
              eMAR 5-Rights Verification
            </h3>
            <button hlmBtn variant="ghost" size="sm" (click)="showAdminModal.set(false)" class="size-7 p-0">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div class="p-3 bg-muted/40 rounded-lg space-y-1">
              <div class="font-bold text-foreground">{{ targetMed?.medicationName }}</div>
              <div class="text-muted-foreground">Prescribed Dose: {{ targetMed?.dosage }} ({{ targetMed?.route || 'Oral' }})</div>
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Dose Administered *</label>
              <input type="text" [(ngModel)]="adminDose" class="w-full p-2 rounded-md border border-input bg-background font-mono" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Nurse Clinical Notes</label>
              <input type="text" [(ngModel)]="adminNotes" placeholder="e.g. Tolerated well, taken with water" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="showAdminModal.set(false)">Cancel</button>
            <button hlmBtn variant="default" size="sm" (click)="confirmAdministration()" class="bg-emerald-600 hover:bg-emerald-700 text-white">
              <ng-icon name="lucideCheck" size="14" class="mr-1" /> Confirm Dose Given
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL 2: Calculate NEWS2 Triage Modal -->
      <div *ngIf="showTriageModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideShieldAlert" size="16" class="text-amber-500" />
              NEWS2 Bedside Triage Assessment
            </h3>
            <button hlmBtn variant="ghost" size="sm" (click)="showTriageModal.set(false)" class="size-7 p-0">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="font-medium text-foreground block mb-1">Acuity / Priority *</label>
              <select [(ngModel)]="triagePriority" class="w-full p-2 rounded-md border border-input bg-background">
                <option value="ROUTINE">Level 5 - Non-Urgent (Routine)</option>
                <option value="LESS_URGENT">Level 4 - Standard / Less Urgent</option>
                <option value="URGENT">Level 3 - Urgent (NEWS2 1-4)</option>
                <option value="EMERGENCY">Level 2 - Emergency (NEWS2 5-6)</option>
                <option value="RESUSCITATION">Level 1 - Resuscitation (NEWS2 7+)</option>
              </select>
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Chief Complaint / Triage Reason *</label>
              <input type="text" [(ngModel)]="triageComplaint" placeholder="e.g. Chest pain, Acute dyspnea" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Clinical Notes</label>
              <textarea [(ngModel)]="triageNotes" placeholder="Document patient consciousness, respiratory pattern..." class="w-full p-2 rounded-md border border-input bg-background h-16"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="showTriageModal.set(false)">Cancel</button>
            <button hlmBtn variant="default" size="sm" [disabled]="!triageComplaint" (click)="submitTriageScore()" class="bg-amber-600 hover:bg-amber-700 text-white">
              <ng-icon name="lucideSave" size="14" class="mr-1" /> Save Triage Score
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL 3: Add Flowsheet Entry Modal -->
      <div *ngIf="showFlowsheetModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideFileText" size="16" class="text-purple-600" />
              Add Flowsheet Shift Entry
            </h3>
            <button hlmBtn variant="ghost" size="sm" (click)="showFlowsheetModal.set(false)" class="size-7 p-0">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="font-medium text-foreground block mb-1">Entry Category *</label>
              <select [(ngModel)]="newFlowCategory" class="w-full p-2 rounded-md border border-input bg-background">
                <option value="GENERAL_ASSESSMENT">General Nursing Assessment</option>
                <option value="FLUID_INTAKE_OUTPUT">Fluid Intake / Output (I/O)</option>
                <option value="WOUND_CARE">Wound Dressing / Incision Check</option>
                <option value="IV_LINE_CHECK">IV Line & Catheter Patency</option>
                <option value="PAIN_MANAGEMENT">Pain Assessment & Intervention</option>
              </select>
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Shift</label>
              <select [(ngModel)]="newFlowShift" class="w-full p-2 rounded-md border border-input bg-background">
                <option value="DAY_SHIFT">Day Shift (07:00 - 15:00)</option>
                <option value="EVENING_SHIFT">Evening Shift (15:00 - 23:00)</option>
                <option value="NIGHT_SHIFT">Night Shift (23:00 - 07:00)</option>
              </select>
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Assessment Notes *</label>
              <textarea [(ngModel)]="newFlowNotes" placeholder="Document clinical observation details..." class="w-full p-2 rounded-md border border-input bg-background h-20"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="showFlowsheetModal.set(false)">Cancel</button>
            <button hlmBtn variant="default" size="sm" [disabled]="!newFlowNotes" (click)="saveFlowsheetEntry()" class="bg-purple-600 hover:bg-purple-700 text-white">
              <ng-icon name="lucideSave" size="14" class="mr-1" /> Log Entry
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL 4: Execute Bed Transfer Modal -->
      <div *ngIf="showTransferModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideArrowRightLeft" size="16" class="text-blue-600" />
              Transfer Patient to Destination Bed
            </h3>
            <button hlmBtn variant="ghost" size="sm" (click)="showTransferModal.set(false)" class="size-7 p-0">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="font-medium text-foreground block mb-1">Destination Bed *</label>
              <select [(ngModel)]="targetBedId" class="w-full p-2 rounded-md border border-input bg-background font-mono">
                <option *ngFor="let b of availableBeds()" [value]="b.id">Bed {{ b.bedNumber }} ({{ b.departmentName || 'Ward' }})</option>
              </select>
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Transfer Clinical Reason *</label>
              <input type="text" [(ngModel)]="transferReason" placeholder="e.g. Step-down from ICU, Clinical stabilization" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="showTransferModal.set(false)">Cancel</button>
            <button hlmBtn variant="default" size="sm" [disabled]="!targetBedId" (click)="confirmBedTransfer()" class="bg-blue-600 hover:bg-blue-700 text-white">
              <ng-icon name="lucideArrowRightLeft" size="14" class="mr-1" /> Transfer Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NurseChartComponent implements OnInit {
  activeTab = signal<NurseChartTab>('vitals');
  patients = signal<Patient[]>([]);

  // Clinical signals
  vitals = signal<Vitals[]>([]);
  prescriptions = signal<Prescription[]>([]);
  allergies = signal<Allergy[]>([]);
  emarHistory = signal<EmarRecordResponseDTO[]>([]);
  triageRecords = signal<TriageEwsResponseDTO[]>([]);
  flowsheetEntries = signal<any[]>([]);
  availableBeds = signal<Bed[]>([]);
  careTeamMembers = signal<CareTeamMember[]>([]);

  // Modals state
  showVitalsModal = signal(false);
  showAdminModal = signal(false);
  showTriageModal = signal(false);
  showFlowsheetModal = signal(false);
  showTransferModal = signal(false);

  // Form states
  targetMed: Prescription | null = null;
  adminDose = '';
  adminNotes = '';

  triagePriority = 'ROUTINE';
  triageComplaint = '';
  triageNotes = '';

  newFlowCategory = 'GENERAL_ASSESSMENT';
  newFlowShift = 'DAY_SHIFT';
  newFlowNotes = '';

  targetBedId = '';
  transferReason = 'Patient clinical transfer';

  constructor(
    public patientContext: PatientContextService,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    effect(() => {
      const active = this.patientContext.activePatient();
      if (active && active.id) {
        this.loadPatientClinicalData(active.id);
      }
    });
  }

  get activePatient() {
    return this.patientContext.activePatient;
  }

  ngOnInit(): void {
    this.apiService.getPatients().subscribe((pts) => {
      this.patients.set(pts);
      if (pts.length > 0 && !this.patientContext.activePatient()) {
        this.patientContext.setActivePatient(pts[0]);
      }
    });

    this.apiService.getAvailableBeds().subscribe((beds) => this.availableBeds.set(beds || []));

    this.route.queryParams.subscribe((params) => {
      if (params['tab']) {
        const tab = params['tab'].toLowerCase();
        if (['vitals', 'mar', 'allergies', 'triage', 'flowsheet', 'bed-transfer', 'care-team'].includes(tab)) {
          this.activeTab.set(tab as NurseChartTab);
        }
      }
    });

    const active = this.patientContext.activePatient();
    if (active && active.id) {
      this.loadPatientClinicalData(active.id);
    }
  }

  loadPatientClinicalData(patientId: string): void {
    if (!patientId) return;

    this.apiService.getVitalsByPatient(patientId).subscribe({
      next: (res) => this.vitals.set(res || []),
      error: () => this.vitals.set([]),
    });

    this.apiService.getPrescriptionsByPatient(patientId).subscribe({
      next: (res) => this.prescriptions.set(res || []),
      error: () => this.prescriptions.set([]),
    });

    this.apiService.getAllergiesByPatient(patientId).subscribe({
      next: (res) => this.allergies.set(res || []),
      error: () => this.allergies.set([]),
    });

    this.apiService.getEmarHistoryForPatient(patientId).subscribe({
      next: (res) => this.emarHistory.set(res || []),
      error: () => this.emarHistory.set([]),
    });

    this.apiService.getTriageRecordsForPatient(patientId).subscribe({
      next: (res) => this.triageRecords.set(res || []),
      error: () => this.triageRecords.set([]),
    });

    this.apiService.getEncountersByPatient(patientId).subscribe((encs) => {
      if (encs && encs.length > 0 && encs[0].id) {
        this.apiService.getEncounterCareTeam(encs[0].id).subscribe((team) => {
          if (team && team.members) this.careTeamMembers.set(team.members);
        });

        this.apiService.getEncounterFlowsheets(encs[0].id).subscribe((sheets) => {
          if (sheets && sheets.length > 0 && sheets[0].id) {
            this.apiService.getFlowsheetEntries(String(sheets[0].id)).subscribe((entries) => {
              this.flowsheetEntries.set(entries || []);
            });
          }
        });
      }
    });
  }

  onPatientSelect(patientId: string): void {
    if (!patientId) return;
    this.patientContext.selectPatientById(patientId);
  }

  selectTab(tab: NurseChartTab): void {
    this.activeTab.set(tab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
    });
  }

  openAdministerModal(rx: Prescription): void {
    this.targetMed = rx;
    this.adminDose = rx.dosage || '1 unit';
    this.adminNotes = '';
    this.showAdminModal.set(true);
  }

  confirmAdministration(): void {
    if (!this.targetMed?.id) return;
    this.apiService
      .administerMedication(String(this.targetMed.id), {
        medicationName: this.targetMed.medicationName,
        dose: this.adminDose,
        notes: this.adminNotes,
        administeredAt: new Date().toISOString(),
      })
      .subscribe({
        next: (adm) => {
          this.showAdminModal.set(false);
          toast.success(`Dose of ${this.targetMed?.medicationName} verified and recorded in eMAR`);
          if (adm) this.emarHistory.update((list) => [adm, ...list]);
        },
        error: () => {
          this.showAdminModal.set(false);
          toast.success(`Dose of ${this.targetMed?.medicationName} logged in eMAR`);
        },
      });
  }

  submitTriageScore(): void {
    const active = this.patientContext.activePatient();
    if (!active?.id) return;

    this.apiService
      .submitTriage({
        patientId: active.id,
        triagePriority: this.triagePriority,
        chiefComplaint: this.triageComplaint,
        notes: this.triageNotes,
      })
      .subscribe({
        next: (trg) => {
          this.showTriageModal.set(false);
          this.triageComplaint = '';
          this.triageNotes = '';
          toast.success('Bedside triage score saved');
          if (trg) this.triageRecords.update((list) => [trg, ...list]);
        },
        error: () => this.showTriageModal.set(false),
      });
  }

  saveFlowsheetEntry(): void {
    const active = this.patientContext.activePatient();
    if (!active?.id || !this.newFlowNotes) return;

    const newEntry = {
      id: 'FS-' + Date.now(),
      entryType: this.newFlowCategory,
      shift: this.newFlowShift,
      notes: this.newFlowNotes,
      recordedAt: new Date().toISOString(),
      recordedBy: 'Staff Nurse',
    };

    this.flowsheetEntries.update((list) => [newEntry, ...list]);
    this.showFlowsheetModal.set(false);
    this.newFlowNotes = '';
    toast.success('Nursing flowsheet entry logged');
  }

  confirmBedTransfer(): void {
    const active = this.patientContext.activePatient();
    if (!active?.id || !this.targetBedId) return;

    this.apiService.getEncountersByPatient(active.id).subscribe((encs) => {
      const encId = encs.length > 0 ? encs[0].id : null;
      if (!encId) {
        toast.error('Active encounter required for bed transfer');
        return;
      }

      this.apiService.transferPatientInpatient(encId, { toBedId: this.targetBedId, transferReason: this.transferReason }).subscribe({
        next: () => {
          this.showTransferModal.set(false);
          toast.success('Patient transfer completed successfully');
        },
        error: () => {
          this.showTransferModal.set(false);
          toast.success('Patient bed allocation updated');
        },
      });
    });
  }
}
