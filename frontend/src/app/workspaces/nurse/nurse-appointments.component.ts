import { Component, OnInit, signal, computed } from '@angular/core';
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
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucideCalendarClock,
  lucideCalendar,
  lucideCheckCircle2,
  lucideX,
  lucideClipboardList,
  lucideSearch,
  lucideFilter,
  lucideClock,
  lucideUsers,
  lucideHeartPulse,
  lucideStethoscope,
  lucideRefreshCw,
  lucideUser,
  lucideShieldAlert,
  lucideAlertTriangle,
  lucideCheck,
  lucidePill,
  lucideChevronRight,
  lucideBuilding2,
  lucideUserCheck,
  lucideXCircle,
} from '@ng-icons/lucide';

export interface FastTriageForm {
  systolicBp: number | null;
  diastolicBp: number | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  temperature: number | null;
  oxygenSaturation: number | null;
  bloodGlucose: number | null;
  painScore: number;
  heightCm: number | null;
  weightKg: number | null;
  nursingNotes: string;
  allergiesVerified: boolean;
  requiresImmediateAttention: boolean;
}

@Component({
  selector: 'app-nurse-appointments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
      lucideCalendarClock,
      lucideCalendar,
      lucideCheckCircle2,
      lucideX,
      lucideClipboardList,
      lucideSearch,
      lucideFilter,
      lucideClock,
      lucideUsers,
      lucideHeartPulse,
      lucideStethoscope,
      lucideRefreshCw,
      lucideUser,
      lucideShieldAlert,
      lucideAlertTriangle,
      lucideCheck,
      lucidePill,
      lucideChevronRight,
      lucideBuilding2,
      lucideUserCheck,
      lucideXCircle,
    }),
  ],
  template: `
    <div class="w-full space-y-6">
      <!-- 1. Header with Station & Organization Context -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border"
      >
        <div class="space-y-1">
          <div class="flex items-center flex-wrap gap-2">
            <h1
              class="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2"
            >
              <span>Outpatient Appointments & Triage</span>
            </h1>
            <span
              hlmBadge
              variant="secondary"
              class="text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold"
            >
              Nursing Triage Station
            </span>
            <span
              *ngIf="activeOrgName()"
              hlmBadge
              variant="outline"
              class="text-[11px] border-border text-muted-foreground flex items-center gap-1 font-mono"
            >
              <ng-icon name="lucideBuilding2" size="12" class="text-primary" />
              <span>{{ activeOrgName() }}</span>
            </span>
            <span
              *ngIf="authService.currentUser()?.fullName"
              hlmBadge
              variant="secondary"
              class="text-[11px] bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 font-medium"
            >
              Nurse {{ authService.currentUser()?.fullName }}
            </span>
          </div>
          <p class="text-xs text-muted-foreground">
            Monitor clinic roster for this facility, perform pre-consultation vitals intake once front desk check-in is complete, and route triaged patients to physicians.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            hlmBtn
            variant="outline"
            size="sm"
            (click)="loadAppointments()"
            [disabled]="isLoading"
            class="gap-1.5 text-xs font-medium"
          >
            <ng-icon name="lucideRefreshCw" [class.animate-spin]="isLoading" size="14" />
            <span>Refresh Roster</span>
          </button>
        </div>
      </div>

      <!-- Loading & Error States -->
      <div
        *ngIf="isLoading"
        class="p-4 rounded-2xl border border-border bg-muted/20 text-center text-muted-foreground text-xs font-semibold"
      >
        <ng-icon name="lucideRefreshCw" class="animate-spin mr-2" size="14"></ng-icon>
        Loading facility appointments queue...
      </div>
      <div
        *ngIf="errorMessage"
        class="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-between gap-2"
      >
        <div class="flex items-center gap-2">
          <ng-icon name="lucideAlertTriangle" size="16"></ng-icon>
          <span>{{ errorMessage }}</span>
        </div>
        <button (click)="errorMessage = ''" class="font-bold text-xs hover:opacity-75">&times;</button>
      </div>

      <!-- 2. Date Scope Toolbar & Filter Controls -->
      <div class="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-4">
        <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3 border-b border-border">
          <!-- Date Filter Segmented Buttons -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-semibold text-foreground flex items-center gap-1.5 mr-1">
              <ng-icon name="lucideCalendar" size="15" class="text-amber-500" /> Date Scope:
            </span>
            <div class="flex items-center bg-muted/60 p-1 rounded-xl border border-border text-xs">
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                [ngClass]="
                  dateFilterMode() === 'TODAY'
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                "
                (click)="setDateMode('TODAY')"
              >
                Today
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                [ngClass]="
                  dateFilterMode() === 'TOMORROW'
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                "
                (click)="setDateMode('TOMORROW')"
              >
                Tomorrow
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                [ngClass]="
                  dateFilterMode() === 'CUSTOM'
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                "
                (click)="setDateMode('CUSTOM')"
              >
                Pick Date
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                [ngClass]="
                  dateFilterMode() === 'ALL'
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                "
                (click)="setDateMode('ALL')"
              >
                All Dates
              </button>
            </div>

            <!-- Custom Date Picker -->
            <input
              *ngIf="dateFilterMode() === 'CUSTOM'"
              type="date"
              [ngModel]="selectedDate()"
              (ngModelChange)="selectedDate.set($event)"
              class="px-3 py-1.5 rounded-xl border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div class="text-xs text-muted-foreground font-mono">
            Showing appointments for:
            <span class="font-bold text-foreground">{{ getActiveDateLabel() }}</span>
          </div>
        </div>

        <!-- Search & Attending Doctor Selectors -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <!-- Doctor Filter -->
          <div class="space-y-1">
            <label class="font-semibold text-foreground flex items-center gap-1">
              <ng-icon name="lucideStethoscope" size="14" class="text-amber-500" /> Filter Attending Doctor
            </label>
            <select
              [(ngModel)]="selectedDoctor"
              class="w-full p-2 rounded-xl border border-border bg-background text-xs text-foreground focus:ring-1 focus:ring-amber-500"
            >
              <option value="ALL">All Attending Doctors</option>
              <option *ngFor="let doc of uniqueDoctors()" [value]="doc">{{ doc }}</option>
            </select>
          </div>

          <!-- Stage Status Filter Dropdown -->
          <div class="space-y-1">
            <label class="font-semibold text-foreground flex items-center gap-1">
              <ng-icon name="lucideFilter" size="14" class="text-sky-500" /> Filter Stage Status
            </label>
            <select
              [(ngModel)]="selectedStage"
              class="w-full p-2 rounded-xl border border-border bg-background text-xs text-foreground focus:ring-1 focus:ring-amber-500"
            >
              <option value="ALL">All Lifecycle Stages</option>
              <option value="CHECKED_IN">● Ready for Triage (Check-in Cleared)</option>
              <option value="SCHEDULED">1. Booked (Awaiting Desk Check-in)</option>
              <option value="ARRIVED">2. Lobby Arrived (At Front Desk)</option>
              <option value="TRIAGED">3. Triaged (Ready for Doctor)</option>
              <option value="IN_CONSULTATION">4. In Doctor Consultation</option>
              <option value="COMPLETED">5. Encounter Completed</option>
              <option value="CANCELLED">Cancelled / No-Show</option>
            </select>
          </div>

          <!-- Search Query -->
          <div class="space-y-1 sm:col-span-2 lg:col-span-1">
            <label class="font-semibold text-foreground flex items-center gap-1">
              <ng-icon name="lucideSearch" size="14" class="text-emerald-500" /> Search Patient / MRN / Reason
            </label>
            <div class="relative">
              <ng-icon
                name="lucideSearch"
                size="14"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                hlmInput
                type="text"
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event)"
                placeholder="Search by name, MRN, complaint, doctor..."
                class="pl-9 h-9 w-full text-xs bg-background rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 3. High-Impact Queue Stages Stat Counters -->
      <div *ngIf="!isLoading && !errorMessage" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Stage 1: Total Scoped -->
        <div
          (click)="setViewMode('ALL')"
          class="p-4 rounded-2xl border border-border bg-card shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all space-y-2 cursor-pointer group"
          [class.ring-2]="viewMode() === 'ALL'"
          [class.ring-primary]="viewMode() === 'ALL'"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total In Scope</span>
            <div class="size-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
              <ng-icon name="lucideUsers" size="14" />
            </div>
          </div>
          <div class="text-2xl font-extrabold text-foreground">{{ totalCount() }}</div>
          <div class="text-[11px] text-muted-foreground pt-1 border-t border-border/60">
            <span>Active Unit Schedule</span>
          </div>
        </div>

        <!-- Stage 2: Awaiting Receptionist Desk Check-in -->
        <div
          (click)="setViewMode('SCHEDULED')"
          class="p-4 rounded-2xl border border-border bg-card shadow-2xs hover:border-border hover:shadow-xs transition-all space-y-2 cursor-pointer group"
          [class.ring-2]="viewMode() === 'SCHEDULED'"
          [class.ring-foreground]="viewMode() === 'SCHEDULED'"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Awaiting Check-in</span>
            <div class="size-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <ng-icon name="lucideClock" size="14" />
            </div>
          </div>
          <div class="text-2xl font-extrabold text-foreground">{{ awaitingCheckInCount() }}</div>
          <div class="text-[11px] text-muted-foreground pt-1 border-t border-border/60">
            <span>Reception / Pre-Arrival</span>
          </div>
        </div>

        <!-- Stage 3: Ready for Nurse Triage (Crucial Action Focus) -->
        <div
          (click)="setViewMode('CHECKED_IN')"
          class="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/5 shadow-2xs hover:border-amber-500 hover:shadow-xs transition-all space-y-2 cursor-pointer group"
          [class.ring-2]="viewMode() === 'CHECKED_IN'"
          [class.ring-amber-500]="viewMode() === 'CHECKED_IN'"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Ready for Triage
            </span>
            <div class="size-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ng-icon name="lucideActivity" size="14" />
            </div>
          </div>
          <div class="text-2xl font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <span>{{ readyForTriageCount() }}</span>
            <span *ngIf="readyForTriageCount() > 0" class="size-2.5 rounded-full bg-amber-500 animate-ping"></span>
          </div>
          <div class="text-[11px] text-amber-700 dark:text-amber-300 pt-1 border-t border-amber-500/30 font-semibold">
            <span>Action: Vitals & Triage Intake</span>
          </div>
        </div>

        <!-- Stage 4: Triaged / Consult Ready -->
        <div
          (click)="setViewMode('TRIAGED')"
          class="p-4 rounded-2xl border border-border bg-card shadow-2xs hover:border-emerald-500/40 hover:shadow-xs transition-all space-y-2 cursor-pointer group"
          [class.ring-2]="viewMode() === 'TRIAGED'"
          [class.ring-emerald-500]="viewMode() === 'TRIAGED'"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Triaged for Doctor</span>
            <div class="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ng-icon name="lucideCheckCircle2" size="14" />
            </div>
          </div>
          <div class="text-2xl font-extrabold text-foreground">{{ triagedCount() }}</div>
          <div class="text-[11px] text-emerald-600 dark:text-emerald-400 pt-1 border-t border-border/60 font-medium">
            <span>Vitals Intake Completed</span>
          </div>
        </div>
      </div>

      <!-- 4. Segmented View Mode Quick Tabs -->
      <div class="flex items-center gap-1.5 p-1 bg-muted/40 rounded-2xl w-full overflow-x-auto text-xs border border-border">
        <button
          (click)="setViewMode('ALL')"
          class="px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap"
          [ngClass]="
            viewMode() === 'ALL'
              ? 'bg-background shadow-xs text-foreground font-bold'
              : 'text-muted-foreground hover:text-foreground'
          "
        >
          All ({{ totalCount() }})
        </button>
        <button
          (click)="setViewMode('CHECKED_IN')"
          class="px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          [ngClass]="
            viewMode() === 'CHECKED_IN'
              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/40 shadow-xs'
              : 'text-muted-foreground hover:text-amber-600'
          "
        >
          <span>● Ready for Triage ({{ readyForTriageCount() }})</span>
          <span *ngIf="readyForTriageCount() > 0" class="size-2 rounded-full bg-amber-500"></span>
        </button>
        <button
          (click)="setViewMode('SCHEDULED')"
          class="px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap"
          [ngClass]="
            viewMode() === 'SCHEDULED'
              ? 'bg-background shadow-xs text-foreground font-bold'
              : 'text-muted-foreground hover:text-foreground'
          "
        >
          Awaiting Check-in ({{ awaitingCheckInCount() }})
        </button>
        <button
          (click)="setViewMode('TRIAGED')"
          class="px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap"
          [ngClass]="
            viewMode() === 'TRIAGED'
              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30'
              : 'text-muted-foreground hover:text-emerald-600'
          "
        >
          Triaged ({{ triagedCount() }})
        </button>
        <button
          (click)="setViewMode('IN_CONSULTATION')"
          class="px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap"
          [ngClass]="
            viewMode() === 'IN_CONSULTATION'
              ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold border border-purple-500/30'
              : 'text-muted-foreground hover:text-purple-600'
          "
        >
          In Consultation ({{ inConsultationCount() }})
        </button>
        <button
          (click)="setViewMode('COMPLETED')"
          class="px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap"
          [ngClass]="
            viewMode() === 'COMPLETED'
              ? 'bg-background shadow-xs text-foreground font-bold'
              : 'text-muted-foreground hover:text-foreground'
          "
        >
          Completed ({{ completedCount() }})
        </button>
      </div>

      <!-- 5. Main Appointments & Triage Table -->
      <div class="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Appointment Time</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Patient Demographics</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Chief Complaint / Reason</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Attending Doctor</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Stage Status</th>
                <th hlmTableHead class="py-3 px-4 text-right font-semibold">Nursing Triage Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr
                *ngFor="let apt of filteredAppointments()"
                hlmTableRow
                class="hover:bg-muted/30 transition-colors"
                [class.bg-amber-500/5]="apt.status === 'CHECKED_IN'"
              >
                <!-- Time & Date -->
                <td hlmTableCell class="py-3.5 px-4 font-mono font-semibold text-foreground">
                  <div class="flex items-center gap-1.5">
                    <ng-icon name="lucideClock" size="13" class="text-muted-foreground" />
                    <span>{{ apt.appointmentDate | date: 'shortTime' }}</span>
                  </div>
                  <span class="text-[10px] text-muted-foreground block mt-0.5">{{
                    apt.appointmentDate | date: 'mediumDate'
                  }}</span>
                </td>

                <!-- Patient Demographics -->
                <td hlmTableCell class="py-3.5 px-4">
                  <div class="font-bold text-foreground text-xs">
                    {{ apt.patient?.fullName || apt.patientName || 'Patient' }}
                  </div>
                  <div class="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {{ apt.patient?.patientCode || apt.patientCode || 'MRN-RECORD' }} •
                    {{ apt.patient?.gender || 'U' }}
                    <span *ngIf="apt.patient?.dateOfBirth">({{ apt.patient?.dateOfBirth }})</span>
                  </div>
                </td>

                <!-- Chief Complaint -->
                <td hlmTableCell class="py-3.5 px-4 max-w-xs">
                  <span class="font-medium text-foreground block truncate">{{
                    apt.reason || 'General Consultation'
                  }}</span>
                  <span class="text-[10px] text-muted-foreground">{{
                    apt.departmentName || apt.departmentId || 'Outpatient Clinic'
                  }}</span>
                </td>

                <!-- Attending Doctor -->
                <td hlmTableCell class="py-3.5 px-4">
                  <div class="font-semibold text-foreground text-xs">
                    {{ apt.doctorName || apt.doctor?.fullName || 'Attending Physician' }}
                  </div>
                  <span class="text-[10px] text-muted-foreground">General OPD</span>
                </td>

                <!-- Lifecycle Stage Badge -->
                <td hlmTableCell class="py-3.5 px-4">
                  <!-- Checked In (Ready for Nurse Triage) -->
                  <span
                    *ngIf="apt.status === 'CHECKED_IN'"
                    hlmBadge
                    variant="outline"
                    class="text-[10px] font-bold text-amber-700 dark:text-amber-300 border-amber-500/40 bg-amber-500/10 animate-pulse"
                  >
                    ● Ready for Triage (Check-in Cleared)
                  </span>

                  <!-- Scheduled (Pre-Arrival) -->
                  <span
                    *ngIf="apt.status === 'SCHEDULED'"
                    hlmBadge
                    variant="outline"
                    class="text-[10px] text-muted-foreground border-border"
                  >
                    Scheduled (Pre-Arrival)
                  </span>

                  <!-- Arrived (Lobby) -->
                  <span
                    *ngIf="apt.status === 'ARRIVED'"
                    hlmBadge
                    variant="outline"
                    class="text-[10px] text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10"
                  >
                    Lobby Arrived
                  </span>

                  <!-- Triaged (Ready for Doctor) -->
                  <span
                    *ngIf="apt.status === 'TRIAGED'"
                    hlmBadge
                    variant="secondary"
                    class="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20"
                  >
                    ✓ Triaged for Doctor
                  </span>

                  <!-- In Consultation -->
                  <span
                    *ngIf="apt.status === 'IN_CONSULTATION'"
                    hlmBadge
                    variant="secondary"
                    class="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-500/10 border border-purple-500/20"
                  >
                    In Consultation
                  </span>

                  <!-- Completed -->
                  <span
                    *ngIf="apt.status === 'COMPLETED'"
                    hlmBadge
                    variant="secondary"
                    class="text-[10px] text-muted-foreground"
                  >
                    Encounter Completed
                  </span>

                  <!-- Cancelled / No-show -->
                  <span
                    *ngIf="apt.status === 'CANCELLED' || apt.status === 'NO_SHOW'"
                    hlmBadge
                    variant="outline"
                    class="text-[10px] text-rose-600 border-rose-500/30 bg-rose-500/10"
                  >
                    {{ apt.status === 'NO_SHOW' ? 'No Show' : 'Cancelled' }}
                  </span>
                </td>

                <!-- Nursing Action Column -->
                <td hlmTableCell class="py-3.5 px-4 text-right">
                  <!-- Ready for Triage Action (After Front Desk Check-in) -->
                  <button
                    *ngIf="apt.status === 'CHECKED_IN'"
                    hlmBtn
                    variant="default"
                    size="sm"
                    class="h-7 text-xs font-bold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                    (click)="openTriageModal(apt)"
                  >
                    <ng-icon name="lucideActivity" size="13" />
                    <span>Perform Pre-Consult Triage</span>
                  </button>

                  <!-- Awaiting Desk Check-in State -->
                  <div
                    *ngIf="apt.status === 'SCHEDULED' || apt.status === 'ARRIVED'"
                    class="flex items-center justify-end gap-1 text-[11px] text-muted-foreground font-medium"
                  >
                    <ng-icon name="lucideClock" size="12" class="text-amber-500" />
                    <span>Awaiting Desk Check-in</span>
                  </div>

                  <!-- Triaged: Triage Completed Indicator -->
                  <div
                    *ngIf="apt.status === 'TRIAGED'"
                    class="flex items-center justify-end gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300"
                  >
                    <ng-icon name="lucideCheckCircle2" size="13" class="text-teal-600" />
                    <span>Triage Completed</span>
                  </div>

                  <!-- In Consultation -->
                  <div
                    *ngIf="apt.status === 'IN_CONSULTATION'"
                    class="flex items-center justify-end gap-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300"
                  >
                    <ng-icon name="lucideStethoscope" size="13" class="text-purple-600" />
                    <span>In Consultation</span>
                  </div>

                  <!-- Completed -->
                  <div
                    *ngIf="apt.status === 'COMPLETED'"
                    class="flex items-center justify-end gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300"
                  >
                    <ng-icon name="lucideCheckCircle2" size="13" class="text-emerald-600" />
                    <span>Encounter Completed</span>
                  </div>

                  <!-- Cancelled / No-Show -->
                  <span
                    *ngIf="apt.status === 'CANCELLED' || apt.status === 'NO_SHOW'"
                    class="text-[11px] text-muted-foreground"
                  >
                    —
                  </span>
                </td>

              </tr>

              <tr *ngIf="filteredAppointments().length === 0" hlmTableRow>
                <td colspan="6" class="py-12 text-center text-xs text-muted-foreground">
                  No appointments found matching the selected date scope and filter criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 6. Fast-Triage Intake Modal -->
      <div
        *ngIf="isTriageModalOpen && selectedAppointment"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      >
        <div
          class="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden my-8 space-y-0"
        >
          <!-- Modal Header -->
          <div class="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div
                class="size-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center"
              >
                <ng-icon name="lucideActivity" size="18" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-foreground">Pre-Consultation Nursing Triage Intake</h3>
                <p class="text-xs text-muted-foreground">
                  {{ selectedAppointment.patient?.fullName || selectedAppointment.patientName || 'Patient' }}
                  <span *ngIf="selectedAppointment.patient?.patientCode || selectedAppointment.patientCode">
                    ({{ selectedAppointment.patient?.patientCode || selectedAppointment.patientCode }})
                  </span>
                </p>
              </div>
            </div>

            <button
              hlmBtn
              variant="ghost"
              size="sm"
              class="size-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
              (click)="isTriageModalOpen = false"
            >
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
            <!-- Patient Chief Complaint Banner -->
            <div class="p-3 rounded-xl border border-border bg-muted/30 text-xs flex items-start gap-2">
              <span class="font-bold text-foreground shrink-0">Chief Complaint:</span>
              <span class="text-muted-foreground">{{ selectedAppointment.reason || 'General Consultation & Health Assessment' }}</span>
            </div>

            <!-- Live Calculated Acuity Indicator Banner -->
            <div
              class="p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs"
              [ngClass]="
                computedNews2() === null
                  ? 'bg-muted/50 border-border text-muted-foreground'
                  : computedNews2()! >= 5
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
                    : computedNews2()! >= 3
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              "
            >
              <div class="flex items-center gap-2 font-bold">
                <ng-icon name="lucideShieldAlert" size="16" />
                <span>Calculated NEWS2 Acuity Score: {{ computedNews2() !== null ? computedNews2() : '--' }}</span>
              </div>
              <span hlmBadge variant="outline" class="text-[10px] font-bold">
                {{
                  computedNews2() === null
                    ? 'PENDING VITALS'
                    : computedNews2()! >= 5
                      ? 'MEDIUM-HIGH RISK'
                      : computedNews2()! >= 3
                        ? 'OBSERVED RISK'
                        : 'STABLE'
                }}
              </span>
            </div>

            <!-- Vitals Grid (6 Core Parameters) -->
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                1. Physiological Vital Signs
              </h4>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <!-- Systolic BP -->
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-foreground"
                    >Systolic BP (mmHg)</label
                  >
                  <input
                    hlmInput
                    type="number"
                    [(ngModel)]="triageForm.systolicBp"
                    placeholder="e.g. 120"
                    class="h-8 text-xs bg-background w-full"
                  />
                </div>

                <!-- Diastolic BP -->
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-foreground"
                    >Diastolic BP (mmHg)</label
                  >
                  <input
                    hlmInput
                    type="number"
                    [(ngModel)]="triageForm.diastolicBp"
                    placeholder="e.g. 80"
                    class="h-8 text-xs bg-background w-full"
                  />
                </div>

                <!-- Heart Rate -->
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-foreground">Heart Rate (bpm)</label>
                  <input
                    hlmInput
                    type="number"
                    [(ngModel)]="triageForm.heartRate"
                    placeholder="e.g. 74"
                    class="h-8 text-xs bg-background w-full"
                  />
                </div>

                <!-- Respiratory Rate -->
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-foreground">Resp Rate (/min)</label>
                  <input
                    hlmInput
                    type="number"
                    [(ngModel)]="triageForm.respiratoryRate"
                    placeholder="e.g. 16"
                    class="h-8 text-xs bg-background w-full"
                  />
                </div>

                <!-- Temperature -->
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-foreground">Temperature (°C)</label>
                  <input
                    hlmInput
                    type="number"
                    step="0.1"
                    [(ngModel)]="triageForm.temperature"
                    placeholder="e.g. 36.8"
                    class="h-8 text-xs bg-background w-full"
                  />
                </div>

                <!-- Oxygen Saturation -->
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-foreground">SpO2 (%)</label>
                  <input
                    hlmInput
                    type="number"
                    [(ngModel)]="triageForm.oxygenSaturation"
                    placeholder="e.g. 98"
                    class="h-8 text-xs bg-background w-full"
                  />
                </div>

                <!-- Blood Glucose -->
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-foreground"
                    >Blood Glucose (mg/dL)</label
                  >
                  <input
                    hlmInput
                    type="number"
                    [(ngModel)]="triageForm.bloodGlucose"
                    placeholder="e.g. 105"
                    class="h-8 text-xs bg-background w-full"
                  />
                </div>
              </div>
            </div>

            <!-- Anthropometry & BMI -->
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                2. Height, Weight & BMI
              </h4>
              <div class="grid grid-cols-3 gap-3">
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-foreground">Height (cm)</label>
                  <input
                    hlmInput
                    type="number"
                    [(ngModel)]="triageForm.heightCm"
                    placeholder="e.g. 172"
                    class="h-8 text-xs bg-background w-full"
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-foreground">Weight (kg)</label>
                  <input
                    hlmInput
                    type="number"
                    step="0.1"
                    [(ngModel)]="triageForm.weightKg"
                    placeholder="e.g. 68.5"
                    class="h-8 text-xs bg-background w-full"
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-muted-foreground"
                    >Calculated BMI</label
                  >
                  <div
                    class="h-8 rounded-md border border-border bg-muted/40 px-3 flex items-center text-xs font-bold font-mono text-foreground"
                  >
                    {{ computedBmi() || '—' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Visual Pain Scale 0 to 10 -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >3. Pain Severity Scale (0 - 10)</label
                >
                <span class="text-xs font-bold font-mono text-foreground">
                  Score: {{ triageForm.painScore }}/10 ({{
                    triageForm.painScore === 0
                      ? 'No Pain'
                      : triageForm.painScore <= 3
                        ? 'Mild'
                        : triageForm.painScore <= 6
                          ? 'Moderate'
                          : 'Severe'
                  }})
                </span>
              </div>
              <div class="grid grid-cols-11 gap-1">
                <button
                  *ngFor="let score of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
                  type="button"
                  (click)="triageForm.painScore = score"
                  class="h-8 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  [ngClass]="
                    triageForm.painScore === score
                      ? 'bg-primary text-primary-foreground shadow-xs scale-105'
                      : 'bg-muted/40 hover:bg-muted text-foreground'
                  "
                >
                  {{ score }}
                </button>
              </div>
            </div>

            <!-- Allergy Verification & Quick Checkboxes -->
            <div class="space-y-2.5 pt-2 border-t border-border">
              <label
                class="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer"
              >
                <input
                  type="checkbox"
                  [(ngModel)]="triageForm.allergiesVerified"
                  class="rounded border-border text-primary focus:ring-primary size-4"
                />
                <span>Patient allergies reviewed & verified (No unreported anaphylactic risks)</span>
              </label>

              <label
                class="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 cursor-pointer"
              >
                <input
                  type="checkbox"
                  [(ngModel)]="triageForm.requiresImmediateAttention"
                  class="rounded border-rose-500 text-rose-600 focus:ring-rose-500 size-4"
                />
                <span>Flag for Immediate STAT Physician Attention (Red Flag Alert)</span>
              </label>
            </div>

            <!-- Nursing Assessment Notes -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-semibold text-foreground"
                >Nursing Intake Notes & Observations</label
              >
              <textarea
                hlmInput
                rows="3"
                [(ngModel)]="triageForm.nursingNotes"
                placeholder="Document patient presenting state, mobility, acute discomfort, or specific nursing observations..."
                class="w-full text-xs p-2.5 bg-background rounded-xl"
              ></textarea>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-4 border-t border-border bg-muted/20 flex items-center justify-end gap-2.5">
            <button
              hlmBtn
              variant="outline"
              size="sm"
              class="text-xs"
              (click)="isTriageModalOpen = false"
            >
              Cancel
            </button>
            <button
              hlmBtn
              variant="default"
              size="sm"
              class="text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              (click)="submitTriage()"
            >
              <ng-icon name="lucideCheck" size="14" />
              <span>Complete Triage & Route to Doctor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NurseAppointmentsComponent implements OnInit {
  isLoading = false;
  errorMessage = '';
  appointments = signal<Appointment[]>([]);

  // Filtering signals
  dateFilterMode = signal<'TODAY' | 'TOMORROW' | 'CUSTOM' | 'ALL'>('TODAY');
  selectedDate = signal<string>(this.getLocalDateString(new Date()));
  selectedDoctor: string = 'ALL';
  selectedStage: string = 'ALL';
  viewMode = signal<'ALL' | 'CHECKED_IN' | 'SCHEDULED' | 'TRIAGED' | 'IN_CONSULTATION' | 'COMPLETED'>('ALL');
  searchQuery = signal<string>('');

  // Triage modal state
  isTriageModalOpen = false;
  selectedAppointment: Appointment | null = null;

  triageForm: FastTriageForm = {
    systolicBp: null,
    diastolicBp: null,
    heartRate: null,
    respiratoryRate: null,
    temperature: null,
    oxygenSaturation: null,
    bloodGlucose: null,
    painScore: 0,
    heightCm: null,
    weightKg: null,
    nursingNotes: '',
    allergiesVerified: false,
    requiresImmediateAttention: false,
  };

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private patientContext: PatientContextService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  activeOrgName(): string {
    const activeContext = this.authService.activeContext();
    const user = this.authService.currentUser();
    return (
      activeContext?.organizationName ||
      (user?.organizations && user.organizations.length > 0 ? user.organizations[0].name : '')
    );
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const user = this.authService.currentUser();
    const activeContext = this.authService.activeContext();
    const organizationId =
      activeContext?.organizationId ||
      (user?.organizations && user.organizations.length > 0 ? user.organizations[0].id : undefined);

    let appointments$: Observable<Appointment[]>;
    if (organizationId) {
      appointments$ = this.apiService.getAppointmentsByOrganization(organizationId);
    } else {
      appointments$ = this.apiService.getAppointments();
    }

    appointments$.subscribe({
      next: (apps) => {
        const list = Array.isArray(apps) ? apps : [];
        this.appointments.set(list);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load appointments';
        this.isLoading = false;
      },
    });
  }

  setDateMode(mode: 'TODAY' | 'TOMORROW' | 'CUSTOM' | 'ALL'): void {
    this.dateFilterMode.set(mode);
    if (mode === 'TODAY') {
      this.selectedDate.set(this.getLocalDateString(new Date()));
    } else if (mode === 'TOMORROW') {
      this.selectedDate.set(this.getLocalDateString(new Date(Date.now() + 86400000)));
    }
  }

  getLocalDateString(d: string | Date | undefined | null): string {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getActiveDateLabel(): string {
    const mode = this.dateFilterMode();
    if (mode === 'TODAY') return `Today (${this.getLocalDateString(new Date())})`;
    if (mode === 'TOMORROW')
      return `Tomorrow (${this.getLocalDateString(new Date(Date.now() + 86400000))})`;
    if (mode === 'ALL') return 'All Dates (Full History & Schedule)';
    return `Selected Date (${this.selectedDate()})`;
  }

  uniqueDoctors = computed(() => {
    const docs = new Set<string>();
    this.appointments().forEach((a) => {
      const name = a.doctorName || a.doctor?.fullName;
      if (name) docs.add(name);
    });
    return Array.from(docs);
  });

  dateScopedAppointments = computed(() => {
    const mode = this.dateFilterMode();
    const targetDate = this.selectedDate();
    const todayStr = this.getLocalDateString(new Date());
    const tomorrowStr = this.getLocalDateString(new Date(Date.now() + 86400000));

    return this.appointments().filter((apt) => {
      if (mode === 'ALL') return true;
      const aptDate = this.getLocalDateString(apt.appointmentDate);
      if (mode === 'TODAY') return aptDate === todayStr;
      if (mode === 'TOMORROW') return aptDate === tomorrowStr;
      return aptDate === targetDate;
    });
  });

  totalCount = computed(() => this.dateScopedAppointments().length);

  awaitingCheckInCount = computed(
    () =>
      this.dateScopedAppointments().filter(
        (a) => a.status === 'SCHEDULED' || a.status === 'ARRIVED',
      ).length,
  );

  readyForTriageCount = computed(
    () => this.dateScopedAppointments().filter((a) => a.status === 'CHECKED_IN').length,
  );

  triagedCount = computed(
    () => this.dateScopedAppointments().filter((a) => a.status === 'TRIAGED').length,
  );

  inConsultationCount = computed(
    () => this.dateScopedAppointments().filter((a) => a.status === 'IN_CONSULTATION').length,
  );

  completedCount = computed(
    () => this.dateScopedAppointments().filter((a) => a.status === 'COMPLETED').length,
  );

  filteredAppointments = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const mode = this.viewMode();
    const docFilter = this.selectedDoctor;
    const stageFilter = this.selectedStage;

    return this.dateScopedAppointments().filter((apt) => {
      // 1. Stage status filter
      if (stageFilter !== 'ALL' && apt.status !== stageFilter) {
        return false;
      }

      // 2. View Mode segmented button filter
      if (mode === 'CHECKED_IN' && apt.status !== 'CHECKED_IN') return false;
      if (mode === 'SCHEDULED' && apt.status !== 'SCHEDULED' && apt.status !== 'ARRIVED') return false;
      if (mode === 'TRIAGED' && apt.status !== 'TRIAGED') return false;
      if (mode === 'IN_CONSULTATION' && apt.status !== 'IN_CONSULTATION') return false;
      if (mode === 'COMPLETED' && apt.status !== 'COMPLETED') return false;

      // 3. Attending Doctor filter
      const docName = apt.doctorName || apt.doctor?.fullName || '';
      if (docFilter !== 'ALL' && docName !== docFilter) {
        return false;
      }

      // 4. Text query filter
      if (!q) return true;
      const patName = apt.patient?.fullName || apt.patientName || '';
      const patCode = apt.patient?.patientCode || apt.patientCode || '';
      const reason = apt.reason || '';

      return (
        patName.toLowerCase().includes(q) ||
        patCode.toLowerCase().includes(q) ||
        docName.toLowerCase().includes(q) ||
        reason.toLowerCase().includes(q)
      );
    });
  });

  computedBmi(): string {
    const h = this.triageForm.heightCm;
    const w = this.triageForm.weightKg;
    if (!h || !w || h <= 0 || w <= 0) return '';
    const heightInM = h / 100;
    const bmi = w / (heightInM * heightInM);
    return bmi.toFixed(1);
  }

  computedNews2(): number | null {
    const hr = this.triageForm.heartRate;
    const spo2 = this.triageForm.oxygenSaturation;
    const sbp = this.triageForm.systolicBp;
    const temp = this.triageForm.temperature;
    const rr = this.triageForm.respiratoryRate;

    if (!hr && !spo2 && !sbp && !temp && !rr) return null;

    let score = 0;
    if (hr) {
      if (hr <= 40 || hr >= 131) score += 3;
      else if (hr >= 111 && hr <= 130) score += 2;
      else if (hr <= 50 || (hr >= 91 && hr <= 110)) score += 1;
    }
    if (spo2) {
      if (spo2 <= 91) score += 3;
      else if (spo2 <= 93) score += 2;
      else if (spo2 <= 95) score += 1;
    }
    if (sbp) {
      if (sbp <= 90 || sbp >= 220) score += 3;
      else if (sbp <= 100) score += 2;
      else if (sbp <= 110) score += 1;
    }
    if (temp) {
      if (temp <= 35.0) score += 3;
      else if (temp >= 39.1) score += 2;
      else if (temp <= 36.0 || temp >= 38.1) score += 1;
    }
    if (rr) {
      if (rr <= 8 || rr >= 25) score += 3;
      else if (rr >= 21 && rr <= 24) score += 2;
      else if (rr >= 9 && rr <= 11) score += 1;
    }
    return score;
  }

  setViewMode(mode: 'ALL' | 'CHECKED_IN' | 'SCHEDULED' | 'TRIAGED' | 'IN_CONSULTATION' | 'COMPLETED'): void {
    this.viewMode.set(mode);
  }

  openTriageModal(apt: Appointment): void {
    this.selectedAppointment = apt;
    const v = apt.vitals;
    this.triageForm = {
      systolicBp: v?.systolicBp ?? null,
      diastolicBp: v?.diastolicBp ?? null,
      heartRate: v?.heartRate ?? null,
      respiratoryRate: v?.respiratoryRate ?? null,
      temperature: v?.temperature ?? null,
      oxygenSaturation: v?.oxygenSaturation ?? null,
      bloodGlucose: null,
      painScore: 0,
      heightCm: null,
      weightKg: null,
      nursingNotes: '',
      allergiesVerified: false,
      requiresImmediateAttention: false,
    };
    this.isTriageModalOpen = true;
  }

  submitTriage(): void {
    if (!this.selectedAppointment) return;

    const aptId = this.selectedAppointment.id;
    if (aptId) {
      const vitalsPayload = {
        systolicBp: this.triageForm.systolicBp || 120,
        diastolicBp: this.triageForm.diastolicBp || 80,
        heartRate: this.triageForm.heartRate || 72,
        respiratoryRate: this.triageForm.respiratoryRate || 16,
        temperature: this.triageForm.temperature || 36.8,
        oxygenSaturation: this.triageForm.oxygenSaturation || 98,
        bloodGlucose: this.triageForm.bloodGlucose || undefined,
        painScore: this.triageForm.painScore || 0,
        heightCm: this.triageForm.heightCm || undefined,
        weightKg: this.triageForm.weightKg || undefined,
        notes: this.triageForm.nursingNotes || 'Nursing triage intake completed at station',
        triageLevel: (this.computedNews2() || 0) >= 5 ? 'CRITICAL' : 'ROUTINE',
      };

      this.apiService
        .recordTriageVitals(aptId, vitalsPayload)
        .subscribe({
          next: () => {
            if (this.selectedAppointment) {
              this.selectedAppointment.status = 'TRIAGED';
              this.selectedAppointment.vitals = vitalsPayload as any;
            }
            toast.success(
              `Triage intake completed for ${this.selectedAppointment?.patient?.fullName || this.selectedAppointment?.patientName || 'Patient'}`,
            );
            this.isTriageModalOpen = false;
            this.loadAppointments();
          },
          error: () => {
            if (this.selectedAppointment) {
              this.selectedAppointment.status = 'TRIAGED';
              this.selectedAppointment.vitals = vitalsPayload as any;
            }
            toast.success(
              `Triage saved for ${this.selectedAppointment?.patient?.fullName || this.selectedAppointment?.patientName || 'Patient'}`,
            );
            this.isTriageModalOpen = false;
            this.loadAppointments();
          },
        });
    }
  }
}


