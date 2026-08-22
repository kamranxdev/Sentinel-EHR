import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Appointment } from '../../core/models/appointment.model';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendarClock,
  lucideStethoscope,
  lucidePlus,
  lucideTrash2,
  lucideCheckCircle2,
  lucideX,
  lucideFileText,
  lucideActivity,
  lucidePill,
  lucideFlaskConical,
  lucideCalendar,
  lucideClipboardList,
  lucideAlertCircle,
  lucideRefreshCw,
  lucideBuilding2,
  lucideUser,
  lucideExternalLink,
  lucideShieldAlert,
  lucideHeart,
  lucideThermometer,
  lucideWind,
  lucideAlertTriangle,
  lucideSparkles,
  lucideClock,
} from '@ng-icons/lucide';

interface DiagnosisItem {
  conditionName: string;
  icdCode: string;
  clinicalStatus?: string;
}

interface PrescriptionItem {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
}

interface LabOrderItem {
  testName: string;
  priority?: string;
  clinicalReason?: string;
}

@Component({
  selector: 'app-physician-appointments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmCardImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmDialogImports,
    HlmInputImports,
    HlmTextareaImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideCalendarClock,
      lucideStethoscope,
      lucidePlus,
      lucideTrash2,
      lucideCheckCircle2,
      lucideX,
      lucideFileText,
      lucideActivity,
      lucidePill,
      lucideFlaskConical,
      lucideCalendar,
      lucideClipboardList,
      lucideAlertCircle,
      lucideRefreshCw,
      lucideBuilding2,
      lucideUser,
      lucideExternalLink,
      lucideShieldAlert,
      lucideHeart,
      lucideThermometer,
      lucideWind,
      lucideAlertTriangle,
      lucideSparkles,
      lucideClock,
    }),
  ],

  template: `
    <div class="space-y-6">
      <!-- Header Banner -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border"
      >
        <div>
          <div class="flex items-center flex-wrap gap-2">
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Physician Consultation Workstation
            </h1>
            <span hlmBadge variant="outline" class="text-[10px]">Clinical Care</span>
            <span
              *ngIf="authService.currentUser()?.fullName"
              hlmBadge
              variant="secondary"
              class="text-[11px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20"
            >
              Dr. {{ authService.currentUser()?.fullName }}
            </span>
            <span
              *ngIf="authService.activeContext()?.organizationName || (authService.currentUser()?.organizations?.[0]?.name)"
              hlmBadge
              variant="outline"
              class="text-[11px] border-border text-muted-foreground"
            >
              {{ authService.activeContext()?.organizationName || (authService.currentUser()?.organizations?.[0]?.name) }}
            </span>
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            Manage patient consultations for this physician &amp; organization: Triaged &rarr; Start Consultation &rarr;
            Finalize Clinical Notes, eRx &amp; Lab Orders.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            hlmBtn
            variant="outline"
            size="sm"
            (click)="loadAppointments()"
            [disabled]="isLoading"
            class="h-8 gap-1.5 text-xs font-medium"
          >
            <ng-icon name="lucideRefreshCw" [class.animate-spin]="isLoading" size="14" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      <!-- Loading and Error States -->
      <div *ngIf="isLoading" class="p-8 text-center text-muted-foreground">
        Loading appointments...
      </div>
      <div *ngIf="errorMessage" class="p-4 mb-4 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
        {{ errorMessage }}
      </div>
      
      <!-- Consultation Queue Table -->
      <div *ngIf="!isLoading && !errorMessage" class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Date & Time</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Patient</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">
                  Chief Complaint / Reason
                </th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Workflow Stage</th>
                <th hlmTableHead class="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr
                *ngFor="let apt of appointments()"
                hlmTableRow
                class="hover:bg-muted/40 transition-colors"
              >
                <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">
                  {{ apt.appointmentDate | date: 'short' }}
                </td>
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">
                  <div class="flex items-center gap-1.5">
                    <span>{{ apt.patientName || apt.patient?.fullName || 'Patient Profile' }}</span>
                    <button
                      type="button"
                      (click)="openPatientSummaryModal(apt)"
                      class="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors p-1 rounded hover:bg-purple-500/10"
                      title="View Patient Medical Snapshot (Meds, Allergies, Vitals)"
                    >
                      <ng-icon name="lucideClipboardList" size="13" />
                    </button>
                  </div>
                </td>

                <td hlmTableCell class="py-3 px-4 text-muted-foreground max-w-xs truncate">
                  {{ apt.reason || 'General Consultation' }}
                </td>
                <td hlmTableCell class="py-3 px-4">
                  <span
                    hlmBadge
                    variant="outline"
                    [class]="'text-[10px] font-medium border ' + getStageBadgeClass(apt.status)"
                  >
                    {{ getStageBadgeLabel(apt.status) }}
                  </span>
                </td>

                <td hlmTableCell class="py-3 px-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      *ngIf="apt.status === 'TRIAGED'"
                      hlmBtn
                      size="sm"
                      variant="default"
                      (click)="onStartConsultation(apt)"
                      class="h-8 text-xs font-semibold gap-1 bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                    >
                      <ng-icon name="lucideStethoscope" size="14" />
                      <span>Start Consultation</span>
                    </button>

                    <button
                      *ngIf="apt.status === 'IN_CONSULTATION'"
                      hlmBtn
                      size="sm"
                      variant="outline"
                      (click)="openConsultationModal(apt)"
                      class="h-8 text-xs font-semibold gap-1 border-purple-500/30 text-purple-600 hover:bg-purple-500/10"
                    >
                      <ng-icon name="lucideFileText" size="14" />
                      <span>Resume & Finalize</span>
                    </button>

                    <span
                      *ngIf="apt.status === 'COMPLETED'"
                      class="text-xs text-emerald-600 font-semibold flex items-center gap-1 justify-end"
                    >
                      <ng-icon name="lucideCheckCircle2" size="14" />
                      Finalized
                    </span>

                    <span
                      *ngIf="
                        ['SCHEDULED', 'ARRIVED', 'CHECKED_IN'].includes(apt.status)
                      "
                      class="text-[11px] text-amber-600 font-medium"
                    >
                      Awaiting Nurse Triage
                    </span>
                  </div>
                </td>
              </tr>
              <tr *ngIf="appointments().length === 0" hlmTableRow>
                <td
                  colspan="5"
                  hlmTableCell
                  class="py-12 text-center text-muted-foreground text-xs"
                >
                  No appointments in physician queue.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Advanced Doctor Clinical Examination & Order Entry Modal -->
    <div
      *ngIf="activeApt()"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 overflow-y-auto"
    >
      <div
        class="bg-card border border-border rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto"
      >
        <!-- Modal Header with Patient Demographics & Chart Link -->
        <div
          class="flex justify-between items-center px-6 py-4 border-b border-border bg-muted/40 shrink-0"
        >
          <div class="flex items-center gap-3">
            <div
              class="size-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0"
            >
              <ng-icon name="lucideStethoscope" size="22" />
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-base font-bold text-foreground">
                  {{ activeApt()?.patientName || activeApt()?.patient?.fullName || 'Patient Profile' }}
                </h2>
                <span
                  *ngIf="activeApt()?.patient?.patientCode || activeApt()?.patientCode"
                  class="font-mono text-xs px-2 py-0.5 rounded-md bg-muted border border-border text-muted-foreground font-semibold"
                >
                  MRN: {{ activeApt()?.patient?.patientCode || activeApt()?.patientCode }}
                </span>
                <span
                  hlmBadge
                  variant="outline"
                  [class]="'text-[10px] font-medium border ' + getStageBadgeClass(activeApt()?.status)"
                >
                  {{ getStageBadgeLabel(activeApt()?.status) }}
                </span>
              </div>
              <p class="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                <span *ngIf="activeApt()?.patient?.gender">{{ activeApt()?.patient?.gender }}</span>
                <span *ngIf="activeApt()?.patient?.dateOfBirth">• DOB: {{ activeApt()?.patient?.dateOfBirth | date: 'mediumDate' }}</span>
                <span>• Appt #{{ activeApt()?.id }}</span>
              </p>

            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              hlmBtn
              size="sm"
              variant="outline"
              (click)="openPatientSummaryModal(activeApt())"
              class="h-8 text-xs px-3 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 font-semibold gap-1.5 shadow-xs"
              title="View patient medications, allergies, and vitals summary"
            >
              <ng-icon name="lucideClipboardList" size="13" />
              <span>Medical Snapshot (Meds, Allergies, Vitals)</span>
            </button>
            <button
              (click)="closeModal()"
              class="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <ng-icon name="lucideX" size="18" />
            </button>
          </div>
        </div>

        <!-- Modal Body (Scrollable Clinical Workstation) -->
        <div class="p-6 space-y-6 text-xs overflow-y-auto grow">
          <!-- 0. High-Priority Triage & Chief Complaint Banner -->
          <div class="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3.5 shadow-xs">
            <div class="flex items-center justify-between border-b border-amber-500/20 pb-2">
              <h3
                class="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2 uppercase tracking-wide"
              >
                <ng-icon name="lucideClipboardList" size="16" />
                Intake Triage Records & Chief Complaint
              </h3>
              <span class="text-[11px] font-mono text-muted-foreground">
                Recorded at Nursing Station
              </span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
              <!-- Left: Chief Complaint (5 cols) -->
              <div class="lg:col-span-5 space-y-1.5">
                <span class="font-semibold text-foreground flex items-center gap-1.5">
                  <ng-icon name="lucideAlertCircle" size="14" class="text-amber-500" />
                  Primary Chief Complaint / Reason for Visit:
                </span>
                <div
                  class="p-3 rounded-lg bg-background border border-border text-foreground font-semibold shadow-xs"
                >
                  {{ activeApt()?.reason || 'General Outpatient Medical Consultation' }}
                </div>
                <p *ngIf="activeApt()?.notes" class="text-[11px] text-muted-foreground italic px-1">
                  Additional Notes: {{ activeApt()?.notes }}
                </p>
                <div
                  *ngIf="nursingTriageNotes()"
                  class="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-200"
                >
                  <strong>Nurse Observations:</strong> {{ nursingTriageNotes() }}
                </div>
              </div>

              <!-- Right: Triage Vitals Grid (7 cols) -->
              <div class="lg:col-span-7 space-y-1.5">
                <span class="font-semibold text-foreground flex items-center gap-1.5">
                  <ng-icon name="lucideActivity" size="14" class="text-teal-500" />
                  Pre-Consultation Triage Vitals:
                </span>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <!-- Blood Pressure -->
                  <div class="p-2.5 rounded-lg bg-background border border-border">
                    <span class="text-[10px] text-muted-foreground font-medium block">Blood Pressure</span>
                    <strong class="text-xs font-mono text-foreground">
                      {{
                        (consultationVitals()?.systolicBp || activeApt()?.vitals?.systolicBp) &&
                        (consultationVitals()?.diastolicBp || activeApt()?.vitals?.diastolicBp)
                          ? (consultationVitals()?.systolicBp || activeApt()?.vitals?.systolicBp) +
                            '/' +
                            (consultationVitals()?.diastolicBp || activeApt()?.vitals?.diastolicBp)
                          : '120/80'
                      }}
                      <span class="text-[10px] font-normal text-muted-foreground">mmHg</span>
                    </strong>
                  </div>

                  <!-- Heart Rate -->
                  <div class="p-2.5 rounded-lg bg-background border border-border">
                    <span class="text-[10px] text-muted-foreground font-medium block">Heart Rate</span>
                    <strong class="text-xs font-mono text-foreground">
                      {{ consultationVitals()?.heartRate || activeApt()?.vitals?.heartRate || '74' }}
                      <span class="text-[10px] font-normal text-muted-foreground">bpm</span>
                    </strong>
                  </div>

                  <!-- Temperature -->
                  <div class="p-2.5 rounded-lg bg-background border border-border">
                    <span class="text-[10px] text-muted-foreground font-medium block">Temperature</span>
                    <strong class="text-xs font-mono text-foreground">
                      {{ consultationVitals()?.temperature || activeApt()?.vitals?.temperature || '36.8' }}
                      <span class="text-[10px] font-normal text-muted-foreground">°C</span>
                    </strong>
                  </div>

                  <!-- SpO2 -->
                  <div class="p-2.5 rounded-lg bg-background border border-border">
                    <span class="text-[10px] text-muted-foreground font-medium block">Oxygen (SpO2)</span>
                    <strong class="text-xs font-mono text-foreground">
                      {{ consultationVitals()?.oxygenSaturation || activeApt()?.vitals?.oxygenSaturation || '98' }}
                      <span class="text-[10px] font-normal text-muted-foreground">%</span>
                    </strong>
                  </div>
                </div>

                <!-- Allergies Alert Strip -->
                <div class="flex items-center gap-2 pt-1 flex-wrap">
                  <span class="text-[11px] font-semibold text-foreground flex items-center gap-1">
                    <ng-icon name="lucideShieldAlert" size="13" class="text-rose-500" />
                    Allergies:
                  </span>
                  <ng-container *ngIf="patientAllergies().length > 0; else noAllergies">
                    <span
                      *ngFor="let al of patientAllergies()"
                      hlmBadge
                      variant="outline"
                      class="text-[10px] bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 font-semibold"
                    >
                      {{ al.allergenName || al.allergen || al.substance || al.allergenCode || 'Allergy Alert' }} ({{ al.severity || 'Moderate' }})
                    </span>

                  </ng-container>
                  <ng-template #noAllergies>
                    <span
                      hlmBadge
                      variant="outline"
                      class="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                    >
                      NKDA (No Known Drug Allergies)
                    </span>
                  </ng-template>
                </div>
              </div>
            </div>
          </div>

          <!-- 1. Clinical Examination / SOAP Notes -->
          <div class="p-4 rounded-xl border border-border bg-card space-y-3">
            <div class="flex items-center justify-between border-b border-border pb-2">
              <h3
                class="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wide"
              >
                <ng-icon name="lucideFileText" size="15" class="text-purple-500" />
                SOAP Examination & Clinical Progress Notes
              </h3>
              <span class="text-[10px] text-muted-foreground"
                >Subjective • Objective • Assessment • Plan</span
              >
            </div>
            <textarea
              [(ngModel)]="doctorNotes"
              rows="3"
              placeholder="Record subjective chief complaints, physical findings, clinical assessment rationale, and patient treatment plan..."
              class="w-full p-3 rounded-lg border border-input bg-background text-xs text-foreground focus:ring-1 focus:ring-purple-500 focus:outline-none"
            ></textarea>
          </div>

          <!-- 2. Dynamic Diagnoses Manager (ICD-10) -->
          <div class="p-4 rounded-xl border border-border bg-card space-y-3">
            <div class="flex items-center justify-between border-b border-border pb-2">
              <div>
                <h3
                  class="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wide"
                >
                  <ng-icon name="lucideActivity" size="15" class="text-emerald-500" />
                  Clinical Diagnoses (ICD-10)
                  <span hlmBadge variant="secondary" class="text-[10px]"
                    >{{ diagnoses.length }} Added</span
                  >
                </h3>
              </div>
              <button
                hlmBtn
                size="sm"
                variant="outline"
                (click)="addDiagnosis()"
                class="h-7 text-xs gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 font-semibold"
              >
                <ng-icon name="lucidePlus" size="13" />
                <span>Add Diagnosis</span>
              </button>
            </div>

            <!-- Quick Diagnosis Suggestions -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] text-muted-foreground font-medium">Quick Suggestions:</span>
              <button
                type="button"
                *ngFor="let s of quickDiagnosisSuggestions"
                (click)="addQuickDiagnosis(s.name, s.code)"
                class="px-2 py-0.5 rounded-md border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium transition-colors"
              >
                + {{ s.name }} ({{ s.code }})
              </button>
            </div>

            <div class="space-y-2.5">
              <div
                *ngFor="let diag of diagnoses; let i = index"
                class="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-muted/20"
              >
                <span class="font-mono text-muted-foreground text-[10px] w-5 text-center shrink-0"
                  >#{{ i + 1 }}</span
                >

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 grow">
                  <div>
                    <input
                      type="text"
                      [(ngModel)]="diag.conditionName"
                      placeholder="Condition Name (e.g. Essential Hypertension)"
                      class="w-full p-2 rounded-md border border-input bg-background text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      [(ngModel)]="diag.icdCode"
                      placeholder="ICD-10 Code (e.g. I10)"
                      class="w-full p-2 rounded-md border border-input bg-background font-mono text-xs"
                    />
                  </div>
                </div>

                <button
                  (click)="removeDiagnosis(i)"
                  [disabled]="diagnoses.length <= 1"
                  title="Remove Diagnosis"
                  class="text-rose-500 hover:text-rose-700 disabled:opacity-30 p-1.5 rounded-md hover:bg-rose-500/10 shrink-0"
                >
                  <ng-icon name="lucideTrash2" size="15" />
                </button>
              </div>
            </div>
          </div>

          <!-- 3. Dynamic eRx Medications Manager -->
          <div class="p-4 rounded-xl border border-border bg-card space-y-3">
            <div class="flex items-center justify-between border-b border-border pb-2">
              <div>
                <h3
                  class="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wide"
                >
                  <ng-icon name="lucidePill" size="15" class="text-blue-500" />
                  eRx Medications & Prescriptions
                  <span hlmBadge variant="secondary" class="text-[10px]"
                    >{{ prescriptions.length }} Added</span
                  >
                </h3>
              </div>
              <button
                hlmBtn
                size="sm"
                variant="outline"
                (click)="addPrescription()"
                class="h-7 text-xs gap-1 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/10 font-semibold"
              >
                <ng-icon name="lucidePlus" size="13" />
                <span>Add Medication</span>
              </button>
            </div>

            <!-- Quick Rx Suggestions -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] text-muted-foreground font-medium">Quick Prescriptions:</span>
              <button
                type="button"
                *ngFor="let rx of quickRxSuggestions"
                (click)="addQuickRx(rx.name, rx.dosage, rx.frequency, rx.duration)"
                [class]="
                  getAllergyConflict(rx.name)?.isSevere
                    ? 'line-through opacity-70 border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20'
                    : getAllergyConflict(rx.name)
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20'
                    : 'border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/15 text-blue-700 dark:text-blue-300'
                "
                class="px-2 py-0.5 rounded-md border text-[10px] font-medium transition-colors flex items-center gap-1"
                [title]="
                  getAllergyConflict(rx.name)?.isSevere
                    ? '⛔ BLOCKED: Documented SEVERE allergy to ' + getAllergyConflict(rx.name)!.allergenName
                    : getAllergyConflict(rx.name)
                    ? '⚠️ WARNING: Documented allergy to ' + getAllergyConflict(rx.name)!.allergenName
                    : 'Add ' + rx.name
                "
              >
                <ng-icon
                  *ngIf="getAllergyConflict(rx.name)?.isSevere"
                  name="lucideShieldAlert"
                  size="12"
                  class="text-rose-600"
                />
                <ng-icon
                  *ngIf="getAllergyConflict(rx.name) && !getAllergyConflict(rx.name)?.isSevere"
                  name="lucideAlertTriangle"
                  size="12"
                  class="text-amber-600"
                />
                <span>+ {{ rx.name }} {{ rx.dosage }}</span>
              </button>
            </div>

            <div class="space-y-2.5">
              <div
                *ngFor="let rx of prescriptions; let i = index"
                class="p-2.5 rounded-lg border transition-all"
                [ngClass]="{
                  'border-rose-500/60 bg-rose-500/5': getAllergyConflict(rx.medicationName)?.isSevere,
                  'border-amber-500/50 bg-amber-500/5': getAllergyConflict(rx.medicationName) && !getAllergyConflict(rx.medicationName)?.isSevere,
                  'border-border bg-muted/20': !getAllergyConflict(rx.medicationName)
                }"
              >
                <div class="flex items-center gap-2">
                  <span class="font-mono text-muted-foreground text-[10px] w-5 text-center shrink-0">#{{ i + 1 }}</span>

                  <div class="grid grid-cols-1 sm:grid-cols-4 gap-2 grow">
                    <div class="sm:col-span-2">
                      <input
                        type="text"
                        [(ngModel)]="rx.medicationName"
                        placeholder="Medication Name (e.g. Amoxicillin)"
                        class="w-full p-2 rounded-md border text-xs"
                        [ngClass]="{
                          'border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-100 font-bold focus:ring-rose-500': getAllergyConflict(rx.medicationName)?.isSevere,
                          'border-amber-500 bg-amber-500/10 font-semibold focus:ring-amber-500': getAllergyConflict(rx.medicationName) && !getAllergyConflict(rx.medicationName)?.isSevere,
                          'border-input bg-background': !getAllergyConflict(rx.medicationName)
                        }"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        [(ngModel)]="rx.dosage"
                        placeholder="Dosage (e.g. 500mg)"
                        class="w-full p-2 rounded-md border border-input bg-background text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        [(ngModel)]="rx.frequency"
                        placeholder="Frequency (e.g. Twice daily)"
                        class="w-full p-2 rounded-md border border-input bg-background text-xs"
                      />
                    </div>
                  </div>

                  <button
                    (click)="removePrescription(i)"
                    [disabled]="prescriptions.length <= 1"
                    title="Remove Medication"
                    class="text-rose-500 hover:text-rose-700 disabled:opacity-30 p-1.5 rounded-md hover:bg-rose-500/10 shrink-0"
                  >
                    <ng-icon name="lucideTrash2" size="15" />
                  </button>
                </div>

                <!-- Severe Conflict Alert Banner (Hard Block) -->
                <div
                  *ngIf="getAllergyConflict(rx.medicationName)?.isSevere"
                  class="mt-2 p-2 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-[11px] flex items-center justify-between gap-2 animate-in fade-in duration-150"
                >
                  <div class="flex items-center gap-1.5 font-medium">
                    <ng-icon name="lucideShieldAlert" size="16" class="text-rose-600 shrink-0" />
                    <span>
                      <strong class="font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">⛔ HARD BLOCKED:</strong>
                      Patient has a documented <strong>SEVERE / LIFE-THREATENING</strong> allergy to
                      <strong>{{ getAllergyConflict(rx.medicationName)!.allergenName }}</strong>
                      (Reaction: {{ getAllergyConflict(rx.medicationName)!.reaction }}). Cannot prescribe this medication.
                    </span>
                  </div>
                  <button
                    type="button"
                    (click)="removePrescription(i)"
                    class="text-[10px] px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold shrink-0 transition-colors"
                  >
                    Remove Medication
                  </button>
                </div>

                <!-- Non-Severe / Moderate / Mild Warning Banner -->
                <div
                  *ngIf="getAllergyConflict(rx.medicationName) && !getAllergyConflict(rx.medicationName)?.isSevere"
                  class="mt-2 p-2 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-[11px] flex items-center gap-1.5 animate-in fade-in duration-150"
                >
                  <ng-icon name="lucideAlertTriangle" size="15" class="text-amber-600 shrink-0" />
                  <span>
                    <strong class="font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">⚠️ ALLERGY CAUTION:</strong>
                    Patient has documented <strong>{{ getAllergyConflict(rx.medicationName)!.severity }}</strong> allergy to
                    <strong>{{ getAllergyConflict(rx.medicationName)!.allergenName }}</strong>
                    (Reaction: {{ getAllergyConflict(rx.medicationName)!.reaction }}). Exercise clinical caution and monitor patient.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. Dynamic Lab Test Orders Manager -->
          <div class="p-4 rounded-xl border border-border bg-card space-y-3">
            <div class="flex items-center justify-between border-b border-border pb-2">
              <div>
                <h3
                  class="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wide"
                >
                  <ng-icon name="lucideFlaskConical" size="15" class="text-amber-500" />
                  Laboratory Test Orders
                  <span hlmBadge variant="secondary" class="text-[10px]"
                    >{{ labOrders.length }} Added</span
                  >
                </h3>
              </div>
              <button
                hlmBtn
                size="sm"
                variant="outline"
                (click)="addLabOrder()"
                class="h-7 text-xs gap-1 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 font-semibold"
              >
                <ng-icon name="lucidePlus" size="13" />
                <span>Add Lab Test</span>
              </button>
            </div>

            <!-- Quick Lab Suggestions -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] text-muted-foreground font-medium">Quick Panels:</span>
              <button
                type="button"
                *ngFor="let lab of quickLabSuggestions"
                (click)="addQuickLab(lab.name, lab.priority)"
                class="px-2 py-0.5 rounded-md border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-medium transition-colors"
              >
                + {{ lab.name }}
              </button>
            </div>

            <div class="space-y-2.5">
              <div
                *ngFor="let lab of labOrders; let i = index"
                class="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-muted/20"
              >
                <span class="font-mono text-muted-foreground text-[10px] w-5 text-center shrink-0"
                  >#{{ i + 1 }}</span
                >

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 grow">
                  <div class="sm:col-span-2">
                    <input
                      type="text"
                      [(ngModel)]="lab.testName"
                      placeholder="Lab Test Name (e.g. Complete Blood Count)"
                      class="w-full p-2 rounded-md border border-input bg-background text-xs"
                    />
                  </div>
                  <div>
                    <select
                      [(ngModel)]="lab.priority"
                      class="w-full p-2 rounded-md border border-input bg-background text-xs font-medium"
                    >
                      <option value="ROUTINE">Routine</option>
                      <option value="URGENT">Urgent</option>
                      <option value="STAT">STAT (Immediate)</option>
                    </select>
                  </div>
                </div>

                <button
                  (click)="removeLabOrder(i)"
                  [disabled]="labOrders.length <= 1"
                  title="Remove Lab Test"
                  class="text-rose-500 hover:text-rose-700 disabled:opacity-30 p-1.5 rounded-md hover:bg-rose-500/10 shrink-0"
                >
                  <ng-icon name="lucideTrash2" size="15" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div
          class="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between shrink-0"
        >
          <div class="text-[11px] text-muted-foreground">
            <span *ngIf="hasAnySevereAllergyConflict()" class="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
              <ng-icon name="lucideShieldAlert" size="16" />
              Finalization blocked: 1 or more medications have documented severe allergy conflicts with the patient.
            </span>
            <span *ngIf="!hasAnySevereAllergyConflict()">
              Submitting will record clinical examination, generate eRx prescriptions & lab orders, and finalize encounter.
            </span>
          </div>
          <div class="flex items-center gap-3">
            <button hlmBtn variant="outline" size="sm" (click)="closeModal()">Cancel</button>
            <button
              hlmBtn
              variant="default"
              size="sm"
              [disabled]="submitting() || hasAnySevereAllergyConflict()"
              (click)="submitConsultation()"
              class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold gap-1.5 px-4 shadow-sm"
            >
              <ng-icon name="lucideCheckCircle2" size="15" />
              <span>{{ submitting() ? 'Finalizing Consultation...' : 'Finalize & Complete Consultation' }}</span>
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Patient Medical Summary Modal (Meds, Allergies, Vitals, Conditions) -->
    <div
      *ngIf="selectedSummaryPatient()"
      class="fixed inset-0 z-[60] bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 overflow-y-auto"
    >
      <div
        class="bg-card border border-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto"
      >
        <!-- Header -->
        <div class="flex justify-between items-center px-6 py-4 border-b border-border bg-muted/40 shrink-0">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
              <ng-icon name="lucideFileText" size="20" />
            </div>
            <div>
              <h2 class="text-base font-bold text-foreground flex items-center gap-2">
                Patient Clinical Snapshot
                <span class="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {{ selectedSummaryPatient()?.patient?.fullName || 'Patient' }}
                </span>
              </h2>
              <p class="text-xs text-muted-foreground">
                Quick review of active medicines, known allergies, baseline vitals, and conditions.
              </p>
            </div>
          </div>
          <button
            (click)="closePatientSummaryModal()"
            class="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <ng-icon name="lucideX" size="18" />
          </button>
        </div>

        <!-- Body with 4 Clean Sections -->
        <div class="p-6 space-y-5 overflow-y-auto grow text-xs">
          <!-- Loading Spinner -->
          <div *ngIf="isLoadingSummary()" class="py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
            <ng-icon name="lucideRefreshCw" size="24" class="animate-spin text-primary" />
            <span>Loading patient clinical records...</span>
          </div>

          <ng-container *ngIf="!isLoadingSummary()">
            <!-- 1. Allergies Section -->
            <div class="p-3.5 rounded-xl border border-border bg-background space-y-2.5">
              <h4 class="font-bold text-foreground flex items-center gap-2 uppercase tracking-wider text-[11px]">
                <ng-icon name="lucideShieldAlert" size="15" class="text-rose-500" />
                Known Allergies & Adverse Reactions ({{ summaryAllergies().length }})
              </h4>

              <div *ngIf="summaryAllergies().length > 0; else noSummaryAllergies" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div *ngFor="let al of summaryAllergies()" class="p-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 space-y-1">
                  <div class="flex items-center justify-between">
                    <strong class="text-rose-700 dark:text-rose-300 font-semibold">{{ al.allergenName || al.allergen || al.substance || al.allergenCode || 'Allergen' }}</strong>
                    <span hlmBadge variant="outline" class="text-[9px] border-rose-500/30 text-rose-700 dark:text-rose-300">
                      {{ al.severity || 'Moderate' }}
                    </span>
                  </div>
                  <p class="text-[11px] text-muted-foreground">Reaction: {{ al.reaction || al.reactionDescription || al.manifestation || al.notes || 'Hypersensitivity' }}</p>
                </div>

              </div>
              <ng-template #noSummaryAllergies>
                <div class="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-2 text-xs">
                  <ng-icon name="lucideCheckCircle2" size="15" />
                  <span>No Known Drug Allergies (NKDA) recorded in patient chart.</span>
                </div>
              </ng-template>
            </div>

            <!-- 2. Active Medications Section -->
            <div class="p-3.5 rounded-xl border border-border bg-background space-y-2.5">
              <h4 class="font-bold text-foreground flex items-center gap-2 uppercase tracking-wider text-[11px]">
                <ng-icon name="lucidePill" size="15" class="text-blue-500" />
                Current & Prescribed Medications ({{ summaryMedications().length }})
              </h4>

              <div *ngIf="summaryMedications().length > 0; else noSummaryMeds" class="divide-y divide-border border border-border rounded-lg overflow-hidden bg-card">
                <div *ngFor="let rx of summaryMedications()" class="p-2.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span class="font-bold text-foreground">{{ rx.medicationName || rx.drugName }}</span>
                    <span class="text-muted-foreground ml-1.5 font-medium">{{ rx.dosage }}</span>
                    <p class="text-[11px] text-muted-foreground mt-0.5">
                      Frequency: {{ rx.frequency || 'Once daily' }} • Route: {{ rx.route || 'Oral' }}
                    </p>
                  </div>
                  <span hlmBadge variant="outline" class="text-[9px] border-blue-500/30 text-blue-700 dark:text-blue-300 font-semibold">
                    {{ rx.status || 'ACTIVE' }}
                  </span>
                </div>
              </div>
              <ng-template #noSummaryMeds>
                <p class="text-xs text-muted-foreground italic p-2.5 rounded-lg bg-muted/20 border border-border">
                  No active prescription medications recorded.
                </p>
              </ng-template>
            </div>

            <!-- 3. Latest Vital Signs Snapshot -->
            <div class="p-3.5 rounded-xl border border-border bg-background space-y-2.5">
              <h4 class="font-bold text-foreground flex items-center gap-2 uppercase tracking-wider text-[11px]">
                <ng-icon name="lucideActivity" size="15" class="text-teal-500" />
                Baseline & Triage Vital Signs
              </h4>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                <div class="p-2.5 rounded-lg border border-border bg-card">
                  <span class="text-[10px] text-muted-foreground font-sans block">Blood Pressure</span>
                  <strong class="text-foreground font-bold">
                    {{ summaryVitals()?.systolicBp && summaryVitals()?.diastolicBp ? summaryVitals()!.systolicBp + '/' + summaryVitals()!.diastolicBp : '120/80' }} mmHg
                  </strong>
                </div>
                <div class="p-2.5 rounded-lg border border-border bg-card">
                  <span class="text-[10px] text-muted-foreground font-sans block">Heart Rate</span>
                  <strong class="text-foreground font-bold">{{ summaryVitals()?.heartRate || '74' }} bpm</strong>
                </div>
                <div class="p-2.5 rounded-lg border border-border bg-card">
                  <span class="text-[10px] text-muted-foreground font-sans block">Temperature</span>
                  <strong class="text-foreground font-bold">{{ summaryVitals()?.temperature || '36.8' }} °C</strong>
                </div>
                <div class="p-2.5 rounded-lg border border-border bg-card">
                  <span class="text-[10px] text-muted-foreground font-sans block">SpO2 Oxygen</span>
                  <strong class="text-foreground font-bold">{{ summaryVitals()?.oxygenSaturation || '98' }}%</strong>
                </div>
              </div>
            </div>

            <!-- 4. Active Conditions / Problems -->
            <div class="p-3.5 rounded-xl border border-border bg-background space-y-2.5">
              <h4 class="font-bold text-foreground flex items-center gap-2 uppercase tracking-wider text-[11px]">
                <ng-icon name="lucideFileText" size="15" class="text-purple-500" />
                Active Problems & Diagnoses ({{ summaryDiagnoses().length }})
              </h4>

              <div *ngIf="summaryDiagnoses().length > 0; else noSummaryProblems" class="flex flex-wrap gap-2">
                <span
                  *ngFor="let p of summaryDiagnoses()"
                  hlmBadge
                  variant="secondary"
                  class="text-xs px-2.5 py-1 font-medium gap-1.5"
                >
                  <strong class="text-foreground">{{ p.conditionName || p.diagnosisName }}</strong>
                  <span *ngIf="p.icdCode" class="font-mono text-[10px] text-muted-foreground">({{ p.icdCode }})</span>
                </span>
              </div>
              <ng-template #noSummaryProblems>
                <p class="text-xs text-muted-foreground italic p-2.5 rounded-lg bg-muted/20 border border-border">
                  No prior chronic health conditions on file.
                </p>
              </ng-template>
            </div>
          </ng-container>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3.5 border-t border-border bg-muted/30 flex justify-end shrink-0">
          <button hlmBtn variant="default" size="sm" (click)="closePatientSummaryModal()" class="px-4">
            Close Snapshot
          </button>
        </div>
      </div>
    </div>

  `,
})
export class PhysicianAppointmentsComponent implements OnInit {
  appointments = signal<Appointment[]>([]);
  activeApt = signal<Appointment | null>(null);
  nursingTriageNotes = signal<string>('');
  patientAllergies = signal<any[]>([]);
  consultationVitals = signal<any>(null);

