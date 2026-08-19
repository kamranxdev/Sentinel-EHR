import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PatientContextService } from '../../core/services/patient-context.service';
import { ApiService } from '../../core/services/api.service';
import { Patient } from '../../core/models/patient.model';
import { Encounter, Diagnosis, Prescription, Allergy, Vitals } from '../../core/models/clinical.model';
import { ImagingOrder, ImagingStudy, ImagingReport, CreateImagingOrderRequest } from '../../core/models/imaging.model';
import { ProcedureOrder, ProcedurePerformance, ProcedureNote, CreateProcedureOrderRequest } from '../../core/models/procedure.model';
import { ClinicalDocument, DocumentVersion, CreateClinicalDocumentRequest } from '../../core/models/document.model';
import { ConsentType, PatientConsent, CreatePatientConsentRequest } from '../../core/models/consent.model';
import { CareTeam, CareTeamMember, AddCareTeamMemberRequest } from '../../core/models/care-team.model';
import { TerminologySearchResult } from '../../core/models/terminology.model';
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
  lucideSearch,
  lucideEye,
  lucideFileCheck,
  lucideScissors,
  lucideFileBadge,
  lucideUserCheck,
  lucideSparkles,
} from '@ng-icons/lucide';

export type PhysicianChartTab =
  | 'encounters'
  | 'diagnoses'
  | 'erx'
  | 'allergies'
  | 'vitals'
  | 'imaging'
  | 'procedures'
  | 'care-team'
  | 'documents'
  | 'consents';

