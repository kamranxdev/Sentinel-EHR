import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PatientContextService } from '../../core/services/patient-context.service';
import { ApiService } from '../../core/services/api.service';
import { Patient, Encounter, Diagnosis, Prescription, Allergy, Vitals } from '../../core/models/models';
import { BreakGlassModalComponent } from '../../shared/break-glass-modal.component';
import { InpatientAdmissionModalComponent } from '../../shared/inpatient-admission-modal.component';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideStethoscope,
  lucidePill,
  lucideListChecks,
  lucideTriangleAlert,
  lucideActivity,
  lucideUserRound,
  lucideUsers,
  lucideChevronRight,
  lucidePlus,
  lucideShieldAlert,
  lucideRefreshCw,
  lucideFileText,
  lucideBed,
  lucideUserPlus,
  lucideX,
  lucideSave,
  lucideClock,
  lucideCheckCircle2,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-doctor-chart',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HlmCardImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmButtonImports,
    BreakGlassModalComponent,
    InpatientAdmissionModalComponent,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideStethoscope,
      lucidePill,
      lucideListChecks,
      lucideTriangleAlert,
      lucideActivity,
      lucideUserRound,
      lucideUsers,
      lucideChevronRight,
      lucidePlus,
      lucideShieldAlert,
      lucideRefreshCw,
      lucideFileText,
      lucideBed,
      lucideUserPlus,
      lucideX,
      lucideSave,
      lucideClock,
      lucideCheckCircle2,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Doctor Clinical Chart Header & Patient Banner -->
      <div class="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Doctor Clinical Patient Chart
              <span hlmBadge variant="secondary" class="text-[10px]">Physician EHR Context</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">Comprehensive physician chart for SOAP notes, ICD-10 diagnoses, eRx orders, allergies, and vitals.</p>
          </div>

          <!-- Quick Patient Switcher Combobox -->
          <div class="flex items-center gap-3 w-full md:w-auto">
            <div class="flex items-center gap-2 bg-muted/30 border border-border rounded-lg p-1.5 w-full md:w-auto">
              <ng-icon name="lucideUserRound" size="16" class="text-primary ml-2 shrink-0" />
              <select
                class="bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer pr-4 max-w-[240px] truncate"
                [ngModel]="activePatient()?.id"
                (ngModelChange)="onPatientSelect($event)"
              >
                <option *ngIf="patients().length === 0" [value]="null">Loading MPI census...</option>
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
            <span hlmBadge variant="outline" class="text-[10px] font-semibold text-primary border-primary/30 bg-primary/10">
              {{ patient.bloodType || 'A+' }}
            </span>
          </div>

          <div>
            <span class="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Contact / Phone</span>
            <span class="text-foreground block truncate">{{ patient.phone || 'N/A' }}</span>
          </div>

          <div>
            <span class="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Clinical Status</span>
            <span hlmBadge variant="secondary" class="text-[10px] bg-emerald-500/10 text-emerald-600">Active Chart Context</span>
          </div>
        </div>

        <ng-template #noPatientSelected>
          <div class="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between">
            <span class="flex items-center gap-2">
              <ng-icon name="lucideTriangleAlert" size="16" /> No active patient selected. Please select a patient from the dropdown or MPI census.
            </span>
          </div>
        </ng-template>

        <!-- Doctor Chart Sub-Navigation Tabs -->
        <div class="flex items-center gap-2 border-b border-border pt-1 overflow-x-auto">
          <button
            (click)="selectTab('encounters')"
            class="flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap"
            [ngClass]="activeTab() === 'encounters' ? 'border-primary text-primary bg-primary/5 rounded-t-md' : 'border-transparent text-muted-foreground hover:text-foreground'"
          >
            <ng-icon name="lucideStethoscope" size="15" /> SOAP Notes & Encounters
          </button>

          <button
            (click)="selectTab('diagnoses')"
            class="flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap"
            [ngClass]="activeTab() === 'diagnoses' ? 'border-primary text-primary bg-primary/5 rounded-t-md' : 'border-transparent text-muted-foreground hover:text-foreground'"
          >
            <ng-icon name="lucideListChecks" size="15" /> Problem List (ICD-10)
          </button>

          <button
            (click)="selectTab('erx')"
            class="flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap"
            [ngClass]="activeTab() === 'erx' ? 'border-primary text-primary bg-primary/5 rounded-t-md' : 'border-transparent text-muted-foreground hover:text-foreground'"
          >
            <ng-icon name="lucidePill" size="15" /> Pharmacy & eRx Orders
          </button>

          <button
            (click)="selectTab('allergies')"
            class="flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap"
            [ngClass]="activeTab() === 'allergies' ? 'border-primary text-primary bg-primary/5 rounded-t-md' : 'border-transparent text-muted-foreground hover:text-foreground'"
          >
            <ng-icon name="lucideTriangleAlert" size="15" /> Coded Allergies & Risk
          </button>

          <button
            (click)="selectTab('vitals')"
            class="flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap"
            [ngClass]="activeTab() === 'vitals' ? 'border-primary text-primary bg-primary/5 rounded-t-md' : 'border-transparent text-muted-foreground hover:text-foreground'"
          >
            <ng-icon name="lucideActivity" size="15" /> Bedside Vitals
          </button>
        </div>
      </div>

      <!-- TAB 1: Encounters & SOAP Notes -->
      <div *ngIf="activeTab() === 'encounters'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucideStethoscope" size="18" class="text-primary" />
              Inpatient Encounters & Clinical Visits
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Manage active inpatient encounters, bed assignments, discharge planning, and emergency access overrides.</p>
          </div>

          <div class="flex items-center gap-2">
            <button hlmBtn size="sm" (click)="isAdmissionModalOpen.set(true)" class="gap-2 text-xs font-semibold shadow-xs">
              <ng-icon name="lucideUserPlus" class="text-sm"></ng-icon> Register Admission
            </button>
            <button hlmBtn variant="destructive" size="sm" (click)="triggerBreakGlass()" class="gap-2 text-xs font-semibold shadow-xs">
              <ng-icon name="lucideShieldAlert" class="text-sm"></ng-icon> Emergency Break-Glass
            </button>
          </div>
        </div>

        <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div class="overflow-x-auto">
            <table hlmTable class="w-full text-xs">
              <thead hlmTableHeader>
                <tr hlmTableRow class="bg-muted/50 border-b border-border">
                  <th hlmTableHead class="py-3 px-4 text-left font-semibold">Encounter ID</th>
                  <th hlmTableHead class="py-3 px-4 text-left font-semibold">Type / Class</th>
                  <th hlmTableHead class="py-3 px-4 text-left font-semibold">Chief Complaint</th>
                  <th hlmTableHead class="py-3 px-4 text-left font-semibold">Status Stage</th>
                  <th hlmTableHead class="py-3 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody hlmTableBody class="divide-y divide-border">
                <tr *ngFor="let enc of encounters()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                  <td hlmTableCell class="py-3 px-4 font-mono font-bold text-foreground">#ENC-{{ enc.id }}</td>
                  <td hlmTableCell class="py-3 px-4 font-medium text-foreground">{{ enc.encounterType }}</td>
                  <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ enc.chiefComplaint || 'Clinical evaluation' }}</td>
                  <td hlmTableCell class="py-3 px-4">
                    <span hlmBadge [variant]="enc.status === 'FINISHED' || enc.status === 'COMPLETED' ? 'secondary' : 'default'" class="text-[10px]">
                      {{ enc.status }}
                    </span>
                  </td>
                  <td hlmTableCell class="py-3 px-4 text-right">
                    <button *ngIf="enc.status === 'ACTIVE' || enc.status === 'IN_PROGRESS'" hlmBtn variant="outline" size="sm" (click)="finalizeEncounter(enc.id)" class="h-7 text-[11px]">
                      Finalize Visit
                    </button>
                  </td>
                </tr>
                <tr *ngIf="encounters().length === 0" hlmTableRow>
                  <td colspan="5" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No encounters recorded for this patient.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: Problem List (ICD-10) -->
      <div *ngIf="activeTab() === 'diagnoses'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucideListChecks" size="18" class="text-primary" />
              Problem List (ICD-10 & SNOMED-CT Coded Conditions)
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Document clinical diagnoses, problem severity, and ICD-10 terminology codes.</p>
          </div>
          <button hlmBtn variant="default" size="sm" (click)="showDiagnosisModal.set(true)" class="gap-1.5 font-semibold text-xs">
            <ng-icon name="lucidePlus" size="14" /> Add ICD-10 Diagnosis
          </button>
        </div>

        <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div class="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
            <h3 class="text-xs font-semibold text-foreground flex items-center gap-2">
              <ng-icon name="lucideListChecks" size="14" class="text-primary" />
              Documented Diagnoses
            </h3>
            <span class="text-[11px] text-muted-foreground">{{ diagnoses().length }} active conditions</span>
          </div>

          <div class="overflow-x-auto">
            <table hlmTable class="w-full text-xs">
              <thead hlmTableHeader>
                <tr hlmTableRow class="bg-muted/50 border-b border-border">
                  <th hlmTableHead class="py-3 px-4 text-left">ICD-10 Code</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Condition Description</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Clinical Status</th>
                </tr>
              </thead>
              <tbody hlmTableBody class="divide-y divide-border">
                <tr *ngFor="let d of diagnoses()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                  <td hlmTableCell class="py-3 px-4 font-mono font-bold"><span hlmBadge variant="outline">{{ d.icdCode || 'N/A' }}</span></td>
                  <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ d.conditionName }}</td>
                  <td hlmTableCell class="py-3 px-4"><span hlmBadge variant="outline" class="text-[10px] text-emerald-600">{{ d.status || 'ACTIVE' }}</span></td>
                </tr>
                <tr *ngIf="diagnoses().length === 0" hlmTableRow>
                  <td colspan="3" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No active ICD-10 diagnoses documented for this patient.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 3: Pharmacy & eRx Orders -->
      <div *ngIf="activeTab() === 'erx'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucidePill" size="18" class="text-emerald-500" />
              Pharmacy & e-Prescription Orders (eRx)
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Issue eRx medication orders with dosage, route, and pharmacy instructions.</p>
          </div>
          <button hlmBtn variant="default" size="sm" (click)="showErxModal.set(true)" class="gap-1.5 font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
            <ng-icon name="lucidePlus" size="14" /> Issue New eRx Order
          </button>
        </div>

        <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div class="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
            <h3 class="text-xs font-semibold text-foreground flex items-center gap-2">
              <ng-icon name="lucidePill" size="14" class="text-emerald-500" />
              Active eRx Medication Orders
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
                </tr>
                <tr *ngIf="prescriptions().length === 0" hlmTableRow>
                  <td colspan="5" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No active eRx orders logged for this patient.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 4: Allergies & Risk Register -->
      <div *ngIf="activeTab() === 'allergies'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucideTriangleAlert" size="18" class="text-amber-500" />
              Coded Allergies & Risk Register
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Review allergen safety records, severity, and adverse reaction history.</p>
          </div>
          <button hlmBtn variant="default" size="sm" (click)="showAllergyModal.set(true)" class="gap-1.5 font-semibold text-xs bg-amber-600 hover:bg-amber-700 text-white">
            <ng-icon name="lucidePlus" size="14" /> Document Allergy
          </button>
        </div>

        <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div class="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
            <h3 class="text-xs font-semibold text-foreground flex items-center gap-2">
              <ng-icon name="lucideTriangleAlert" size="14" class="text-amber-500" />
              Active Coded Allergies Log
            </h3>
            <span class="text-[11px] text-muted-foreground">{{ allergies().length }} documented</span>
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
                  <td colspan="5" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No active allergies documented for this patient.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 5: Bedside Vitals -->
      <div *ngIf="activeTab() === 'vitals'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucideActivity" size="18" class="text-blue-500" />
              Bedside Vitals Flowsheet
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Monitor physiological vital signs, blood pressure, pulse, temperature, and BMI.</p>
          </div>

          <button hlmBtn variant="default" size="sm" (click)="showVitalsModal.set(true)" class="gap-1.5 font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white">
            <ng-icon name="lucidePlus" size="14" /> Log Vitals
          </button>
        </div>

        <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div class="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
            <h3 class="text-xs font-semibold text-foreground flex items-center gap-2">
              <ng-icon name="lucideActivity" size="14" class="text-blue-500" />
              Vitals History Log
            </h3>
            <span class="text-[11px] text-muted-foreground">{{ vitals().length }} readings recorded</span>
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
                  <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ v.recordedBy?.fullName || 'Clinician' }}</td>
                </tr>
                <tr *ngIf="vitals().length === 0" hlmTableRow>
                  <td colspan="8" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No vitals recorded for this patient.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal 1: Add Diagnosis Modal -->
      <div *ngIf="showDiagnosisModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-5">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideListChecks" size="16" class="text-primary" />
              Add ICD-10 Coded Diagnosis
            </h3>
            <button hlmBtn variant="ghost" size="sm" (click)="showDiagnosisModal.set(false)" class="size-7 p-0">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="font-medium text-foreground block mb-1">ICD-10 Code *</label>
              <input type="text" [(ngModel)]="newDiagnosis.icdCode" placeholder="e.g. E11.9, I10, J45.909" class="w-full p-2 rounded-md border border-input bg-background font-mono" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Condition Description *</label>
              <input type="text" [(ngModel)]="newDiagnosis.conditionName" placeholder="e.g. Type 2 Diabetes Mellitus, Essential Hypertension" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="showDiagnosisModal.set(false)">Cancel</button>
            <button hlmBtn variant="default" size="sm" [disabled]="savingDiagnosis() || !newDiagnosis.icdCode || !newDiagnosis.conditionName" (click)="saveDiagnosis()">
              <ng-icon name="lucideSave" size="14" class="mr-1" /> {{ savingDiagnosis() ? 'Saving...' : 'Save Diagnosis' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal 2: Issue eRx Modal -->
      <div *ngIf="showErxModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg space-y-5">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucidePill" size="16" class="text-emerald-500" />
              Issue Pharmacy eRx Order
            </h3>
            <button hlmBtn variant="ghost" size="sm" (click)="showErxModal.set(false)" class="size-7 p-0">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="col-span-2">
              <label class="font-medium text-foreground block mb-1">Medication Name *</label>
              <input type="text" [(ngModel)]="newErx.medicationName" placeholder="e.g. Amoxicillin, Metformin, Lisinopril" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Dosage *</label>
              <input type="text" [(ngModel)]="newErx.dosage" placeholder="e.g. 500mg, 10ml" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Route</label>
              <select [(ngModel)]="newErx.route" class="w-full p-2 rounded-md border border-input bg-background">
                <option value="Oral">Oral</option>
                <option value="IV">Intravenous (IV)</option>
                <option value="IM">Intramuscular (IM)</option>
                <option value="Subcutaneous">Subcutaneous</option>
                <option value="Topical">Topical</option>
              </select>
            </div>

            <div class="col-span-2">
              <label class="font-medium text-foreground block mb-1">Frequency</label>
              <input type="text" [(ngModel)]="newErx.frequency" placeholder="e.g. Twice daily with meals (BID)" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div class="col-span-2">
              <label class="font-medium text-foreground block mb-1">Pharmacy Instructions</label>
              <textarea [(ngModel)]="newErx.instructions" placeholder="Enter specific instructions..." class="w-full p-2 rounded-md border border-input bg-background h-16"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="showErxModal.set(false)">Cancel</button>
            <button hlmBtn variant="default" size="sm" [disabled]="savingErx() || !newErx.medicationName || !newErx.dosage" (click)="saveErx()" class="bg-emerald-600 hover:bg-emerald-700 text-white">
              <ng-icon name="lucideSave" size="14" class="mr-1" /> {{ savingErx() ? 'Submitting...' : 'Issue eRx Order' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal 3: Document Allergy Modal -->
      <div *ngIf="showAllergyModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-5">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideTriangleAlert" size="16" class="text-amber-500" />
              Document New Patient Allergy
            </h3>
            <button hlmBtn variant="ghost" size="sm" (click)="showAllergyModal.set(false)" class="size-7 p-0">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="font-medium text-foreground block mb-1">Allergen Name *</label>
              <input type="text" [(ngModel)]="newAllergy.allergenName" placeholder="e.g. Penicillin, Latex, Peanuts" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Category</label>
              <select [(ngModel)]="newAllergy.category" class="w-full p-2 rounded-md border border-input bg-background">
                <option value="DRUG">DRUG (Medication)</option>
                <option value="FOOD">FOOD</option>
                <option value="ENVIRONMENTAL">ENVIRONMENTAL</option>
              </select>
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Severity</label>
              <select [(ngModel)]="newAllergy.severity" class="w-full p-2 rounded-md border border-input bg-background">
                <option value="MILD">MILD</option>
                <option value="MODERATE">MODERATE</option>
                <option value="SEVERE">SEVERE (Anaphylaxis Risk)</option>
              </select>
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Reaction Description</label>
              <textarea [(ngModel)]="newAllergy.reactionDescription" placeholder="Describe symptoms..." class="w-full p-2 rounded-md border border-input bg-background h-20"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="showAllergyModal.set(false)">Cancel</button>
            <button hlmBtn variant="default" size="sm" [disabled]="savingAllergy() || !newAllergy.allergenName" (click)="saveAllergy()" class="bg-amber-600 hover:bg-amber-700 text-white">
              <ng-icon name="lucideSave" size="14" class="mr-1" /> {{ savingAllergy() ? 'Saving...' : 'Save Allergy Record' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal 4: Log Vitals Modal -->
      <div *ngIf="showVitalsModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg space-y-5">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideActivity" size="16" class="text-blue-500" />
              Log Bedside Physiological Vitals
            </h3>
            <button hlmBtn variant="ghost" size="sm" (click)="showVitalsModal.set(false)" class="size-7 p-0">
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
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="showVitalsModal.set(false)">Cancel</button>
            <button hlmBtn variant="default" size="sm" [disabled]="savingVitals()" (click)="saveVitals()" class="bg-blue-600 hover:bg-blue-700 text-white">
              <ng-icon name="lucideSave" size="14" class="mr-1" /> {{ savingVitals() ? 'Saving...' : 'Save Vitals Entry' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Shared Break Glass & Inpatient Admission Modals -->
      <app-break-glass-modal
        [isOpen]="isBreakGlassModalOpen()"
        (closed)="isBreakGlassModalOpen.set(false)"
      ></app-break-glass-modal>

      <app-inpatient-admission-modal
        [isOpen]="isAdmissionModalOpen()"
        [targetPatientId]="activePatient()?.id"
        (closed)="isAdmissionModalOpen.set(false)"
      ></app-inpatient-admission-modal>
    </div>
  `,
})
export class DoctorChartComponent implements OnInit {
  activeTab = signal<'encounters' | 'diagnoses' | 'erx' | 'allergies' | 'vitals'>('encounters');
  patients = signal<Patient[]>([]);

  // Clinical data signals
  encounters = signal<Encounter[]>([]);
  diagnoses = signal<Diagnosis[]>([]);
  prescriptions = signal<Prescription[]>([]);
  allergies = signal<Allergy[]>([]);
  vitals = signal<Vitals[]>([]);

  // Modals & form state
  isBreakGlassModalOpen = signal(false);
  isAdmissionModalOpen = signal(false);

  showDiagnosisModal = signal(false);
  savingDiagnosis = signal(false);
  newDiagnosis = { icdCode: '', conditionName: '' };

  showErxModal = signal(false);
  savingErx = signal(false);
  newErx = { medicationName: '', dosage: '', route: 'Oral', frequency: 'Twice daily', instructions: '' };

  showAllergyModal = signal(false);
  savingAllergy = signal(false);
  newAllergy = { allergenName: '', category: 'DRUG', severity: 'SEVERE', reactionDescription: '', status: 'ACTIVE' };

  showVitalsModal = signal(false);
  savingVitals = signal(false);
  newVitals = { bloodPressure: '120/80', heartRate: 72, temperature: 36.8, oxygenSaturation: 98 };

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

    this.route.queryParams.subscribe((params) => {
      if (params['tab']) {
        const tab = params['tab'].toLowerCase();
        if (['encounters', 'diagnoses', 'erx', 'prescriptions', 'allergies', 'vitals'].includes(tab)) {
          this.activeTab.set(tab === 'prescriptions' ? 'erx' : (tab as any));
        }
      }
    });

    const active = this.patientContext.activePatient();
    if (active && active.id) {
      this.loadPatientClinicalData(active.id);
    }
  }

  loadPatientClinicalData(patientId: number | string): void {
    const pId = Number(patientId);
    if (!pId) return;

    const active = this.patientContext.activePatient() as any;

    this.apiService.getEncountersByPatient(pId).subscribe({
      next: (res) => this.encounters.set(res || []),
      error: () => this.encounters.set([]),
    });

    this.apiService.getDiagnosesByPatient(pId).subscribe({
      next: (res) => {
        if (res && res.length > 0) {
          this.diagnoses.set(res);
        } else if (active?.diagnoses?.length) {
          this.diagnoses.set(active.diagnoses);
        } else {
          this.diagnoses.set([]);
        }
      },
      error: () => {
        if (active?.diagnoses?.length) this.diagnoses.set(active.diagnoses);
        else this.diagnoses.set([]);
      },
    });

    this.apiService.getPrescriptionsByPatient(pId).subscribe({
      next: (res) => {
        if (res && res.length > 0) {
          this.prescriptions.set(res);
        } else if (active?.prescriptions?.length) {
          this.prescriptions.set(active.prescriptions);
        } else {
          this.prescriptions.set([]);
        }
      },
      error: () => {
        if (active?.prescriptions?.length) this.prescriptions.set(active.prescriptions);
        else this.prescriptions.set([]);
      },
    });

    this.apiService.getAllergiesByPatient(pId).subscribe({
      next: (res) => {
        if (res && res.length > 0) {
          this.allergies.set(res);
        } else if (active?.allergies?.length) {
          this.allergies.set(active.allergies);
        } else {
          this.allergies.set([]);
        }
      },
      error: () => {
        if (active?.allergies?.length) this.allergies.set(active.allergies);
        else this.allergies.set([]);
      },
    });

    this.apiService.getVitalsByPatient(pId).subscribe({
      next: (res) => {
        if (res && res.length > 0) {
          this.vitals.set(res);
        } else if (active?.vitals?.length) {
          this.vitals.set(active.vitals);
        } else {
          this.vitals.set([]);
        }
      },
      error: () => {
        if (active?.vitals?.length) this.vitals.set(active.vitals);
        else this.vitals.set([]);
      },
    });

    this.apiService.getPatientClinicalHistory(pId).subscribe({
      next: (dto: any) => {
        if (dto) {
          if (dto.vitals?.length && this.vitals().length === 0) this.vitals.set(dto.vitals);
          if (dto.prescriptions?.length && this.prescriptions().length === 0) this.prescriptions.set(dto.prescriptions);
          if (dto.allergies?.length && this.allergies().length === 0) this.allergies.set(dto.allergies);
          if (dto.pastIllnesses?.length && this.diagnoses().length === 0) this.diagnoses.set(dto.pastIllnesses);
        }
      },
      error: () => {},
    });
  }

  onPatientSelect(patientId: number | string): void {
    if (!patientId) return;
    this.patientContext.selectPatientById(patientId);
  }

  selectTab(tab: 'encounters' | 'diagnoses' | 'erx' | 'allergies' | 'vitals'): void {
    this.activeTab.set(tab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
    });
  }

  triggerBreakGlass(): void {
    this.isBreakGlassModalOpen.set(true);
  }

  finalizeEncounter(id?: number): void {
    if (!id) return;
    this.apiService.updateEncounter(id, { status: 'FINISHED' }).subscribe({
      next: () => {
        toast.success('Encounter finalized successfully');
        const active = this.patientContext.activePatient();
        if (active?.id) this.loadPatientClinicalData(active.id);
      },
    });
  }

  saveDiagnosis(): void {
    const active = this.patientContext.activePatient();
    if (!active?.id || !this.newDiagnosis.icdCode || !this.newDiagnosis.conditionName || this.savingDiagnosis()) return;

    this.savingDiagnosis.set(true);
    this.apiService
      .createDiagnosis({
        patient: { id: Number(active.id) } as Patient,
        icdCode: this.newDiagnosis.icdCode,
        conditionName: this.newDiagnosis.conditionName,
        status: 'ACTIVE',
      })
      .subscribe({
        next: (saved: any) => {
          this.savingDiagnosis.set(false);
          this.showDiagnosisModal.set(false);
          this.newDiagnosis = { icdCode: '', conditionName: '' };
          toast.success('ICD-10 Diagnosis added');
          if (saved) {
            this.diagnoses.update((list) => [saved, ...list]);
          }
          this.loadPatientClinicalData(active.id!);
        },
        error: () => this.savingDiagnosis.set(false),
      });
  }

  saveErx(): void {
    const active = this.patientContext.activePatient();
    if (!active?.id || !this.newErx.medicationName || !this.newErx.dosage || this.savingErx()) return;

    this.savingErx.set(true);
    this.apiService
      .createPrescription({
        patient: { id: Number(active.id) } as Patient,
        medicationName: this.newErx.medicationName,
        dosage: this.newErx.dosage,
        route: this.newErx.route,
        frequency: this.newErx.frequency,
        instructions: this.newErx.instructions,
        status: 'ACTIVE',
      })
      .subscribe({
        next: (saved: any) => {
          this.savingErx.set(false);
          this.showErxModal.set(false);
          this.newErx = { medicationName: '', dosage: '', route: 'Oral', frequency: 'Twice daily', instructions: '' };
          toast.success('eRx order issued to pharmacy');
          if (saved) {
            this.prescriptions.update((list) => [saved, ...list]);
          }
          this.loadPatientClinicalData(active.id!);
        },
        error: () => this.savingErx.set(false),
      });
  }

  saveAllergy(): void {
    const active = this.patientContext.activePatient();
    if (!active?.id || !this.newAllergy.allergenName || this.savingAllergy()) return;

    this.savingAllergy.set(true);
    this.apiService
      .createAllergy({
        patient: { id: Number(active.id) } as Patient,
        allergenName: this.newAllergy.allergenName,
        category: this.newAllergy.category,
        severity: this.newAllergy.severity,
        reactionDescription: this.newAllergy.reactionDescription,
        status: 'ACTIVE',
      })
      .subscribe({
        next: (saved: any) => {
          this.savingAllergy.set(false);
          this.showAllergyModal.set(false);
          this.newAllergy = { allergenName: '', category: 'DRUG', severity: 'SEVERE', reactionDescription: '', status: 'ACTIVE' };
          toast.success('Allergy record saved');
          if (saved) {
            this.allergies.update((list) => [saved, ...list]);
          }
          this.loadPatientClinicalData(active.id!);
        },
        error: () => this.savingAllergy.set(false),
      });
  }

  saveVitals(): void {
    const active = this.patientContext.activePatient();
    if (!active?.id || this.savingVitals()) return;

    this.savingVitals.set(true);
    this.apiService
      .recordVitals({
        patient: { id: Number(active.id) } as Patient,
        bloodPressure: this.newVitals.bloodPressure,
        heartRate: Number(this.newVitals.heartRate),
        temperature: Number(this.newVitals.temperature),
        oxygenSaturation: Number(this.newVitals.oxygenSaturation),
      })
      .subscribe({
        next: (saved: any) => {
          this.savingVitals.set(false);
          this.showVitalsModal.set(false);
          toast.success('Vitals recorded');
          if (saved) {
            this.vitals.update((list) => [saved, ...list]);
          }
          this.loadPatientClinicalData(active.id!);
        },
        error: () => this.savingVitals.set(false),
      });
  }
}