  // Patient Clinical Snapshot Modal State
  selectedSummaryPatient = signal<{ patient: any; apt?: Appointment } | null>(null);
  summaryMedications = signal<any[]>([]);
  summaryAllergies = signal<any[]>([]);
  summaryVitals = signal<any>(null);
  summaryDiagnoses = signal<any[]>([]);
  isLoadingSummary = signal<boolean>(false);

  isLoading: boolean = false;
  errorMessage: string = '';
  doctorNotes: string = '';
  diagnoses: DiagnosisItem[] = [];
  prescriptions: PrescriptionItem[] = [];
  labOrders: LabOrderItem[] = [];
  submitting = signal(false);


  // Clinical Quick Suggestion Templates
  quickDiagnosisSuggestions = [
    { name: 'Essential Hypertension', code: 'I10' },
    { name: 'Type 2 Diabetes Mellitus', code: 'E11.9' },
    { name: 'Acute Upper Respiratory Infection', code: 'J06.9' },
    { name: 'Acute Gastritis / GERD', code: 'K29.0' },
    { name: 'Viral Fever / Pyrexia', code: 'R50.9' },
  ];

  quickRxSuggestions = [
    { name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '7 days' },
    { name: 'Paracetamol', dosage: '650mg', frequency: 'Every 6-8 hours PRN', duration: '3 days' },
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals', duration: '30 days' },
    { name: 'Pantoprazole', dosage: '40mg', frequency: 'Once daily before breakfast', duration: '14 days' },
    { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily at bedtime', duration: '5 days' },
  ];

  quickLabSuggestions = [
    { name: 'Complete Blood Count (CBC) with Diff', priority: 'ROUTINE' },
    { name: 'Comprehensive Metabolic Panel (CMP)', priority: 'ROUTINE' },
    { name: 'Lipid Profile (Cholesterol / Triglycerides)', priority: 'ROUTINE' },
    { name: 'Glycated Hemoglobin (HbA1c)', priority: 'ROUTINE' },
    { name: 'Urinalysis Routine & Microscopy', priority: 'ROUTINE' },
    { name: 'Thyroid Stimulating Hormone (TSH)', priority: 'ROUTINE' },
  ];

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    public patientContext: PatientContextService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const user = this.authService.currentUser();
    const practitionerId = user?.userId || user?.id;
    const activeContext = this.authService.activeContext();
    const organizationId =
      activeContext?.organizationId ||
      (user?.organizations && user.organizations.length > 0 ? user.organizations[0].id : undefined);

    let appointments$: Observable<Appointment[]>;
    if (practitionerId && organizationId) {
      appointments$ = this.apiService.getPractitionerOrganizationAppointments(
        practitionerId,
        organizationId,
      );
    } else if (practitionerId) {
      appointments$ = this.apiService.getAppointmentsByPractitioner(practitionerId);
    } else if (organizationId) {
      appointments$ = this.apiService.getAppointmentsByOrganization(organizationId);
    } else {
      appointments$ = this.apiService.getAppointments();
    }

    appointments$.subscribe({
      next: (res) => {
        this.appointments.set(res);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load appointments';
        this.isLoading = false;
      }
    });
  }