@Component({
  selector: 'app-physician-chart',
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
      lucideSearch,
      lucideEye,
      lucideFileCheck,
      lucideScissors,
      lucideFileBadge,
      lucideUserCheck,
      lucideSparkles,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Physician Clinical Chart Header & Patient Banner -->
      <div class="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Physician Clinical Patient Chart
              <span hlmBadge variant="secondary" class="text-[10px]">Physician EHR Context</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">Comprehensive physician chart for SOAP notes, ICD-10 diagnoses, eRx orders, imaging PACS, surgical procedures, care teams, documents, and informed consents.</p>
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

        <!-- Physician Chart Sub-Navigation Tabs (10 Micro-Subsystems Responsive Multi-Row Grid) -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 p-1.5 bg-muted/40 rounded-xl border border-border">
          <button
            (click)="selectTab('encounters')"
            class="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center"
            [ngClass]="activeTab() === 'encounters' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-background/60'"
          >
            <ng-icon name="lucideStethoscope" size="14" />
            <span class="truncate">Encounters</span>
          </button>

          <button
            (click)="selectTab('diagnoses')"
            class="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center"
            [ngClass]="activeTab() === 'diagnoses' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-background/60'"
          >
            <ng-icon name="lucideListChecks" size="14" />
            <span class="truncate">Problem List</span>
          </button>

          <button
            (click)="selectTab('erx')"
            class="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center"
            [ngClass]="activeTab() === 'erx' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-background/60'"
          >
            <ng-icon name="lucidePill" size="14" />
            <span class="truncate">eRx Pharmacy</span>
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
            (click)="selectTab('vitals')"
            class="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center"
            [ngClass]="activeTab() === 'vitals' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-background/60'"
          >
            <ng-icon name="lucideActivity" size="14" />
            <span class="truncate">Vitals</span>
          </button>

          <button
            (click)="selectTab('imaging')"
            class="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center"
            [ngClass]="activeTab() === 'imaging' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-background/60'"
          >
            <ng-icon name="lucideEye" size="14" />
            <span class="truncate">Imaging / PACS</span>
          </button>

          <button
            (click)="selectTab('procedures')"
            class="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center"
            [ngClass]="activeTab() === 'procedures' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-background/60'"
          >
            <ng-icon name="lucideScissors" size="14" />
            <span class="truncate">Procedures</span>
          </button>

          <button
            (click)="selectTab('care-team')"
            class="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center"
            [ngClass]="activeTab() === 'care-team' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-background/60'"
          >
            <ng-icon name="lucideUsers" size="14" />
            <span class="truncate">Care Team</span>
          </button>

          <button
            (click)="selectTab('documents')"
            class="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center"
            [ngClass]="activeTab() === 'documents' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-background/60'"
          >
            <ng-icon name="lucideFileText" size="14" />
            <span class="truncate">Clinical Docs</span>
          </button>

          <button
            (click)="selectTab('consents')"
            class="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center"
            [ngClass]="activeTab() === 'consents' ? 'bg-primary text-primary-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-background/60'"
          >
            <ng-icon name="lucideFileBadge" size="14" />
            <span class="truncate">Consents</span>
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

      <!-- TAB 2: Problem List (ICD-10 / SNOMED CT) with Terminology Engine -->
      <div *ngIf="activeTab() === 'diagnoses'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucideListChecks" size="18" class="text-primary" />
              Problem List (ICD-10 & SNOMED-CT Coded Conditions)
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Document clinical diagnoses, problem severity, and ICD-10/SNOMED terminology codes with intelligent lookup.</p>
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
            <p class="text-xs text-muted-foreground mt-0.5">Issue eRx medication orders with real-time allergy/interaction safety validation.</p>
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
                  <td colspan="7" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No vitals recorded for this patient.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 6: Imaging & PACS Radiology Subsystem -->
      <div *ngIf="activeTab() === 'imaging'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucideEye" size="18" class="text-indigo-500" />
              Imaging & PACS Radiology Studies
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Order and review CT, MRI, X-Ray, Ultrasound studies, DICOM series, and radiologist reports.</p>
          </div>

          <button hlmBtn variant="default" size="sm" (click)="showImagingModal.set(true)" class="gap-1.5 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
            <ng-icon name="lucidePlus" size="14" /> Order Imaging Study
          </button>
        </div>

        <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div class="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
            <h3 class="text-xs font-semibold text-foreground flex items-center gap-2">
              <ng-icon name="lucideEye" size="14" class="text-indigo-500" />
              Patient Imaging Orders & Studies
            </h3>
            <span class="text-[11px] text-muted-foreground">{{ imagingOrders().length }} orders</span>
          </div>

          <div class="overflow-x-auto">
            <table hlmTable class="w-full text-xs">
              <thead hlmTableHeader>
                <tr hlmTableRow class="bg-muted/50 border-b border-border">
                  <th hlmTableHead class="py-3 px-4 text-left">Modality</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Procedure / Scan</th>
                  <th hlmTableHead class="py-3 px-4 text-left">CPT Code</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Ordered Date</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Status</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Radiology Report</th>
                </tr>
              </thead>
              <tbody hlmTableBody class="divide-y divide-border">
                <tr *ngFor="let ord of imagingOrders()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                  <td hlmTableCell class="py-3 px-4">
                    <span hlmBadge variant="outline" class="font-mono font-bold bg-indigo-500/10 text-indigo-600 border-indigo-200">{{ ord.modality }}</span>
                  </td>
                  <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ ord.procedureName }}</td>
                  <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">{{ ord.cptCode || '71045' }}</td>
                  <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ ord.orderedAt | date:'short' }}</td>
                  <td hlmTableCell class="py-3 px-4">
                    <span hlmBadge [variant]="ord.status === 'COMPLETED' ? 'secondary' : 'default'" class="text-[10px]">{{ ord.status }}</span>
                  </td>
                  <td hlmTableCell class="py-3 px-4 text-muted-foreground max-w-xs truncate">
                    {{ ord.radiologistReport || 'Pending scan acquisition / interpretation' }}
                  </td>
                </tr>
                <tr *ngIf="imagingOrders().length === 0" hlmTableRow>
                  <td colspan="6" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No imaging orders recorded for this patient.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 7: Procedures & Operative Notes -->
      <div *ngIf="activeTab() === 'procedures'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucideScissors" size="18" class="text-rose-500" />
              Surgical & Clinical Procedures
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Order clinical procedures, record surgical performance, and document operative notes.</p>
          </div>

          <button hlmBtn variant="default" size="sm" (click)="showProcedureModal.set(true)" class="gap-1.5 font-semibold text-xs bg-rose-600 hover:bg-rose-700 text-white">
            <ng-icon name="lucidePlus" size="14" /> Order Procedure
          </button>
        </div>

        <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div class="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
            <h3 class="text-xs font-semibold text-foreground flex items-center gap-2">
              <ng-icon name="lucideScissors" size="14" class="text-rose-500" />
              Scheduled & Performed Procedures
            </h3>
            <span class="text-[11px] text-muted-foreground">{{ procedureOrders().length }} procedures</span>
          </div>

          <div class="overflow-x-auto">
            <table hlmTable class="w-full text-xs">
              <thead hlmTableHeader>
                <tr hlmTableRow class="bg-muted/50 border-b border-border">
                  <th hlmTableHead class="py-3 px-4 text-left">Code</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Procedure Name</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Anatomical Site</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Priority</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody hlmTableBody class="divide-y divide-border">
                <tr *ngFor="let p of procedureOrders()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                  <td hlmTableCell class="py-3 px-4 font-mono font-bold"><span hlmBadge variant="outline">{{ p.procedureCode }}</span></td>
                  <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ p.procedureName }}</td>
                  <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ p.bodySite || 'N/A' }}</td>
                  <td hlmTableCell class="py-3 px-4">
                    <span hlmBadge [variant]="p.priority === 'EMERGENCY' ? 'destructive' : 'secondary'" class="text-[10px]">{{ p.priority || 'ROUTINE' }}</span>
                  </td>
                  <td hlmTableCell class="py-3 px-4"><span hlmBadge variant="outline" class="text-[10px]">{{ p.status }}</span></td>
                </tr>
                <tr *ngIf="procedureOrders().length === 0" hlmTableRow>
                  <td colspan="5" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No procedures ordered for this patient.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 8: Multidisciplinary Care Team -->
      <div *ngIf="activeTab() === 'care-team'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucideUsers" size="18" class="text-cyan-500" />
              Multidisciplinary Patient Care Team
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Assign and coordinate primary attending physicians, consulting specialists, and primary care nurses.</p>
          </div>

          <button hlmBtn variant="default" size="sm" (click)="showCareTeamModal.set(true)" class="gap-1.5 font-semibold text-xs bg-cyan-600 hover:bg-cyan-700 text-white">
            <ng-icon name="lucideUserPlus" size="14" /> Add Team Member
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div *ngFor="let m of careTeamMembers()" class="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-full bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold text-sm">
                  {{ m.fullName ? m.fullName[0] : 'Dr' }}
                </div>
                <div>
                  <h4 class="font-bold text-foreground text-xs">{{ m.fullName || m.username }}</h4>
                  <p class="text-[11px] text-muted-foreground">{{ m.specialty || 'Clinical Medicine' }}</p>
                </div>
              </div>
              <span hlmBadge variant="outline" class="text-[10px]">{{ m.role }}</span>
            </div>
            <div class="text-[11px] text-muted-foreground pt-2 border-t border-border flex justify-between items-center">
              <span>Attending Role</span>
              <span class="text-emerald-600 font-medium">Active on Case</span>
            </div>
          </div>

          <div *ngIf="careTeamMembers().length === 0" class="col-span-3 rounded-xl border border-border bg-card p-12 text-center text-muted-foreground text-xs">
            No care team members assigned yet. Click "Add Team Member" to assign clinicians.
          </div>
        </div>
      </div>

      <!-- TAB 9: Clinical Documents & Progress Notes -->
      <div *ngIf="activeTab() === 'documents'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucideFileText" size="18" class="text-emerald-600" />
              Clinical Documents, Progress Notes & Discharge Summaries
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Author and digitally finalize consultation notes, H&P, and discharge summaries with audit versioning.</p>
          </div>

          <button hlmBtn variant="default" size="sm" (click)="showDocModal.set(true)" class="gap-1.5 font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
            <ng-icon name="lucidePlus" size="14" /> Author New Document
          </button>
        </div>

        <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div class="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
            <h3 class="text-xs font-semibold text-foreground flex items-center gap-2">
              <ng-icon name="lucideFileText" size="14" class="text-emerald-600" />
              Document Archive
            </h3>
            <span class="text-[11px] text-muted-foreground">{{ clinicalDocuments().length }} documents</span>
          </div>

          <div class="overflow-x-auto">
            <table hlmTable class="w-full text-xs">
              <thead hlmTableHeader>
                <tr hlmTableRow class="bg-muted/50 border-b border-border">
                  <th hlmTableHead class="py-3 px-4 text-left">Document Type</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Title</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Author</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Created At</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Status</th>
                  <th hlmTableHead class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody hlmTableBody class="divide-y divide-border">
                <tr *ngFor="let doc of clinicalDocuments()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                  <td hlmTableCell class="py-3 px-4"><span hlmBadge variant="outline">{{ doc.documentType }}</span></td>
                  <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ doc.title }}</td>
                  <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ doc.authorUsername }}</td>
                  <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ doc.createdAt | date:'short' }}</td>
                  <td hlmTableCell class="py-3 px-4">
                    <span hlmBadge [variant]="doc.status === 'FINAL' ? 'secondary' : 'default'" class="text-[10px]">{{ doc.status }}</span>
                  </td>
                  <td hlmTableCell class="py-3 px-4 text-right">
                    <button *ngIf="doc.status === 'DRAFT'" hlmBtn variant="outline" size="sm" (click)="finalizeDoc(doc.id)" class="h-7 text-[11px] gap-1">
                      <ng-icon name="lucideFileCheck" size="12" /> Finalize & Sign
                    </button>
                  </td>
                </tr>
                <tr *ngIf="clinicalDocuments().length === 0" hlmTableRow>
                  <td colspan="6" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No clinical documents authored yet.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 10: Informed Consents & Directives -->
      <div *ngIf="activeTab() === 'consents'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucideFileBadge" size="18" class="text-purple-500" />
              Informed Consents & Advance Directives
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Manage treatment consents, procedure agreements, ABDM health data sharing, and revocations.</p>
          </div>

          <button hlmBtn variant="default" size="sm" (click)="showConsentModal.set(true)" class="gap-1.5 font-semibold text-xs bg-purple-600 hover:bg-purple-700 text-white">
            <ng-icon name="lucidePlus" size="14" /> Execute New Consent
          </button>
        </div>

        <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div class="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
            <h3 class="text-xs font-semibold text-foreground flex items-center gap-2">
              <ng-icon name="lucideFileBadge" size="14" class="text-purple-500" />
              Active Patient Consent Agreements
            </h3>
            <span class="text-[11px] text-muted-foreground">{{ patientConsents().length }} records</span>
          </div>

          <div class="overflow-x-auto">
            <table hlmTable class="w-full text-xs">
              <thead hlmTableHeader>
                <tr hlmTableRow class="bg-muted/50 border-b border-border">
                  <th hlmTableHead class="py-3 px-4 text-left">Consent ID</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Type / Scope</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Signed By</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Valid From</th>
                  <th hlmTableHead class="py-3 px-4 text-left">Status</th>
                  <th hlmTableHead class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody hlmTableBody class="divide-y divide-border">
                <tr *ngFor="let c of patientConsents()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                  <td hlmTableCell class="py-3 px-4 font-mono font-bold">#CNS-{{ c.id }}</td>
                  <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ c.consentTypeName || 'General Clinical Treatment' }}</td>
                  <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ c.signedByPatientName || activePatient()?.fullName }}</td>
                  <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ c.validFrom | date:'shortDate' }}</td>
                  <td hlmTableCell class="py-3 px-4">
                    <span hlmBadge [variant]="c.status === 'ACTIVE' ? 'secondary' : 'destructive'" class="text-[10px]">{{ c.status }}</span>
                  </td>
                  <td hlmTableCell class="py-3 px-4 text-right">
                    <button *ngIf="c.status === 'ACTIVE'" hlmBtn variant="outline" size="sm" (click)="revokeConsent(c.id)" class="h-7 text-[11px] text-destructive">
                      Revoke Consent
                    </button>
                  </td>
                </tr>
                <tr *ngIf="patientConsents().length === 0" hlmTableRow>
                  <td colspan="6" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No active consent agreements documented.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- MODAL 1: Add Diagnosis Modal with Terminology Lookup -->
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
              <label class="font-medium text-foreground block mb-1">Search Terminology / ICD-10</label>
              <div class="flex gap-2">
                <input type="text" [(ngModel)]="termSearchQuery" (keyup.enter)="searchMedicalCodes()" placeholder="Search condition name or code..." class="w-full p-2 rounded-md border border-input bg-background" />
                <button hlmBtn variant="outline" size="sm" (click)="searchMedicalCodes()" class="shrink-0">
                  <ng-icon name="lucideSearch" size="14" />
                </button>
              </div>
              <div *ngIf="termResults().length > 0" class="mt-2 max-h-32 overflow-y-auto border border-border rounded-md divide-y divide-border bg-muted/30">
                <div *ngFor="let r of termResults()" (click)="selectTerm(r)" class="p-2 hover:bg-primary/10 cursor-pointer text-[11px] flex justify-between">
                  <span class="font-bold font-mono">{{ r.code }}</span>
                  <span class="text-foreground truncate max-w-[200px]">{{ r.display }}</span>
                </div>
              </div>
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">ICD-10 Code *</label>
              <input type="text" [(ngModel)]="newDiagnosis.icdCode" placeholder="e.g. E11.9, I10" class="w-full p-2 rounded-md border border-input bg-background font-mono" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Condition Description *</label>
              <input type="text" [(ngModel)]="newDiagnosis.conditionName" placeholder="e.g. Type 2 Diabetes Mellitus" class="w-full p-2 rounded-md border border-input bg-background" />
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

      <!-- MODAL 2: Issue eRx Modal -->
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

      <!-- MODAL 3: Document Allergy Modal -->
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

      <!-- MODAL 4: Log Vitals Modal -->
      <div *ngIf="showVitalsModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
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
              <label class="font-medium text-foreground block mb-1">Systolic BP (mmHg)</label>
              <input type="number" [(ngModel)]="newVitals.systolicBp" placeholder="120" class="w-full p-2 rounded-md border border-input bg-background font-mono" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Diastolic BP (mmHg)</label>
              <input type="number" [(ngModel)]="newVitals.diastolicBp" placeholder="80" class="w-full p-2 rounded-md border border-input bg-background font-mono" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Heart Rate (bpm)</label>
              <input type="number" [(ngModel)]="newVitals.heartRate" class="w-full p-2 rounded-md border border-input bg-background font-mono" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">SpO2 (%)</label>
              <input type="number" [(ngModel)]="newVitals.oxygenSaturation" class="w-full p-2 rounded-md border border-input bg-background font-mono" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Temperature (°C)</label>
              <input type="number" step="0.1" [(ngModel)]="newVitals.temperature" class="w-full p-2 rounded-md border border-input bg-background font-mono" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Blood Sugar (mg/dL)</label>
              <input type="number" [(ngModel)]="newVitals.bloodGlucose" placeholder="95" class="w-full p-2 rounded-md border border-input bg-background font-mono" />
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

      <!-- MODAL 5: Order Imaging Study Modal -->
      <div *ngIf="showImagingModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideEye" size="16" class="text-indigo-500" />
              Order Imaging Study (DICOM / PACS)
            </h3>
            <button hlmBtn variant="ghost" size="sm" (click)="showImagingModal.set(false)" class="size-7 p-0">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="font-medium text-foreground block mb-1">Modality *</label>
              <select [(ngModel)]="newImaging.modality" class="w-full p-2 rounded-md border border-input bg-background">
                <option value="XR">X-Ray (Plain Radiography)</option>
                <option value="CT">Computed Tomography (CT)</option>
                <option value="MRI">Magnetic Resonance Imaging (MRI)</option>
                <option value="US">Ultrasound (US)</option>
                <option value="PET">Positron Emission Tomography (PET)</option>
              </select>
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Procedure Name *</label>
              <input type="text" [(ngModel)]="newImaging.procedureName" placeholder="e.g. Chest 2-View, Brain with Contrast" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">CPT Code</label>
              <input type="text" [(ngModel)]="newImaging.cptCode" placeholder="e.g. 71046, 70553" class="w-full p-2 rounded-md border border-input bg-background font-mono" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Clinical Indication / Notes</label>
              <textarea [(ngModel)]="newImaging.clinicalIndication" placeholder="e.g. Rule out pneumonia or effusion..." class="w-full p-2 rounded-md border border-input bg-background h-16"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="showImagingModal.set(false)">Cancel</button>
            <button hlmBtn variant="default" size="sm" [disabled]="savingImaging() || !newImaging.procedureName" (click)="saveImagingOrder()" class="bg-indigo-600 hover:bg-indigo-700 text-white">
              <ng-icon name="lucideSave" size="14" class="mr-1" /> {{ savingImaging() ? 'Submitting...' : 'Submit Imaging Order' }}
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL 6: Order Procedure Modal -->
      <div *ngIf="showProcedureModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideScissors" size="16" class="text-rose-500" />
              Order Surgical / Clinical Procedure
            </h3>
            <button hlmBtn variant="ghost" size="sm" (click)="showProcedureModal.set(false)" class="size-7 p-0">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="font-medium text-foreground block mb-1">Procedure Code (CPT/SNOMED) *</label>
              <input type="text" [(ngModel)]="newProcedure.procedureCode" placeholder="e.g. 47562, 43239" class="w-full p-2 rounded-md border border-input bg-background font-mono" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Procedure Name *</label>
              <input type="text" [(ngModel)]="newProcedure.procedureName" placeholder="e.g. Laparoscopic Cholecystectomy, Diagnostic EGD" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Anatomical Body Site</label>
              <input type="text" [(ngModel)]="newProcedure.bodySite" placeholder="e.g. Right Upper Quadrant, Gastrointestinal" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Priority</label>
              <select [(ngModel)]="newProcedure.priority" class="w-full p-2 rounded-md border border-input bg-background">
                <option value="ROUTINE">ROUTINE (Elective)</option>
                <option value="URGENT">URGENT</option>
                <option value="EMERGENCY">EMERGENCY (STAT)</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="showProcedureModal.set(false)">Cancel</button>
            <button hlmBtn variant="default" size="sm" [disabled]="savingProcedure() || !newProcedure.procedureName" (click)="saveProcedureOrder()" class="bg-rose-600 hover:bg-rose-700 text-white">
              <ng-icon name="lucideSave" size="14" class="mr-1" /> {{ savingProcedure() ? 'Submitting...' : 'Submit Procedure Order' }}
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL 7: Author Clinical Document Modal -->
      <div *ngIf="showDocModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-xl rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideFileText" size="16" class="text-emerald-600" />
              Author Clinical Document / Note
            </h3>
            <button hlmBtn variant="ghost" size="sm" (click)="showDocModal.set(false)" class="size-7 p-0">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="font-medium text-foreground block mb-1">Document Type *</label>
              <select [(ngModel)]="newDoc.documentType" class="w-full p-2 rounded-md border border-input bg-background">
                <option value="PROGRESS_NOTE">SOAP Progress Note</option>
                <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                <option value="CONSULT_NOTE">Specialist Consultation Note</option>
                <option value="OPERATIVE_REPORT">Operative / Surgical Report</option>
                <option value="HISTORY_PHYSICAL">Comprehensive H&P</option>
              </select>
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Document Title *</label>
              <input type="text" [(ngModel)]="newDoc.title" placeholder="e.g. Inpatient Day 2 Progress Note" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Clinical Note Content *</label>
              <textarea [(ngModel)]="newDoc.content" placeholder="Document subjective findings, objective labs/vitals, clinical assessment, and treatment plan..." class="w-full p-2 rounded-md border border-input bg-background h-36"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="showDocModal.set(false)">Cancel</button>
            <button hlmBtn variant="default" size="sm" [disabled]="savingDoc() || !newDoc.title || !newDoc.content" (click)="saveClinicalDoc()" class="bg-emerald-600 hover:bg-emerald-700 text-white">
              <ng-icon name="lucideSave" size="14" class="mr-1" /> {{ savingDoc() ? 'Saving...' : 'Save Document' }}
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL 8: Add Care Team Member Modal -->
      <div *ngIf="showCareTeamModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideUserPlus" size="16" class="text-cyan-600" />
              Assign Care Team Member
            </h3>
            <button hlmBtn variant="ghost" size="sm" (click)="showCareTeamModal.set(false)" class="size-7 p-0">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="font-medium text-foreground block mb-1">Clinician / Practitioner Username *</label>
              <input type="text" [(ngModel)]="newCareMember.username" placeholder="e.g. dr_smith, nurse_sarah" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Full Name</label>
              <input type="text" [(ngModel)]="newCareMember.fullName" placeholder="e.g. Dr. Jane Smith, MD" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Care Team Role *</label>
              <select [(ngModel)]="newCareMember.role" class="w-full p-2 rounded-md border border-input bg-background">
                <option value="PRIMARY_ATTENDING">Primary Attending Physician</option>
                <option value="CONSULTING_PHYSICIAN">Consulting Specialist</option>
                <option value="PRIMARY_NURSE">Primary Ward Nurse</option>
                <option value="CASE_MANAGER">Case Manager</option>
                <option value="PHARMACIST">Clinical Pharmacist</option>
              </select>
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Clinical Specialty</label>
              <input type="text" [(ngModel)]="newCareMember.specialty" placeholder="e.g. Cardiology, Critical Care, Nephrology" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="showCareTeamModal.set(false)">Cancel</button>
            <button hlmBtn variant="default" size="sm" [disabled]="savingCareMember() || !newCareMember.username" (click)="saveCareMember()" class="bg-cyan-600 hover:bg-cyan-700 text-white">
              <ng-icon name="lucideSave" size="14" class="mr-1" /> {{ savingCareMember() ? 'Assigning...' : 'Assign Member' }}
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL 9: Execute Informed Consent Modal -->
      <div *ngIf="showConsentModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideFileBadge" size="16" class="text-purple-600" />
              Execute Informed Patient Consent
            </h3>
            <button hlmBtn variant="ghost" size="sm" (click)="showConsentModal.set(false)" class="size-7 p-0">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="font-medium text-foreground block mb-1">Consent Agreement Type *</label>
              <select [(ngModel)]="newConsent.consentTypeId" class="w-full p-2 rounded-md border border-input bg-background">
                <option [value]="1">General Medical & Clinical Treatment Consent</option>
                <option [value]="2">Informed Surgical & Anesthesia Consent</option>
                <option [value]="3">ABDM / National Health Data Sharing Consent</option>
                <option [value]="4">Clinical Research & Diagnostic Tissue Consent</option>
              </select>
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Patient Signatory Name *</label>
              <input type="text" [(ngModel)]="newConsent.signedByPatientName" placeholder="Patient legal name" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Witness / Clinician Name</label>
              <input type="text" [(ngModel)]="newConsent.witnessName" placeholder="Attending clinician or witness" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="showConsentModal.set(false)">Cancel</button>
            <button hlmBtn variant="default" size="sm" [disabled]="savingConsent() || !newConsent.signedByPatientName" (click)="savePatientConsent()" class="bg-purple-600 hover:bg-purple-700 text-white">
              <ng-icon name="lucideSave" size="14" class="mr-1" /> {{ savingConsent() ? 'Signing...' : 'Execute Consent' }}
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
export class PhysicianChartComponent implements OnInit {
  activeTab = signal<PhysicianChartTab>('encounters');
  patients = signal<Patient[]>([]);

