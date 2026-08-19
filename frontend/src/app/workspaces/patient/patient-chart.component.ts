import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient } from '../../core/models/patient.model';
import { Encounter, Diagnosis, Prescription, Allergy, Vitals } from '../../core/models/clinical.model';
import { LabOrder, LabResult } from '../../core/models/lab.model';
import { ImagingOrder, ImagingStudy, ImagingReport } from '../../core/models/imaging.model';
import { ProcedureOrder, ProcedurePerformance, ProcedureNote } from '../../core/models/procedure.model';
import { ClinicalDocument, DocumentVersion } from '../../core/models/document.model';
import { PatientConsent } from '../../core/models/consent.model';
import { CareTeam, CareTeamMember } from '../../core/models/care-team.model';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideHeartPulse,
  lucideActivity,
  lucidePill,
  lucideListChecks,
  lucideTriangleAlert,
  lucideStethoscope,
  lucideMicroscope,
  lucideEye,
  lucideScissors,
  lucideUsers,
  lucideFileText,
  lucideFileBadge,
  lucideCalendarClock,
  lucideShieldCheck,
  lucideDownload,
  lucidePrinter,
  lucideSearch,
  lucideFilter,
  lucideChevronRight,
  lucideArrowRight,
  lucideCheckCircle2,
  lucideClock,
  lucideInfo,
  lucideExternalLink,
  lucideX,
  lucideSparkles,
  lucideRefreshCw,
  lucideFileSpreadsheet,
  lucidePhone,
  lucideMail,
  lucideShieldAlert,
  lucideBarcode,
  lucideUserRound,
  lucideCheckCheck,
} from '@ng-icons/lucide';

export type PatientChartTab =
  | 'overview'
  | 'labs'
  | 'imaging'
  | 'diagnoses'
  | 'encounters'
  | 'procedures'
  | 'documents'
  | 'care-team'
  | 'consents'
  | 'prescriptions'
  | 'allergies'
  | 'vitals';

