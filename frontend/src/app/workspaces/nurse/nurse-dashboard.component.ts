import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient } from '../../core/models/patient.model';
import { Appointment } from '../../core/models/appointment.model';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideHospital,
  lucideActivity,
  lucideTriangleAlert,
  lucidePill,
  lucideUserRound,
  lucideCalendarClock,
  lucideChevronRight,
  lucideUsers,
  lucideSearch,
  lucideHeartPulse,
  lucideBed,
  lucideFileText,
  lucideClock,
  lucideCheckCircle2,
  lucideRefreshCw,
  lucideAlertTriangle,
  lucideShieldAlert,
  lucideClipboardList,
  lucideUserCheck,
  lucideArrowRight,
  lucideSparkles,
  lucideDroplet,
  lucideStethoscope,
} from '@ng-icons/lucide';

export interface NurseAssignedInpatient {
  patient: Patient;
  bedCode: string;
  wardName: string;
  roomNumber: string;
  admissionDiagnosis: string;
  ewsScore: number;
  acuityLevel: 'STABLE' | 'OBSERVED' | 'CRITICAL';
  fallRisk: 'LOW' | 'MODERATE' | 'HIGH';
  codeStatus: 'FULL_CODE' | 'DNR' | 'DNI';
  isolation: 'NONE' | 'CONTACT' | 'DROPLET' | 'AIRBORNE';
  attendingPhysician: string;
  nextMedicationTime?: string;
  medsDueCount: number;
  dietOrder?: string;
  ivLineActive: boolean;
}

export interface NursingShiftTask {
  id: string;
  patientName: string;
  bedCode: string;
  taskType: 'EMAR_DUE' | 'VITALS_RECHECK' | 'IO_RECORDING' | 'WOUND_DRESSING' | 'TRIAGE_INTAKE';
  title: string;
  dueTime: string;
  priority: 'HIGH' | 'NORMAL';
  status: 'PENDING' | 'DONE';
}