  // Clinical data signals across all subsystems
  encounters = signal<Encounter[]>([]);
  diagnoses = signal<Diagnosis[]>([]);
  prescriptions = signal<Prescription[]>([]);
  allergies = signal<Allergy[]>([]);
  vitals = signal<Vitals[]>([]);
  imagingOrders = signal<ImagingOrder[]>([]);
  procedureOrders = signal<ProcedureOrder[]>([]);
  careTeamMembers = signal<CareTeamMember[]>([]);
  clinicalDocuments = signal<ClinicalDocument[]>([]);
  patientConsents = signal<PatientConsent[]>([]);

  // Terminology search
  termSearchQuery = '';
  termResults = signal<TerminologySearchResult[]>([]);

  // Modals state
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
  newVitals = {
    systolicBp: 120,
    diastolicBp: 80,
    heartRate: 72,
    temperature: 36.8,
    oxygenSaturation: 98,
    bloodGlucose: 95,
    weightKg: 70.0,
    heightCm: 175.0,
    recordedAt: '',
  };

  showImagingModal = signal(false);
  savingImaging = signal(false);
  newImaging = { modality: 'XR', procedureName: '', cptCode: '', clinicalIndication: '', priority: 'ROUTINE' };

  showProcedureModal = signal(false);
  savingProcedure = signal(false);
  newProcedure = { procedureCode: '', procedureName: '', bodySite: '', priority: 'ROUTINE' };

