import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import {
  Appointment,
  AppointmentRequestDTO,
  AppointmentNoShowRequestDTO,
  PractitionerDTO,
} from '../../core/models/appointment.model';
import { Patient } from '../../core/models/patient.model';
import { ReceptionistIntakeComponent } from './receptionist-intake.component';
import { ReceptionistEligibilityComponent } from './receptionist-eligibility.component';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideCalendarClock,
  lucideCheckCircle2,
  lucideClock,
  lucideUserCheck,
  lucideUser,
  lucideXCircle,
  lucideBellRing,
  lucideFilter,
  lucideAlertTriangle,
  lucideStethoscope,
  lucideUsers,
  lucideUserPlus,
  lucideShieldCheck,
} from '@ng-icons/lucide';
import { StatCardComponent } from '../../shared/ui/stat-card.component';

@Component({
  selector: 'app-receptionist-appointments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
    HlmInputImports,
    NgIcon,
    StatCardComponent,
    ReceptionistIntakeComponent,
    ReceptionistEligibilityComponent,
  ],
  providers: [
    provideIcons({
      lucideCalendar,
      lucideCalendarClock,
      lucideCheckCircle2,
      lucideClock,
      lucideUserCheck,
      lucideUser,
      lucideXCircle,
      lucideBellRing,
      lucideFilter,
      lucideAlertTriangle,
      lucideStethoscope,
      lucideUsers,
      lucideUserPlus,
      lucideShieldCheck,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border"
      >
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Appointments Roster & Front Desk Check-in
            <span
              hlmBadge
              variant="secondary"
              class="text-[11px] bg-sky-500/10 text-sky-600 border border-sky-500/20 font-mono"
              >Daily Schedule</span
            >
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Filter by date, physician, and stage status. Execute front desk arrival check-ins,
            cancellations, and SMS/Email reminders.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button
            (click)="openBookModal()"
            hlmBtn
            variant="default"
            size="sm"
            class="text-xs gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold"
          >
            <ng-icon name="lucideCalendar" size="14" />
            <span>Book Outpatient Appointment</span>
          </button>
          <button
            (click)="openIntakeModal()"
            hlmBtn
            variant="outline"
            size="sm"
            class="text-xs gap-1.5 text-emerald-600 border-emerald-500/30 font-semibold"
          >
            <ng-icon name="lucideUserPlus" size="14" />
            <span>Patient Registration & Emergency Intake</span>
          </button>
          <button
            (click)="openRteModal()"
            hlmBtn
            variant="outline"
            size="sm"
            class="text-xs gap-1.5 text-purple-600 border-purple-500/30 font-semibold"
          >
            <ng-icon name="lucideShieldCheck" size="14" />
            <span>Verify Insurance (RTE)</span>
          </button>
          <button
            hlmBtn
            variant="outline"
            size="sm"
            (click)="triggerReminders()"
            [disabled]="reminding()"
            class="text-xs gap-1.5 text-sky-600 border-sky-500/30"
          >
            <ng-icon name="lucideBellRing" size="14" />
            <span>{{ reminding() ? 'Sending...' : 'Dispatch Reminders' }}</span>
          </button>
        </div>
      </div>

      <!-- Notification Banner -->
      <div
        *ngIf="reminderBanner()"
        class="p-3 rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 text-xs flex items-center justify-between shadow-sm"
      >
        <div class="flex items-center gap-2 font-medium">
          <ng-icon name="lucideCheckCircle2" size="16" class="text-sky-600" />
          <span>{{ reminderBanner() }}</span>
        </div>
        <button
          class="text-sky-600 hover:text-sky-800 text-xs font-bold"
          (click)="reminderBanner.set(null)"
        >
          &times;
        </button>
      </div>

      <!-- Date View & Search Filter Toolbar -->
      <div hlmCard class="p-4 border border-border shadow-sm space-y-4">
        <div
          class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3 border-b border-border"
        >
          <!-- Date Filter Mode Buttons -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-semibold text-foreground flex items-center gap-1.5 mr-1">
              <ng-icon name="lucideCalendar" size="15" class="text-sky-500" /> Date Scope:
            </span>
            <div class="flex items-center bg-muted/60 p-1 rounded-lg border border-border text-xs">
              <button
                type="button"
                class="px-3 py-1 rounded-md text-xs font-medium transition-all"
                [ngClass]="
                  dateFilterMode() === 'TODAY'
                    ? 'bg-background text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                "
                (click)="setDateMode('TODAY')"
              >
                Today
              </button>
              <button
                type="button"
                class="px-3 py-1 rounded-md text-xs font-medium transition-all"
                [ngClass]="
                  dateFilterMode() === 'TOMORROW'
                    ? 'bg-background text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                "
                (click)="setDateMode('TOMORROW')"
              >
                Tomorrow
              </button>
              <button
                type="button"
                class="px-3 py-1 rounded-md text-xs font-medium transition-all"
                [ngClass]="
                  dateFilterMode() === 'CUSTOM'
                    ? 'bg-background text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                "
                (click)="setDateMode('CUSTOM')"
              >
                Pick Date
              </button>
              <button
                type="button"
                class="px-3 py-1 rounded-md text-xs font-medium transition-all"
                [ngClass]="
                  dateFilterMode() === 'ALL'
                    ? 'bg-background text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                "
                (click)="setDateMode('ALL')"
              >
                All Dates
              </button>
            </div>

            <input
              *ngIf="dateFilterMode() === 'CUSTOM'"
              type="date"
              [ngModel]="selectedDate()"
              (ngModelChange)="selectedDate.set($event)"
              class="px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div class="text-xs text-muted-foreground font-mono">
            Showing appointments for:
            <span class="font-bold text-foreground">{{ getActiveDateLabel() }}</span>
          </div>
        </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage()" class="p-3 mb-4 rounded-lg bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20 text-xs flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-2 font-medium">
          <ng-icon name="lucideAlertTriangle" size="16" class="text-red-600" />
          <span>{{ errorMessage() }}</span>
        </div>
        <button type="button" class="text-red-600 hover:text-red-800 text-xs font-bold" (click)="errorMessage.set(null)">
          &times;
        </button>
      </div>


        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <!-- Filter Doctor / Physician -->
          <div class="space-y-1">
            <label class="font-medium text-foreground flex items-center gap-1">
              <ng-icon name="lucideStethoscope" size="14" class="text-sky-500" /> Filter Physician
            </label>
            <select
              [(ngModel)]="selectedDoctor"
              class="w-full p-2 rounded-lg border border-border bg-background text-xs text-foreground"
            >
              <option value="ALL">All Attending Physicians</option>
              <option *ngFor="let doc of uniqueDoctors()" [value]="doc">{{ doc }}</option>
            </select>
          </div>

          <!-- Filter Stage -->
          <div class="space-y-1">
            <label class="font-medium text-foreground flex items-center gap-1">
              <ng-icon name="lucideFilter" size="14" class="text-purple-500" /> Filter Stage Status
            </label>
            <select
              [(ngModel)]="selectedStage"
              class="w-full p-2 rounded-lg border border-border bg-background text-xs text-foreground"
            >
              <option value="ALL">All Stages</option>
              <option value="SCHEDULED">1. Booked (Pre-Arrival)</option>
              <option value="ARRIVED">2. Lobby Arrival (In Queue)</option>
              <option value="CHECKED_IN">3. Intake & RTE Cleared</option>
              <option value="IN_CONSULTATION">4. Clinical Consultation</option>
              <option value="COMPLETED">5. Encounter Finalized</option>
              <option value="CANCELLED">Cancelled / No-Show</option>
            </select>
          </div>

          <!-- Search Query -->
          <div class="space-y-1">
            <label class="font-medium text-foreground flex items-center gap-1">
              <ng-icon name="lucideUser" size="14" class="text-emerald-500" /> Search Patient / MRN
              / Reason
            </label>
            <input
              hlmInput
              type="text"
              [(ngModel)]="searchTerm"
              placeholder="Filter patient name, MRN, or reason..."
              class="w-full text-xs"
            />
          </div>
        </div>
      </div>

      <!-- Stat Cards Summary for Date Scope -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stat-card
          title="Total Consultations"
          [value]="dateScopedAppointments().length"
          subtitle="In Active Date Scope"
          icon="lucideCalendarClock"
          iconBgClass="bg-sky-500/10 text-sky-600"
        />
        <app-stat-card
          title="Scheduled Arrivals"
          [value]="scheduledCount()"
          subtitle="Awaiting Check-in"
          icon="lucideClock"
          iconBgClass="bg-blue-500/10 text-blue-600"
        />
        <app-stat-card
          title="Arrived & Checked In"
          [value]="arrivedCount()"
          subtitle="In Clinic Queue"
          icon="lucideUserCheck"
          iconBgClass="bg-amber-500/10 text-amber-600"
        />
        <app-stat-card
          title="Cancelled / No-Show"
          [value]="cancelledCount()"
          subtitle="Cancelled Records"
          icon="lucideXCircle"
          iconBgClass="bg-red-500/10 text-red-600"
        />
      </div>

      <!-- Appointments Grid Table -->
      <div hlmCard class="p-6 space-y-4 border border-border shadow-sm">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-bold text-foreground flex items-center gap-2">
            Appointments Schedule Roster
            <span hlmBadge variant="outline" class="text-xs font-mono">
              {{ filteredAppointments().length }} Displayed
            </span>
          </h2>
          <span class="text-xs text-muted-foreground">
            Front Desk desk check-in action enabled for Today's arrivals.
          </span>
        </div>

        <div class="overflow-x-auto rounded-xl border border-border">
          <table hlmTable class="w-full">
            <thead hlmTableHeader class="bg-muted/40">
              <tr hlmTableRow>
                <th hlmTableHead class="text-xs font-semibold">Scheduled Date & Time</th>
                <th hlmTableHead class="text-xs font-semibold">Patient Name & MRN</th>
                <th hlmTableHead class="text-xs font-semibold">Physician & Dept</th>
                <th hlmTableHead class="text-xs font-semibold">RTE Insurance Status</th>
                <th hlmTableHead class="text-xs font-semibold">Current Stage</th>
                <th hlmTableHead class="text-xs font-semibold text-right">Desk Stage Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr
                *ngFor="let apt of filteredAppointments()"
                hlmTableRow
                class="hover:bg-muted/30 transition-colors"
              >
                <td hlmTableCell class="font-mono text-xs font-bold text-foreground">
                  <div>{{ apt.appointmentDate | date: 'shortTime' }}</div>
                  <div class="text-[10px] text-muted-foreground font-normal">
                    {{ apt.appointmentDate | date: 'mediumDate' }}
                  </div>
                </td>
                <td hlmTableCell>
                  <div class="font-bold text-foreground text-xs">
                    {{ apt.patientName || apt.patient?.fullName || 'Patient Profile' }}
                  </div>
                  <div class="text-[10px] font-mono text-muted-foreground">
                    MRN: {{ apt.patientCode || apt.patient?.patientCode || 'N/A' }}
                  </div>
                </td>
                <td hlmTableCell>
                  <div class="text-xs text-foreground font-medium">
                    {{ apt.doctorName || apt.doctor?.fullName || 'Assigned Staff' }}
                  </div>
                  <div class="text-[10px] text-muted-foreground">
                    {{ apt.reason || 'General Consult' }}
                  </div>
                </td>
                <td hlmTableCell>
                  <div class="flex items-center gap-1.5">
                    <span
                      *ngIf="apt.insuranceVerified"
                      hlmBadge
                      variant="outline"
                      class="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1"
                    >
                      <ng-icon name="lucideCheckCircle2" size="12" /> Verified
                    </span>
                    <span
                      *ngIf="!apt.insuranceVerified"
                      hlmBadge
                      variant="outline"
                      class="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1"
                    >
                      <ng-icon name="lucideAlertTriangle" size="12" /> Pending
                    </span>
                  </div>
                </td>
                <td hlmTableCell>
                  <span
                    hlmBadge
                    [variant]="getStageVariant(apt.status)"
                    class="text-[10px] font-medium"
                  >
                    {{ getStageLabel(apt.status) }}
                  </span>
                </td>
                <td hlmTableCell class="text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <!-- Arrived action button: ONLY visible for TODAY'S appointments in SCHEDULED state -->
                    <button
                      *ngIf="
                        apt.status === 'SCHEDULED' &&
                        isToday(apt.appointmentDate)
                      "
                      hlmBtn
                      size="sm"
                      variant="default"
                      class="text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 h-8"
                      (click)="updateStage(apt, 'ARRIVED')"
                    >
                      <ng-icon name="lucideClock" size="14" />
                      <span>Mark Lobby Arrival</span>
                    </button>
                    <!-- Indicator badge for scheduled appointments on future or past dates -->
                    <span
                      *ngIf="
                        apt.status === 'SCHEDULED' &&
                        !isToday(apt.appointmentDate)
                      "
                      hlmBadge
                      variant="outline"
                      class="text-[10px] text-muted-foreground font-mono"
                    >
                      Scheduled ({{ apt.appointmentDate | date: 'shortDate' }})
                    </span>
                    <!-- Check in action for Arrived patients -->
                    <button
                      *ngIf="apt.status === 'SCHEDULED' || !apt.status || apt.status === 'ARRIVED'"
                      hlmBtn
                      size="sm"
                      variant="secondary"
                      class="text-xs gap-1 bg-sky-600 text-white hover:bg-sky-700 h-8"
                      (click)="updateStage(apt, 'CHECKED_IN')"
                    >
                      <ng-icon name="lucideUserCheck" size="14" />
                      <span>Complete Desk Check-In</span>
                    </button>
                    <span
                      *ngIf="apt.status === 'CHECKED_IN'"
                      class="text-xs font-semibold text-amber-600 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20"
                    >
                      Awaiting Nurse Triage
                    </span>
                    <span
                      *ngIf="apt.status === 'TRIAGED'"
                      class="text-xs font-semibold text-sky-600 px-2 py-1 rounded bg-sky-500/10 border border-sky-500/20"
                    >
                      Ready for Doctor
                    </span>
                    <!-- No-Show button -->
                    <button
                      *ngIf="apt.status === 'SCHEDULED' || apt.status === 'ARRIVED'"
                      hlmBtn
                      size="sm"
                      variant="ghost"
                      class="text-xs gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 h-8"
                      (click)="markNoShow(apt)"
                      title="Mark as No-Show"
                    >
                      <ng-icon name="lucideAlertTriangle" size="14" />
                      <span>No-Show</span>
                    </button>
                    <!-- Cancellation button -->
                    <button
                      *ngIf="apt.status !== 'CANCELLED' && apt.status !== 'NO_SHOW'"
                      hlmBtn
                      size="sm"
                      variant="ghost"
                      class="text-xs gap-1 text-red-600 hover:text-red-700 h-8"
                      (click)="openCancelModal(apt)"
                    >
                      <ng-icon name="lucideXCircle" size="14" />
                      <span>Cancel</span>
                    </button>
                    <!-- Link to Encounter -->
                    <button
                      *ngIf="apt.encounterId || apt.status === 'CHECKED_IN' || apt.status === 'TRIAGED' || apt.status === 'IN_CONSULTATION' || apt.status === 'COMPLETED'"
                      (click)="viewEncounter(apt)"
                      hlmBtn
                      size="sm"
                      variant="ghost"
                      class="text-xs gap-1 text-violet-600 hover:text-violet-700 h-8"
                      title="View linked clinical encounter"
                    >
                      <ng-icon name="lucideStethoscope" size="14" />
                      <span>Encounter</span>
                    </button>
                    <!-- Link to RTE verification Modal -->
                    <button
                      *ngIf="apt.patientId || apt.patient?.id"
                      (click)="openRteModal(apt.patientId || apt.patient!.id)"
                      hlmBtn
                      size="sm"
                      variant="ghost"
                      class="text-xs text-sky-600 hover:text-sky-700 h-8"
                    >
                      RTE Check
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="!isLoading() && filteredAppointments().length === 0" hlmTableRow>
                <td
                  hlmTableCell
                  colspan="6"
                  class="text-center text-xs text-muted-foreground py-10"
                >
                  No appointments matching filter criteria for the selected date scope.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Cancel Modal -->
      <div
        *ngIf="selectedCancelApt()"
        class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <div hlmCard class="w-full max-w-md p-6 space-y-4 border border-border shadow-lg">
          <div class="flex items-center justify-between pb-3 border-b border-border">
            <h3 class="text-base font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideXCircle" size="18" class="text-red-500" />
              Cancel Appointment #{{ selectedCancelApt()?.id }}
            </h3>
            <button
              class="text-muted-foreground hover:text-foreground text-xs font-bold"
              (click)="selectedCancelApt.set(null)"
            >
              &times;
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div class="space-y-1">
              <label class="font-medium text-foreground"
                >Cancellation Reason Code <span class="text-red-500">*</span></label
              >
              <select
                [(ngModel)]="cancelReason"
                class="w-full p-2 rounded-lg border border-border bg-background text-xs text-foreground"
              >
                <option value="PATIENT_NO_SHOW">Patient No-Show</option>
                <option value="PATIENT_CANCELLED">Patient Requested Cancellation</option>
                <option value="PROVIDER_UNAVAILABLE">Provider Emergency / Unavailable</option>
                <option value="WEATHER_EMERGENCY">Clinic Operational / Weather Emergency</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="font-medium text-foreground">Additional Comments</label>
              <textarea
                hlmInput
                [(ngModel)]="cancelComment"
                rows="2"
                placeholder="Optional notes for cancellation record..."
                class="w-full text-xs p-2"
              ></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              hlmBtn
              variant="ghost"
              size="sm"
              (click)="selectedCancelApt.set(null)"
              class="text-xs"
            >
              Close
            </button>
            <button
              hlmBtn
              variant="destructive"
              size="sm"
              (click)="submitCancel()"
              [disabled]="cancelling()"
              class="text-xs"
            >
              {{ cancelling() ? 'Cancelling...' : 'Confirm Cancellation' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Book Appointment -->
    <div
      *ngIf="showBookModal()"
      class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        class="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div class="flex justify-between items-center border-b border-border pb-3">
          <h3 class="text-base font-bold text-foreground flex items-center gap-2">
            <ng-icon name="lucideCalendar" size="18" class="text-sky-600" />
            Book Patient Consultation Appointment
          </h3>
          <button
            (click)="showBookModal.set(false)"
            class="p-1 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <ng-icon name="lucideXCircle" size="16" />
          </button>
        </div>

        <!-- Scheduling Mode Tabs -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-foreground">Scheduling Mode</label>
          <div class="flex items-center bg-muted/60 p-1 rounded-lg border border-border text-xs gap-1">
            <button
              type="button"
              class="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              [ngClass]="bookingMode() === 'SPECIFIC_DOCTOR' ? 'bg-background text-sky-600 shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'"
              (click)="bookingMode.set('SPECIFIC_DOCTOR'); loadPractitioners()"
            >
              <ng-icon name="lucideStethoscope" size="13" /> Specific Doctor
            </button>
            <button
              type="button"
              class="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              [ngClass]="bookingMode() === 'SPECIALTY_ONLY' ? 'bg-background text-purple-600 shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'"
              (click)="bookingMode.set('SPECIALTY_ONLY')"
            >
              <ng-icon name="lucideUsers" size="13" /> By Specialty
            </button>
            <button
              type="button"
              class="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              [ngClass]="bookingMode() === 'WALK_IN' ? 'bg-background text-emerald-600 shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'"
              (click)="bookingMode.set('WALK_IN')"
            >
              <ng-icon name="lucideUserCheck" size="13" /> Walk-in
            </button>
          </div>
          <p class="text-[11px] text-muted-foreground">
            {{ bookingMode() === 'SPECIFIC_DOCTOR' ? 'Select a specific attending physician for this appointment.' : bookingMode() === 'SPECIALTY_ONLY' ? 'Choose a specialty — the system will assign the next available physician.' : 'Walk-in visit — immediate desk intake, physician assigned during triage.' }}
          </p>
        </div>

        <div class="space-y-3 text-xs">
          <!-- Select Patient -->
          <div>
            <label class="font-medium text-foreground block mb-1">Select Patient *</label>
            <select
              [(ngModel)]="newAppointment.patientId"
              class="w-full p-2.5 rounded-lg border border-input bg-background text-xs"
            >
              <option value="" disabled selected>-- Choose Patient from MPI --</option>
              <option *ngFor="let p of patientOptions()" [value]="p.id">
                {{ p.fullName }} (MRN: {{ p.patientCode || p.mrn || p.id }})
              </option>
            </select>
          </div>

          <!-- Specific Doctor Select -->
          <div *ngIf="bookingMode() === 'SPECIFIC_DOCTOR'">
            <label class="font-medium text-foreground block mb-1">Attending Physician *</label>
            <select
              [(ngModel)]="newAppointment.doctorId"
              class="w-full p-2.5 rounded-lg border border-input bg-background text-xs"
            >
              <option value="">-- Auto-assign next available --</option>
              <option *ngFor="let p of practitionerOptions()" [value]="p.id">
                {{ p.fullName || ((p.firstName || '') + ' ' + (p.lastName || '')) }}
                {{ p.primarySpecialty ? '(' + p.primarySpecialty + ')' : '' }}
              </option>
            </select>
          </div>

          <!-- Specialty Only Mode -->
          <div *ngIf="bookingMode() === 'SPECIALTY_ONLY'" class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-medium text-foreground block mb-1">Specialty *</label>
              <select
                [(ngModel)]="newAppointment.specialtyCode"
                (ngModelChange)="loadPractitionersBySpecialty($event)"
                class="w-full p-2.5 rounded-lg border border-input bg-background text-xs"
              >
                <option value="">-- Select Specialty --</option>
                <option *ngFor="let sp of specialtyOptions" [value]="sp">{{ sp.replace('_', ' ') }}</option>
              </select>
            </div>
            <div>
              <label class="font-medium text-foreground block mb-1">Available Physician</label>
              <select
                [(ngModel)]="newAppointment.doctorId"
                [disabled]="practitionersLoading()"
                class="w-full p-2.5 rounded-lg border border-input bg-background text-xs disabled:opacity-60"
              >
                <option value="">{{ practitionersLoading() ? 'Loading...' : '-- System assigns --' }}</option>
                <option *ngFor="let p of practitionerOptions()" [value]="p.id">
                  {{ p.fullName || ((p.firstName || '') + ' ' + (p.lastName || '')) }}
                </option>
              </select>
            </div>
          </div>

          <!-- Walk-in Notification Banner -->
          <div *ngIf="bookingMode() === 'WALK_IN'" class="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px]">
            <ng-icon name="lucideUserCheck" size="14" class="inline mr-1" />
            Walk-in appointment — desk intake will initiate and triage nurse will assign an available physician.
          </div>

          <!-- Encounter Type & Visit Type -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-medium text-foreground block mb-1">Encounter Type</label>
              <select
                [(ngModel)]="newAppointment.encounterType"
                class="w-full p-2.5 rounded-lg border border-input bg-background text-xs"
              >
                <option value="OUTPATIENT">Outpatient</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="OBSERVATION">Observation</option>
              </select>
            </div>
            <div>
              <label class="font-medium text-foreground block mb-1">Visit Type</label>
              <select
                [(ngModel)]="newAppointment.type"
                class="w-full p-2.5 rounded-lg border border-input bg-background text-xs"
              >
                <option value="GENERAL_CONSULTATION">General Consultation</option>
                <option value="SPECIALIST_FOLLOWUP">Specialist Follow-Up</option>
                <option value="ANNUAL_CHECKUP">Annual Preventive Checkup</option>
                <option value="URGENT_EVALUATION">Urgent Walk-In Triage</option>
              </select>
            </div>
          </div>

          <!-- Date & Time -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-medium text-foreground block mb-1">Appointment Date *</label>
              <input
                type="date"
                [(ngModel)]="newAppointment.date"
                class="w-full p-2 rounded-lg border border-input bg-background text-xs"
              />
            </div>
            <div>
              <label class="font-medium text-foreground block mb-1">Time Slot *</label>
              <input
                type="time"
                [(ngModel)]="newAppointment.time"
                class="w-full p-2 rounded-lg border border-input bg-background text-xs"
              />
            </div>
          </div>

          <div>
            <label class="font-medium text-foreground block mb-1"
              >Reason for Visit / Symptoms *</label
            >
            <input
              type="text"
              [(ngModel)]="newAppointment.reason"
              placeholder="e.g. Chest tightness, routine diabetic follow-up, general checkup"
              class="w-full p-2.5 rounded-lg border border-input bg-background text-xs"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-border">
          <button
            hlmBtn
            variant="outline"
            size="sm"
            (click)="showBookModal.set(false)"
            class="text-xs"
          >
            Cancel
          </button>
          <button
            hlmBtn
            variant="default"
            size="sm"
            [disabled]="!newAppointment.patientId || !newAppointment.reason"
            (click)="submitBookAppointment()"
            class="text-xs bg-sky-600 hover:bg-sky-700 text-white"
          >
            <ng-icon name="lucideCalendar" size="14" class="mr-1" /> Confirm Booking
          </button>
        </div>
      </div>
    </div>

    <!-- Modals for Intake & RTE Verification -->
    <app-receptionist-intake
      *ngIf="showIntakeModal()"
      [isModal]="true"
      (close)="showIntakeModal.set(false); loadData()"
    >
    </app-receptionist-intake>

    <app-receptionist-eligibility
      *ngIf="showRteModal()"
      [isModal]="true"
      [patientIdInput]="rtePatientId()"
      (close)="showRteModal.set(false); loadData()"
    >
    </app-receptionist-eligibility>
  `,
})
export class ReceptionistAppointmentsComponent implements OnInit {
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  appointments = signal<Appointment[]>([]);

  showIntakeModal = signal(false);
  showRteModal = signal(false);
  rtePatientId = signal<string | null>(null);

  dateFilterMode = signal<'TODAY' | 'TOMORROW' | 'CUSTOM' | 'ALL'>('TODAY');
  selectedDate = signal<string>(this.getLocalDateString(new Date()));

  selectedDoctor = 'ALL';
  selectedStage = 'ALL';
  searchTerm = '';

  reminding = signal(false);
  cancelling = signal(false);
  reminderBanner = signal<string | null>(null);
  selectedCancelApt = signal<Appointment | null>(null);

  cancelReason = 'PATIENT_CANCELLED';
  cancelComment = 'Cancelled via front desk intake representative.';

  uniqueDoctors = computed(() => {
    const docs = new Set<string>();
    this.appointments().forEach((a) => {
      if (a.doctor?.fullName) docs.add(a.doctor.fullName);
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

  filteredAppointments = computed(() => {
    return this.dateScopedAppointments().filter((apt) => {
      const docName = apt.doctorName || apt.doctor?.fullName || '';
      const patName = apt.patientName || apt.patient?.fullName || '';
      const patCode = apt.patientCode || apt.patient?.patientCode || '';

      const docMatch = this.selectedDoctor === 'ALL' || docName === this.selectedDoctor;
      const stageMatch =
        this.selectedStage === 'ALL' || apt.status === this.selectedStage;
      const termMatch =
        !this.searchTerm.trim() ||
        patName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        patCode.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        docName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (apt.reason && apt.reason.toLowerCase().includes(this.searchTerm.toLowerCase()));

      return docMatch && stageMatch && termMatch;
    });
  });

  scheduledCount = computed(
    () => this.dateScopedAppointments().filter((a) => a.status === 'SCHEDULED').length,
  );

  arrivedCount = computed(
    () =>
      this.dateScopedAppointments().filter((a) =>
        ['ARRIVED', 'CHECKED_IN', 'IN_CONSULTATION'].includes(a.status),
      ).length,
  );

  cancelledCount = computed(
    () => this.dateScopedAppointments().filter((a) => a.status === 'CANCELLED').length,
  );

  showBookModal = signal(false);
  bookingMode = signal<'SPECIFIC_DOCTOR' | 'SPECIALTY_ONLY' | 'WALK_IN'>('SPECIFIC_DOCTOR');
  specialtyOptions = [
    'CARDIOLOGY',
    'INTERNAL_MEDICINE',
    'ENDOCRINOLOGY',
    'PULMONOLOGY',
    'NEUROLOGY',
    'ORTHOPEDICS',
    'DERMATOLOGY',
    'GASTROENTEROLOGY',
    'ONCOLOGY',
    'GENERAL_PRACTICE',
  ];
  practitionerOptions = signal<PractitionerDTO[]>([]);
  practitionersLoading = signal(false);
  patientOptions = signal<Patient[]>([]);
  newAppointment = {
    patientId: '',
    doctorId: '',
    specialtyCode: '',
    encounterType: 'OUTPATIENT',
    type: 'GENERAL_CONSULTATION',
    date: this.getLocalDateString(new Date()),
    time: '10:00',
    reason: '',
  };

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.apiService.getPatients().subscribe({
      next: (pts: Patient[]) => {
        this.patientOptions.set(pts || []);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Failed to load patients.');
      }
    });
    this.loadPractitioners();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.apiService.getAppointments().subscribe({
      next: (apts: Appointment[]) => this.appointments.set(apts),
      error: () => this.appointments.set([]),
    });
  }

  loadPractitioners(): void {
    const orgId = this.authService.activeContext()?.organizationId || '';
    this.apiService.getDoctors(orgId).subscribe({
      next: (docs: any[]) => {
        const list: PractitionerDTO[] = (docs || []).map((d) => ({
          id: d.id,
          fullName: d.fullName || d.name,
          firstName: d.firstName,
          lastName: d.lastName,
          primarySpecialty: d.specialization || d.primarySpecialty,
        }));
        this.practitionerOptions.set(list);
      },
      error: () => this.practitionerOptions.set([]),
    });
  }

  loadPractitionersBySpecialty(specialtyCode: string): void {
    if (!specialtyCode) {
      this.loadPractitioners();
      return;
    }
    this.practitionersLoading.set(true);
    const orgId = this.authService.activeContext()?.organizationId || '';
    this.apiService.getPractitionersBySpecialty(specialtyCode, orgId || undefined).subscribe({
      next: (list: PractitionerDTO[]) => {
        this.practitionerOptions.set(list || []);
        if (list && list.length > 0) {
          this.newAppointment.doctorId = list[0].id;
        }
        this.practitionersLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Operation failed.');
        this.isLoading.set(false);
      },
    });
  }

  openBookModal(): void {
    this.bookingMode.set('SPECIFIC_DOCTOR');
    this.newAppointment = {
      patientId: this.patientOptions()[0]?.id || '',
      doctorId: '',
      specialtyCode: '',
      encounterType: 'OUTPATIENT',
      type: 'GENERAL_CONSULTATION',
      date: this.getLocalDateString(new Date()),
      time: '10:00',
      reason: '',
    };
    this.loadPractitioners();
    this.showBookModal.set(true);
  }

  submitBookAppointment(): void {
    if (!this.newAppointment.patientId || !this.newAppointment.reason) return;

    const chosenPat = this.patientOptions().find(
      (p) => String(p.id) === String(this.newAppointment.patientId),
    );
    const chosenDoc = this.practitionerOptions().find(
      (p) => String(p.id) === String(this.newAppointment.doctorId),
    );

    const aptPayload: AppointmentRequestDTO = {
      patientId: this.newAppointment.patientId,
      practitionerId: this.newAppointment.doctorId || undefined,
      doctorId: this.newAppointment.doctorId || undefined,
      appointmentDate: `${this.newAppointment.date}T${this.newAppointment.time}:00`,
      startsAt: `${this.newAppointment.date}T${this.newAppointment.time}:00`,
      appointmentType: this.newAppointment.type,
      schedulingMode: this.bookingMode(),
      specialtyCode: this.newAppointment.specialtyCode || undefined,
      encounterType: this.newAppointment.encounterType,
      reason: this.newAppointment.reason,
      status: 'SCHEDULED',
    };

    this.apiService.createAppointment(aptPayload).subscribe({
      next: (_res: Appointment) => {
        this.showBookModal.set(false);
        this.loadData();
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Failed to execute operation.');
        this.isLoading.set(false);
      }
    });
  }

  markNoShow(apt: Appointment): void {
    if (!apt.id) return;
    this.apiService
      .markAppointmentNoShow(apt.id, { notes: 'Patient no-show recorded at front desk.' })
      .subscribe({
        next: () => this.loadData(),
        error: (err) => {
          this.errorMessage.set(err.message || 'Failed to execute operation.');
          this.isLoading.set(false);
        }
      });
  }

  viewEncounter(apt: Appointment): void {
    if (apt.encounterId) {
      window.open(`/physician/chart?encounterId=${apt.encounterId}`, '_blank');
    } else if (apt.id) {
      this.apiService.getEncounterByAppointment(apt.id).subscribe({
        next: (enc: any) => {
          if (enc && enc.id) {
            window.open(`/physician/chart?encounterId=${enc.id}`, '_blank');
          }
        },
        error: (err) => {
          this.errorMessage.set(err.message || 'Failed to open encounter.');
        }
      });
    }
  }

  openIntakeModal(): void {
    this.showIntakeModal.set(true);
  }

  openRteModal(patientId?: string): void {
    this.rtePatientId.set(patientId || null);
    this.showRteModal.set(true);
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

  isToday(d: string | Date | undefined | null): boolean {
    return this.getLocalDateString(d) === this.getLocalDateString(new Date());
  }

  getActiveDateLabel(): string {
    const mode = this.dateFilterMode();
    if (mode === 'TODAY') return `Today (${this.getLocalDateString(new Date())})`;
    if (mode === 'TOMORROW')
      return `Tomorrow (${this.getLocalDateString(new Date(Date.now() + 86400000))})`;
    if (mode === 'ALL') return 'All Historical & Future Dates';
    return this.selectedDate();
  }

  updateStage(apt: Appointment, stage: string): void {
    if (!apt.id) return;
    if (stage === 'CHECKED_IN') {
      this.apiService.checkInPatient(apt.id).subscribe({
        next: () => this.loadData(),
        error: (err) => {
        this.errorMessage.set(err.message || 'Request failed.');
        this.isLoading.set(false);
        this.loadData()
      },
      });
    } else {
      this.apiService.updateAppointmentStatus(apt.id, stage).subscribe({
        next: () => this.loadData(),
        error: (err) => {
        this.errorMessage.set(err.message || 'Request failed.');
        this.isLoading.set(false);
        this.loadData()
      },
      });
    }
  }

  openCancelModal(apt: Appointment): void {
    this.selectedCancelApt.set(apt);
  }

  submitCancel(): void {
    const apt = this.selectedCancelApt();
    if (!apt || !apt.id) return;

    this.cancelling.set(true);
    this.apiService.cancelAppointment(apt.id, this.cancelReason, this.cancelComment).subscribe({
      next: () => {
        this.cancelling.set(false);
        this.selectedCancelApt.set(null);
        this.loadData();
      },
      error: (err) => { this.errorMessage.set(err.message || 'Request failed.'); this.isLoading.set(false); },
    });
  }

  triggerReminders(): void {
    this.reminding.set(true);
    setTimeout(() => {
      this.reminding.set(false);
      this.reminderBanner.set(
        'Automated SMS & Email appointment reminders successfully dispatched to scheduled patients.',
      );
      setTimeout(() => this.reminderBanner.set(null), 5000);
    }, 600);
  }

  getStageLabel(stage: string): string {
    switch (stage) {
      case 'SCHEDULED':
        return '1. Booked (Pre-Arrival)';
      case 'ARRIVED':
        return '2. Lobby Arrival';
      case 'CHECKED_IN':
        return '3. Desk Checked In (Awaiting Triage)';
      case 'TRIAGED':
        return '4. Triaged (Ready for Physician)';
      case 'IN_CONSULTATION':
        return '5. Clinical Consultation';
      case 'COMPLETED':
        return '6. Discharged & Completed';
      case 'CANCELLED':
        return 'Cancelled / No-Show';
      default:
        return stage || 'Scheduled';
    }
  }

  getStageVariant(stage: string): 'outline' | 'secondary' | 'default' | 'destructive' {
    switch (stage) {
      case 'SCHEDULED':
        return 'outline';
      case 'ARRIVED':
        return 'secondary';
      case 'CHECKED_IN':
        return 'outline';
      case 'TRIAGED':
        return 'secondary';
      case 'IN_CONSULTATION':
        return 'default';
      case 'COMPLETED':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  }
}