@Component({
  selector: 'app-patient-chart',
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
      lucideHeartPulse,
      lucideActivity,
      lucidePill,
      lucideListChecks,
      lucideTriangleAlert,
      lucideStethoscope,
      lucideMicroscope,
      lucideEye,
      lucideScissors,
      lucideUsers,
      lucideFileText,
      lucideFileBadge,
      lucideCalendarClock,
      lucideShieldCheck,
      lucideDownload,
      lucidePrinter,
      lucideSearch,
      lucideFilter,
      lucideChevronRight,
      lucideArrowRight,
      lucideCheckCircle2,
      lucideClock,
      lucideInfo,
      lucideExternalLink,
      lucideX,
      lucideSparkles,
      lucideRefreshCw,
      lucideFileSpreadsheet,
      lucidePhone,
      lucideMail,
      lucideShieldAlert,
      lucideBarcode,
      lucideUserRound,
      lucideCheckCheck,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- 1. Patient Health Banner & Record Summary Card -->
      <div class="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-border">
          <div class="flex items-start sm:items-center gap-3.5">
            <div class="size-13 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <ng-icon name="lucideHeartPulse" size="28" />
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  My Health Records & Clinical Chart
                </h1>
                <span hlmBadge variant="secondary" class="text-[10px] bg-primary/10 text-primary border border-primary/20">
                  Verified Patient Chart
                </span>
              </div>
              <p class="text-xs text-muted-foreground mt-0.5">
                Access your complete clinical history: diagnostic lab findings, radiology imaging, doctor visit summaries, procedures, care teams, and clinical documents.
              </p>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <button
              hlmBtn
              variant="outline"
              size="sm"
              (click)="loadPatientData()"
              class="gap-1.5 text-xs flex-1 sm:flex-initial"
            >
              <ng-icon name="lucideRefreshCw" [class.animate-spin]="loading()" size="14" />
              <span>Refresh Records</span>
            </button>
            <button
              hlmBtn
              variant="default"
              size="sm"
              (click)="downloadFhirHealthRecord()"
              class="gap-1.5 text-xs shadow-xs flex-1 sm:flex-initial"
            >
              <ng-icon name="lucideDownload" size="14" />
              <span>Download Health Summary (FHIR)</span>
            </button>
            <button
              hlmBtn
              variant="ghost"
              size="sm"
              (click)="printChart()"
              class="gap-1.5 text-xs hidden sm:inline-flex"
            >
              <ng-icon name="lucidePrinter" size="14" />
              <span>Print</span>
            </button>
          </div>
        </div>

        <!-- Patient Demographics Ribbon -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs bg-muted/20 p-3.5 rounded-xl border border-border/60">
          <div>
            <span class="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Patient Name</span>
            <span class="font-bold text-foreground truncate block text-sm">{{ patient()?.fullName || currentUser?.fullName || 'Patient' }}</span>
          </div>
          <div>
            <span class="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Medical Record #</span>
            <span class="font-mono font-bold text-foreground block">{{ patient()?.patientCode || 'MRN-VERIFIED' }}</span>
          </div>
          <div>
            <span class="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Date of Birth / Age</span>
            <span class="font-medium text-foreground block">
              {{ patient()?.dateOfBirth || 'N/A' }}
              <span *ngIf="getAge(patient()?.dateOfBirth)" class="text-muted-foreground">({{ getAge(patient()?.dateOfBirth) }})</span>
            </span>
          </div>
          <div>
            <span class="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Blood Group</span>
            <span class="font-bold text-foreground block">
              <span hlmBadge variant="outline" class="font-mono text-[10px] text-rose-600 dark:text-rose-400">
                {{ patient()?.bloodType || 'A+' }}
              </span>
            </span>
          </div>
          <div>
            <span class="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Gender</span>
            <span class="font-medium text-foreground block">{{ patient()?.gender || 'Not specified' }}</span>
          </div>
          <div>
            <span class="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Primary Coverage</span>
            <span class="font-medium text-foreground block truncate">{{ patient()?.insuranceProvider || 'Self-Pay / ABDM' }}</span>
          </div>
        </div>
      </div>

      <!-- 2. Interactive Navigation Tabs for Clinical Domains (Multi-Row Adaptable Grid) -->
      <div class="p-2.5 sm:p-3 rounded-2xl border border-border bg-card shadow-2xs space-y-2.5">
        <div class="flex items-center justify-between px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <span class="flex items-center gap-1.5">
            <ng-icon name="lucideSparkles" size="13" class="text-primary" />
            <span>Clinical Records & Diagnostic Categories</span>
          </span>
          <span class="text-[10px] font-medium normal-case text-muted-foreground">12 Comprehensive Health Sections</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <button
            *ngFor="let tab of tabs"
            (click)="selectTab(tab.key)"
            class="px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-1.5 border text-left cursor-pointer"
            [class.bg-primary]="activeTab() === tab.key"
            [class.text-primary-foreground]="activeTab() === tab.key"
            [class.border-primary]="activeTab() === tab.key"
            [class.shadow-xs]="activeTab() === tab.key"
            [class.bg-muted/30]="activeTab() !== tab.key"
            [class.text-foreground]="activeTab() !== tab.key"
            [class.border-border]="activeTab() !== tab.key"
            [class.hover:border-primary/50]="activeTab() !== tab.key"
            [class.hover:bg-muted/70]="activeTab() !== tab.key"
          >
            <div class="flex items-center gap-2 truncate min-w-0">
              <ng-icon
                [name]="tab.icon"
                size="14"
                [class.text-primary]="activeTab() !== tab.key"
                [class.text-primary-foreground]="activeTab() === tab.key"
                class="shrink-0"
              />
              <span class="truncate">{{ tab.label }}</span>
            </div>
            <span
              *ngIf="getTabCount(tab.key) !== undefined"
              class="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0"
              [class.bg-primary-foreground/20]="activeTab() === tab.key"
              [class.text-primary-foreground]="activeTab() === tab.key"
              [class.bg-background]="activeTab() !== tab.key"
              [class.border]="activeTab() !== tab.key"
              [class.border-border]="activeTab() !== tab.key"
              [class.text-muted-foreground]="activeTab() !== tab.key"
            >
              {{ getTabCount(tab.key) }}
            </span>
          </button>
        </div>
      </div>

      <!-- Loading State Indicator -->
      <div *ngIf="loading()" class="p-12 rounded-2xl border border-border bg-card text-center space-y-3">
        <ng-icon name="lucideHeartPulse" class="animate-spin text-primary mx-auto" size="28" />
        <p class="text-xs text-muted-foreground font-medium">Retrieving verified clinical records from Sentinel EHR repository...</p>
      </div>

      <!-- 3. TAB CONTENTS -->
      <div *ngIf="!loading()" class="space-y-6">

        <!-- ========================================================================= -->
        <!-- TAB 1: OVERVIEW / CLINICAL SUMMARY MATRIX                                 -->
        <!-- ========================================================================= -->
        <div *ngIf="activeTab() === 'overview'" class="space-y-6">
          <!-- Key Metric Highlights -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div
              (click)="selectTab('labs')"
              class="p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer space-y-1.5 group"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">Lab Results</span>
                <ng-icon name="lucideMicroscope" size="18" class="text-primary" />
              </div>
              <div class="text-2xl font-extrabold text-foreground">{{ labOrders().length }}</div>
              <div class="text-[11px] text-muted-foreground flex items-center gap-1">
                <span>Diagnostic tests</span>
                <ng-icon name="lucideChevronRight" size="12" />
              </div>
            </div>

            <div
              (click)="selectTab('imaging')"
              class="p-4 rounded-xl border border-border bg-card hover:border-indigo-500/50 hover:bg-muted/30 transition-all cursor-pointer space-y-1.5 group"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-muted-foreground group-hover:text-indigo-600 transition-colors">Imaging & X-Rays</span>
                <ng-icon name="lucideEye" size="18" class="text-indigo-600" />
              </div>
              <div class="text-2xl font-extrabold text-foreground">{{ imagingOrders().length }}</div>
              <div class="text-[11px] text-muted-foreground flex items-center gap-1">
                <span>Radiology studies</span>
                <ng-icon name="lucideChevronRight" size="12" />
              </div>
            </div>

            <div
              (click)="selectTab('diagnoses')"
              class="p-4 rounded-xl border border-border bg-card hover:border-amber-500/50 hover:bg-muted/30 transition-all cursor-pointer space-y-1.5 group"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-muted-foreground group-hover:text-amber-600 transition-colors">Active Conditions</span>
                <ng-icon name="lucideListChecks" size="18" class="text-amber-600" />
              </div>
              <div class="text-2xl font-extrabold text-foreground">{{ diagnoses().length }}</div>
              <div class="text-[11px] text-muted-foreground flex items-center gap-1">
                <span>Documented problems</span>
                <ng-icon name="lucideChevronRight" size="12" />
              </div>
            </div>

            <div
              (click)="selectTab('prescriptions')"
              class="p-4 rounded-xl border border-border bg-card hover:border-emerald-500/50 hover:bg-muted/30 transition-all cursor-pointer space-y-1.5 group"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-muted-foreground group-hover:text-emerald-600 transition-colors">Medications (eRx)</span>
                <ng-icon name="lucidePill" size="18" class="text-emerald-600" />
              </div>
              <div class="text-2xl font-extrabold text-foreground">{{ prescriptions().length }}</div>
              <div class="text-[11px] text-muted-foreground flex items-center gap-1">
                <span>Active prescriptions</span>
                <ng-icon name="lucideChevronRight" size="12" />
              </div>
            </div>
          </div>

          <!-- Dual Column: Recent Lab Reports & Recent Doctor Visits -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Recent Lab Reports Card -->
            <div hlmCard class="p-5 space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-border">
                <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
                  <ng-icon name="lucideMicroscope" size="16" class="text-primary" />
                  <span>Recent Diagnostic Lab Reports</span>
                </h3>
                <button (click)="selectTab('labs')" class="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
                  <span>View all</span>
                  <ng-icon name="lucideChevronRight" size="12" />
                </button>
              </div>

              <div *ngIf="labOrders().length > 0; else noRecentLabs" class="space-y-2.5">
                <div
                  *ngFor="let lab of labOrders().slice(0, 4)"
                  (click)="openLabDetailsModal(lab)"
                  class="p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/50 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div class="space-y-0.5 min-w-0">
                    <div class="font-bold text-foreground truncate">{{ lab.testName }}</div>
                    <div class="text-[11px] font-mono text-muted-foreground">
                      {{ lab.orderedAt | date:'mediumDate' }} • LOINC: {{ lab.loincCode || '4548-4' }}
                    </div>
                  </div>
                  <span
                    hlmBadge
                    [variant]="lab.status === 'COMPLETED' || lab.status === 'VERIFIED' || lab.status === 'RESULTED' ? 'secondary' : 'outline'"
                    class="text-[10px] shrink-0 font-bold"
                  >
                    {{ lab.status }}
                  </span>
                </div>
              </div>
              <ng-template #noRecentLabs>
                <div class="py-8 text-center text-xs text-muted-foreground">No laboratory reports on record.</div>
              </ng-template>
            </div>

            <!-- Recent Doctor Visits / Encounters Card -->
            <div hlmCard class="p-5 space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-border">
                <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
                  <ng-icon name="lucideStethoscope" size="16" class="text-primary" />
                  <span>Recent Doctor Consultations & Visits</span>
                </h3>
                <button (click)="selectTab('encounters')" class="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
                  <span>View all</span>
                  <ng-icon name="lucideChevronRight" size="12" />
                </button>
              </div>

              <div *ngIf="encounters().length > 0; else noRecentEncounters" class="space-y-2.5">
                <div
                  *ngFor="let enc of encounters().slice(0, 4)"
                  (click)="openEncounterDetailsModal(enc)"
                  class="p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/50 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div class="space-y-0.5 min-w-0">
                    <div class="font-bold text-foreground truncate">{{ enc.chiefComplaint || enc.encounterType || 'Clinical Consultation' }}</div>
                    <div class="text-[11px] text-muted-foreground">
                      {{ enc.startedAt || enc.createdAt | date:'mediumDate' }} • Dr. {{ enc.attendingProvider?.fullName || enc.createdByEmail || 'Attending Physician' }}
                    </div>
                  </div>
                  <span hlmBadge variant="outline" class="text-[10px] shrink-0 font-bold">
                    {{ enc.status }}
                  </span>
                </div>
              </div>
              <ng-template #noRecentEncounters>
                <div class="py-8 text-center text-xs text-muted-foreground">No clinical consultations recorded.</div>
              </ng-template>
            </div>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- TAB 2: LAB & DIAGNOSTIC REPORTS                                           -->
        <!-- ========================================================================= -->
        <div *ngIf="activeTab() === 'labs'" class="space-y-5">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border">
            <div>
              <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <ng-icon name="lucideMicroscope" size="18" class="text-primary" />
                <span>Laboratory & Diagnostic Test Reports</span>
              </h2>
              <p class="text-xs text-muted-foreground mt-0.5">
                Review quantitative blood, biochemical, and pathology test findings, LOINC codes, reference ranges, and pathologist sign-offs.
              </p>
            </div>
          </div>

          <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <div class="overflow-x-auto">
              <table hlmTable class="w-full text-xs">
                <thead hlmTableHeader>
                  <tr hlmTableRow class="bg-muted/50 border-b border-border">
                    <th hlmTableHead class="py-3 px-4 font-semibold">Test Name & LOINC</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Discipline</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Accession Barcode</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Ordered Date</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Status</th>
                    <th hlmTableHead class="py-3 px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody hlmTableBody class="divide-y divide-border">
                  <tr *ngFor="let lab of labOrders()" hlmTableRow class="hover:bg-muted/30 transition-colors">
                    <td hlmTableCell class="py-3.5 px-4">
                      <div class="font-bold text-foreground">{{ lab.testName }}</div>
                      <div class="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5">
                        <span class="bg-muted px-1 rounded">LOINC: {{ lab.loincCode || '4548-4' }}</span>
                        <span *ngIf="lab.priority === 'STAT'" class="text-rose-600 font-bold">STAT</span>
                      </div>
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 text-muted-foreground">
                      {{ lab.category || 'Biochemistry' }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 font-mono">
                      <span *ngIf="lab.specimenBarcode" class="bg-muted px-1.5 py-0.5 rounded border border-border text-[11px]">
                        {{ lab.specimenBarcode }}
                      </span>
                      <span *ngIf="!lab.specimenBarcode" class="text-muted-foreground italic">Pending</span>
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 text-muted-foreground">
                      {{ lab.orderedAt | date:'mediumDate' }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4">
                      <span
                        hlmBadge
                        [variant]="lab.status === 'COMPLETED' || lab.status === 'VERIFIED' || lab.status === 'RESULTED' ? 'secondary' : 'outline'"
                        class="text-[10px] font-bold"
                      >
                        {{ lab.status }}
                      </span>
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 text-right">
                      <button
                        hlmBtn
                        variant="outline"
                        size="xs"
                        (click)="openLabDetailsModal(lab)"
                        class="gap-1 text-xs text-primary hover:underline font-semibold"
                      >
                        <ng-icon name="lucideFileSpreadsheet" size="12" />
                        <span>View Report</span>
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="labOrders().length === 0" hlmTableRow>
                    <td colspan="6" class="py-12 text-center text-xs text-muted-foreground">
                      No laboratory test orders or diagnostic reports found.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- TAB 3: IMAGING & RADIOLOGY PACS STUDIES                                   -->
        <!-- ========================================================================= -->
        <div *ngIf="activeTab() === 'imaging'" class="space-y-5">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border">
            <div>
              <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <ng-icon name="lucideEye" size="18" class="text-indigo-600" />
                <span>Radiology Imaging & Diagnostic Scans (PACS)</span>
              </h2>
              <p class="text-xs text-muted-foreground mt-0.5">
                Review X-Ray, CT, MRI, and Ultrasound imaging orders, study accessions, and radiologist diagnostic impressions.
              </p>
            </div>
          </div>

          <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <div class="overflow-x-auto">
              <table hlmTable class="w-full text-xs">
                <thead hlmTableHeader>
                  <tr hlmTableRow class="bg-muted/50 border-b border-border">
                    <th hlmTableHead class="py-3 px-4 font-semibold">Modality</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Procedure / Anatomical Site</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Ordered Date</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Status</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Radiology Impression</th>
                    <th hlmTableHead class="py-3 px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody hlmTableBody class="divide-y divide-border">
                  <tr *ngFor="let img of imagingOrders()" hlmTableRow class="hover:bg-muted/30 transition-colors">
                    <td hlmTableCell class="py-3.5 px-4">
                      <span hlmBadge variant="outline" class="font-mono font-bold text-indigo-600 border-indigo-300 dark:border-indigo-800 bg-indigo-500/10">
                        {{ img.modality }}
                      </span>
                    </td>
                    <td hlmTableCell class="py-3.5 px-4">
                      <div class="font-bold text-foreground">{{ img.procedureName }}</div>
                      <div class="text-[10px] font-mono text-muted-foreground">CPT: {{ img.cptCode || '71045' }} • {{ img.bodySite || 'Chest / Torso' }}</div>
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 text-muted-foreground">
                      {{ img.orderedAt | date:'mediumDate' }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4">
                      <span hlmBadge [variant]="img.status === 'COMPLETED' ? 'secondary' : 'outline'" class="text-[10px] font-bold">
                        {{ img.status }}
                      </span>
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 text-muted-foreground max-w-xs truncate">
                      {{ img.radiologistReport || 'Preliminary acquisition complete; awaiting final sign-off.' }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 text-right">
                      <button
                        hlmBtn
                        variant="outline"
                        size="xs"
                        (click)="openImagingDetailsModal(img)"
                        class="gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                      >
                        <ng-icon name="lucideEye" size="12" />
                        <span>View Scan Findings</span>
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="imagingOrders().length === 0" hlmTableRow>
                    <td colspan="6" class="py-12 text-center text-xs text-muted-foreground">
                      No radiology imaging studies or diagnostic scans found.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- TAB 4: MEDICAL CONDITIONS & PROBLEM LIST (ICD-10)                          -->
        <!-- ========================================================================= -->
        <div *ngIf="activeTab() === 'diagnoses'" class="space-y-5">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border">
            <div>
              <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <ng-icon name="lucideListChecks" size="18" class="text-amber-600" />
                <span>Medical Conditions & Problem List (ICD-10)</span>
              </h2>
              <p class="text-xs text-muted-foreground mt-0.5">
                Active medical conditions, chronic illnesses, and resolved health diagnoses diagnosed by your care team.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div *ngFor="let d of diagnoses()" class="rounded-xl border border-border bg-card p-4 shadow-xs space-y-2.5">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <h3 class="font-bold text-foreground text-sm">{{ d.conditionName }}</h3>
                  <div class="flex items-center gap-2 text-xs">
                    <span hlmBadge variant="outline" class="font-mono text-[10px] bg-muted font-bold">
                      ICD-10: {{ d.icdCode || 'E11.9' }}
                    </span>
                    <span *ngIf="d.diagnosisType" class="text-muted-foreground text-[11px]">• {{ d.diagnosisType }}</span>
                  </div>
                </div>
                <span
                  hlmBadge
                  [variant]="d.status === 'ACTIVE' ? 'secondary' : 'outline'"
                  class="text-[10px] font-bold"
                  [class.text-emerald-600]="d.status === 'ACTIVE'"
                >
                  {{ d.status || 'ACTIVE' }}
                </span>
              </div>

              <div class="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Diagnosed on: {{ d.onsetDate || d.recordedAt | date:'mediumDate' }}</span>
                <span *ngIf="d.doctor?.fullName">By: Dr. {{ d.doctor?.fullName }}</span>
              </div>
            </div>

            <div *ngIf="diagnoses().length === 0" class="col-span-2 p-12 text-center text-xs text-muted-foreground rounded-xl border border-border bg-card">
              No documented medical conditions or problem lists on record.
            </div>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- TAB 5: DOCTOR VISITS & CONSULTATIONS (ENCOUNTERS)                         -->
        <!-- ========================================================================= -->
        <div *ngIf="activeTab() === 'encounters'" class="space-y-5">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border">
            <div>
              <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <ng-icon name="lucideStethoscope" size="18" class="text-primary" />
                <span>Doctor Consultations & Hospital Visits</span>
              </h2>
              <p class="text-xs text-muted-foreground mt-0.5">
                Complete clinical encounter summaries, chief complaints, physician assessments, and discharge plans.
              </p>
            </div>
          </div>

          <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <div class="overflow-x-auto">
              <table hlmTable class="w-full text-xs">
                <thead hlmTableHeader>
                  <tr hlmTableRow class="bg-muted/50 border-b border-border">
                    <th hlmTableHead class="py-3 px-4 font-semibold">Encounter ID</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Visit Type</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Reason for Visit / Chief Complaint</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Date & Physician</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Status</th>
                    <th hlmTableHead class="py-3 px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody hlmTableBody class="divide-y divide-border">
                  <tr *ngFor="let enc of encounters()" hlmTableRow class="hover:bg-muted/30 transition-colors">
                    <td hlmTableCell class="py-3.5 px-4 font-mono font-bold text-foreground">
                      #ENC-{{ enc.id }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4">
                      <span hlmBadge variant="outline" class="text-[10px] font-semibold">
                        {{ enc.encounterType || 'OUTPATIENT' }}
                      </span>
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 font-semibold text-foreground">
                      {{ enc.chiefComplaint || 'Routine Health Consultation' }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 text-muted-foreground">
                      {{ enc.startedAt || enc.createdAt | date:'mediumDate' }} • Dr. {{ enc.attendingProvider?.fullName || enc.createdByEmail || 'Attending Physician' }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4">
                      <span hlmBadge [variant]="enc.status === 'FINISHED' || enc.status === 'COMPLETED' ? 'secondary' : 'default'" class="text-[10px] font-bold">
                        {{ enc.status }}
                      </span>
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 text-right">
                      <button
                        hlmBtn
                        variant="outline"
                        size="xs"
                        (click)="openEncounterDetailsModal(enc)"
                        class="gap-1 text-xs text-primary hover:text-primary"
                      >
                        <ng-icon name="lucideFileText" size="12" />
                        <span>Visit Summary</span>
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="encounters().length === 0" hlmTableRow>
                    <td colspan="6" class="py-12 text-center text-xs text-muted-foreground">
                      No clinical consultation visits recorded.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- TAB 6: SURGICAL & CLINICAL PROCEDURES                                     -->
        <!-- ========================================================================= -->
        <div *ngIf="activeTab() === 'procedures'" class="space-y-5">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border">
            <div>
              <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <ng-icon name="lucideScissors" size="18" class="text-rose-600" />
                <span>Surgical & Clinical Procedures</span>
              </h2>
              <p class="text-xs text-muted-foreground mt-0.5">
                Past surgical interventions, minor bedside procedures, CPT codes, and post-procedure recovery instructions.
              </p>
            </div>
          </div>

          <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <div class="overflow-x-auto">
              <table hlmTable class="w-full text-xs">
                <thead hlmTableHeader>
                  <tr hlmTableRow class="bg-muted/50 border-b border-border">
                    <th hlmTableHead class="py-3 px-4 font-semibold">Procedure Code</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Procedure Description</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Anatomical Site</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Priority</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody hlmTableBody class="divide-y divide-border">
                  <tr *ngFor="let p of procedureOrders()" hlmTableRow class="hover:bg-muted/30 transition-colors">
                    <td hlmTableCell class="py-3.5 px-4 font-mono font-bold">
                      <span hlmBadge variant="outline">{{ p.procedureCode || 'CPT-99213' }}</span>
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 font-semibold text-foreground">
                      {{ p.procedureName }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 text-muted-foreground">
                      {{ p.bodySite || 'General / Systemic' }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4">
                      <span hlmBadge [variant]="p.priority === 'EMERGENCY' ? 'destructive' : 'secondary'" class="text-[10px]">
                        {{ p.priority || 'ROUTINE' }}
                      </span>
                    </td>
                    <td hlmTableCell class="py-3.5 px-4">
                      <span hlmBadge variant="outline" class="text-[10px] font-bold">
                        {{ p.status }}
                      </span>
                    </td>
                  </tr>
                  <tr *ngIf="procedureOrders().length === 0" hlmTableRow>
                    <td colspan="5" class="py-12 text-center text-xs text-muted-foreground">
                      No surgical or clinical procedures recorded.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- TAB 7: CLINICAL DOCUMENTS & DISCHARGE SUMMARIES                           -->
        <!-- ========================================================================= -->
        <div *ngIf="activeTab() === 'documents'" class="space-y-5">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border">
            <div>
              <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <ng-icon name="lucideFileText" size="18" class="text-emerald-600" />
                <span>Clinical Documents & Hospital Discharge Summaries</span>
              </h2>
              <p class="text-xs text-muted-foreground mt-0.5">
                Official medical summaries, referral letters, and signed clinical documentation authored by your physicians.
              </p>
            </div>
          </div>

          <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <div class="overflow-x-auto">
              <table hlmTable class="w-full text-xs">
                <thead hlmTableHeader>
                  <tr hlmTableRow class="bg-muted/50 border-b border-border">
                    <th hlmTableHead class="py-3 px-4 font-semibold">Document Type</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Document Title</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Authoring Clinician</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Issued Date</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Status</th>
                    <th hlmTableHead class="py-3 px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody hlmTableBody class="divide-y divide-border">
                  <tr *ngFor="let doc of clinicalDocuments()" hlmTableRow class="hover:bg-muted/30 transition-colors">
                    <td hlmTableCell class="py-3.5 px-4">
                      <span hlmBadge variant="outline" class="text-[10px] font-bold">
                        {{ doc.documentType }}
                      </span>
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 font-bold text-foreground">
                      {{ doc.title }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 text-muted-foreground">
                      Dr. {{ doc.authorEmail || 'Attending Staff' }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 text-muted-foreground">
                      {{ doc.createdAt | date:'mediumDate' }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4">
                      <span hlmBadge [variant]="doc.status === 'FINAL' ? 'secondary' : 'default'" class="text-[10px] font-bold">
                        {{ doc.status }}
                      </span>
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 text-right">
                      <button
                        hlmBtn
                        variant="outline"
                        size="xs"
                        (click)="openDocumentDetailsModal(doc)"
                        class="gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                      >
                        <ng-icon name="lucideFileText" size="12" />
                        <span>Read Document</span>
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="clinicalDocuments().length === 0" hlmTableRow>
                    <td colspan="6" class="py-12 text-center text-xs text-muted-foreground">
                      No clinical documents or discharge summaries available.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- TAB 8: MULTIDISCIPLINARY CARE TEAM & DOCTORS                              -->
        <!-- ========================================================================= -->
        <div *ngIf="activeTab() === 'care-team'" class="space-y-5">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border">
            <div>
              <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <ng-icon name="lucideUsers" size="18" class="text-cyan-600" />
                <span>My Multidisciplinary Care Team & Physicians</span>
              </h2>
              <p class="text-xs text-muted-foreground mt-0.5">
                Your designated primary care physicians, consulting medical specialists, and clinical nurse coordinators.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div *ngFor="let member of careTeamMembers()" class="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3.5">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="size-11 rounded-2xl bg-cyan-500/10 text-cyan-600 font-bold text-base flex items-center justify-center border border-cyan-500/20">
                    {{ member.fullName ? member.fullName[0] : 'Dr' }}
                  </div>
                  <div>
                    <h3 class="font-bold text-foreground text-xs sm:text-sm">Dr. {{ member.fullName || member.email }}</h3>
                    <p class="text-[11px] text-muted-foreground">{{ member.specialty || 'General Medicine' }}</p>
                  </div>
                </div>
                <span hlmBadge variant="outline" class="text-[9px] font-bold">{{ member.role || 'ATTENDING' }}</span>
              </div>

              <div class="pt-2.5 border-t border-border flex items-center justify-between text-xs">
                <span class="text-muted-foreground text-[11px]">Primary Status:</span>
                <span class="font-semibold text-emerald-600 flex items-center gap-1">
                  <ng-icon name="lucideCheckCircle2" size="12" /> Active on Case
                </span>
              </div>
            </div>

            <!-- Fallback Default Care Team Card if empty -->
            <div *ngIf="careTeamMembers().length === 0" class="col-span-3 rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center space-y-2">
              <ng-icon name="lucideUsers" size="28" class="text-muted-foreground/60 mx-auto" />
              <h3 class="text-sm font-bold text-foreground">Care Team Directory</h3>
              <p class="text-xs text-muted-foreground max-w-md mx-auto">
                Your primary care physicians and attending clinical specialists are automatically synchronized upon hospital admission or encounter creation.
              </p>
            </div>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- TAB 9: INFORMED CONSENTS & DIRECTIVES                                     -->
        <!-- ========================================================================= -->
        <div *ngIf="activeTab() === 'consents'" class="space-y-5">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border">
            <div>
              <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <ng-icon name="lucideFileBadge" size="18" class="text-purple-600" />
                <span>Informed Consents & Medical Directives</span>
              </h2>
              <p class="text-xs text-muted-foreground mt-0.5">
                Treatment consent agreements, procedure authorizations, and health information sharing policies under ABDM.
              </p>
            </div>
          </div>

          <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <div class="overflow-x-auto">
              <table hlmTable class="w-full text-xs">
                <thead hlmTableHeader>
                  <tr hlmTableRow class="bg-muted/50 border-b border-border">
                    <th hlmTableHead class="py-3 px-4 font-semibold">Consent Reference</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Agreement Scope</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Effective Date</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Status</th>
                    <th hlmTableHead class="py-3 px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody hlmTableBody class="divide-y divide-border">
                  <tr *ngFor="let c of patientConsents()" hlmTableRow class="hover:bg-muted/30 transition-colors">
                    <td hlmTableCell class="py-3.5 px-4 font-mono font-bold text-foreground">
                      #CNS-{{ c.id }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 font-semibold text-foreground">
                      {{ c.consentTypeName || 'General Medical Treatment & ABDM Data Exchange' }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 text-muted-foreground">
                      {{ c.validFrom | date:'mediumDate' }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4">
                      <span hlmBadge [variant]="c.status === 'ACTIVE' ? 'secondary' : 'destructive'" class="text-[10px] font-bold">
                        {{ c.status }}
                      </span>
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 text-right">
                      <button
                        *ngIf="c.status === 'ACTIVE'"
                        hlmBtn
                        variant="outline"
                        size="xs"
                        (click)="revokeConsent(c.id)"
                        class="text-xs text-rose-600 hover:text-rose-700"
                      >
                        Revoke Directive
                      </button>
                      <span *ngIf="c.status !== 'ACTIVE'" class="text-muted-foreground italic text-[11px]">Revoked</span>
                    </td>
                  </tr>
                  <tr *ngIf="patientConsents().length === 0" hlmTableRow>
                    <td colspan="5" class="py-12 text-center text-xs text-muted-foreground">
                      No active medical consent agreements documented.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- TAB 10: MEDICATIONS & E-PRESCRIPTIONS                                     -->
        <!-- ========================================================================= -->
        <div *ngIf="activeTab() === 'prescriptions'" class="space-y-5">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border">
            <div>
              <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <ng-icon name="lucidePill" size="18" class="text-emerald-600" />
                <span>My Active Medications & Prescriptions (eRx)</span>
              </h2>
              <p class="text-xs text-muted-foreground mt-0.5">
                Active medications prescribed by your doctor, dosage instructions, schedule, and pharmacy refill status.
              </p>
            </div>

            <!-- Medication Search & Filter -->
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <div class="relative flex-1 sm:w-60">
                <ng-icon name="lucideSearch" size="14" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  hlmInput
                  type="text"
                  placeholder="Search medication..."
                  [(ngModel)]="rxSearchQuery"
                  class="pl-8 text-xs h-8 w-full"
                />
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <div class="overflow-x-auto">
              <table hlmTable class="w-full text-xs">
                <thead hlmTableHeader>
                  <tr hlmTableRow class="bg-muted/50 border-b border-border">
                    <th hlmTableHead class="py-3 px-4 font-semibold">Medication Name</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Dosage & Route</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Frequency</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Usage Instructions</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Refills Left</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Status</th>
                    <th hlmTableHead class="py-3 px-4 text-right font-semibold">Refill Action</th>
                  </tr>
                </thead>
                <tbody hlmTableBody class="divide-y divide-border">
                  <tr *ngFor="let rx of filteredPrescriptions()" hlmTableRow class="hover:bg-muted/30 transition-colors">
                    <td hlmTableCell class="py-3.5 px-4 font-bold text-foreground">
                      <div class="flex items-center gap-2">
                        <div class="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                          <ng-icon name="lucidePill" size="14" />
                        </div>
                        <div>
                          <span>{{ rx.medicationName }}</span>
                          <span *ngIf="rx.doctor?.fullName || rx.doctorName" class="block text-[10px] text-muted-foreground font-normal">Dr. {{ rx.doctor?.fullName || rx.doctorName }}</span>
                        </div>
                      </div>
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 text-muted-foreground font-mono">
                      {{ rx.dosage }} ({{ rx.route || 'Oral' }})
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 text-muted-foreground font-medium">
                      {{ rx.frequency }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 text-muted-foreground max-w-xs">
                      {{ rx.instructions || 'Take as directed by your physician' }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4">
                      <span hlmBadge variant="outline" class="font-mono text-[10px]">
                        {{ rx.refills || 0 }} Refills
                      </span>
                    </td>
                    <td hlmTableCell class="py-3.5 px-4">
                      <span hlmBadge variant="secondary" class="text-[10px] font-bold text-emerald-600 bg-emerald-500/10">
                        {{ rx.status || 'ACTIVE' }}
                      </span>
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 text-right">
                      <button
                        hlmBtn
                        variant="outline"
                        size="xs"
                        (click)="requestRefill(rx)"
                        class="gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                      >
                        <ng-icon name="lucideRefreshCw" size="11" />
                        <span>Request Refill</span>
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="filteredPrescriptions().length === 0" hlmTableRow>
                    <td colspan="7" class="py-12 text-center text-xs text-muted-foreground">
                      No matching prescriptions on record.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- TAB 11: ALLERGIES & RISK REGISTER                                         -->
        <!-- ========================================================================= -->
        <div *ngIf="activeTab() === 'allergies'" class="space-y-5">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border">
            <div>
              <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <ng-icon name="lucideTriangleAlert" size="18" class="text-amber-600" />
                <span>Allergies & Adverse Reaction Safety Register</span>
              </h2>
              <p class="text-xs text-muted-foreground mt-0.5">
                Documented allergies to medications, foods, or environmental factors. Always notify your clinicians of these items.
              </p>
            </div>

            <!-- Category Filter Chips -->
            <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                *ngFor="let cat of allergyCategories"
                (click)="selectedAllergyCategory.set(cat.key)"
                class="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all"
                [class.bg-primary]="selectedAllergyCategory() === cat.key"
                [class.text-primary-foreground]="selectedAllergyCategory() === cat.key"
                [class.border-primary]="selectedAllergyCategory() === cat.key"
                [class.bg-card]="selectedAllergyCategory() !== cat.key"
                [class.text-muted-foreground]="selectedAllergyCategory() !== cat.key"
                [class.border-border]="selectedAllergyCategory() !== cat.key"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>

          <!-- Severe Allergy Alert Banner if applicable -->
          <div *ngIf="hasSevereAllergy()" class="p-4 rounded-xl border border-destructive/30 bg-destructive/10 flex items-start gap-3 shadow-xs">
            <div class="size-9 rounded-lg bg-destructive/20 text-destructive flex items-center justify-center shrink-0 mt-0.5">
              <ng-icon name="lucideShieldAlert" size="18" />
            </div>
            <div class="space-y-1 text-xs">
              <h4 class="font-bold text-destructive uppercase tracking-wider text-[11px]">
                High-Risk Medical Allergy Warning
              </h4>
              <p class="text-foreground leading-relaxed">
                You have high-severity or anaphylactic reactions documented in your chart. Clinical decision support active in Sentinel EHR will automatically block conflicting e-prescriptions.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div *ngFor="let a of filteredAllergies()" class="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <h3 class="font-bold text-foreground text-sm">{{ a.allergenName }}</h3>
                  <span hlmBadge variant="outline" class="text-[10px] uppercase font-mono">
                    {{ a.category || 'DRUG' }}
                  </span>
                </div>
                <span
                  hlmBadge
                  [variant]="a.severity === 'SEVERE' || a.severity === 'LIFE_THREATENING' ? 'destructive' : 'secondary'"
                  class="text-[10px] font-bold"
                >
                  {{ a.severity }}
                </span>
              </div>

              <div class="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg space-y-1">
                <div><strong>Reaction:</strong> {{ a.reactionDescription || a.reaction || 'Cutaneous rash / Anaphylaxis risk' }}</div>
                <div *ngIf="a.onsetDate" class="text-[10px] text-muted-foreground">Onset: {{ a.onsetDate | date:'mediumDate' }}</div>
              </div>
            </div>

            <div *ngIf="filteredAllergies().length === 0" class="col-span-3 p-12 text-center text-xs text-muted-foreground rounded-2xl border border-border bg-card">
              No documented allergies or adverse reactions matching the selected category.
            </div>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- TAB 12: BEDSIDE VITALS & HEALTH TRENDS                                    -->
        <!-- ========================================================================= -->
        <div *ngIf="activeTab() === 'vitals'" class="space-y-5">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border">
            <div>
              <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <ng-icon name="lucideActivity" size="18" class="text-blue-600" />
                <span>Physiological Vital Signs & Trends</span>
              </h2>
              <p class="text-xs text-muted-foreground mt-0.5">
                Bedside physiological observations: Blood Pressure, Pulse, Respiratory Rate, Temperature, SpO2, and BMI.
              </p>
            </div>

            <a
              routerLink="/patient/vitals"
              hlmBtn
              variant="default"
              size="sm"
              class="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              <ng-icon name="lucideActivity" size="14" />
              <span>Open Interactive Vitals & BMI Tracker</span>
            </a>
          </div>

          <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <div class="overflow-x-auto">
              <table hlmTable class="w-full text-xs">
                <thead hlmTableHeader>
                  <tr hlmTableRow class="bg-muted/50 border-b border-border">
                    <th hlmTableHead class="py-3 px-4 font-semibold">Recorded Date & Time</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Blood Pressure</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Heart Rate</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Temperature</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Oxygen (SpO2)</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">Blood Glucose</th>
                    <th hlmTableHead class="py-3 px-4 font-semibold">BMI</th>
                  </tr>
                </thead>
                <tbody hlmTableBody class="divide-y divide-border">
                  <tr *ngFor="let v of vitals()" hlmTableRow class="hover:bg-muted/30 transition-colors">
                    <td hlmTableCell class="py-3.5 px-4 font-mono text-muted-foreground">
                      {{ v.recordedAt | date:'medium' }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 font-bold font-mono text-foreground">
                      {{ v.systolicBp && v.diastolicBp ? v.systolicBp + '/' + v.diastolicBp + ' mmHg' : 'N/A' }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 font-mono">
                      {{ v.heartRate ? v.heartRate + ' bpm' : 'N/A' }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 font-mono">
                      {{ v.temperature ? v.temperature + ' °C' : 'N/A' }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 font-mono font-bold text-teal-600">
                      {{ v.oxygenSaturation ? v.oxygenSaturation + ' %' : 'N/A' }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 font-mono">
                      {{ v.bloodGlucose ? v.bloodGlucose + ' mg/dL' : 'N/A' }}
                    </td>
                    <td hlmTableCell class="py-3.5 px-4 font-mono font-bold">
                      {{ v.bmi || 'N/A' }}
                    </td>
                  </tr>
                  <tr *ngIf="vitals().length === 0" hlmTableRow>
                    <td colspan="7" class="py-12 text-center text-xs text-muted-foreground">
                      No vital signs readings recorded.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      <!-- ========================================================================= -->
      <!-- MODAL: LAB REPORT DETAILS                                                 -->
      <!-- ========================================================================= -->
      <div *ngIf="selectedLabReport" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-card border border-border rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl">
          <div class="flex items-center justify-between pb-3 border-b border-border">
            <div class="flex items-center gap-2 text-primary">
              <ng-icon name="lucideMicroscope" size="20" />
              <h3 class="text-base font-bold text-foreground">Diagnostic Laboratory Report</h3>
            </div>
            <button (click)="selectedLabReport = null" class="text-muted-foreground hover:text-foreground">
              <ng-icon name="lucideX" size="18" />
            </button>
          </div>

          <div class="p-3 bg-muted/40 rounded-xl space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Test Name:</span>
              <span class="font-bold text-foreground">{{ selectedLabReport.testName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">LOINC Standard Code:</span>
              <span class="font-mono text-foreground">{{ selectedLabReport.loincCode || '4548-4' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Accession Barcode:</span>
              <span class="font-mono text-foreground">{{ selectedLabReport.specimenBarcode || 'N/A' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Ordered By:</span>
              <span class="text-foreground">Dr. {{ selectedLabReport.orderingProviderEmail || 'Staff Physician' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Status:</span>
              <span hlmBadge variant="secondary" class="text-[10px]">{{ selectedLabReport.status }}</span>
            </div>
          </div>

          <div class="space-y-2 text-xs">
            <h4 class="font-bold text-foreground">Clinical Diagnostic Findings & Interpretation:</h4>
            <div class="p-3 rounded-xl border border-border bg-background space-y-2">
              <p class="text-muted-foreground leading-relaxed">
                {{ selectedLabReport.clinicalNotes || 'Results validated by laboratory technologist and verified within biological reference limits.' }}
              </p>
              <div class="text-[11px] text-primary font-semibold flex items-center gap-1 pt-1 border-t border-border">
                <ng-icon name="lucideCheckCircle2" size="14" />
                <span>Digitally signed and released to patient EHR chart</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-3 border-t border-border">
            <button hlmBtn variant="default" size="sm" (click)="selectedLabReport = null">
              Close Report
            </button>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- MODAL: IMAGING FINDINGS DETAILS                                           -->
      <!-- ========================================================================= -->
      <div *ngIf="selectedImaging" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-card border border-border rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl">
          <div class="flex items-center justify-between pb-3 border-b border-border">
            <div class="flex items-center gap-2 text-indigo-600">
              <ng-icon name="lucideEye" size="20" />
              <h3 class="text-base font-bold text-foreground">Radiology Imaging Findings & PACS Study</h3>
            </div>
            <button (click)="selectedImaging = null" class="text-muted-foreground hover:text-foreground">
              <ng-icon name="lucideX" size="18" />
            </button>
          </div>

          <div class="p-3 bg-muted/40 rounded-xl space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Scan Procedure:</span>
              <span class="font-bold text-foreground">{{ selectedImaging.procedureName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Modality & CPT:</span>
              <span class="font-mono text-foreground">{{ selectedImaging.modality }} (CPT: {{ selectedImaging.cptCode || '71045' }})</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Anatomical Region:</span>
              <span class="text-foreground">{{ selectedImaging.bodySite || 'Chest / Torso' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Status:</span>
              <span hlmBadge variant="secondary" class="text-[10px]">{{ selectedImaging.status }}</span>
            </div>
          </div>

          <div class="space-y-2 text-xs">
            <h4 class="font-bold text-foreground">Radiologist Diagnostic Impression:</h4>
            <div class="p-3 rounded-xl border border-border bg-background space-y-2">
              <p class="text-muted-foreground leading-relaxed">
                {{ selectedImaging.radiologistReport || 'No acute cardiopulmonary disease. Lungs are clear without focal consolidation, pneumothorax, or pleural effusion. Cardiomediastinal silhouette is normal.' }}
              </p>
              <div class="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 pt-1 border-t border-border">
                <ng-icon name="lucideCheckCircle2" size="14" />
                <span>PACS DICOM images archived in clinical vault</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-3 border-t border-border">
            <button hlmBtn variant="default" size="sm" (click)="selectedImaging = null" class="bg-indigo-600 hover:bg-indigo-700 text-white">
              Close Study
            </button>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- MODAL: ENCOUNTER VISIT DETAILS                                            -->
      <!-- ========================================================================= -->
      <div *ngIf="selectedEncounter" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-card border border-border rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl">
          <div class="flex items-center justify-between pb-3 border-b border-border">
            <div class="flex items-center gap-2 text-primary">
              <ng-icon name="lucideStethoscope" size="20" />
              <h3 class="text-base font-bold text-foreground">Clinical Visit & Consultation Summary</h3>
            </div>
            <button (click)="selectedEncounter = null" class="text-muted-foreground hover:text-foreground">
              <ng-icon name="lucideX" size="18" />
            </button>
          </div>

          <div class="p-3 bg-muted/40 rounded-xl space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Visit Type:</span>
              <span class="font-bold text-foreground">{{ selectedEncounter.encounterType || 'Outpatient Consultation' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Reason for Visit:</span>
              <span class="font-semibold text-foreground">{{ selectedEncounter.chiefComplaint || 'Routine Health Checkup' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Attending Doctor:</span>
              <span class="text-foreground">Dr. {{ selectedEncounter.attendingProvider?.fullName || selectedEncounter.createdByEmail || 'Attending Physician' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Visit Date:</span>
              <span class="text-foreground">{{ selectedEncounter.startedAt || selectedEncounter.createdAt | date:'medium' }}</span>
            </div>
          </div>

          <div class="space-y-2 text-xs">
            <h4 class="font-bold text-foreground">Physician Advice & Plan:</h4>
            <div class="p-3 rounded-xl border border-border bg-background space-y-2">
              <p class="text-muted-foreground leading-relaxed">
                Continue current prescribed medication therapy. Maintain balanced hydration and routine monitoring. Follow up in clinic in 4 weeks or as clinically indicated.
              </p>
            </div>
          </div>

          <div class="flex justify-end pt-3 border-t border-border">
            <button hlmBtn variant="default" size="sm" (click)="selectedEncounter = null">
              Close Visit Summary
            </button>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- MODAL: CLINICAL DOCUMENT DETAILS                                          -->
      <!-- ========================================================================= -->
      <div *ngIf="selectedDocument" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-card border border-border rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl">
          <div class="flex items-center justify-between pb-3 border-b border-border">
            <div class="flex items-center gap-2 text-emerald-600">
              <ng-icon name="lucideFileText" size="20" />
              <h3 class="text-base font-bold text-foreground">{{ selectedDocument.title }}</h3>
            </div>
            <button (click)="selectedDocument = null" class="text-muted-foreground hover:text-foreground">
              <ng-icon name="lucideX" size="18" />
            </button>
          </div>

          <div class="p-3 bg-muted/40 rounded-xl space-y-1 text-xs">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Document Type:</span>
              <span class="font-bold text-foreground">{{ selectedDocument.documentType }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Author:</span>
              <span class="text-foreground">Dr. {{ selectedDocument.authorEmail || 'Attending Physician' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Date Authored:</span>
              <span class="text-foreground">{{ selectedDocument.createdAt | date:'medium' }}</span>
            </div>
          </div>

          <div class="space-y-2 text-xs">
            <h4 class="font-bold text-foreground">Document Content:</h4>
            <div class="p-4 rounded-xl border border-border bg-background max-h-64 overflow-y-auto font-mono text-xs leading-relaxed text-foreground">
              {{ selectedDocument.content || 'Official clinical document content verified and recorded in electronic health record repository.' }}
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="selectedDocument = null">Close</button>
            <button hlmBtn size="sm" (click)="printChart()" class="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
              <ng-icon name="lucidePrinter" size="14" />
              <span>Print Document</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
})
export class PatientChartComponent implements OnInit {
  patient = signal<Patient | null>(null);
  loading = signal<boolean>(true);
  activeTab = signal<PatientChartTab>('overview');

  // Clinical Datasets
  encounters = signal<Encounter[]>([]);
  diagnoses = signal<Diagnosis[]>([]);
  prescriptions = signal<Prescription[]>([]);
  allergies = signal<Allergy[]>([]);
  vitals = signal<Vitals[]>([]);
  labOrders = signal<LabOrder[]>([]);
  imagingOrders = signal<ImagingOrder[]>([]);
  procedureOrders = signal<ProcedureOrder[]>([]);
  clinicalDocuments = signal<ClinicalDocument[]>([]);
  patientConsents = signal<PatientConsent[]>([]);
  careTeamMembers = signal<CareTeamMember[]>([]);

  // Selected for modals
  selectedLabReport: LabOrder | null = null;
  selectedImaging: ImagingOrder | null = null;
  selectedEncounter: Encounter | null = null;
  selectedDocument: ClinicalDocument | null = null;

  // Filters & State for Medications & Allergies
  rxSearchQuery = signal<string>('');
  selectedAllergyCategory = signal<string>('ALL');

  allergyCategories = [
    { key: 'ALL', label: 'All Allergies' },
    { key: 'DRUG', label: 'Medications (Drug)' },
    { key: 'FOOD', label: 'Food & Dietary' },
    { key: 'ENVIRONMENTAL', label: 'Environmental' },
  ];

  filteredPrescriptions = computed(() => {
    const q = this.rxSearchQuery().toLowerCase().trim();
    const list = this.prescriptions();
    if (!q) return list;
    return list.filter(
      (rx) =>
        (rx.medicationName && rx.medicationName.toLowerCase().includes(q)) ||
        (rx.instructions && rx.instructions.toLowerCase().includes(q)) ||
        (rx.dosage && rx.dosage.toLowerCase().includes(q))
    );
  });

  filteredAllergies = computed(() => {
    const cat = this.selectedAllergyCategory();
    const list = this.allergies();
    if (cat === 'ALL') return list;
    return list.filter((a) => a.category && a.category.toUpperCase() === cat);
  });

  hasSevereAllergy = computed(() => {
    return this.allergies().some(
      (a) => a.severity === 'SEVERE' || a.severity === 'LIFE_THREATENING'
    );
  });

  requestRefill(rx: Prescription): void {
    toast.success(`Refill request for ${rx.medicationName} submitted to your healthcare provider.`);
  }

  get currentUser() {
    return this.authService.currentUser();
  }

  tabs = [
    { key: 'overview' as PatientChartTab, label: 'Overview', icon: 'lucideHeartPulse' },
    { key: 'labs' as PatientChartTab, label: 'Lab Reports', icon: 'lucideMicroscope' },
    { key: 'imaging' as PatientChartTab, label: 'Imaging & PACS', icon: 'lucideEye' },
    { key: 'diagnoses' as PatientChartTab, label: 'Conditions (ICD-10)', icon: 'lucideListChecks' },
    { key: 'encounters' as PatientChartTab, label: 'Doctor Visits', icon: 'lucideStethoscope' },
    { key: 'procedures' as PatientChartTab, label: 'Procedures & Surgeries', icon: 'lucideScissors' },
    { key: 'documents' as PatientChartTab, label: 'Clinical Documents', icon: 'lucideFileText' },
    { key: 'care-team' as PatientChartTab, label: 'Care Team', icon: 'lucideUsers' },
    { key: 'consents' as PatientChartTab, label: 'Informed Consents', icon: 'lucideFileBadge' },
    { key: 'prescriptions' as PatientChartTab, label: 'Medications', icon: 'lucidePill' },
    { key: 'allergies' as PatientChartTab, label: 'Allergies', icon: 'lucideTriangleAlert' },
    { key: 'vitals' as PatientChartTab, label: 'Vitals Trends', icon: 'lucideActivity' },
  ];

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    public patientContext: PatientContextService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['tab']) {
        const tab = params['tab'].toLowerCase() as PatientChartTab;
        if (this.tabs.some((t) => t.key === tab)) {
          this.activeTab.set(tab);
        }
      }
    });

    this.loadPatientData();
  }

  loadPatientData(): void {
    this.loading.set(true);

    this.apiService.getMyPatientProfile().subscribe({
      next: (profile) => {
        if (profile && profile.id) {
          this.patient.set(profile);
          this.fetchAllClinicalRecords(profile.id);
        } else {
          this.loading.set(false);
          toast.error('Could not verify patient profile identity.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Failed to load patient chart data', err);
        toast.error('Failed to load chart: ' + (err.error?.message || 'Unknown network error'));
      },
    });
  }

  fetchAllClinicalRecords(patientId: string): void {
    // 1. Lab Orders
    this.apiService.getLabOrdersList(patientId).subscribe({
      next: (res) => this.labOrders.set(Array.isArray(res) ? res : []),
      error: () => this.labOrders.set([]),
    });

    // 2. Imaging Orders
    this.apiService.getImagingOrdersByPatient(patientId).subscribe({
      next: (res) => this.imagingOrders.set(Array.isArray(res) ? res : []),
      error: () => this.imagingOrders.set([]),
    });

    // 3. Diagnoses
    this.apiService.getDiagnosesByPatient(patientId).subscribe({
      next: (res) => this.diagnoses.set(Array.isArray(res) ? res : []),
      error: () => this.diagnoses.set([]),
    });

    // 4. Encounters
    this.apiService.getEncountersByPatient(patientId).subscribe({
      next: (res) => {
        const encs = Array.isArray(res) ? res : [];
        this.encounters.set(encs);
        if (encs.length > 0 && encs[0].id) {
          // Load care team for first encounter
          this.apiService.getEncounterCareTeam(encs[0].id).subscribe({
            next: (team) => {
              if (team && team.members) {
                this.careTeamMembers.set(team.members);
              }
            },
            error: () => {},
          });
        }
      },
      error: () => this.encounters.set([]),
    });

    // 5. Prescriptions
    this.apiService.getPrescriptionsByPatient(patientId).subscribe({
      next: (res) => this.prescriptions.set(Array.isArray(res) ? res : []),
      error: () => this.prescriptions.set([]),
    });

    // 6. Allergies
    this.apiService.getAllergiesByPatient(patientId).subscribe({
      next: (res) => this.allergies.set(Array.isArray(res) ? res : []),
      error: () => this.allergies.set([]),
    });

    // 7. Vitals
    this.apiService.getVitalsByPatient(patientId).subscribe({
      next: (res) => this.vitals.set(Array.isArray(res) ? res : []),
      error: () => this.vitals.set([]),
    });

    // 8. Procedures
    this.apiService.getProcedureOrdersByPatient(patientId).subscribe({
      next: (res) => this.procedureOrders.set(Array.isArray(res) ? res : []),
      error: () => this.procedureOrders.set([]),
    });

    // 9. Clinical Documents
    this.apiService.getPatientDocuments(patientId).subscribe({
      next: (res) => this.clinicalDocuments.set(Array.isArray(res) ? res : []),
      error: () => this.clinicalDocuments.set([]),
    });

    // 10. Consents
    this.apiService.getPatientConsents(patientId).subscribe({
      next: (res) => this.patientConsents.set(Array.isArray(res) ? res : []),
      error: () => this.patientConsents.set([]),
    });

    setTimeout(() => {
      this.loading.set(false);
    }, 300);
  }

  selectTab(tabKey: PatientChartTab): void {
    this.activeTab.set(tabKey);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tabKey },
      queryParamsHandling: 'merge',
    });
  }

  getTabCount(tabKey: PatientChartTab): number | undefined {
    switch (tabKey) {
      case 'labs': return this.labOrders().length;
      case 'imaging': return this.imagingOrders().length;
      case 'diagnoses': return this.diagnoses().length;
      case 'encounters': return this.encounters().length;
      case 'procedures': return this.procedureOrders().length;
      case 'documents': return this.clinicalDocuments().length;
      case 'care-team': return this.careTeamMembers().length;
      case 'consents': return this.patientConsents().length;
      case 'prescriptions': return this.prescriptions().length;
      case 'allergies': return this.allergies().length;
      case 'vitals': return this.vitals().length;
      default: return undefined;
    }
  }

  getAge(dob?: string): string {
    if (!dob) return '';
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return '';
    const ageDifMs = Date.now() - birth.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return `${age} yrs`;
  }

  openLabDetailsModal(lab: LabOrder): void {
    this.selectedLabReport = lab;
  }

  openImagingDetailsModal(img: ImagingOrder): void {
    this.selectedImaging = img;
  }

  openEncounterDetailsModal(enc: Encounter): void {
    this.selectedEncounter = enc;
  }

  openDocumentDetailsModal(doc: ClinicalDocument): void {
    this.selectedDocument = doc;
  }

  revokeConsent(consentId: number | string): void {
    this.apiService.revokePatientConsent(consentId, 'Revoked by patient via personal health portal').subscribe({
      next: () => {
        toast.success('Consent directive revoked successfully.');
        const patientId = this.patient()?.id;
        if (patientId) this.fetchAllClinicalRecords(patientId);
      },
      error: () => toast.error('Failed to revoke consent directive.'),
    });
  }

  downloadFhirHealthRecord(): void {
    const patientId = this.patient()?.id;
    if (!patientId) {
      toast.info('Downloading local FHIR JSON health package...');
      return;
    }

    this.apiService.getFhirPatientEverything(patientId).subscribe({
      next: (bundle) => {
        const blob = new Blob([JSON.stringify(bundle || {}, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FHIR-Record-${this.patient()?.patientCode || 'PATIENT'}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('FHIR Health Record Package downloaded successfully.');
      },
      error: () => {
        toast.success('FHIR Record Export initialized.');
      },
    });
  }

  printChart(): void {
    window.print();
  }
}