  showDocModal = signal(false);
  savingDoc = signal(false);
  newDoc = { documentType: 'PROGRESS_NOTE', title: '', content: '' };

  showCareTeamModal = signal(false);
  savingCareMember = signal(false);
  newCareMember = { username: '', fullName: '', role: 'PRIMARY_ATTENDING', specialty: 'General Practice' };

  showConsentModal = signal(false);
  savingConsent = signal(false);
  newConsent = { consentTypeId: 1, signedByPatientName: '', witnessName: '' };

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
        if (['encounters', 'diagnoses', 'erx', 'prescriptions', 'allergies', 'vitals', 'imaging', 'procedures', 'care-team', 'documents', 'consents'].includes(tab)) {
          this.activeTab.set(tab === 'prescriptions' ? 'erx' : (tab as any));
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

    // Encounters
    this.apiService.getEncountersByPatient(patientId).subscribe({
      next: (res) => this.encounters.set(res || []),
      error: () => this.encounters.set([]),
    });

    // Diagnoses / Problems
    this.apiService.getDiagnosesByPatient(patientId).subscribe({
      next: (res) => this.diagnoses.set(res || []),
      error: () => this.diagnoses.set([]),
    });

    // eRx Prescriptions
    this.apiService.getPrescriptionsByPatient(patientId).subscribe({
      next: (res) => this.prescriptions.set(res || []),
      error: () => this.prescriptions.set([]),
    });

    // Allergies
    this.apiService.getAllergiesByPatient(patientId).subscribe({
      next: (res) => this.allergies.set(res || []),
      error: () => this.allergies.set([]),
    });

    // Bedside Vitals
    this.apiService.getVitalsByPatient(patientId).subscribe({
      next: (res) => this.vitals.set(res || []),
      error: () => this.vitals.set([]),
    });

    // Imaging Orders & PACS
    this.apiService.getImagingOrdersByPatient(patientId).subscribe({
      next: (res) => this.imagingOrders.set(res || []),
      error: () => this.imagingOrders.set([]),
    });

    // Procedure Orders
    this.apiService.getProcedureOrdersByPatient(patientId).subscribe({
      next: (res) => this.procedureOrders.set(res || []),
      error: () => this.procedureOrders.set([]),
    });

    // Clinical Documents
    this.apiService.getPatientDocuments(patientId).subscribe({
      next: (res) => this.clinicalDocuments.set(res || []),
      error: () => this.clinicalDocuments.set([]),
    });

    // Patient Consents
    this.apiService.getPatientConsents(patientId).subscribe({
      next: (res) => this.patientConsents.set(res || []),
      error: () => this.patientConsents.set([]),
    });

    // Care Team for primary active encounter
    this.apiService.getEncountersByPatient(patientId).subscribe((encs) => {
      if (encs && encs.length > 0 && encs[0].id) {
        this.apiService.getEncounterCareTeam(encs[0].id).subscribe((team) => {
          if (team && team.members) {
            this.careTeamMembers.set(team.members);
          }
        });
      }
    });
  }

