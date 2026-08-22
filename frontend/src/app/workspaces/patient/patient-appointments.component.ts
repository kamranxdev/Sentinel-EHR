import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { User, OrganizationContextDTO } from '../../core/models/auth-user.model';
import { Patient } from '../../core/models/patient.model';
import {
  Appointment,
  AppointmentRequestDTO,
  DoctorRecommendationDTO,
} from '../../core/models/appointment.model';
import { Organization } from '../../core/models/organization.model';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendarClock,
  lucidePlus,
  lucideSparkles,
  lucideCheckCircle2,
  lucideUserRound,
  lucideClock,
  lucideStethoscope,
  lucideAlertCircle,
  lucideX,
  lucideCalendar,
  lucideFilter,
  lucideBan,
  lucideFileText,
  lucideShieldCheck,
  lucideChevronRight,
  lucideChevronLeft,
  lucideCheck,
  lucideInfo,
  lucideSearch,
  lucideUser,
  lucideActivity,
  lucideTrash2,
  lucideBuilding2,
  lucideHospital,
  lucideArrowLeft,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-patient-appointments',
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
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideCalendarClock,
      lucidePlus,
      lucideSparkles,
      lucideCheckCircle2,
      lucideUserRound,
      lucideClock,
      lucideStethoscope,
      lucideAlertCircle,
      lucideX,
      lucideCalendar,
      lucideFilter,
      lucideBan,
      lucideFileText,
      lucideShieldCheck,
      lucideChevronRight,
      lucideChevronLeft,
      lucideCheck,
      lucideInfo,
      lucideSearch,
      lucideUser,
      lucideActivity,
      lucideTrash2,
      lucideBuilding2,
      lucideHospital,
      lucideArrowLeft,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Header Banner & Booking Action -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border"
      >
        <div class="flex items-center gap-3">
          <div
            class="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20"
          >
            <ng-icon name="lucideCalendarClock" size="24" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold tracking-tight text-foreground">
                My Consultation Schedule
              </h1>
              <span hlmBadge variant="outline" class="text-[10px]">Patient Portal</span>
            </div>
            <p class="text-xs text-muted-foreground mt-0.5">
              Book new clinical consultations with Smart Doctor Match, view schedule, and manage
              visits.
            </p>
          </div>
        </div>
        <button
          hlmBtn
          variant="default"
          size="sm"
          (click)="openBookingModal()"
          class="gap-2 font-semibold text-xs shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <ng-icon name="lucidePlus" size="15" />
          <span>Book Consultation</span>
        </button>
      </div>

      <!-- Filter Controls & Search -->
      <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <!-- Status Tabs -->
        <div
          class="flex items-center p-1 rounded-lg bg-muted/60 border border-border w-fit text-xs"
        >
          <button
            *ngFor="let status of ['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED']"
            (click)="activeFilter.set(status)"
            [class.bg-card]="activeFilter() === status"
            [class.text-foreground]="activeFilter() === status"
            [class.shadow-xs]="activeFilter() === status"
            class="px-3 py-1.5 rounded-md font-medium text-muted-foreground hover:text-foreground transition-all"
          >
            {{ status | titlecase }}
          </button>
        </div>

        <!-- Search Bar -->
        <div class="relative w-full sm:w-64">
          <ng-icon
            name="lucideSearch"
            size="14"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search doctor or reason..."
            class="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <!-- Appointments List Table -->
      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Date & Time</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Attending Doctor</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Consultation Reason</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Status</th>
                <th hlmTableHead class="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr
                *ngFor="let apt of filteredAppointments()"
                hlmTableRow
                class="hover:bg-muted/40 transition-colors"
              >
                <!-- Date & Time -->
                <td hlmTableCell class="py-3.5 px-4 font-mono text-foreground font-medium">
                  <div class="flex items-center gap-2">
                    <ng-icon name="lucideCalendar" size="14" class="text-primary" />
                    <span>{{ apt.appointmentDate | date: 'mediumDate' }}</span>
                    <span class="text-muted-foreground"
                      >• {{ apt.appointmentDate | date: 'shortTime' }}</span
                    >
                  </div>
                </td>

                <!-- Attending Doctor -->
                <td hlmTableCell class="py-3.5 px-4">
                  <div class="flex items-center gap-2">
                    <div
                      class="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0"
                    >
                      Dr
                    </div>
                    <div>
                      <div class="font-semibold text-foreground">
                        {{ getDoctorDisplayName(apt) }}
                      </div>
                      <div
                        class="text-[10px] text-muted-foreground"
                        *ngIf="getDoctorSpecialization(apt)"
                      >
                        {{ getDoctorSpecialization(apt) }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Reason -->
                <td hlmTableCell class="py-3.5 px-4 text-muted-foreground max-w-xs truncate">
                  <span class="text-foreground font-medium">{{
                    apt.reason || 'General Consultation'
                  }}</span>
                  <p *ngIf="apt.notes" class="text-[10px] text-muted-foreground truncate">
                    {{ apt.notes }}
                  </p>
                </td>

                <!-- Status Badge -->
                <td hlmTableCell class="py-3.5 px-4">
                  <span
                    hlmBadge
                    variant="outline"
                    [class]="'text-[10px] font-medium border px-2.5 py-0.5 ' + getStageBadgeClass(apt.status)"
                  >
                    {{ getStageLabel(apt.status) }}
                  </span>
                </td>


                <!-- Actions -->
                <td hlmTableCell class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      *ngIf="apt.status === 'SCHEDULED'"
                      hlmBtn
                      size="sm"
                      variant="ghost"
                      (click)="openCancelModal(apt)"
                      class="h-7 px-2 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1"
                    >
                      <ng-icon name="lucideBan" size="13" />
                      <span>Cancel</span>
                    </button>
                    <span
                      *ngIf="apt.status !== 'SCHEDULED'"
                      class="text-[11px] text-muted-foreground"
                      >--</span
                    >
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr *ngIf="filteredAppointments().length === 0" hlmTableRow>
                <td
                  colspan="5"
                  hlmTableCell
                  class="py-12 text-center text-muted-foreground text-xs"
                >
                  <div class="flex flex-col items-center justify-center space-y-2">
                    <div class="size-10 rounded-full bg-muted flex items-center justify-center">
                      <ng-icon name="lucideCalendarClock" size="20" class="text-muted-foreground" />
                    </div>
                    <p class="font-medium text-foreground">No consultations found</p>
                    <p class="text-muted-foreground text-[11px]">
                      Click "Book Consultation" above to schedule a new appointment.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- MULTI-STEP BOOK CONSULTATION WIZARD MODAL -->
      <!-- ========================================================= -->
      <div
        *ngIf="showBookingModal()"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      >
        <div
          class="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden my-6"
        >
          <!-- Modal Header -->
          <div
            class="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30"
          >
            <div class="flex items-center gap-2">
              <div
                class="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"
              >
                <ng-icon name="lucideStethoscope" size="18" />
              </div>
              <div>
                <h2 class="text-base font-bold text-foreground">Book Clinical Consultation</h2>
                <p class="text-[11px] text-muted-foreground">
                  Step {{ bookingStep() }} of 3 - {{ getStepTitle() }}
                </p>
              </div>
            </div>
            <button
              (click)="closeBookingModal()"
              class="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors"
            >
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <!-- Step Progress Indicator -->
          <div
            class="grid grid-cols-3 border-b border-border bg-muted/10 text-center text-xs font-semibold"
          >
            <div
              class="py-2.5 px-3 border-r border-border transition-colors flex items-center justify-center gap-1.5"
              [class.bg-primary/10]="bookingStep() === 1"
              [class.text-primary]="bookingStep() === 1"
              [class.text-muted-foreground]="bookingStep() !== 1"
            >
              <span
                class="size-5 rounded-full text-[10px] flex items-center justify-center"
                [class.bg-primary]="bookingStep() === 1"
                [class.text-primary-foreground]="bookingStep() === 1"
                [class.bg-muted]="bookingStep() !== 1"
                >1</span
              >
              <span>Reason & Schedule</span>
            </div>
            <div
              class="py-2.5 px-3 border-r border-border transition-colors flex items-center justify-center gap-1.5"
              [class.bg-primary/10]="bookingStep() === 2"
              [class.text-primary]="bookingStep() === 2"
              [class.text-muted-foreground]="bookingStep() !== 2"
            >
              <span
                class="size-5 rounded-full text-[10px] flex items-center justify-center"
                [class.bg-primary]="bookingStep() === 2"
                [class.text-primary-foreground]="bookingStep() === 2"
                [class.bg-muted]="bookingStep() !== 2"
                >2</span
              >
              <span>Smart Doctor Match</span>
            </div>
            <div
              class="py-2.5 px-3 transition-colors flex items-center justify-center gap-1.5"
              [class.bg-primary/10]="bookingStep() === 3"
              [class.text-primary]="bookingStep() === 3"
              [class.text-muted-foreground]="bookingStep() !== 3"
            >
              <span
                class="size-5 rounded-full text-[10px] flex items-center justify-center"
                [class.bg-primary]="bookingStep() === 3"
                [class.text-primary-foreground]="bookingStep() === 3"
                [class.bg-muted]="bookingStep() !== 3"
                >3</span
              >
              <span>Review & Confirm</span>
            </div>
          </div>

          <!-- Modal Body (Steps) -->
          <div class="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            <!-- ================= STEP 1 ================= -->
            <div *ngIf="bookingStep() === 1" class="space-y-4">
              <!-- Hospital Selection Section -->
              <div class="space-y-3">
                <div>
                  <label
                    class="block text-xs font-bold text-foreground mb-1.5 flex items-center justify-between"
                  >
                    <span>Select Hospital / Clinic <span class="text-rose-500">*</span></span>
                    <span
                      *ngIf="selectedHospital()"
                      class="text-[11px] text-primary font-semibold flex items-center gap-1"
                    >
                      <ng-icon name="lucideCheckCircle2" size="12" />
                      {{ selectedHospital()?.name }}
                    </span>
                  </label>

                  <!-- Native Dropdown Select Menu -->
                  <div class="relative">
                    <select
                      [ngModel]="selectedHospital()?.id"
                      (ngModelChange)="onHospitalSelectChange($event)"
                      class="w-full p-2.5 pl-3 pr-8 text-xs font-semibold rounded-xl border border-border bg-background text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
                    >
                      <option [value]="undefined" disabled>
                        -- Choose a Hospital or Clinic --
                      </option>
                      <option *ngFor="let org of allOrganizations()" [value]="org.id">
                        {{ org.name }} ({{ org.code }}) — {{ org.organizationType || 'Hospital' }}
                      </option>
                    </select>
                  </div>
                  <p class="text-[10px] text-muted-foreground mt-1">
                    Choose the hospital or clinic (e.g. AIIMS Delhi, AIIMS Gorakhpur, Apollo) where
                    you want to consult a physician.
                  </p>
                </div>

              </div>

              <div>
                <label class="block text-xs font-bold text-foreground mb-1">
                  Chief Complaint / Reason for Consultation <span class="text-rose-500">*</span>
                </label>
                <input
                  hlmInput
                  type="text"
                  [(ngModel)]="bookingReason"
                  placeholder="e.g. Mild chest pain, high blood pressure, or routine health check"
                  class="w-full text-xs"
                />
              </div>

              <!-- Quick Symptom Tags / Presets -->
              <div>
                <label class="block text-[11px] font-medium text-muted-foreground mb-1.5"
                  >Quick Select Common Reasons:</label
                >
                <div class="flex flex-wrap gap-1.5">
                  <button
                    *ngFor="let preset of commonReasons"
                    type="button"
                    (click)="selectReasonPreset(preset)"
                    [class.bg-primary]="bookingReason === preset"
                    [class.text-primary-foreground]="bookingReason === preset"
                    [class.bg-muted]="bookingReason !== preset"
                    class="px-2.5 py-1 rounded-full text-[11px] font-medium hover:bg-primary/80 hover:text-primary-foreground transition-colors"
                  >
                    {{ preset }}
                  </button>
                </div>
              </div>

              <!-- Preferred Date & Time Selection -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label class="block text-xs font-bold text-foreground mb-1">
                    Preferred Date <span class="text-rose-500">*</span>
                  </label>
                  <input
                    hlmInput
                    type="date"
                    [min]="minDate"
                    [(ngModel)]="bookingDate"
                    class="w-full text-xs"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-foreground mb-1">
                    Preferred Time Slot <span class="text-rose-500">*</span>
                  </label>
                  <input hlmInput type="time" [(ngModel)]="bookingTime" class="w-full text-xs" />
                </div>
              </div>
            </div>

            <!-- ================= STEP 2 ================= -->
            <div *ngIf="bookingStep() === 2" class="space-y-4">
              <!-- Selected Hospital Header Banner -->
              <div
                class="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between gap-3"
              >
                <div class="flex items-center gap-2.5">
                  <div
                    class="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"
                  >
                    <ng-icon name="lucideHospital" size="16" />
                  </div>
                  <div>
                    <span
                      class="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block"
                      >Selected Hospital / Clinic</span
                    >
                    <h4 class="text-xs font-bold text-foreground">
                      {{ selectedHospital()?.name }} ({{ selectedHospital()?.code }})
                    </h4>
                  </div>
                </div>
                <button
                  type="button"
                  hlmBtn
                  variant="outline"
                  size="xs"
                  (click)="bookingStep.set(1)"
                  class="text-xs font-semibold gap-1"
                >
                  <ng-icon name="lucideArrowLeft" size="12" /> Change Hospital
                </button>
              </div>

              <!-- AI Recommendation Engine Header Banner -->
              <div
                class="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-start gap-3"
              >
                <div
                  class="size-8 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0"
                >
                  <ng-icon name="lucideSparkles" size="18" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-xs font-bold text-foreground">Smart Doctor Match Engine</h3>
                    <span
                      hlmBadge
                      variant="outline"
                      class="text-[9px] border-purple-500/40 text-purple-600 dark:text-purple-400"
                      >Hospital Match Active</span
                    >
                  </div>
                  <p class="text-[11px] text-muted-foreground mt-0.5">
                    Matching complaint "<span class="font-semibold text-foreground">{{
                      bookingReason
                    }}</span
                    >" with available specialists at
                    <span class="font-semibold text-foreground">{{ selectedHospital()?.name }}</span
                    >.
                  </p>
                </div>
              </div>

              <!-- Recommended Doctors List Loading -->
              <div
                *ngIf="loadingRecommendations()"
                class="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2"
              >
                <ng-icon name="lucideClock" size="16" class="animate-spin text-primary" />
                <span>Evaluating doctor matching engine at {{ selectedHospital()?.name }}...</span>
              </div>

              <!-- Recommended Doctors Empty State -->
              <div
                *ngIf="!loadingRecommendations() && recommendedDoctors().length === 0"
                class="p-6 text-center rounded-xl border border-dashed border-border bg-muted/20 space-y-3"
              >
                <div
                  class="size-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground"
                >
                  <ng-icon name="lucideStethoscope" size="20" />
                </div>
                <div>
                  <h4 class="text-xs font-bold text-foreground">
                    No Physicians Available for {{ selectedHospital()?.name }}
                  </h4>
                  <p class="text-[11px] text-muted-foreground mt-0.5">
                    No active physicians were found for the selected hospital. Please choose another
                    hospital to schedule your consultation.
                  </p>
                </div>
                <button
                  type="button"
                  (click)="bookingStep.set(1)"
                  class="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all inline-flex items-center gap-1.5"
                >
                  <ng-icon name="lucideArrowLeft" size="13" />
                  <span>Choose Another Hospital</span>
                </button>
              </div>

              <!-- Recommended Doctors Cards -->
              <div
                *ngIf="!loadingRecommendations() && recommendedDoctors().length > 0"
                class="space-y-3"
              >
                <div
                  *ngFor="let rec of recommendedDoctors()"
                  (click)="selectDoctor(rec.doctor, rec.recommendedSlots?.[0])"
                  [class.border-primary]="selectedDoctor?.id === rec.doctor.id"
                  [class.bg-primary/5]="selectedDoctor?.id === rec.doctor.id"
                  class="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer space-y-2.5 relative"
                >
                  <!-- Top Row: Doctor Info & Match Score Pill -->
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-3">
                      <div
                        class="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20"
                      >
                        Dr
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <h4 class="text-xs font-bold text-foreground">
                            {{ formatDoctorName(rec.doctor) }}
                          </h4>
                          <span
                            *ngIf="rec.verifiedLicense"
                            hlmBadge
                            variant="secondary"
                            class="text-[9px] gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          >
                            <ng-icon name="lucideShieldCheck" size="11" /> Verified
                          </span>
                        </div>
                        <p class="text-[11px] text-muted-foreground">
                          {{ rec.doctor.specialization || rec.recommendedSpecialty }} •
                          {{ rec.doctor.yearsOfExperience || 8 }}+ Yrs Exp
                        </p>
                      </div>
                    </div>

                    <!-- Match Score Pill -->
                    <div class="text-right shrink-0">
                      <span
                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30"
                      >
                        <ng-icon name="lucideSparkles" size="12" /> {{ rec.matchScore }}% Match
                      </span>
                    </div>
                  </div>

                  <!-- Match Rationale -->
                  <div
                    class="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-lg border border-border/50"
                  >
                    <span class="font-semibold text-foreground">Match Insight:</span>
                    {{ rec.matchReason }}
                  </div>

                  <!-- Recommended Smart Slots -->
                  <div *ngIf="rec.recommendedSlots && rec.recommendedSlots.length > 0" class="pt-1">
                    <span class="text-[10px] font-semibold text-muted-foreground block mb-1"
                      >Available Doctor Time Slots:</span
                    >
                    <div class="flex flex-wrap gap-1.5">
                      <button
                        *ngFor="let slot of getFormattedSlots(rec.recommendedSlots)"
                        type="button"
                        (click)="selectDoctorAndSlot(rec.doctor, slot, $event)"
                        [class.bg-primary]="
                          selectedDoctor?.id === rec.doctor.id &&
                          cleanSlot(selectedSlot) === cleanSlot(slot)
                        "
                        [class.text-primary-foreground]="
                          selectedDoctor?.id === rec.doctor.id &&
                          cleanSlot(selectedSlot) === cleanSlot(slot)
                        "
                        [class.bg-background]="
                          selectedDoctor?.id !== rec.doctor.id ||
                          cleanSlot(selectedSlot) !== cleanSlot(slot)
                        "
                        class="px-2.5 py-1 rounded-md text-[11px] font-medium border border-border hover:border-primary transition-all flex items-center gap-1.5"
                      >
                        <ng-icon name="lucideClock" size="12" />
                        <span>{{ cleanSlot(slot) }}</span>
                      </button>
                    </div>
                  </div>

                  <!-- Radio checkmark -->
                  <div
                    *ngIf="selectedDoctor?.id === rec.doctor.id"
                    class="absolute top-3 right-3 text-primary"
                  >
                    <ng-icon name="lucideCheckCircle2" size="18" />
                  </div>
                </div>
              </div>

              <!-- Fallback Manual Doctor Dropdown -->
              <div *ngIf="allDoctors().length > 0" class="pt-2 border-t border-border">
                <label class="block text-xs font-bold text-foreground mb-1">
                  Or Manually Select from {{ selectedHospital()?.name }} Physicians:
                </label>
                <select
                  [ngModel]="selectedDoctor?.id"
                  (ngModelChange)="onManualDoctorChange($event)"
                  class="w-full p-2 text-xs rounded-lg border border-border bg-background text-foreground"
                >
                  <option [value]="undefined" disabled>-- Select Doctor --</option>
                  <option *ngFor="let doc of allDoctors()" [value]="doc.id">
                    {{ formatDoctorName(doc) }} ({{ doc.specialization || 'General Practice' }})
                  </option>
                </select>
              </div>
            </div>

            <!-- ================= STEP 3 ================= -->
            <div *ngIf="bookingStep() === 3" class="space-y-4">
              <!-- Summary Card -->
              <div hlmCard class="p-4 border border-border bg-card space-y-3">
                <h3
                  class="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground"
                >
                  Consultation Summary
                </h3>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span class="text-muted-foreground block text-[11px]">Attending Physician</span>
                    <span class="font-bold text-foreground">{{
                      selectedDoctor ? formatDoctorName(selectedDoctor) : 'Not Selected'
                    }}</span>
                    <span
                      class="text-[10px] text-muted-foreground block"
                      *ngIf="selectedDoctor?.specialization"
                    >
                      {{ selectedDoctor?.specialization }}
                    </span>
                  </div>

                  <div>
                    <span class="text-muted-foreground block text-[11px]">Hospital / Clinic</span>
                    <span class="font-bold text-foreground">{{ getSelectedOrgName() }}</span>
                  </div>

                  <div>
                    <span class="text-muted-foreground block text-[11px]"
                      >Scheduled Date & Time</span
                    >
                    <span class="font-bold text-primary"
                      >{{ bookingDate }} • {{ getFormattedSelectedSlot() }}</span
                    >
                  </div>

                  <div>
                    <span class="text-muted-foreground block text-[11px]">Reason for Visit</span>
                    <span class="font-medium text-foreground">{{ bookingReason }}</span>
                  </div>
                </div>
              </div>

              <!-- Notes Input -->
              <div>
                <label class="block text-xs font-bold text-foreground mb-1">
                  Additional Symptoms / Patient Notes (Optional)
                </label>
                <textarea
                  hlmInput
                  rows="3"
                  [(ngModel)]="bookingNotes"
                  placeholder="Provide any additional symptoms, relevant medications or prior history for your physician..."
                  class="w-full text-xs p-2.5 rounded-lg border border-border bg-background"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Modal Footer Actions -->
          <div class="flex items-center justify-between p-4 border-t border-border bg-muted/20">
            <div>
              <button
                *ngIf="bookingStep() > 1"
                hlmBtn
                variant="outline"
                size="sm"
                (click)="previousStep()"
                class="text-xs font-semibold gap-1"
              >
                <ng-icon name="lucideChevronLeft" size="14" />
                <span>Previous</span>
              </button>
            </div>

            <div class="flex items-center gap-2">
              <button
                hlmBtn
                variant="ghost"
                size="sm"
                (click)="closeBookingModal()"
                class="text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                *ngIf="bookingStep() < 3"
                hlmBtn
                variant="default"
                size="sm"
                (click)="nextStep()"
                class="text-xs font-bold gap-1"
              >
                <span>Continue</span>
                <ng-icon name="lucideChevronRight" size="14" />
              </button>

              <button
                *ngIf="bookingStep() === 3"
                hlmBtn
                variant="default"
                size="sm"
                (click)="submitBooking()"
                [disabled]="bookingInProgress()"
                class="text-xs font-bold gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <ng-icon *ngIf="!bookingInProgress()" name="lucideCheck" size="14" />
                <ng-icon
                  *ngIf="bookingInProgress()"
                  name="lucideClock"
                  size="14"
                  class="animate-spin"
                />
                <span>{{ bookingInProgress() ? 'Confirming...' : 'Confirm Appointment' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= CANCELLATION MODAL ================= -->
      <div
        *ngIf="showCancelModal()"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in"
      >
        <div
          class="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4"
        >
          <div class="flex items-center justify-between pb-3 border-b border-border">
            <div class="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <ng-icon name="lucideAlertCircle" size="20" />
              <h3 class="text-sm font-bold text-foreground">Cancel Appointment</h3>
            </div>
            <button
              (click)="closeCancelModal()"
              class="text-muted-foreground hover:text-foreground"
            >
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <p class="text-xs text-muted-foreground">
            Are you sure you want to cancel your scheduled appointment with
            <strong class="text-foreground">{{
              appointmentToCancel ? getDoctorDisplayName(appointmentToCancel) : 'Physician'
            }}</strong>
            on
            <strong class="text-foreground">{{
              appointmentToCancel?.appointmentDate | date: 'mediumDate'
            }}</strong
            >?
          </p>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-foreground mb-1"
                >Reason for Cancellation</label
              >
              <select
                [(ngModel)]="cancelReason"
                class="w-full p-2 text-xs rounded-lg border border-border bg-background text-foreground"
              >
                <option value="Schedule Conflict">Schedule Conflict</option>
                <option value="Symptoms Resolved">Symptoms Resolved / Improved</option>
                <option value="Provider Reschedule Requested">
                  Rescheduled with Another Provider
                </option>
                <option value="Personal Emergency">Personal Emergency</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-foreground mb-1"
                >Additional Comment (Optional)</label
              >
              <textarea
                hlmInput
                rows="2"
                [(ngModel)]="cancelComment"
                placeholder="Optional explanation for the clinical care team..."
                class="w-full text-xs p-2 rounded-lg border border-border bg-background"
              ></textarea>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              hlmBtn
              variant="ghost"
              size="sm"
              (click)="closeCancelModal()"
              class="text-xs font-semibold"
            >
              Keep Appointment
            </button>
            <button
              hlmBtn
              variant="default"
              size="sm"
              (click)="confirmCancellation()"
              [disabled]="cancellingInProgress()"
              class="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white border-0"
            >
              Confirm Cancellation
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PatientAppointmentsComponent implements OnInit {
  isLoading = false;
  errorMessage = "";

  patientProfile = signal<Patient | null>(null);
  appointments = signal<Appointment[]>([]);
  allOrganizations = signal<Organization[]>([]);
  selectedHospital = signal<Organization | null>(null);
  hospitalSearchQuery = '';

  allDoctors = signal<User[]>([]);
  recommendedDoctors = signal<DoctorRecommendationDTO[]>([]);

  // Filtering & Search
  activeFilter = signal<string>('ALL');
  searchQuery = '';

  // Booking Wizard Modal State
  showBookingModal = signal<boolean>(false);
  bookingStep = signal<number>(1);
  bookingInProgress = signal<boolean>(false);
  loadingRecommendations = signal<boolean>(false);

  // Booking Form Inputs
  bookingReason = '';
  bookingDate = new Date().toISOString().split('T')[0];
  bookingTime = '09:30';
  bookingNotes = '';
  selectedDoctor: User | null = null;
  selectedSlot = '';
  selectedOrgId = signal<string>('');
  selectedOrgName = signal<string>('');

  // Cancellation Modal State
  showCancelModal = signal<boolean>(false);
  cancellingInProgress = signal<boolean>(false);
  appointmentToCancel: Appointment | null = null;
  cancelReason = 'Schedule Conflict';
  cancelComment = '';

  minDate = new Date().toISOString().split('T')[0];

  commonReasons: string[] = [
    'General Health Checkup',
    'Cardiology Evaluation',
    'Fever & Cough / Flu Symptoms',
    'Severe Migraine / Headache',
    'Skin Rash & Allergy',
    'Back & Joint Pain',
    'Blood Pressure Consultation',
  ];

  filteredOrganizations = computed<Organization[]>(() => {
    const list = this.allOrganizations();
    const q = this.hospitalSearchQuery.toLowerCase().trim();
    if (!q) return list;
    return list.filter(
      (org) =>
        (org.name && org.name.toLowerCase().includes(q)) ||
        (org.code && org.code.toLowerCase().includes(q)) ||
        (org.organizationType && org.organizationType.toLowerCase().includes(q)),
    );
  });

  docHasOrgs(doctor?: User | null): boolean {
    return !!(doctor && doctor.organizations && doctor.organizations.length > 0);
  }

  getDoctorOrgs(doctor?: User | null): OrganizationContextDTO[] {
    if (!doctor || !doctor.organizations) return [];
    return doctor.organizations;
  }

  getDoctorOrgsSummary(doctor?: User | null): string {
    if (!doctor || !doctor.organizations || doctor.organizations.length === 0) {
      return 'Sentinel Network';
    }
    return doctor.organizations.map((o: OrganizationContextDTO) => o.name || o.code).join(', ');
  }

  getSelectedOrgName(): string {
    const hosp = this.selectedHospital();
    if (hosp) {
      return hosp.name || hosp.code || 'Sentinel Hospital';
    }
    if (this.selectedOrgName()) return this.selectedOrgName();
    if (
      this.selectedDoctor &&
      this.selectedDoctor.organizations &&
      this.selectedDoctor.organizations.length > 0
    ) {
      const found = this.selectedDoctor.organizations.find(
        (o: OrganizationContextDTO) => o.id === this.selectedOrgId(),
      );
      if (found) return found.name || found.code || '';
      return (
        this.selectedDoctor.organizations[0].name || this.selectedDoctor.organizations[0].code || ''
      );
    }
    return 'Sentinel Central Hospital';
  }

  selectOrganizationForDoctor(doctor: User, org: OrganizationContextDTO, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedDoctor = doctor;
    if (org && org.id) {
      this.selectedOrgId.set(org.id);
      this.selectedOrgName.set(org.name || org.code || '');
    }
  }

  formatDoctorName(nameOrUser?: string | User | null): string {
    if (!nameOrUser) return '';
    const rawName = typeof nameOrUser === 'string' ? nameOrUser : nameOrUser.fullName;
    if (!rawName) return '';
    const cleaned = rawName.trim().replace(/^(Dr\.?\s*)+/i, '');
    return `Dr. ${cleaned}`;
  }

  getDoctorDisplayName(apt: Appointment): string {
    const rawName = apt.doctorName || apt.doctor?.fullName;
    if (!rawName) return 'Assigned Physician';
    return this.formatDoctorName(rawName);
  }

  getDoctorSpecialization(apt: Appointment): string {
    return apt.doctorSpecialization || apt.doctor?.specialization || 'Clinical Medicine';
  }

  // Computed Properties for Filtering
  filteredAppointments = computed<Appointment[]>(() => {
    let list = this.appointments();
    if (!Array.isArray(list)) return [];

    const filter = this.activeFilter();
    if (filter !== 'ALL') {
      list = list.filter((a) => a.status === filter);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.reason?.toLowerCase().includes(q) ||
          a.doctorName?.toLowerCase().includes(q) ||
          a.doctor?.fullName?.toLowerCase().includes(q) ||
          a.doctorSpecialization?.toLowerCase().includes(q) ||
          a.doctor?.specialization?.toLowerCase().includes(q),
      );
    }

    return list;
  });

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.loadOrganizations();
    this.loadPatientAndAppointments();
    this.loadDoctors();
  }

  loadOrganizations(): void {
    // Immediate fallback from authenticated user's organization context if available
    const userOrgs = this.authService.currentUser()?.organizations;
    if (userOrgs && userOrgs.length > 0 && this.allOrganizations().length === 0) {
      const initial: Organization[] = userOrgs.map((uo: OrganizationContextDTO) => ({
        id: uo.id,
        name: uo.name,
        code: uo.code,
        organizationType: 'HOSPITAL',
        status: 'ACTIVE',
      }));
      this.allOrganizations.set(initial);
      if (!this.selectedHospital()) {
        this.selectHospital(initial[0]);
      }
    }

    this.apiService.getOrganizations().subscribe({
      next: (orgs: Organization[]) => {
        if (Array.isArray(orgs) && orgs.length > 0) {
          this.allOrganizations.set(orgs);
          if (!this.selectedHospital()) {
            this.selectHospital(orgs[0]);
          } else {
            const currentSelected = this.selectedHospital();
            const matching = orgs.find((o: Organization) => o.id === currentSelected?.id);
            if (matching) {
              this.selectHospital(matching);
            } else {
              this.selectHospital(orgs[0]);
            }
          }
        }
      },
      error: (err) => { this.errorMessage = err.message || 'Failed'; this.isLoading = false; },
    });
  }

  onHospitalSelectChange(orgId: string | undefined): void {
    if (!orgId) return;
    const found = this.allOrganizations().find((o: Organization) => o.id === orgId);
    if (found) {
      this.selectHospital(found);
    }
  }

  selectHospital(org: Organization): void {
    this.selectedHospital.set(org);
    this.selectedOrgId.set(org.id);
    this.selectedOrgName.set(org.name || org.code || '');
    this.selectedDoctor = null;
    this.selectedSlot = '';
    this.loadDoctors();
  }

  loadPatientAndAppointments(): void {
    this.apiService.getMyPatientProfile().subscribe({
      next: (profile: Patient | null) => {
        if (profile) {
          this.patientProfile.set(profile);
          this.fetchAppointments(profile.id);
        }
      },
      error: (err) => { this.errorMessage = err.message || 'Failed'; this.isLoading = false; },
    });
  }

  fetchAppointments(patientId: string): void {
    this.apiService.getAppointmentsByPatient(patientId).subscribe({
      next: (apts: Appointment[]) => this.appointments.set(Array.isArray(apts) ? apts : []),
      error: (err) => { this.errorMessage = err.message || 'Failed'; this.isLoading = false; },
    });
  }

  loadDoctors(): void {
    const orgId = this.selectedHospital()?.id;
    this.apiService.getDoctors(orgId).subscribe({
      next: (docs: User[]) => this.allDoctors.set(Array.isArray(docs) ? docs : []),
      error: (err) => { this.errorMessage = err.message || 'Failed'; this.isLoading = false; },
    });
  }

  // =========================================================
  // BOOKING WIZARD HANDLERS
  // =========================================================
  openBookingModal(): void {
    this.bookingStep.set(1);
    this.bookingReason = '';
    this.bookingDate = new Date().toISOString().split('T')[0];
    this.bookingTime = '09:30';
    this.bookingNotes = '';
    this.selectedDoctor = null;
    this.selectedSlot = '';
    this.hospitalSearchQuery = '';

    this.loadOrganizations();

    if (this.allOrganizations().length > 0 && !this.selectedHospital()) {
      this.selectHospital(this.allOrganizations()[0]);
    }

    this.showBookingModal.set(true);
  }

  closeBookingModal(): void {
    this.showBookingModal.set(false);
  }

  selectReasonPreset(preset: string): void {
    this.bookingReason = preset;
  }

  getStepTitle(): string {
    switch (this.bookingStep()) {
      case 1:
        return 'Select Hospital & Reason';
      case 2:
        return 'Smart Doctor Match & Slot';
      case 3:
        return 'Review & Confirm';
      default:
        return '';
    }
  }

  nextStep(): void {
    if (this.bookingStep() === 1) {
      if (!this.selectedHospital()) {
        toast.error('Hospital Required', {
          description: 'Please select a hospital or clinic to proceed with appointment booking.',
        });
        return;
      }
      if (!this.bookingReason.trim()) {
        toast.error('Reason Required', {
          description: 'Please enter or select a chief complaint for your consultation.',
        });
        return;
      }
      if (!this.bookingDate) {
        toast.error('Date Required', {
          description: 'Please select a preferred date for your consultation.',
        });
        return;
      }

      this.bookingStep.set(2);
      this.fetchRecommendations();
    } else if (this.bookingStep() === 2) {
      if (!this.selectedDoctor) {
        toast.error('Doctor Selection Required', {
          description: 'Please select a doctor to proceed with scheduling.',
        });
        return;
      }
      this.bookingStep.set(3);
    }
  }

  previousStep(): void {
    if (this.bookingStep() > 1) {
      this.bookingStep.set(this.bookingStep() - 1);
    }
  }

  fetchRecommendations(): void {
    const patientId = this.patientProfile()?.id;
    const hospitalId = this.selectedHospital()?.id;
    this.loadingRecommendations.set(true);
    this.apiService
      .getRecommendedDoctors(patientId, this.bookingReason, this.bookingDate, hospitalId)
      .subscribe({
        next: (recs: DoctorRecommendationDTO[]) => {
          this.recommendedDoctors.set(recs);
          this.loadingRecommendations.set(false);

          // Auto select top recommendation if available
          if (recs.length > 0) {
            const top = recs[0];
            this.selectDoctor(top.doctor, top.recommendedSlots?.[0]);
          } else {
            this.selectedDoctor = null;
            this.selectedSlot = '';
          }
        },
        error: (err) => { this.errorMessage = err.message || 'Failed'; this.isLoading = false; },
      });
  }

  selectDoctor(doctor: User, slot?: string): void {
    this.selectedDoctor = doctor;
    if (slot) {
      this.selectedSlot = slot;
    }
    const hosp = this.selectedHospital();
    if (hosp) {
      this.selectedOrgId.set(hosp.id);
      this.selectedOrgName.set(hosp.name || hosp.code || '');
    } else if (doctor.organizations && doctor.organizations.length > 0) {
      this.selectedOrgId.set(doctor.organizations[0].id);
      this.selectedOrgName.set(doctor.organizations[0].name || doctor.organizations[0].code || '');
    }
  }

  selectDoctorAndSlot(doctor: User, slot: string, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedDoctor = doctor;
    this.selectedSlot = slot;
    const hosp = this.selectedHospital();
    if (hosp) {
      this.selectedOrgId.set(hosp.id);
      this.selectedOrgName.set(hosp.name || hosp.code || '');
    } else if (doctor.organizations && doctor.organizations.length > 0) {
      this.selectedOrgId.set(doctor.organizations[0].id);
      this.selectedOrgName.set(doctor.organizations[0].name || doctor.organizations[0].code || '');
    }
  }

  onManualDoctorChange(docId: string | undefined): void {
    if (!docId) return;
    const found = this.allDoctors().find((d: User) => d.id === docId);
    if (found) {
      this.selectedDoctor = found;
      this.selectedSlot = '';
      const hosp = this.selectedHospital();
      if (hosp) {
        this.selectedOrgId.set(hosp.id);
        this.selectedOrgName.set(hosp.name || hosp.code || '');
      } else if (found.organizations && found.organizations.length > 0) {
        this.selectedOrgId.set(found.organizations[0].id);
        this.selectedOrgName.set(found.organizations[0].name || found.organizations[0].code || '');
      }
    }
  }

  submitBooking(): void {
    const patient = this.patientProfile();
    if (!patient || !patient.id) {
      toast.error('Patient Context Missing', {
        description: 'Unable to resolve your patient profile.',
      });
      return;
    }

    if (!this.selectedDoctor || !this.selectedDoctor.id) {
      toast.error('Doctor Required', {
        description: 'Please select a doctor for your consultation.',
      });
      return;
    }

    const timeStr = this.selectedSlot
      ? this.extractTimeFromSlot(this.selectedSlot)
      : this.bookingTime;
    const dateTimeStr = `${this.bookingDate}T${timeStr}:00`;
    let dateTimeIso = dateTimeStr;
    try {
      const parsed = new Date(dateTimeStr);
      if (!isNaN(parsed.getTime())) {
        dateTimeIso = parsed.toISOString();
      }
    } catch {
      dateTimeIso = dateTimeStr;
    }

    const chosenOrgId =
      this.selectedHospital()?.id ||
      this.selectedOrgId() ||
      (this.selectedDoctor.organizations && this.selectedDoctor.organizations.length > 0
        ? this.selectedDoctor.organizations[0].id
        : undefined);

    const appointmentPayload: AppointmentRequestDTO = {
      patientId: patient.id,
      doctorId: this.selectedDoctor.id,
      practitionerId: this.selectedDoctor.id,
      organizationId: chosenOrgId,
      appointmentDate: dateTimeIso,
      startsAt: dateTimeIso,
      reason: this.bookingReason,
      notes: this.bookingNotes || undefined,
      status: 'SCHEDULED',
      stage: 'SCHEDULED',
    };

    this.bookingInProgress.set(true);

    this.apiService.scheduleAppointment(appointmentPayload).subscribe({
      next: () => {
        this.bookingInProgress.set(false);
        this.closeBookingModal();

        const docDisplayName = this.formatDoctorName(this.selectedDoctor?.fullName);
        const hospitalName = this.getSelectedOrgName();

        toast.success('Consultation Scheduled Successfully!', {
          description: `Appointment with ${docDisplayName} at ${hospitalName} confirmed for ${this.bookingDate}.`,
        });

        // Refresh list
        this.fetchAppointments(patient.id);
      },
      error: (err) => { this.errorMessage = err.message || 'Failed'; this.isLoading = false; },
    });
  }

  cleanSlot(slot?: string): string {
    if (!slot) return '';
    return slot.replace(/\s*\(.*?\)/g, '').trim();
  }

  formatTime12h(time24?: string): string {
    if (!time24) return '';
    if (time24.includes('AM') || time24.includes('PM')) return this.cleanSlot(time24);
    const parts = time24.split(':');
    if (parts.length < 2) return time24;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = hours < 10 ? '0' + hours : '' + hours;
    return `${strHours}:${minutes} ${ampm}`;
  }

  getFormattedSlots(rawSlots?: string[]): string[] {
    if (!rawSlots || rawSlots.length === 0) {
      return [];
    }

    const set = new Set<string>();
    for (const s of rawSlots) {
      const cleaned = this.cleanSlot(s);
      if (cleaned) set.add(cleaned);
    }

    return Array.from(set).sort((a: string, b: string) => {
      const tA = this.extractTimeFromSlot(a);
      const tB = this.extractTimeFromSlot(b);
      return tA.localeCompare(tB);
    });
  }

  getFormattedSelectedSlot(): string {
    if (this.selectedSlot) {
      return this.cleanSlot(this.selectedSlot);
    }
    if (this.bookingTime) {
      return this.formatTime12h(this.bookingTime);
    }
    return '09:30 AM';
  }

  public extractTimeFromSlot(slot: string): string {
    if (!slot) return this.bookingTime || '09:30';
    const match = slot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const ampm = match[3];
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
      const hh = hours < 10 ? '0' + hours : '' + hours;
      return `${hh}:${minutes}`;
    }
    return this.bookingTime || '09:30';
  }

  // =========================================================
  // CANCELLATION HANDLERS
  // =========================================================
  openCancelModal(apt: Appointment): void {
    this.appointmentToCancel = apt;
    this.cancelReason = 'Schedule Conflict';
    this.cancelComment = '';
    this.showCancelModal.set(true);
  }

  closeCancelModal(): void {
    this.showCancelModal.set(false);
    this.appointmentToCancel = null;
  }

  confirmCancellation(): void {
    if (!this.appointmentToCancel || !this.appointmentToCancel.id) return;

    const id = this.appointmentToCancel.id;
    this.cancellingInProgress.set(true);

    this.apiService.cancelAppointment(id, this.cancelReason, this.cancelComment).subscribe({
      next: () => {
        this.cancellingInProgress.set(false);
        this.closeCancelModal();

        toast.success('Appointment Cancelled', {
          description: 'The consultation has been marked as cancelled.',
        });

        const p = this.patientProfile();
        if (p) this.fetchAppointments(p.id);
      },
      error: (err) => { this.errorMessage = err.message || 'Failed'; this.isLoading = false; }
    });
  }

  getStageLabel(stage?: string): string {
    switch (stage) {
      case 'SCHEDULED':
      case 'CONFIRMED':
        return 'Scheduled';
      case 'ARRIVED':
        return 'Lobby Arrived';
      case 'CHECKED_IN':
        return 'Checked In (Awaiting Triage)';
      case 'TRIAGED':
        return 'Triaged (Ready for Doctor)';
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
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/40 font-bold';
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
}
 