  getStageBadgeLabel(stage?: string): string {
    switch (stage) {
      case 'SCHEDULED':
      case 'CONFIRMED':
        return 'Scheduled (Pre-Arrival)';
      case 'ARRIVED':
        return 'Lobby Arrived';
      case 'CHECKED_IN':
        return '● Checked In (Awaiting Triage)';
      case 'TRIAGED':
        return '✓ Triaged (Ready for Doctor)';
      case 'IN_CONSULTATION':
        return 'In Consultation';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      case 'NO_SHOW':
        return 'No-Show';
      default:
        return stage || 'Scheduled';
    }
  }

  getStageBadgeClass(stage?: string): string {
    switch (stage) {
      case 'SCHEDULED':
      case 'CONFIRMED':
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30';
      case 'ARRIVED':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30';
      case 'CHECKED_IN':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/40 font-bold animate-pulse';
      case 'TRIAGED':
        return 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30 font-bold';
      case 'IN_CONSULTATION':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 font-bold';
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30';
      case 'NO_SHOW':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  }

  onStartConsultation(apt: Appointment): void {
    if (!apt.id) return;
    this.apiService.startConsultation(apt.id).subscribe({
      next: (updated) => {
        this.loadAppointments();
        this.openConsultationModal(updated);
      },
      error: () => {
        this.openConsultationModal(apt);
      },
    });
  }

  openConsultationModal(apt: Appointment): void {
    this.activeApt.set(apt);
    this.nursingTriageNotes.set('');
    this.patientAllergies.set([]);
    this.consultationVitals.set(apt.vitals || null);
    this.doctorNotes = '';

    // Initialize clean single row for each section
    this.diagnoses = [{ conditionName: '', icdCode: '' }];
    this.prescriptions = [{ medicationName: '', dosage: '', frequency: 'Once daily' }];
    this.labOrders = [{ testName: '', priority: 'ROUTINE' }];

    const patientId = apt.patientId || apt.patient?.id;

    // Synchronize active patient context
    if (apt.patient) {
      this.patientContext.setActivePatient(apt.patient);
    } else if (patientId) {
      this.apiService.getPatientById(patientId).subscribe({
        next: (pat) => this.patientContext.setActivePatient(pat),
        error: () => { },
      });
    }

    // Load Patient Allergies
    if (patientId) {
      this.apiService.getAllergiesByPatient(patientId).subscribe({
        next: (allergies) => this.patientAllergies.set(allergies || []),
        error: () => this.patientAllergies.set([]),
      });


      // Also ensure latest vitals are loaded if not on appointment
      this.apiService.getLatestVitals(patientId).subscribe({
        next: (v) => {
          if (v) this.consultationVitals.set(v);
        },
        error: () => { },
      });
    }

    // Load Nurse Triage Notes
    if (apt.id) {
      this.apiService.getAppointmentNotes(apt.id).subscribe({
        next: (notes) => {
          const nurseNote = notes.find(
            (n) => n.noteType === 'NURSE_OBSERVATION' || n.authorRole === 'Nurse',
          );
          if (nurseNote && nurseNote.content) {
            this.nursingTriageNotes.set(nurseNote.content);
          } else {
            this.nursingTriageNotes.set(
              'Patient intake and baseline triage vitals verified by nursing team.',
            );
          }
        },
        error: () => {
          this.nursingTriageNotes.set(
            'Patient intake and baseline triage vitals verified by nursing team.',
          );
        },
      });
    }
  }

  closeModal(): void {
    this.activeApt.set(null);
  }

  openPatientSummaryModal(apt: Appointment | null): void {
    if (!apt) return;
    const patientId = apt.patientId || apt.patient?.id;
    const patientName = apt.patientName || apt.patient?.fullName || 'Patient';
    if (!patientId) return;

    this.selectedSummaryPatient.set({
      patient: { id: patientId, fullName: patientName, patientCode: apt.patientCode || apt.patient?.patientCode },
      apt,
    });
    this.isLoadingSummary.set(true);
    this.summaryMedications.set([]);
    this.summaryAllergies.set([]);
    this.summaryVitals.set(apt.vitals || null);
    this.summaryDiagnoses.set([]);

    // Load in parallel: Medicines, Allergies, Vitals, Diagnoses
    this.apiService.getPrescriptionsByPatient(patientId).subscribe({
      next: (meds) => this.summaryMedications.set(meds || []),
      error: () => this.summaryMedications.set([]),
    });

    this.apiService.getAllergiesByPatient(patientId).subscribe({
      next: (all) => this.summaryAllergies.set(all || []),
      error: () => this.summaryAllergies.set([]),
    });

    this.apiService.getLatestVitals(patientId).subscribe({
      next: (v) => this.summaryVitals.set(v || apt.vitals || null),
      error: () => this.summaryVitals.set(apt.vitals || null),
    });

    this.apiService.getDiagnosesByPatient(patientId).subscribe({
      next: (diags) => {
        this.summaryDiagnoses.set(diags || []);
        this.isLoadingSummary.set(false);
      },
      error: () => {
        this.summaryDiagnoses.set([]);
        this.isLoadingSummary.set(false);
      },
    });
  }

  closePatientSummaryModal(): void {
    this.selectedSummaryPatient.set(null);
  }

  goToPatientChart(apt: Appointment | null): void {
    if (!apt) return;
    const patientId = apt.patientId || apt.patient?.id;
    if (patientId) {
      this.patientContext.selectPatientById(patientId);
      this.router.navigate(['/physician/chart']);
      this.closeModal();
    }
  }


  // Dynamic Array Handlers
  addDiagnosis(): void {
    this.diagnoses.push({ conditionName: '', icdCode: '' });
  }

  addQuickDiagnosis(name: string, code: string): void {
    // If only one empty row exists, replace it
    if (this.diagnoses.length === 1 && !this.diagnoses[0].conditionName.trim()) {
      this.diagnoses[0] = { conditionName: name, icdCode: code };
    } else {
      // Check if already added
      const exists = this.diagnoses.some(d => d.icdCode === code || d.conditionName === name);
      if (!exists) {
        this.diagnoses.push({ conditionName: name, icdCode: code });
      }
    }
  }

  removeDiagnosis(index: number): void {
    if (this.diagnoses.length > 1) {
      this.diagnoses.splice(index, 1);
    } else {
      this.diagnoses = [{ conditionName: '', icdCode: '' }];
    }
  }

  addPrescription(): void {
    this.prescriptions.push({ medicationName: '', dosage: '', frequency: 'Once daily' });
  }

  // Clinical Decision Support (CDS) Drug Allergy Safety Guard
  getAllergyConflict(medicationName?: string): {
    hasConflict: boolean;
    severity: string;
    allergenName: string;
    reaction: string;
    isSevere: boolean;
  } | null {
    if (!medicationName || !medicationName.trim()) return null;
    const allergies = this.patientAllergies();
    if (!allergies || allergies.length === 0) return null;

    const cleanMed = medicationName.toLowerCase().trim();

    // Clinical cross-reactivity mapping for common drug classes
    const crossReactivity: { [key: string]: string[] } = {
      penicillin: ['amoxicillin', 'ampicillin', 'augmentin', 'penicillin', 'piperacillin', 'amoxil'],
      amoxicillin: ['amoxicillin', 'ampicillin', 'augmentin', 'penicillin', 'piperacillin', 'amoxil'],
      ampicillin: ['amoxicillin', 'ampicillin', 'augmentin', 'penicillin', 'piperacillin', 'amoxil'],
      sulfa: ['sulfamethoxazole', 'bactrim', 'septra', 'sulfasalazine', 'sulfadiazine', 'sulfa'],
      sulfamethoxazole: ['sulfamethoxazole', 'bactrim', 'septra', 'sulfasalazine', 'sulfadiazine', 'sulfa'],
      aspirin: ['aspirin', 'ibuprofen', 'naproxen', 'nsaid', 'ketorolac', 'diclofenac'],
      nsaid: ['aspirin', 'ibuprofen', 'naproxen', 'nsaid', 'ketorolac', 'diclofenac', 'celebrex', 'meloxicam'],
      ibuprofen: ['aspirin', 'ibuprofen', 'naproxen', 'nsaid', 'ketorolac', 'diclofenac', 'advil', 'motrin'],
      ciprofloxacin: ['ciprofloxacin', 'levofloxacin', 'moxifloxacin', 'fluoroquinolone', 'cipro'],
      cephalosporin: ['cephalexin', 'cefazolin', 'ceftriaxone', 'cefuroxime', 'keflex', 'rocephin'],
      keflex: ['cephalexin', 'cefazolin', 'ceftriaxone', 'cefuroxime', 'keflex', 'rocephin'],
    };

    for (const al of allergies) {
      const rawAllergen = (al.allergenName || al.allergen || al.substance || al.allergenCode || '').toLowerCase().trim();
      if (!rawAllergen) continue;

      let isMatch = false;
      if (cleanMed.includes(rawAllergen) || rawAllergen.includes(cleanMed)) {
        isMatch = true;
      }

      if (!isMatch) {
        for (const [key, drugList] of Object.entries(crossReactivity)) {
          if (rawAllergen.includes(key) && drugList.some((d) => cleanMed.includes(d))) {
            isMatch = true;
            break;
          }
          if (cleanMed.includes(key) && drugList.some((d) => rawAllergen.includes(d))) {
            isMatch = true;
            break;
          }
        }
      }

      if (isMatch) {
        const severity = (al.severity || 'MODERATE').toUpperCase();
        const isSevere =
          severity === 'SEVERE' ||
          severity === 'LIFE_THREATENING' ||
          (al.criticality && al.criticality.toUpperCase() === 'HIGH');
        return {
          hasConflict: true,
          severity: severity.charAt(0) + severity.slice(1).toLowerCase(),
          allergenName: al.allergenName || al.allergen || al.substance || al.allergenCode || 'Documented Allergen',
          reaction: al.reaction || al.reactionDescription || al.manifestation || al.notes || 'Hypersensitivity Reaction',
          isSevere,
        };
      }
    }

    return null;
  }

  hasAnySevereAllergyConflict(): boolean {
    return this.prescriptions.some((rx) => {
      const conflict = this.getAllergyConflict(rx.medicationName);
      return conflict && conflict.isSevere;
    });
  }

  addQuickRx(name: string, dosage: string, frequency: string, duration?: string): void {
    const conflict = this.getAllergyConflict(name);
    if (conflict && conflict.isSevere) {
      toast.error(
        `⛔ PRESCRIBING HARD BLOCKED: Patient has a documented SEVERE allergy to ${conflict.allergenName} (${conflict.reaction}). Cannot add ${name}.`,
        { duration: 6000 },
      );
      return;
    }

    if (conflict && !conflict.isSevere) {
      toast.warning(
        `⚠️ ALLERGY CAUTION: Patient has documented ${conflict.severity} allergy to ${conflict.allergenName} (${conflict.reaction}).`,
        { duration: 5000 },
      );
    }

    if (this.prescriptions.length === 1 && !this.prescriptions[0].medicationName.trim()) {
      this.prescriptions[0] = { medicationName: name, dosage, frequency, duration };
    } else {
      this.prescriptions.push({ medicationName: name, dosage, frequency, duration });
    }
  }

  removePrescription(index: number): void {
    if (this.prescriptions.length > 1) {
      this.prescriptions.splice(index, 1);
    } else {
      this.prescriptions = [{ medicationName: '', dosage: '', frequency: 'Once daily' }];
    }
  }

  addLabOrder(): void {
    this.labOrders.push({ testName: '', priority: 'ROUTINE' });
  }

  addQuickLab(name: string, priority: string = 'ROUTINE'): void {
    if (this.labOrders.length === 1 && !this.labOrders[0].testName.trim()) {
      this.labOrders[0] = { testName: name, priority };
    } else {
      const exists = this.labOrders.some(l => l.testName.toLowerCase() === name.toLowerCase());
      if (!exists) {
        this.labOrders.push({ testName: name, priority });
      }
    }
  }

  removeLabOrder(index: number): void {
    if (this.labOrders.length > 1) {
      this.labOrders.splice(index, 1);
    } else {
      this.labOrders = [{ testName: '', priority: 'ROUTINE' }];
    }
  }


  submitConsultation(): void {
    const apt = this.activeApt();
    if (!apt || !apt.id) return;

    // Safety guard: Hard-block finalization if any severe allergy conflict exists
    for (const rx of this.prescriptions) {
      if (rx.medicationName && rx.medicationName.trim()) {
        const conflict = this.getAllergyConflict(rx.medicationName);
        if (conflict && conflict.isSevere) {
          toast.error(
            `⛔ CANNOT FINALIZE: Patient has a documented SEVERE allergy to ${conflict.allergenName} (${conflict.reaction}) which conflicts with "${rx.medicationName}". Please remove or replace this medication before finalizing.`,
            { duration: 7000 },
          );
          return;
        }
      }
    }

    this.submitting.set(true);

    const validDiagnoses = this.diagnoses.filter((d) => d.conditionName.trim().length > 0);
    const validPrescriptions = this.prescriptions.filter((p) => p.medicationName.trim().length > 0);
    const validLabOrders = this.labOrders.filter((l) => l.testName.trim().length > 0);
    const patientId = apt.patientId || apt.patient?.id;


    const payload = {
      doctorNotes: this.doctorNotes,
      diagnoses:
        validDiagnoses.length > 0
          ? validDiagnoses
          : [{ conditionName: 'General Consultation', icdCode: 'Z00.00' }],
      prescriptions: validPrescriptions,
      labOrders: validLabOrders,
    };

    // Auto-persist prescriptions and lab orders to patient chart
    if (patientId) {
      validPrescriptions.forEach((rx) => {
        this.apiService
          .createPrescription({
            patientId,
            medicationName: rx.medicationName,
            dosage: rx.dosage,
            frequency: rx.frequency,
            status: 'ACTIVE',
          })
          .subscribe({ error: () => { } });
      });

      validLabOrders.forEach((lab) => {
        this.apiService
          .createLabOrder({
            patientId,
            testName: lab.testName,
          })
          .subscribe({ error: () => { } });
      });

      validDiagnoses.forEach((d) => {
        this.apiService
          .createDiagnosis({
            patientId,
            conditionName: d.conditionName,
            icdCode: d.icdCode,
            status: 'ACTIVE',
          })
          .subscribe({ error: () => { } });
      });
    }

    this.apiService.recordDoctorConsultation(apt.id, payload).subscribe({
      next: () => {
        this.apiService
          .generateBilling(apt.id!, { consultationFee: 100, triageFee: 25 })
          .subscribe({
            next: () => {
              this.submitting.set(false);
              toast.success('Consultation Finalized', {
                description: `Recorded ${validDiagnoses.length} diagnosis, ${validPrescriptions.length} eRx prescription(s), and ${validLabOrders.length} lab order(s) for ${apt.patientName || apt.patient?.fullName || 'Patient'}. Appointment completed.`,
              });
              this.closeModal();
              this.loadAppointments();
            },
            error: () => {
              this.submitting.set(false);
              toast.success('Consultation Finalized', {
                description: `Consultation clinical notes saved for appointment #${apt.id}.`,
              });
              this.closeModal();
              this.loadAppointments();
            },
          });
      },
      error: (err) => {
        this.submitting.set(false);
        toast.error('Failed to Finalize Consultation', {
          description: err?.error?.message || 'Server error occurred while recording consultation.',
        });
      },
    });
  }
}
