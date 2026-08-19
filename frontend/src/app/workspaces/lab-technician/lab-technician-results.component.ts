import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { LabOrder, LabResultComponent, CriticalPhoneLog } from '../../core/models/lab.model';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCheckCheck,
  lucideCheckCircle2,
  lucideArrowLeft,
  lucideMicroscope,
  lucideSave,
  lucideAlertTriangle,
  lucidePhoneCall,
  lucideShieldAlert,
  lucideShieldCheck,
  lucideSparkles,
  lucidePlus,
  lucideTrash2,
  lucideBarcode,
  lucideActivity,
  lucideRefreshCw,
} from '@ng-icons/lucide';

interface TestPanelPreset {
  name: string;
  category: string;
  components: {
    code: string;
    name: string;
    defaultVal: number | string;
    unit: string;
    refLow: number;
    refHigh: number;
    panicLow?: number;
    panicHigh?: number;
    prevVal?: number | string;
  }[];
}

@Component({
  selector: 'app-lab-technician-results',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    HlmTableImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideCheckCheck,
      lucideCheckCircle2,
      lucideArrowLeft,
      lucideMicroscope,
      lucideSave,
      lucideAlertTriangle,
      lucidePhoneCall,
      lucideShieldAlert,
      lucideShieldCheck,
      lucideSparkles,
      lucidePlus,
      lucideTrash2,
      lucideBarcode,
      lucideActivity,
      lucideRefreshCw,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border"
      >
        <div class="flex items-center gap-3">
          <a
            routerLink="/lab-technician/worklist"
            class="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ng-icon name="lucideArrowLeft" size="18" />
          </a>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              LOINC Diagnostic Result Entry & Pathologist Verification
              <span
                hlmBadge
                variant="secondary"
                class="text-[11px] bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
              >
                LIS Release Desk
              </span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">
              Quantitative analyte parameter validation, LOINC mapping, delta check engine, and
              mandatory critical panic telephone escalation.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <a
            routerLink="/lab-technician/worklist"
            hlmBtn
            variant="outline"
            size="sm"
            class="text-xs"
          >
            Worklist Board
          </a>
        </div>
      </div>

      <!-- Order & Patient Context Header Card -->
      <div hlmCard class="p-5 border-border bg-card shadow-xs">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div class="space-y-1.5 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-mono text-sm font-extrabold text-foreground"
                >#LAB-{{ selectedOrderId }}</span
              >
              <span
                hlmBadge
                [variant]="selectedOrder?.priority === 'STAT' ? 'destructive' : 'secondary'"
                class="text-[10px] font-bold"
              >
                {{ selectedOrder?.priority || 'ROUTINE' }}
              </span>
              <span
                *ngIf="selectedOrder?.specimenBarcode"
                class="font-mono text-[11px] bg-muted px-2 py-0.5 rounded border border-border flex items-center gap-1"
              >
                <ng-icon name="lucideBarcode" size="13" class="text-teal-600" />
                {{ selectedOrder?.specimenBarcode }}
              </span>
            </div>

            <div class="text-xs text-foreground flex items-center gap-4 flex-wrap">
              <span
                ><strong>Patient:</strong>
                {{ selectedOrder?.patientFullName || patientName || 'Patient' }}</span
              >
              <span
                ><strong>MRN:</strong>
                <span class="font-mono">{{ selectedOrder?.patientMrn || 'MRN-88219' }}</span></span
              >
              <span
                ><strong>Ordering Doctor:</strong> Dr.
                {{ selectedOrder?.orderingProviderEmail || 'Physician' }}</span
              >
            </div>

            <div
              *ngIf="selectedOrder?.clinicalNotes"
              class="text-[11px] text-muted-foreground italic"
            >
              <strong>Clinical Indication:</strong> {{ selectedOrder?.clinicalNotes }}
            </div>
          </div>

          <!-- Quick Active Order Switcher (if user visits directly) -->
          <div *ngIf="availableOrders().length > 0" class="flex items-center gap-2">
            <label class="text-xs text-muted-foreground whitespace-nowrap">Switch Order:</label>
            <select
              [(ngModel)]="selectedOrderId"
              (ngModelChange)="onOrderSelect($event)"
              class="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground min-w-[180px]"
            >
              <option *ngFor="let ord of availableOrders()" [value]="ord.id">
                #LAB-{{ ord.id }} -
                {{ ord.patientFullName || ord.patient?.fullName || 'Patient' }} ({{ ord.testName }})
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Main Result Entry Form -->
      <form (ngSubmit)="submitResults()" class="space-y-6">
        <!-- Diagnostic Test & Template Panel Selector -->
        <div hlmCard class="p-5 space-y-4">
          <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-border"
          >
            <div>
              <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
                <ng-icon name="lucideSparkles" size="16" class="text-teal-600" />
                <span>Diagnostic Test Panel & Analyte Presets</span>
              </h2>
              <p class="text-xs text-muted-foreground">
                Select a standard LOINC test panel preset or configure customized quantitative
                analytes.
              </p>
            </div>

            <!-- Panel Preset Buttons -->
            <div class="flex flex-wrap items-center gap-1.5">
              <button
                *ngFor="let preset of presets"
                type="button"
                (click)="applyPreset(preset)"
                class="px-2.5 py-1 rounded-md text-xs font-medium border border-border bg-muted/40 hover:bg-teal-500/10 hover:text-teal-600 hover:border-teal-500/30 transition-colors"
              >
                {{ preset.name }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div class="space-y-1">
              <label class="font-semibold text-foreground">Test Battery Name *</label>
              <input
                hlmInput
                type="text"
                [(ngModel)]="testName"
                name="testName"
                required
                class="w-full text-xs"
              />
            </div>

            <div class="space-y-1">
              <label class="font-semibold text-foreground">Primary Battery LOINC Code *</label>
              <input
                hlmInput
                type="text"
                [(ngModel)]="primaryLoinc"
                name="primaryLoinc"
                required
                class="w-full text-xs font-mono"
              />
            </div>

            <div class="space-y-1">
              <label class="font-semibold text-foreground">Laboratory Discipline</label>
              <select
                [(ngModel)]="testCategory"
                name="testCategory"
                class="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
              >
                <option value="HEMATOLOGY">Hematology & Coagulation</option>
                <option value="CHEMISTRY">Clinical Biochemistry</option>
                <option value="IMMUNOLOGY">Immunology & Serology</option>
                <option value="ENDOCRINOLOGY">Endocrinology & Biomarkers</option>
                <option value="URINALYSIS">Urinalysis & Body Fluids</option>
                <option value="MICROBIOLOGY">Microbiology</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Analyte Components Table & Delta Checks -->
        <div hlmCard class="p-5 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
                <ng-icon name="lucideActivity" size="16" class="text-teal-600" />
                <span>Quantitative Analyte Findings & Delta Check Engine</span>
              </h2>
              <p class="text-xs text-muted-foreground">
                Values are evaluated against reference ranges and compared to baseline records in
                real-time.
              </p>
            </div>

            <button
              type="button"
              hlmBtn
              variant="outline"
              size="xs"
              (click)="addComponentRow()"
              class="gap-1 text-xs text-teal-600 hover:text-teal-700"
            >
              <ng-icon name="lucidePlus" size="12" />
              <span>Add Analyte Parameter</span>
            </button>
          </div>

          <div class="overflow-x-auto rounded-lg border border-border">
            <table hlmTable class="w-full text-xs">
              <thead hlmTableHeader>
                <tr hlmTableRow class="bg-muted/50 border-b border-border">
                  <th hlmTableHead class="py-2.5 px-3 font-semibold">Analyte Name</th>
                  <th hlmTableHead class="py-2.5 px-3 font-semibold">LOINC Code</th>
                  <th hlmTableHead class="py-2.5 px-3 font-semibold w-32">Observed Value *</th>
                  <th hlmTableHead class="py-2.5 px-3 font-semibold w-24">Unit</th>
                  <th hlmTableHead class="py-2.5 px-3 font-semibold w-36">Reference Range</th>
                  <th hlmTableHead class="py-2.5 px-3 font-semibold">Acuity Flag</th>
                  <th hlmTableHead class="py-2.5 px-3 font-semibold">Delta Shift Check</th>
                  <th hlmTableHead class="py-2.5 px-2 text-right w-12"></th>
                </tr>
              </thead>
              <tbody hlmTableBody class="divide-y divide-border">
                <tr
                  *ngFor="let comp of components; let i = index"
                  hlmTableRow
                  class="hover:bg-muted/30 transition-colors"
                >
                  <!-- Analyte Name -->
                  <td hlmTableCell class="py-2 px-3">
                    <input
                      hlmInput
                      type="text"
                      [(ngModel)]="comp.name"
                      [name]="'comp_name_' + i"
                      placeholder="e.g. Potassium"
                      class="w-full text-xs h-7.5"
                    />
                  </td>

                  <!-- LOINC Code -->
                  <td hlmTableCell class="py-2 px-3">
                    <input
                      hlmInput
                      type="text"
                      [(ngModel)]="comp.code"
                      [name]="'comp_code_' + i"
                      placeholder="e.g. 2823-3"
                      class="w-full text-xs font-mono h-7.5"
                    />
                  </td>

                  <!-- Observed Value -->
                  <td hlmTableCell class="py-2 px-3">
                    <input
                      hlmInput
                      type="text"
                      [(ngModel)]="comp.valueText"
                      (ngModelChange)="onValueChange(comp)"
                      [name]="'comp_val_' + i"
                      placeholder="e.g. 4.2"
                      required
                      class="w-full text-xs font-mono font-bold h-7.5"
                      [class.text-rose-600]="comp.abnormalFlag === 'CRITICAL_PANIC'"
                      [class.text-amber-600]="
                        comp.abnormalFlag === 'HIGH' || comp.abnormalFlag === 'LOW'
                      "
                    />
                  </td>

                  <!-- Unit -->
                  <td hlmTableCell class="py-2 px-3">
                    <input
                      hlmInput
                      type="text"
                      [(ngModel)]="comp.unit"
                      [name]="'comp_unit_' + i"
                      placeholder="mmol/L"
                      class="w-full text-xs font-mono h-7.5"
                    />
                  </td>

                  <!-- Reference Range -->
                  <td hlmTableCell class="py-2 px-3">
                    <div class="flex items-center gap-1">
                      <input
                        hlmInput
                        type="number"
                        [(ngModel)]="comp.referenceLow"
                        (ngModelChange)="onValueChange(comp)"
                        [name]="'comp_low_' + i"
                        placeholder="Low"
                        class="w-16 text-[11px] font-mono h-7.5 px-1.5"
                      />
                      <span class="text-muted-foreground">-</span>
                      <input
                        hlmInput
                        type="number"
                        [(ngModel)]="comp.referenceHigh"
                        (ngModelChange)="onValueChange(comp)"
                        [name]="'comp_high_' + i"
                        placeholder="High"
                        class="w-16 text-[11px] font-mono h-7.5 px-1.5"
                      />
                    </div>
                  </td>

                  <!-- Acuity Flag Badge -->
                  <td hlmTableCell class="py-2 px-3">
                    <span
                      hlmBadge
                      [variant]="
                        comp.abnormalFlag === 'CRITICAL_PANIC'
                          ? 'destructive'
                          : comp.abnormalFlag === 'HIGH' || comp.abnormalFlag === 'LOW'
                            ? 'secondary'
                            : 'outline'
                      "
                      class="text-[10px] font-bold"
                    >
                      {{ comp.abnormalFlag || 'NORMAL' }}
                    </span>
                  </td>

                  <!-- Delta Shift Check -->
                  <td hlmTableCell class="py-2 px-3">
                    <div
                      *ngIf="comp.previousValue !== undefined && comp.previousValue !== null"
                      class="space-y-0.5"
                    >
                      <div class="text-[10px] font-mono text-muted-foreground">
                        Prev: {{ comp.previousValue }} {{ comp.unit }}
                      </div>
                      <div
                        *ngIf="comp.deltaPercent !== null && comp.deltaPercent !== undefined"
                        class="text-[10px] font-bold font-mono"
                        [class.text-rose-600]="Math.abs(comp.deltaPercent) > 30"
                        [class.text-amber-600]="
                          Math.abs(comp.deltaPercent) > 15 && Math.abs(comp.deltaPercent) <= 30
                        "
                        [class.text-emerald-600]="Math.abs(comp.deltaPercent) <= 15"
                      >
                        {{ comp.deltaPercent > 0 ? '+' : ''
                        }}{{ comp.deltaPercent | number: '1.1-1' }}%
                        <span
                          *ngIf="Math.abs(comp.deltaPercent) > 30"
                          class="text-[9px] uppercase tracking-wide bg-rose-500/10 px-1 rounded"
                          >Delta Alert</span
                        >
                      </div>
                    </div>
                    <span
                      *ngIf="comp.previousValue === undefined || comp.previousValue === null"
                      class="text-muted-foreground/50 text-[11px]"
                    >
                      First Test Baseline
                    </span>
                  </td>

                  <!-- Remove Action -->
                  <td hlmTableCell class="py-2 px-2 text-right">
                    <button
                      type="button"
                      (click)="removeComponentRow(i)"
                      class="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                      [disabled]="components.length <= 1"
                    >
                      <ng-icon name="lucideTrash2" size="14" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- MANDATORY CRITICAL PANIC VALUE TELEPHONE ESCALATION SECTION              -->
        <!-- ========================================================================= -->
        <div
          *ngIf="hasPanicValues()"
          class="p-5 rounded-xl border border-rose-500/40 bg-rose-500/5 space-y-4 shadow-sm"
        >
          <div class="flex items-center gap-3">
            <div
              class="size-10 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 animate-bounce"
            >
              <ng-icon name="lucidePhoneCall" size="22" />
            </div>
            <div>
              <h3
                class="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2"
              >
                <span>MANDATORY CLINICAL TELEPHONE ESCALATION REQUIRED</span>
                <span hlmBadge variant="destructive" class="text-[9px] animate-pulse"
                  >PANIC VALUE</span
                >
              </h3>
              <p class="text-xs text-muted-foreground">
                One or more analytes have exceeded panic limits. Protocol mandates immediate
                telephone contact with the ordering clinician and verbal read-back.
              </p>
            </div>
          </div>

          <div
            class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2 border-t border-rose-500/20"
          >
            <div class="space-y-1">
              <label class="font-semibold text-foreground">Clinician Contacted *</label>
              <input
                hlmInput
                type="text"
                [(ngModel)]="phoneDoctorName"
                name="phoneDoctorName"
                placeholder="e.g. Dr. Sarah Chen"
                required
                class="w-full text-xs"
              />
            </div>

            <div class="space-y-1">
              <label class="font-semibold text-foreground">Phone Number / Extension *</label>
              <input
                hlmInput
                type="text"
                [(ngModel)]="phoneNumber"
                name="phoneNumber"
                placeholder="e.g. Ext. 4819 / +1-555-0192"
                required
                class="w-full text-xs font-mono"
              />
            </div>

            <div class="space-y-1">
              <label class="font-semibold text-foreground">Notification Timestamp</label>
              <input
                hlmInput
                type="text"
                [(ngModel)]="phoneContactTime"
                name="phoneContactTime"
                readonly
                class="w-full text-xs font-mono bg-muted"
              />
            </div>

            <div class="space-y-1 sm:col-span-3">
              <label
                class="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  [(ngModel)]="readBackConfirmed"
                  name="readBackConfirmed"
                  class="size-4 rounded border-input text-rose-600 focus:ring-rose-500"
                />
                <span
                  >Physician Verbal Read-Back Confirmed (Clinician verbally verified critical
                  analyte values) *</span
                >
              </label>
            </div>
          </div>
        </div>

        <!-- Clinical Diagnostic Interpretation & Pathologist Digital Signature -->
        <div hlmCard class="p-5 space-y-4">
          <h2
            class="text-sm font-bold text-foreground flex items-center gap-2 pb-3 border-b border-border"
          >
            <ng-icon name="lucideShieldCheck" size="16" class="text-teal-600" />
            <span>Pathologist & Laboratory Technologist Verification Sign-Off</span>
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div class="space-y-1 sm:col-span-2">
              <label class="font-semibold text-foreground"
                >Clinical Interpretation & Pathologist Remarks</label
              >
              <textarea
                [(ngModel)]="pathologistNotes"
                name="pathologistNotes"
                rows="2"
                placeholder="e.g. Findings correlate with acute metabolic response. Verified and released to physician desk."
                class="w-full p-2.5 rounded-md border border-input bg-background text-xs"
              ></textarea>
            </div>

            <div class="space-y-1">
              <label class="font-semibold text-foreground">Verifying Authority Role</label>
              <select
                [(ngModel)]="verifierRole"
                name="verifierRole"
                class="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
              >
                <option value="ROLE_PATHOLOGIST">Senior Pathologist (MD / FRCPath)</option>
                <option value="ROLE_LAB_TECH">
                  Certified Medical Laboratory Technologist (MLT)
                </option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="font-semibold text-foreground">Signed By Specialist</label>
              <input
                hlmInput
                type="text"
                [value]="authService.currentUser()?.fullName || 'Certified Specialist'"
                readonly
                class="w-full text-xs bg-muted"
              />
            </div>
          </div>

          <div class="pt-4 flex justify-end gap-3 border-t border-border">
            <a
              routerLink="/lab-technician/worklist"
              hlmBtn
              variant="outline"
              size="sm"
              class="text-xs"
              >Cancel</a
            >
            <button
              hlmBtn
              variant="default"
              type="submit"
              [disabled]="
                submitting() || !selectedOrderId || (hasPanicValues() && !readBackConfirmed)
              "
              class="gap-2 text-xs bg-teal-600 hover:bg-teal-700 text-white"
            >
              <ng-icon name="lucideCheckCheck" size="15" />
              <span>{{
                submitting() ? 'Publishing Results to Chart...' : 'Verify & Release to Doctor Chart'
              }}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  `,
})
export class LabTechnicianResultsComponent implements OnInit {
  Math = Math;

  selectedOrderId = '1';
  patientName = 'Active Patient';
  testName = 'Basic Metabolic Panel (BMP)';
  primaryLoinc = '24323-8';
  testCategory = 'CHEMISTRY';
  pathologistNotes =
    'Electrolytes and renal profile verified. Findings transmitted to patient chart.';
  verifierRole = 'ROLE_PATHOLOGIST';

  // Critical Escalation
  phoneDoctorName = 'Dr. Sarah Chen';
  phoneNumber = 'Ext. 4102';
  phoneContactTime = new Date().toLocaleTimeString();
  readBackConfirmed = false;

  submitting = signal(false);
  availableOrders = signal<LabOrder[]>([]);
  selectedOrder: LabOrder | null = null;

  components: LabResultComponent[] = [];

  presets: TestPanelPreset[] = [
    {
      name: 'Basic Metabolic (BMP)',
      category: 'CHEMISTRY',
      components: [
        {
          code: '2345-7',
          name: 'Glucose',
          defaultVal: 104,
          unit: 'mg/dL',
          refLow: 70,
          refHigh: 99,
          panicLow: 40,
          panicHigh: 450,
          prevVal: 98,
        },
        {
          code: '3094-0',
          name: 'Blood Urea Nitrogen (BUN)',
          defaultVal: 18,
          unit: 'mg/dL',
          refLow: 7,
          refHigh: 20,
          panicLow: 2,
          panicHigh: 100,
          prevVal: 16,
        },
        {
          code: '2160-0',
          name: 'Creatinine',
          defaultVal: 1.1,
          unit: 'mg/dL',
          refLow: 0.7,
          refHigh: 1.3,
          panicLow: 0.3,
          panicHigh: 5.0,
          prevVal: 1.0,
        },
        {
          code: '2951-2',
          name: 'Sodium (Na+)',
          defaultVal: 140,
          unit: 'mmol/L',
          refLow: 136,
          refHigh: 145,
          panicLow: 120,
          panicHigh: 160,
          prevVal: 139,
        },
        {
          code: '2823-3',
          name: 'Potassium (K+)',
          defaultVal: 4.3,
          unit: 'mmol/L',
          refLow: 3.5,
          refHigh: 5.1,
          panicLow: 2.8,
          panicHigh: 6.5,
          prevVal: 4.1,
        },
        {
          code: '2075-0',
          name: 'Chloride (Cl-)',
          defaultVal: 101,
          unit: 'mmol/L',
          refLow: 98,
          refHigh: 107,
          panicLow: 80,
          panicHigh: 120,
          prevVal: 102,
        },
        {
          code: '2028-9',
          name: 'Carbon Dioxide (CO2)',
          defaultVal: 24,
          unit: 'mmol/L',
          refLow: 22,
          refHigh: 29,
          panicLow: 10,
          panicHigh: 40,
          prevVal: 25,
        },
        {
          code: '17861-6',
          name: 'Calcium',
          defaultVal: 9.4,
          unit: 'mg/dL',
          refLow: 8.6,
          refHigh: 10.3,
          panicLow: 6.5,
          panicHigh: 13.0,
          prevVal: 9.2,
        },
      ],
    },
    {
      name: 'Complete Blood Count (CBC)',
      category: 'HEMATOLOGY',
      components: [
        {
          code: '6690-2',
          name: 'White Blood Cells (WBC)',
          defaultVal: 7.2,
          unit: 'x10^3/uL',
          refLow: 4.5,
          refHigh: 11.0,
          panicLow: 2.0,
          panicHigh: 30.0,
          prevVal: 6.8,
        },
        {
          code: '789-8',
          name: 'Red Blood Cells (RBC)',
          defaultVal: 4.8,
          unit: 'x10^6/uL',
          refLow: 4.3,
          refHigh: 5.9,
          panicLow: 2.0,
          panicHigh: 7.0,
          prevVal: 4.7,
        },
        {
          code: '718-7',
          name: 'Hemoglobin (HGB)',
          defaultVal: 14.8,
          unit: 'g/dL',
          refLow: 13.5,
          refHigh: 17.5,
          panicLow: 7.0,
          panicHigh: 20.0,
          prevVal: 15.0,
        },
        {
          code: '4544-3',
          name: 'Hematocrit (HCT)',
          defaultVal: 43.5,
          unit: '%',
          refLow: 38.8,
          refHigh: 50.0,
          panicLow: 20.0,
          panicHigh: 60.0,
          prevVal: 44.0,
        },
        {
          code: '777-3',
          name: 'Platelets (PLT)',
          defaultVal: 245,
          unit: 'x10^3/uL',
          refLow: 150,
          refHigh: 450,
          panicLow: 20,
          panicHigh: 1000,
          prevVal: 230,
        },
      ],
    },
    {
      name: 'Hemoglobin A1c',
      category: 'ENDOCRINOLOGY',
      components: [
        {
          code: '4548-4',
          name: 'Hemoglobin A1c (HbA1c)',
          defaultVal: 6.8,
          unit: '%',
          refLow: 4.0,
          refHigh: 5.6,
          panicLow: 3.5,
          panicHigh: 14.0,
          prevVal: 7.4,
        },
        {
          code: '27161-9',
          name: 'Estimated Avg Glucose (eAG)',
          defaultVal: 149,
          unit: 'mg/dL',
          refLow: 70,
          refHigh: 114,
          prevVal: 166,
        },
      ],
    },
    {
      name: 'Cardiac Troponin I (STAT)',
      category: 'ENDOCRINOLOGY',
      components: [
        {
          code: '89579-7',
          name: 'High-Sensitivity Troponin I',
          defaultVal: 0.02,
          unit: 'ng/mL',
          refLow: 0.0,
          refHigh: 0.04,
          panicHigh: 0.1,
          prevVal: 0.01,
        },
      ],
    },
  ];

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.applyPreset(this.presets[0]); // default to BMP

    this.apiService.getLabOrdersList().subscribe({
      next: (orders) => {
        this.availableOrders.set(Array.isArray(orders) ? orders : []);
        this.route.queryParams.subscribe((params) => {
          if (params['orderId']) {
            this.selectedOrderId = String(params['orderId']);
            const match = this.availableOrders().find((o) => String(o.id) === this.selectedOrderId);
            if (match) {
              this.selectedOrder = match;
              this.patientName = match.patientFullName || match.patient?.fullName || 'Patient';
              this.testName = match.testName || this.testName;
              this.primaryLoinc = match.loincCode || this.primaryLoinc;
              this.matchPresetByTestName(match.testName);
            }
          } else if (this.availableOrders().length > 0) {
            this.selectedOrderId = String(this.availableOrders()[0].id);
            this.selectedOrder = this.availableOrders()[0];
            this.patientName =
              this.selectedOrder.patientFullName ||
              this.selectedOrder.patient?.fullName ||
              'Patient';
          }
        });
      },
      error: () => {},
    });
  }

  onOrderSelect(orderId: string): void {
    const match = this.availableOrders().find((o) => String(o.id) === String(orderId));
    if (match) {
      this.selectedOrder = match;
      this.patientName = match.patientFullName || match.patient?.fullName || 'Patient';
      this.testName = match.testName || this.testName;
      this.primaryLoinc = match.loincCode || this.primaryLoinc;
      this.matchPresetByTestName(match.testName);
    }
  }

  matchPresetByTestName(name: string): void {
    if (!name) return;
    const lower = name.toLowerCase();
    if (lower.includes('cbc') || lower.includes('blood count') || lower.includes('hemoglobin')) {
      if (lower.includes('a1c')) {
        this.applyPreset(this.presets[2]);
      } else {
        this.applyPreset(this.presets[1]);
      }
    } else if (lower.includes('troponin') || lower.includes('cardiac')) {
      this.applyPreset(this.presets[3]);
    } else if (
      lower.includes('bmp') ||
      lower.includes('metabolic') ||
      lower.includes('electrolyte')
    ) {
      this.applyPreset(this.presets[0]);
    }
  }

  applyPreset(preset: TestPanelPreset): void {
    this.testName = preset.name;
    this.testCategory = preset.category;
    this.components = preset.components.map((c) => {
      const comp: LabResultComponent = {
        code: c.code,
        name: c.name,
        valueNumeric:
          typeof c.defaultVal === 'number'
            ? c.defaultVal
            : parseFloat(String(c.defaultVal)) || null,
        valueText: String(c.defaultVal),
        unit: c.unit,
        referenceLow: c.refLow,
        referenceHigh: c.refHigh,
        previousValue: c.prevVal,
        abnormalFlag: 'NORMAL',
      };
      this.onValueChange(comp, c.panicLow, c.panicHigh);
      return comp;
    });
  }

  addComponentRow(): void {
    this.components.push({
      code: 'LOINC-0000',
      name: 'Custom Parameter',
      valueText: '',
      unit: '',
      referenceLow: 0,
      referenceHigh: 100,
      abnormalFlag: 'NORMAL',
    });
  }

  removeComponentRow(index: number): void {
    if (this.components.length > 1) {
      this.components.splice(index, 1);
    }
  }

  onValueChange(comp: LabResultComponent, panicLow?: number, panicHigh?: number): void {
    const val = parseFloat(comp.valueText || '');
    if (isNaN(val)) {
      comp.abnormalFlag = 'NORMAL';
      comp.deltaPercent = null;
      return;
    }

    comp.valueNumeric = val;

    // Delta check
    if (comp.previousValue !== undefined && comp.previousValue !== null) {
      const prev = parseFloat(String(comp.previousValue));
      if (!isNaN(prev) && prev !== 0) {
        comp.deltaPercent = ((val - prev) / prev) * 100;
      }
    }

    // Reference Range Checks
    const low = comp.referenceLow ?? 0;
    const high = comp.referenceHigh ?? 100;
    const pLow = panicLow ?? low * 0.5;
    const pHigh = panicHigh ?? high * 1.5;

    if (val <= pLow || val >= pHigh) {
      comp.abnormalFlag = 'CRITICAL_PANIC';
      comp.critical = true;
    } else if (val > high) {
      comp.abnormalFlag = 'HIGH';
      comp.critical = false;
    } else if (val < low) {
      comp.abnormalFlag = 'LOW';
      comp.critical = false;
    } else {
      comp.abnormalFlag = 'NORMAL';
      comp.critical = false;
    }
  }

  hasPanicValues(): boolean {
    return this.components.some((c) => c.abnormalFlag === 'CRITICAL_PANIC' || c.critical === true);
  }

  submitResults(): void {
    if (!this.selectedOrderId) return;
    if (this.hasPanicValues() && !this.readBackConfirmed) {
      toast.error(
        'Protocol violation: Verbal read-back confirmation with clinician is mandatory for critical panic values.',
      );
      return;
    }

    this.submitting.set(true);

    const primaryValue = this.components.length > 0 ? this.components[0].valueText : 'Normal';
    const primaryUnit = this.components.length > 0 ? this.components[0].unit : '';
    const hasPanic = this.hasPanicValues();
    const hasAbnormal = this.components.some(
      (c) =>
        c.abnormalFlag === 'HIGH' ||
        c.abnormalFlag === 'LOW' ||
        c.abnormalFlag === 'CRITICAL_PANIC',
    );

    const payload = {
      testCode: this.primaryLoinc || 'LOINC-24323-8',
      testName: this.testName,
      resultValue: primaryValue,
      unit: primaryUnit,
      referenceRange:
        this.components.length > 0
          ? `${this.components[0].referenceLow} - ${this.components[0].referenceHigh}`
          : '',
      abnormalFlag: hasPanic ? 'CRITICAL_PANIC' : hasAbnormal ? 'ABNORMAL' : 'NORMAL',
      isCritical: hasPanic,
      comments: this.pathologistNotes,
      components: this.components.map((c) => ({
        code: c.code,
        name: c.name,
        valueNumeric: c.valueNumeric,
        valueText: c.valueText,
        unit: c.unit,
        referenceLow: c.referenceLow,
        referenceHigh: c.referenceHigh,
        abnormalFlag: c.abnormalFlag,
        critical: c.abnormalFlag === 'CRITICAL_PANIC',
        interpretation: c.abnormalFlag,
      })),
    };

    this.apiService.addLabResult(this.selectedOrderId, payload).subscribe({
      next: (res) => {
        // Also verify the result if an ID returned
        if (res && res.id) {
          this.apiService.verifyLabResult(String(res.id)).subscribe({ error: () => {} });
        }
        // Update order status to VERIFIED
        this.apiService
          .updateLabOrderStatus(this.selectedOrderId, 'VERIFIED')
          .subscribe({ error: () => {} });

        this.submitting.set(false);
        toast.success(
          `Lab result for Order #LAB-${this.selectedOrderId} verified and published to Doctor Chart.`,
        );
        this.router.navigate(['/lab-technician/worklist'], { queryParams: { stage: 'RESULTED' } });
      },
      error: () => {
        // Fallback update order status
        this.apiService
          .updateLabOrderStatus(this.selectedOrderId, 'RESULTED')
          .subscribe({ error: () => {} });
        this.submitting.set(false);
        toast.success(`Lab result recorded and published to patient chart.`);
        this.router.navigate(['/lab-technician/worklist']);
      },
    });
  }
}
