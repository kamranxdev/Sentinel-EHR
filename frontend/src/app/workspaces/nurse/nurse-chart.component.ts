import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PatientContextService } from '../../core/services/patient-context.service';
import { ApiService } from '../../core/services/api.service';
import { Patient, Vitals, Prescription, Allergy } from '../../core/models/models';

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
} from '@ng-icons/lucide';

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
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Bedside Chart Header & Patient Banner -->
      <div class="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Bedside Clinical Chart
              <span hlmBadge variant="secondary" class="text-[10px]">Active Bedside Context</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">Comprehensive patient chart for bedside vitals, medication eMAR, and allergy safety.</p>
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
            <span hlmBadge variant="secondary" class="text-[10px] bg-blue-500/10 text-blue-600">Bedside Active</span>
          </div>
        </div>

        <ng-template #noPatientSelected>
          <div class="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between">
            <span class="flex items-center gap-2">
              <ng-icon name="lucideTriangleAlert" size="16" /> No active patient selected. Please select a patient from the dropdown or unit roster.
            </span>
          </div>
        </ng-template>

        <!-- Bedside Chart Sub-Navigation Tabs -->
        <div class="flex items-center gap-2 border-b border-border pt-1">
          <button
            (click)="selectTab('vitals')"
            class="flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer"
            [ngClass]="activeTab() === 'vitals' ? 'border-primary text-primary bg-primary/5 rounded-t-md' : 'border-transparent text-muted-foreground hover:text-foreground'"
          >
            <ng-icon name="lucideActivity" size="15" /> Bedside Vitals Flowsheet
          </button>

          <button
            (click)="selectTab('mar')"
            class="flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer"
            [ngClass]="activeTab() === 'mar' ? 'border-primary text-primary bg-primary/5 rounded-t-md' : 'border-transparent text-muted-foreground hover:text-foreground'"
          >
            <ng-icon name="lucidePill" size="15" /> Medication MAR Orders
          </button>

          <button
            (click)="selectTab('allergies')"
            class="flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer"
            [ngClass]="activeTab() === 'allergies' ? 'border-primary text-primary bg-primary/5 rounded-t-md' : 'border-transparent text-muted-foreground hover:text-foreground'"
          >
            <ng-icon name="lucideTriangleAlert" size="15" /> Coded Allergies & ADRs
          </button>
        </div>
      </div>

      <!-- Tab 1: Vitals Flowsheet -->
      <div *ngIf="activeTab() === 'vitals'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucideActivity" size="18" class="text-blue-500" />
              Bedside Vitals Flowsheet
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Record and monitor physiological vital signs, blood pressure, pulse, temperature, and BMI.</p>
          </div>

          <button hlmBtn variant="default" size="sm" (click)="showVitalsModal.set(true)" class="gap-1.5 font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white">
            <ng-icon name="lucidePlus" size="14" /> Log Bedside Vitals
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
                  <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ v.recordedBy?.fullName || 'Nurse' }}</td>
                </tr>
                <tr *ngIf="vitals().length === 0" hlmTableRow>
                  <td colspan="8" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No vitals recorded for this patient.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab 2: Medication MAR -->
      <div *ngIf="activeTab() === 'mar'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucidePill" size="18" class="text-emerald-500" />
              Medication Administration Record (MAR)
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Active physician eRx orders & 1-click bedside dose administration log.</p>
          </div>
        </div>

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

      <!-- Tab 3: Allergies & Risk Register -->
      <div *ngIf="activeTab() === 'allergies'" class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h2 class="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <ng-icon name="lucideTriangleAlert" size="18" class="text-amber-500" />
              Coded Allergies & Risk Register
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Document allergen safety records, severity, and adverse reaction descriptions.</p>
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
                    <span hlmBadge [variant]="a.severity === 'SEVERE' || a.severity === 'CRITICAL' ? 'destructive' : 'secondary'" class="text-[10px]">
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

      <!-- Log Vitals Modal -->
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
            <button hlmBtn variant="outline" size="sm" (click)="showVitalsModal.set(false)">Cancel</button>
            <button hlmBtn variant="default" size="sm" [disabled]="savingVitals()" (click)="saveVitals()" class="bg-blue-600 hover:bg-blue-700 text-white">
              <ng-icon name="lucideSave" size="14" class="mr-1" /> {{ savingVitals() ? 'Saving...' : 'Save Vitals Entry' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Document Allergy Modal -->
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
                <option value="BIOLOGICAL">BIOLOGICAL</option>
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
              <textarea [(ngModel)]="newAllergy.reactionDescription" placeholder="Describe symptoms (e.g., rash, swelling, wheezing)..." class="w-full p-2 rounded-md border border-input bg-background h-20"></textarea>
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
    </div>
  `,
})
export class NurseChartComponent implements OnInit {
  activeTab = signal<'vitals' | 'mar' | 'allergies'>('vitals');
  patients = signal<Patient[]>([]);

  // State data for sub-views
  vitals = signal<Vitals[]>([]);
  prescriptions = signal<Prescription[]>([]);
  emarHistory = signal<any[]>([]);
  allergies = signal<Allergy[]>([]);

  // Modal controls & forms
  showVitalsModal = signal(false);
  savingVitals = signal(false);
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

  showAllergyModal = signal(false);
  savingAllergy = signal(false);
  newAllergy = {
    allergenName: '',
    category: 'DRUG',
    severity: 'SEVERE',
    reactionDescription: '',
    status: 'ACTIVE',
  };

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
    // Load patients roster for switcher dropdown
    this.apiService.getPatients().subscribe((pts) => {
      this.patients.set(pts);
      if (pts.length > 0 && !this.patientContext.activePatient()) {
        this.patientContext.setActivePatient(pts[0]);
      }
    });

    // Handle tab query parameter if present
    this.route.queryParams.subscribe((params) => {
      if (params['tab']) {
        const tab = params['tab'].toLowerCase();
        if (tab === 'vitals' || tab === 'mar' || tab === 'allergies' || tab === 'prescriptions') {
          this.activeTab.set(tab === 'prescriptions' ? 'mar' : (tab as any));
        }
      }
    });

    const active = this.patientContext.activePatient();
    if (active && active.id) {
      this.loadPatientClinicalData(active.id);
    }
  }

  loadPatientClinicalData(patientId: number): void {
    this.apiService.getVitalsByPatient(patientId).subscribe((res) => this.vitals.set(res));
    this.apiService.getPrescriptionsByPatient(patientId).subscribe((res) => this.prescriptions.set(res));
    this.apiService.getEmarHistoryForPatient(patientId).subscribe((res) => this.emarHistory.set(res));
    this.apiService.getAllergiesByPatient(patientId).subscribe((res) => this.allergies.set(res));
  }

  onPatientSelect(patientId: number | string): void {
    if (!patientId) return;
    this.patientContext.selectPatientById(patientId);
  }

  selectTab(tab: 'vitals' | 'mar' | 'allergies'): void {
    this.activeTab.set(tab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
    });
  }

  saveVitals(): void {
    const active = this.patientContext.activePatient();
    if (!active || !active.id || this.savingVitals()) return;

    this.savingVitals.set(true);
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
          this.savingVitals.set(false);
          this.showVitalsModal.set(false);
          if (active.id) this.loadPatientClinicalData(active.id);
        },
        error: () => this.savingVitals.set(false),
      });
  }

  administerMedication(rx: Prescription): void {
    const patient = this.patientContext.activePatient();
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
        if (patient.id) this.apiService.getEmarHistoryForPatient(patient.id).subscribe((res) => this.emarHistory.set(res));
      },
    });
  }

  saveAllergy(): void {
    const active = this.patientContext.activePatient();
    if (!active || !active.id || !this.newAllergy.allergenName || this.savingAllergy()) return;

    this.savingAllergy.set(true);
    this.apiService
      .createAllergy({
        patient: { id: Number(active.id) } as Patient,
        allergenName: this.newAllergy.allergenName,
        category: this.newAllergy.category,
        severity: this.newAllergy.severity,
        reactionDescription: this.newAllergy.reactionDescription,
        status: this.newAllergy.status,
      })
      .subscribe({
        next: () => {
          this.savingAllergy.set(false);
          this.showAllergyModal.set(false);
          this.newAllergy.allergenName = '';
          this.newAllergy.reactionDescription = '';
          if (active.id) this.loadPatientClinicalData(active.id);
        },
        error: () => this.savingAllergy.set(false),
      });
  }
}