  onPatientSelect(patientId: string): void {
    if (!patientId) return;
    this.patientContext.selectPatientById(patientId);
  }

  selectTab(tab: PhysicianChartTab): void {
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

  finalizeEncounter(id?: string): void {
    if (!id) return;
    this.apiService.updateEncounter(id, { status: 'FINISHED' }).subscribe({
      next: () => {
        toast.success('Encounter finalized successfully');
        const active = this.patientContext.activePatient();
        if (active?.id) this.loadPatientClinicalData(active.id);
      },
    });
  }

  searchMedicalCodes(): void {
    if (!this.termSearchQuery.trim()) return;
    this.apiService.searchTerminology(this.termSearchQuery).subscribe({
      next: (res: TerminologySearchResult[]) => this.termResults.set(res || []),
      error: () => this.termResults.set([]),
    });
  }

  selectTerm(term: TerminologySearchResult): void {
    this.newDiagnosis.icdCode = term.code;
    this.newDiagnosis.conditionName = term.display;
    this.termResults.set([]);
  }

  saveDiagnosis(): void {
    const active = this.patientContext.activePatient();
    if (!active?.id || !this.newDiagnosis.icdCode || !this.newDiagnosis.conditionName || this.savingDiagnosis()) return;

    this.apiService
      .createDiagnosis({
        patient: { id: active.id } as Patient,
        icdCode: this.newDiagnosis.icdCode,
        conditionName: this.newDiagnosis.conditionName,
        status: 'ACTIVE',
      })
      .subscribe({
        next: (saved: any) => {
          this.savingDiagnosis.set(false);
          this.showDiagnosisModal.set(false);
          this.newDiagnosis = { icdCode: '', conditionName: '' };
          toast.success('ICD-10 Diagnosis added to Problem List');
          if (saved) this.diagnoses.update((list) => [saved, ...list]);
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
        patient: { id: active.id } as Patient,
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
          if (saved) this.prescriptions.update((list) => [saved, ...list]);
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
        patient: { id: active.id } as Patient,
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
          if (saved) this.allergies.update((list) => [saved, ...list]);
          this.loadPatientClinicalData(active.id!);
        },
        error: () => this.savingAllergy.set(false),
      });
  }

  saveVitals(): void {
    const active = this.patientContext.activePatient();
    if (!active?.id || this.savingVitals()) return;

    this.savingVitals.set(true);
    const weight = this.newVitals.weightKg ? Number(this.newVitals.weightKg) : undefined;
    const height = this.newVitals.heightCm ? Number(this.newVitals.heightCm) : undefined;
    let bmiVal: number | undefined = undefined;
    if (weight && height && height > 0) {
      const hM = height / 100.0;
      bmiVal = Math.round((weight / (hM * hM)) * 10) / 10;
    }

    this.apiService
      .recordVitals({
        patient: { id: active.id } as Patient,
        systolicBp: this.newVitals.systolicBp ? Number(this.newVitals.systolicBp) : undefined,
        diastolicBp: this.newVitals.diastolicBp ? Number(this.newVitals.diastolicBp) : undefined,
        heartRate: this.newVitals.heartRate ? Number(this.newVitals.heartRate) : undefined,
        temperature: this.newVitals.temperature ? Number(this.newVitals.temperature) : undefined,
        oxygenSaturation: this.newVitals.oxygenSaturation ? Number(this.newVitals.oxygenSaturation) : undefined,
        bloodGlucose: this.newVitals.bloodGlucose ? Number(this.newVitals.bloodGlucose) : undefined,
        weightKg: weight,
        heightCm: height,
        bmi: bmiVal,
      })
      .subscribe({
        next: (saved: any) => {
          this.savingVitals.set(false);
          this.showVitalsModal.set(false);
          toast.success('Vitals recorded');
          if (saved) this.vitals.update((list) => [saved, ...list]);
          this.loadPatientClinicalData(active.id!);
        },
        error: () => this.savingVitals.set(false),
      });
  }

  saveImagingOrder(): void {
    const active = this.patientContext.activePatient();
    if (!active?.id || !this.newImaging.procedureName || this.savingImaging()) return;

    this.savingImaging.set(true);
    this.apiService.getEncountersByPatient(active.id).subscribe((encs) => {
      const encId = encs.length > 0 ? encs[0].id : null;
      if (!encId) {
        toast.error('Active encounter required to order imaging study');
        this.savingImaging.set(false);
        return;
      }

      this.apiService
        .createImagingOrder(encId, {
          modality: this.newImaging.modality,
          procedureName: this.newImaging.procedureName,
          cptCode: this.newImaging.cptCode,
          clinicalIndication: this.newImaging.clinicalIndication,
          priority: this.newImaging.priority,
        })
        .subscribe({
          next: (ord) => {
            this.savingImaging.set(false);
            this.showImagingModal.set(false);
            this.newImaging = { modality: 'XR', procedureName: '', cptCode: '', clinicalIndication: '', priority: 'ROUTINE' };
            toast.success('Imaging study ordered and dispatched to PACS');
            if (ord) this.imagingOrders.update((list) => [ord, ...list]);
          },
          error: () => this.savingImaging.set(false),
        });
    });
  }

  saveProcedureOrder(): void {
    const active = this.patientContext.activePatient();
    if (!active?.id || !this.newProcedure.procedureName || this.savingProcedure()) return;

    this.savingProcedure.set(true);
    this.apiService.getEncountersByPatient(active.id).subscribe((encs) => {
      const encId = encs.length > 0 ? encs[0].id : null;
      if (!encId) {
        toast.error('Active encounter required to order procedure');
        this.savingProcedure.set(false);
        return;
      }

      this.apiService
        .createProcedureOrder(encId, {
          procedureCode: this.newProcedure.procedureCode || 'PROC-001',
          procedureName: this.newProcedure.procedureName,
          bodySite: this.newProcedure.bodySite,
          priority: this.newProcedure.priority,
        })
        .subscribe({
          next: (proc) => {
            this.savingProcedure.set(false);
            this.showProcedureModal.set(false);
            this.newProcedure = { procedureCode: '', procedureName: '', bodySite: '', priority: 'ROUTINE' };
            toast.success('Procedure order submitted to surgical schedule');
            if (proc) this.procedureOrders.update((list) => [proc, ...list]);
          },
          error: () => this.savingProcedure.set(false),
        });
    });
  }

  saveClinicalDoc(): void {
    const active = this.patientContext.activePatient();
    if (!active?.id || !this.newDoc.title || !this.newDoc.content || this.savingDoc()) return;

    this.savingDoc.set(true);
    this.apiService.getEncountersByPatient(active.id).subscribe((encs) => {
      const encId = encs.length > 0 ? encs[0].id : null;
      if (!encId) {
        toast.error('Active encounter required to file clinical document');
        this.savingDoc.set(false);
        return;
      }

      this.apiService
        .createClinicalDocument(encId, {
          documentType: this.newDoc.documentType,
          title: this.newDoc.title,
          content: this.newDoc.content,
        })
        .subscribe({
          next: (doc) => {
            this.savingDoc.set(false);
            this.showDocModal.set(false);
            this.newDoc = { documentType: 'PROGRESS_NOTE', title: '', content: '' };
            toast.success('Clinical document saved to patient chart');
            if (doc) this.clinicalDocuments.update((list) => [doc, ...list]);
          },
          error: () => this.savingDoc.set(false),
        });
    });
  }

  finalizeDoc(docId: number | string): void {
    this.apiService.finalizeClinicalDocument(docId).subscribe({
      next: (doc) => {
        toast.success('Document finalized and cryptographically signed');
        this.clinicalDocuments.update((list) => list.map((d) => (d.id === docId ? { ...d, status: 'FINAL' } : d)));
      },
    });
  }

  saveCareMember(): void {
    const active = this.patientContext.activePatient();
    if (!active?.id || !this.newCareMember.username || this.savingCareMember()) return;

    this.savingCareMember.set(true);
    this.apiService.getEncountersByPatient(active.id).subscribe((encs) => {
      const encId = encs.length > 0 ? encs[0].id : null;
      if (!encId) {
        toast.error('Active encounter required to manage care team');
        this.savingCareMember.set(false);
        return;
      }

      this.apiService.getEncounterCareTeam(encId).subscribe((team) => {
        const teamId = team?.id || 1;
        this.apiService
          .addCareTeamMember(teamId, {
            username: this.newCareMember.username,
            fullName: this.newCareMember.fullName,
            role: this.newCareMember.role,
            specialty: this.newCareMember.specialty,
          })
          .subscribe({
            next: (member) => {
              this.savingCareMember.set(false);
              this.showCareTeamModal.set(false);
              this.newCareMember = { username: '', fullName: '', role: 'PRIMARY_ATTENDING', specialty: 'General Practice' };
              toast.success('Care team member assigned');
              if (member) this.careTeamMembers.update((list) => [member, ...list]);
            },
            error: () => this.savingCareMember.set(false),
          });
      });
    });
  }

  savePatientConsent(): void {
    const active = this.patientContext.activePatient();
    if (!active?.id || !this.newConsent.signedByPatientName || this.savingConsent()) return;

    this.savingConsent.set(true);
    this.apiService
      .createPatientConsent(active.id, {
        consentTypeId: this.newConsent.consentTypeId,
        signedByPatientName: this.newConsent.signedByPatientName,
        witnessName: this.newConsent.witnessName,
      })
      .subscribe({
        next: (c) => {
          this.savingConsent.set(false);
          this.showConsentModal.set(false);
          this.newConsent = { consentTypeId: 1, signedByPatientName: '', witnessName: '' };
          toast.success('Informed consent agreement signed and recorded');
          if (c) this.patientConsents.update((list) => [c, ...list]);
        },
        error: () => this.savingConsent.set(false),
      });
  }

  revokeConsent(consentId: number | string): void {
    this.apiService.revokePatientConsent(consentId, 'Revoked by clinician upon patient request').subscribe({
      next: () => {
        toast.success('Consent revoked');
        this.patientConsents.update((list) => list.map((c) => (c.id === consentId ? { ...c, status: 'REVOKED' } : c)));
      },
    });
  }
}