@Component({
  selector: 'app-nurse-dashboard',
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
      lucideHospital,
      lucideActivity,
      lucideTriangleAlert,
      lucidePill,
      lucideUserRound,
      lucideCalendarClock,
      lucideChevronRight,
      lucideUsers,
      lucideSearch,
      lucideHeartPulse,
      lucideBed,
      lucideFileText,
      lucideClock,
      lucideCheckCircle2,
      lucideRefreshCw,
      lucideAlertTriangle,
      lucideShieldAlert,
      lucideClipboardList,
      lucideUserCheck,
      lucideArrowRight,
      lucideSparkles,
      lucideDroplet,
      lucideStethoscope,
    }),
  ],
  template: `
    <div class="w-full space-y-6">
      <!-- 1. Nurse Header: Shift, Station & Unit Identity -->
      <div
        class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5 border-b border-border"
      >
        <div class="space-y-1">
          <div class="flex items-center flex-wrap gap-2.5">
            <h1
              class="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2"
            >
              <span>Nurse Station Command Desk</span>
            </h1>
            <span
              hlmBadge
              variant="secondary"
              class="bg-primary/10 text-primary border-primary/20 text-[11px] font-semibold py-0.5 px-2.5"
            >
              Staff Nurse: {{ currentUser?.fullName || 'Nurse Fatima' }}
            </span>
            <span
              hlmBadge
              variant="outline"
              class="text-[11px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 flex items-center gap-1"
            >
              <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Morning Shift (07:00 – 15:00)</span>
            </span>
          </div>

          <div class="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span
              >Assigned Unit:
              <strong class="text-foreground">Ward 3A - Acute Internal Medicine</strong></span
            >
            <span class="text-border">•</span>
            <span
              >Hospital / Clinic:
              <strong class="text-foreground">{{
                authService.activeContext()?.organizationName || 'Main Hospital'
              }}</strong></span
            >
            <span class="text-border">•</span>
            <span>Station: <strong class="font-mono text-foreground">STATION-3A-N01</strong></span>
          </div>
        </div>

        <!-- Quick Top Actions -->
        <div class="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <button
            hlmBtn
            variant="outline"
            size="sm"
            (click)="loadStationData()"
            class="gap-1.5 text-xs flex-1 sm:flex-initial"
          >
            <ng-icon name="lucideRefreshCw" [class.animate-spin]="loading()" size="14" />
            <span>Refresh</span>
          </button>
          <a
            routerLink="/nurse/appointments"
            hlmBtn
            variant="outline"
            size="sm"
            class="gap-1.5 text-xs flex-1 sm:flex-initial text-amber-600 hover:text-amber-700 dark:text-amber-400"
          >
            <ng-icon name="lucideClipboardList" size="14" />
            <span>Outpatient Appointments & Triage</span>
          </a>
          <a
            routerLink="/nurse/beds"
            hlmBtn
            variant="default"
            size="sm"
            class="gap-1.5 text-xs shadow-xs flex-1 sm:flex-initial bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <ng-icon name="lucideBed" size="14" />
            <span>Spatial Ward Census</span>
          </a>
        </div>
      </div>

      <!-- High-Acuity Patient Alerts (if any NEWS2 >= 4) -->
      <div
        *ngIf="criticalPatientsCount() > 0"
        class="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
      >
        <div class="flex items-center gap-3">
          <div
            class="size-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0"
          >
            <ng-icon name="lucideAlertTriangle" size="20" />
          </div>
          <div>
            <div class="font-bold text-xs sm:text-sm">
              Clinical Alert: {{ criticalPatientsCount() }} patient(s) in Ward 3A require close
              nursing observation
            </div>
            <p class="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
              Elevated NEWS2 score &ge; 4 or critical vitals detected. Check bedside flowsheet and
              notify attending physician.
            </p>
          </div>
        </div>
        <button
          hlmBtn
          variant="outline"
          size="sm"
          (click)="filterMode.set('CRITICAL')"
          class="h-8 text-xs font-bold border-amber-500/40 bg-card hover:bg-amber-500/20 shrink-0"
        >
          View High-Acuity Roster
        </button>
      </div>

      <!-- 2. Nursing Shift KPI Metric Cards (4 High-Impact Tiles) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Tile 1: Assigned Inpatients in Shift -->
        <div
          (click)="filterMode.set('ALL')"
          class="p-4 rounded-2xl border border-border bg-card shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all space-y-2.5 cursor-pointer group"
          [class.ring-2]="filterMode() === 'ALL'"
          [class.ring-primary]="filterMode() === 'ALL'"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >My Inpatient Census</span
            >
            <div
              class="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center"
            >
              <ng-icon name="lucideBed" size="14" />
            </div>
          </div>
          <div class="flex items-baseline justify-between">
            <span class="text-2xl font-extrabold text-foreground">{{
              assignedInpatients().length
            }}</span>
            <span
              hlmBadge
              variant="secondary"
              class="text-[10px] bg-primary/10 text-primary border-primary/20 font-semibold"
            >
              Ward 3A
            </span>
          </div>
          <div
            class="text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60 group-hover:text-primary"
          >
            <span>Assigned Bedside Patients</span>
            <ng-icon
              name="lucideChevronRight"
              size="12"
              class="group-hover:translate-x-0.5 transition-transform"
            />
          </div>
        </div>

        <!-- Tile 2: Outpatient & ER Triage Queue -->
        <a
          routerLink="/nurse/appointments"
          class="p-4 rounded-2xl border border-border bg-card shadow-2xs hover:border-amber-500/40 hover:shadow-xs transition-all space-y-2.5 group"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >Triage Queue</span
            >
            <div
              class="size-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center"
            >
              <ng-icon name="lucideClipboardList" size="14" />
            </div>
          </div>
          <div class="flex items-baseline justify-between">
            <span class="text-2xl font-extrabold text-foreground">{{ triageQueue().length }}</span>
            <span
              hlmBadge
              variant="outline"
              class="text-[10px] font-semibold text-amber-600 border-amber-500/30"
            >
              {{ getPendingTriageCount() }} Awaiting Intake
            </span>
          </div>
          <div
            class="text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60 group-hover:text-amber-600"
          >
            <span>Pre-Consult Intake</span>
            <ng-icon
              name="lucideChevronRight"
              size="12"
              class="group-hover:translate-x-0.5 transition-transform"
            />
          </div>
        </a>

        <!-- Tile 3: eMAR Medication Administrations Due -->
        <div
          (click)="filterMode.set('MEDS_DUE')"
          class="p-4 rounded-2xl border border-border bg-card shadow-2xs hover:border-emerald-500/40 hover:shadow-xs transition-all space-y-2.5 cursor-pointer group"
          [class.ring-2]="filterMode() === 'MEDS_DUE'"
          [class.ring-emerald-500]="filterMode() === 'MEDS_DUE'"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >eMAR Meds Due</span
            >
            <div
              class="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"
            >
              <ng-icon name="lucidePill" size="14" />
            </div>
          </div>
          <div class="flex items-baseline justify-between">
            <span class="text-2xl font-extrabold text-foreground">{{ totalMedsDue() }}</span>
            <span
              hlmBadge
              variant="secondary"
              class="text-[10px] bg-emerald-500/10 text-emerald-600 font-semibold"
            >
              This Shift
            </span>
          </div>
          <div
            class="text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60 group-hover:text-emerald-600"
          >
            <span>5-Rights Verification</span>
            <span class="text-[10px] text-emerald-600 font-bold">On Schedule</span>
          </div>
        </div>

        <!-- Tile 4: Shift Orders & Tasks -->
        <div class="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >Shift Tasks</span
            >
            <div
              class="size-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center"
            >
              <ng-icon name="lucideActivity" size="14" />
            </div>
          </div>
          <div class="flex items-baseline justify-between">
            <span class="text-2xl font-extrabold text-foreground">{{ shiftTasks().length }}</span>
            <span hlmBadge variant="destructive" class="text-[10px] font-semibold">
              Action Required
            </span>
          </div>
          <div
            class="text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60"
          >
            <span>I/O, Vitals, Dressings</span>
            <span class="text-[10px] font-bold text-rose-600">Pending</span>
          </div>
        </div>
      </div>

      <!-- 3. Main Workstation Grid (8 Cols: Inpatient Census Table + Triage Queue, 4 Cols: Shift Tasks Inbox & Quick Actions) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Left Column (8 Cols): Ward Census Roster & Outpatient Triage -->
        <div class="lg:col-span-8 space-y-6">
          <!-- Section A: Assigned Inpatients in Ward 3A with Filter Tabs -->
          <div class="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div
              class="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
            >
              <div>
                <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
                  <ng-icon name="lucideBed" size="16" class="text-primary" />
                  <span>Ward 3A Bedside Inpatient Census</span>
                </h3>
                <p class="text-xs text-muted-foreground mt-0.5">
                  Admitted inpatients assigned under your nursing care for this shift.
                </p>
              </div>

              <!-- Search Box -->
              <div class="relative w-full sm:w-60">
                <ng-icon
                  name="lucideSearch"
                  size="14"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  hlmInput
                  type="text"
                  [(ngModel)]="inpatientSearchQuery"
                  placeholder="Search bed, patient, diagnosis..."
                  class="pl-9 h-8 w-full text-xs bg-background"
                />
              </div>
            </div>

            <!-- Filter Badges / View Filters -->
            <div
              class="px-4 py-2 bg-muted/40 border-b border-border flex items-center gap-2 overflow-x-auto text-xs"
            >
              <button
                (click)="filterMode.set('ALL')"
                class="px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer text-xs"
                [ngClass]="
                  filterMode() === 'ALL'
                    ? 'bg-background shadow-xs text-foreground font-bold border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                "
              >
                All Inpatients ({{ assignedInpatients().length }})
              </button>

              <button
                (click)="filterMode.set('CRITICAL')"
                class="px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer text-xs flex items-center gap-1"
                [ngClass]="
                  filterMode() === 'CRITICAL'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30'
                    : 'text-muted-foreground hover:text-amber-600'
                "
              >
                <span>Elevated NEWS2</span>
                <span
                  *ngIf="criticalPatientsCount() > 0"
                  class="size-2 rounded-full bg-amber-500"
                ></span>
              </button>

              <button
                (click)="filterMode.set('FALL_RISK')"
                class="px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer text-xs"
                [ngClass]="
                  filterMode() === 'FALL_RISK'
                    ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold border border-rose-500/30'
                    : 'text-muted-foreground hover:text-rose-600'
                "
              >
                High Fall Risk
              </button>

              <button
                (click)="filterMode.set('MEDS_DUE')"
                class="px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer text-xs"
                [ngClass]="
                  filterMode() === 'MEDS_DUE'
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30'
                    : 'text-muted-foreground hover:text-emerald-600'
                "
              >
                Meds Due Now
              </button>
            </div>

            <!-- Inpatient Table -->
            <div class="overflow-x-auto">
              <table hlmTable class="w-full text-xs">
                <thead hlmTableHeader>
                  <tr hlmTableRow class="bg-muted/50 border-b border-border">
                    <th hlmTableHead class="py-3 px-4 text-left font-semibold">Bed / Room</th>
                    <th hlmTableHead class="py-3 px-4 text-left font-semibold">
                      Patient Demographics
                    </th>
                    <th hlmTableHead class="py-3 px-4 text-left font-semibold">
                      Admission Diagnosis
                    </th>
                    <th hlmTableHead class="py-3 px-4 text-left font-semibold">NEWS2 Acuity</th>
                    <th hlmTableHead class="py-3 px-4 text-left font-semibold">Care & Safety</th>
                    <th hlmTableHead class="py-3 px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody hlmTableBody class="divide-y divide-border">
                  <tr
                    *ngFor="let inp of filteredInpatients()"
                    hlmTableRow
                    class="hover:bg-muted/30 transition-colors cursor-pointer"
                    (click)="openBedsideChart(inp.patient)"
                  >
                    <!-- Bed & Room -->
                    <td hlmTableCell class="py-3.5 px-4 font-mono">
                      <div class="font-bold text-foreground text-xs flex items-center gap-1.5">
                        <ng-icon name="lucideBed" size="13" class="text-primary" />
                        <span>{{ inp.bedCode }}</span>
                      </div>
                      <span class="text-[10px] text-muted-foreground block mt-0.5"
                        >Rm {{ inp.roomNumber }}</span
                      >
                    </td>

                    <!-- Patient Demographics -->
                    <td hlmTableCell class="py-3.5 px-4">
                      <div class="font-bold text-foreground text-xs">
                        {{ inp.patient.fullName }}
                      </div>
                      <div class="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {{ inp.patient.patientCode }} • {{ inp.patient.gender || 'U' }} ({{
                          inp.patient.dateOfBirth || 'N/A'
                        }})
                      </div>
                    </td>

                    <!-- Diagnosis & Doctor -->
                    <td hlmTableCell class="py-3.5 px-4 max-w-xs">
                      <span class="font-medium text-foreground block truncate">{{
                        inp.admissionDiagnosis
                      }}</span>
                      <span class="text-[10px] text-muted-foreground"
                        >MD: {{ inp.attendingPhysician }}</span
                      >
                    </td>

                    <!-- NEWS2 Acuity -->
                    <td hlmTableCell class="py-3.5 px-4">
                      <div class="flex items-center gap-1.5">
                        <span
                          hlmBadge
                          [variant]="
                            inp.acuityLevel === 'CRITICAL'
                              ? 'destructive'
                              : inp.acuityLevel === 'OBSERVED'
                                ? 'outline'
                                : 'secondary'
                          "
                          class="text-[10px] font-bold"
                          [ngClass]="
                            inp.ewsScore >= 4
                              ? 'border-amber-500 text-amber-600 bg-amber-500/10'
                              : ''
                          "
                        >
                          EWS: {{ inp.ewsScore }}
                        </span>
                        <span class="text-[10px] font-semibold text-muted-foreground">{{
                          inp.acuityLevel
                        }}</span>
                      </div>
                    </td>

                    <!-- Care & Safety Badges -->
                    <td hlmTableCell class="py-3.5 px-4">
                      <div class="flex flex-wrap gap-1 items-center">
                        <span
                          *ngIf="inp.fallRisk === 'HIGH'"
                          hlmBadge
                          variant="destructive"
                          class="text-[9px] px-1.5 py-0 font-bold"
                        >
                          Fall Risk
                        </span>
                        <span
                          *ngIf="inp.isolation !== 'NONE'"
                          hlmBadge
                          variant="outline"
                          class="text-[9px] px-1.5 py-0 font-bold text-purple-600 border-purple-500/30 bg-purple-500/10"
                        >
                          {{ inp.isolation }}
                        </span>
                        <span
                          *ngIf="inp.ivLineActive"
                          hlmBadge
                          variant="secondary"
                          class="text-[9px] px-1.5 py-0 font-mono text-blue-600 bg-blue-500/10"
                        >
                          IV Line
                        </span>
                      </div>
                    </td>

                    <!-- Action Button -->
                    <td hlmTableCell class="py-3.5 px-4 text-right">
                      <button
                        hlmBtn
                        variant="default"
                        size="sm"
                        class="h-7 text-xs font-semibold gap-1 shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
                        (click)="openBedsideChart(inp.patient); $event.stopPropagation()"
                      >
                        <ng-icon name="lucideActivity" size="12" />
                        <span>Bedside Chart</span>
                      </button>
                    </td>
                  </tr>

                  <tr *ngIf="filteredInpatients().length === 0" hlmTableRow>
                    <td colspan="6" class="py-8 text-center text-xs text-muted-foreground">
                      No matching inpatients found in Ward 3A for selected filter.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Section B: Outpatient Appointments & Triage Queue Snapshot -->
          <div class="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div
              class="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
            >
              <div>
                <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
                  <ng-icon name="lucideClipboardList" size="16" class="text-amber-600" />
                  <span>Outpatient Appointments & Triage</span>
                </h3>
                <p class="text-xs text-muted-foreground mt-0.5">
                  Arrived clinic patients awaiting pre-consultation vitals, allergy verification,
                  and triage before doctor consultation.
                </p>
              </div>
              <a
                routerLink="/nurse/appointments"
                class="text-xs text-amber-600 hover:underline font-semibold flex items-center gap-1"
              >
                <span>View Full Queue</span>
                <ng-icon name="lucideChevronRight" size="13" />
              </a>
            </div>

            <div class="divide-y divide-border">
              <div
                *ngFor="let apt of triageQueue().slice(0, 3)"
                class="p-3.5 hover:bg-muted/30 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="size-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0"
                  >
                    <ng-icon name="lucideClock" size="16" />
                  </div>
                  <div>
                    <div class="font-bold text-foreground flex items-center gap-2">
                      <span>{{ apt.patient?.fullName || apt.patientName || 'Patient' }}</span>
                      <span hlmBadge variant="outline" class="text-[10px] font-mono">{{
                        apt.patient?.patientCode || 'MRN-VERIFIED'
                      }}</span>
                    </div>
                    <p class="text-[11px] text-muted-foreground">
                      Time: {{ apt.appointmentDate | date: 'shortTime' }} • Complaint:
                      {{ apt.reason || 'General Consultation' }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <span
                    hlmBadge
                    [variant]="apt.status === 'CHECKED_IN' ? 'secondary' : 'outline'"
                    class="text-[10px]"
                  >
                    {{ apt.status === 'CHECKED_IN' ? 'Awaiting Vitals' : 'Scheduled' }}
                  </span>
                  <a
                    routerLink="/nurse/appointments"
                    hlmBtn
                    variant="outline"
                    size="sm"
                    class="h-7 text-xs font-semibold gap-1 text-amber-600 hover:text-amber-700"
                  >
                    <span>Triage</span>
                    <ng-icon name="lucideArrowRight" size="12" />
                  </a>
                </div>
              </div>

              <div
                *ngIf="triageQueue().length === 0"
                class="py-8 text-center text-xs text-muted-foreground"
              >
                No patients awaiting intake in the triage queue.
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column (4 Cols): Shift Tasks Inbox & Quick Station Tools -->
        <div class="lg:col-span-4 space-y-6">
          <!-- Shift Tasks Inbox -->
          <div class="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs">
            <div class="flex items-center justify-between border-b border-border pb-3">
              <h3
                class="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
              >
                <ng-icon name="lucideActivity" size="14" class="text-rose-600" />
                <span>Shift Nursing Tasks Inbox</span>
              </h3>
              <span hlmBadge variant="destructive" class="text-[10px]">
                {{ shiftTasks().length }} Pending
              </span>
            </div>

            <div class="space-y-2.5">
              <div
                *ngFor="let task of shiftTasks()"
                class="p-3 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors space-y-2 text-xs"
              >
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <span class="font-bold text-foreground text-xs leading-snug">{{
                      task.title
                    }}</span>
                    <div class="text-[10px] text-muted-foreground font-mono mt-0.5">
                      {{ task.patientName }} ({{ task.bedCode }}) • Due: {{ task.dueTime }}
                    </div>
                  </div>
                  <span
                    hlmBadge
                    [variant]="task.priority === 'HIGH' ? 'destructive' : 'secondary'"
                    class="text-[9px] font-bold shrink-0"
                  >
                    {{ task.priority }}
                  </span>
                </div>
                <div class="flex items-center justify-end pt-1 border-t border-border/40">
                  <button
                    (click)="markTaskDone(task)"
                    class="text-emerald-600 hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <ng-icon name="lucideCheckCircle2" size="12" />
                    <span>Complete Task</span>
                  </button>
                </div>
              </div>

              <div
                *ngIf="shiftTasks().length === 0"
                class="py-6 text-center text-xs text-muted-foreground"
              >
                All shift tasks completed on schedule.
              </div>
            </div>
          </div>

          <!-- Quick Station Shortcuts -->
          <div class="p-4 rounded-2xl border border-border bg-card space-y-2.5 shadow-xs">
            <h4 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Nursing Station Links
            </h4>

            <a
              routerLink="/nurse/beds"
              class="p-2.5 rounded-xl border border-border hover:bg-accent/40 transition-all flex items-center justify-between text-xs font-semibold text-foreground group"
            >
              <span class="flex items-center gap-2">
                <ng-icon name="lucideBed" size="15" class="text-primary" />
                Spatial Bed & Ward Census
              </span>
              <ng-icon
                name="lucideChevronRight"
                size="14"
                class="text-muted-foreground group-hover:translate-x-0.5 transition-transform"
              />
            </a>

            <a
              routerLink="/nurse/appointments"
              class="p-2.5 rounded-xl border border-border hover:bg-accent/40 transition-all flex items-center justify-between text-xs font-semibold text-foreground group"
            >
              <span class="flex items-center gap-2">
                <ng-icon name="lucideClipboardList" size="15" class="text-amber-600" />
                Outpatient Appointments & Triage
              </span>
              <ng-icon
                name="lucideChevronRight"
                size="14"
                class="text-muted-foreground group-hover:translate-x-0.5 transition-transform"
              />
            </a>

            <a
              routerLink="/nurse/chart"
              class="p-2.5 rounded-xl border border-border hover:bg-accent/40 transition-all flex items-center justify-between text-xs font-semibold text-foreground group"
            >
              <span class="flex items-center gap-2">
                <ng-icon name="lucideActivity" size="15" class="text-emerald-600" />
                Active Bedside EHR Chart
              </span>
              <ng-icon
                name="lucideChevronRight"
                size="14"
                class="text-muted-foreground group-hover:translate-x-0.5 transition-transform"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NurseDashboardComponent implements OnInit {
  loading = signal<boolean>(false);
  inpatientSearchQuery = '';
  filterMode = signal<'ALL' | 'CRITICAL' | 'FALL_RISK' | 'MEDS_DUE'>('ALL');

  assignedInpatients = signal<NurseAssignedInpatient[]>([]);
  triageQueue = signal<Appointment[]>([]);
  shiftTasks = signal<NursingShiftTask[]>([]);

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    public patientContext: PatientContextService,
    private router: Router,
  ) {}

  get currentUser() {
    return this.authService.currentUser();
  }

  ngOnInit(): void {
    this.loadStationData();
  }

  loadStationData(): void {
    this.loading.set(true);

    // 1. Load Inpatients from occupied hospital beds in assigned ward
    this.apiService.getBeds().subscribe({
      next: (beds) => {
        const occupied = Array.isArray(beds)
          ? beds.filter((b) => b.status === 'OCCUPIED' && b.currentEncounter?.patient)
          : [];
        if (occupied.length > 0) {
          const items: NurseAssignedInpatient[] = occupied.map((b, idx) => ({
            patient: b.currentEncounter!.patient!,
            bedCode: b.bedNumber || b.bedCode || `301${String.fromCharCode(65 + idx)}`,
            wardName: b.wardName || b.departmentName || 'Ward 3A',
            roomNumber: b.roomNumber || `30${idx + 1}`,
            admissionDiagnosis:
              idx === 0
                ? 'Acute Coronary Syndrome'
                : idx === 1
                  ? 'Community-Acquired Pneumonia'
                  : 'Post-Op Observation',
            ewsScore: idx === 0 ? 4 : idx === 1 ? 2 : 1,
            acuityLevel: idx === 0 ? 'OBSERVED' : 'STABLE',
            fallRisk: idx === 0 ? 'HIGH' : 'LOW',
            codeStatus: idx === 0 ? 'FULL_CODE' : 'FULL_CODE',
            isolation: idx === 1 ? 'CONTACT' : 'NONE',
            attendingPhysician: 'Dr. S. Sharma',
            nextMedicationTime: '10:00 AM',
            medsDueCount: idx === 0 ? 2 : 1,
            dietOrder: 'Low Sodium / Diabetic',
            ivLineActive: idx === 0 || idx === 1,
          }));
          this.assignedInpatients.set(items);
        } else {
          // Fallback to active patients
          this.apiService.getPatients().subscribe({
            next: (pts) => {
              const fallbackItems: NurseAssignedInpatient[] = pts.slice(0, 4).map((p, idx) => ({
                patient: p,
                bedCode: `30${idx + 1}A`,
                wardName: 'Ward 3A - Acute Care',
                roomNumber: `30${idx + 1}`,
                admissionDiagnosis:
                  idx === 0
                    ? 'Acute Coronary Syndrome'
                    : idx === 1
                      ? 'Exacerbation of COPD'
                      : 'Post-Op Laparoscopy',
                ewsScore: idx === 0 ? 4 : idx === 1 ? 2 : 1,
                acuityLevel: idx === 0 ? 'OBSERVED' : 'STABLE',
                fallRisk: idx === 0 ? 'HIGH' : 'LOW',
                codeStatus: 'FULL_CODE',
                isolation: idx === 1 ? 'CONTACT' : 'NONE',
                attendingPhysician: 'Dr. S. Sharma',
                nextMedicationTime: '10:00 AM',
                medsDueCount: idx === 0 ? 2 : 1,
                dietOrder: 'Regular / Diabetic',
                ivLineActive: idx === 0 || idx === 1,
              }));
              this.assignedInpatients.set(fallbackItems);
            },
          });
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    // 2. Load Triage Outpatient Queue
    this.apiService.getAppointments().subscribe({
      next: (apps) => {
        this.triageQueue.set(Array.isArray(apps) ? apps : []);
      },
    });

    // 3. Shift Tasks
    this.shiftTasks.set([
      {
        id: 'st-1',
        patientName: 'Sarah Jenkins',
        bedCode: '301A',
        taskType: 'EMAR_DUE',
        title: 'Administer IV Ceftriaxone 1g & Metformin 500mg',
        dueTime: '09:00 AM',
        priority: 'HIGH',
        status: 'PENDING',
      },
      {
        id: 'st-2',
        patientName: 'Robert Vance',
        bedCode: '302A',
        taskType: 'IO_RECORDING',
        title: 'Record Morning Intake & Output Fluid Balance',
        dueTime: '10:00 AM',
        priority: 'NORMAL',
        status: 'PENDING',
      },
      {
        id: 'st-3',
        patientName: 'Sarah Jenkins',
        bedCode: '301A',
        taskType: 'VITALS_RECHECK',
        title: 'Recheck BP & SpO2 for elevated NEWS2 Score',
        dueTime: '11:00 AM',
        priority: 'HIGH',
        status: 'PENDING',
      },
    ]);
  }

  filteredInpatients = computed(() => {
    const q = this.inpatientSearchQuery.toLowerCase().trim();
    let list = this.assignedInpatients();

    const mode = this.filterMode();
    if (mode === 'CRITICAL') {
      list = list.filter(
        (i) => i.ewsScore >= 3 || i.acuityLevel === 'CRITICAL' || i.acuityLevel === 'OBSERVED',
      );
    } else if (mode === 'FALL_RISK') {
      list = list.filter((i) => i.fallRisk === 'HIGH' || i.fallRisk === 'MODERATE');
    } else if (mode === 'MEDS_DUE') {
      list = list.filter((i) => i.medsDueCount > 0);
    }

    if (!q) return list;
    return list.filter(
      (i) =>
        i.patient.fullName?.toLowerCase().includes(q) ||
        i.patient.patientCode?.toLowerCase().includes(q) ||
        i.bedCode?.toLowerCase().includes(q) ||
        i.admissionDiagnosis?.toLowerCase().includes(q) ||
        i.roomNumber?.toLowerCase().includes(q),
    );
  });

  criticalPatientsCount = computed(() => {
    return this.assignedInpatients().filter((i) => i.ewsScore >= 4 || i.acuityLevel === 'CRITICAL')
      .length;
  });

  totalMedsDue = computed(() => {
    return this.assignedInpatients().reduce((acc, curr) => acc + (curr.medsDueCount || 0), 0) + 1;
  });

  getPendingTriageCount(): number {
    return this.triageQueue().filter((a) => a.status === 'CHECKED_IN' || a.stage === 'ARRIVED')
      .length;
  }

  openBedsideChart(patient: Patient): void {
    this.patientContext.setActivePatient(patient);
    this.router.navigate(['/nurse/chart']);
  }

  markTaskDone(task: NursingShiftTask): void {
    this.shiftTasks.set(this.shiftTasks().filter((t) => t.id !== task.id));
    toast.success(`Task completed: ${task.title}`);
  }
}
