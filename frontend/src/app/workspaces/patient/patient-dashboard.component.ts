import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient } from '../../core/models/patient.model';
import {
  Vitals,
  Prescription,
  Allergy,
  Diagnosis,
  Encounter,
} from '../../core/models/clinical.model';
import { Appointment } from '../../core/models/appointment.model';
import { LabResult } from '../../core/models/lab.model';
import { ImagingOrder, ImagingReport } from '../../core/models/imaging.model';
import { ClinicalDocument } from '../../core/models/document.model';
import { Invoice } from '../../core/models/billing.model';
import { PatientConsent } from '../../core/models/consent.model';
import { PatientInsurancePolicy } from '../../core/models/patient.model';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideUserRound,
  lucideCalendarClock,
  lucideTriangleAlert,
  lucidePill,
  lucideActivity,
  lucideChevronRight,
  lucideHeartPulse,
  lucideSparkles,
  lucideShieldCheck,
  lucideStethoscope,
  lucideFileText,
  lucideThermometer,
  lucideDroplet,
  lucideClock,
  lucideCheckCircle2,
  lucideArrowRight,
  lucideDownload,
  lucidePhone,
  lucideShieldAlert,
  lucidePlus,
  lucideExternalLink,
  lucideCalendar,
  lucideAlertCircle,
  lucideMicroscope,
  lucideEye,
  lucideArrowUpRight,
  lucideRefreshCw,
  lucideMapPin,
  lucideUserCheck,
  lucideReceipt,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HlmCardImports, HlmBadgeImports, HlmButtonImports, NgIcon],
  providers: [
    provideIcons({
      lucideUserRound,
      lucideCalendarClock,
      lucideTriangleAlert,
      lucidePill,
      lucideActivity,
      lucideChevronRight,
      lucideHeartPulse,
      lucideSparkles,
      lucideShieldCheck,
      lucideStethoscope,
      lucideFileText,
      lucideThermometer,
      lucideDroplet,
      lucideClock,
      lucideCheckCircle2,
      lucideArrowRight,
      lucideDownload,
      lucidePhone,
      lucideShieldAlert,
      lucidePlus,
      lucideExternalLink,
      lucideCalendar,
      lucideAlertCircle,
      lucideMicroscope,
      lucideEye,
      lucideArrowUpRight,
      lucideRefreshCw,
      lucideMapPin,
      lucideUserCheck,
      lucideReceipt,
    }),
  ],
  template: `
    <div class="w-full space-y-6">
      <div *ngIf="isLoading" class="p-4 text-center text-muted-foreground">Loading...</div>
      <div *ngIf="errorMessage" class="p-4 bg-red-100 text-red-700 rounded mb-4">{{ errorMessage }}</div>

      <!-- 1. Open Header: Patient Welcome & Quick Actions (Full Width, No Card Wrapper) -->
      <div
        class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5 border-b border-border"
      >
        <div class="space-y-1.5">
          <div class="flex items-center flex-wrap gap-2.5">
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {{ getGreeting() }}, {{ patient()?.fullName || currentUser?.fullName || 'Patient' }}
            </h1>
            <span
              hlmBadge
              variant="secondary"
              class="bg-primary/10 text-primary border-primary/20 text-[11px] font-semibold py-0.5 px-2.5"
            >
              Verified EHR Portal
            </span>
          </div>

          <div class="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span class="inline-flex items-center gap-1 font-mono font-bold text-foreground">
              <span class="text-muted-foreground font-sans font-normal">MRN:</span>
              {{ patient()?.patientCode || 'MRN-VERIFIED' }}
            </span>
            <span class="text-border">•</span>
            <span
              >DOB: <strong class="text-foreground">{{ patient()?.dateOfBirth || 'N/A' }}</strong>
              <span *ngIf="getAge(patient()?.dateOfBirth)" class="text-muted-foreground"
                >({{ getAge(patient()?.dateOfBirth) }})</span
              ></span
            >
            <span class="text-border">•</span>
            <span>
              Blood Group:
              <strong class="text-foreground">{{ patient()?.bloodType || 'N/A' }}</strong></span
            >
            <span class="text-border">•</span>
            <span
              >Primary Coverage:
              <strong class="text-foreground">{{
                patient()?.insuranceProvider || 'ABDM / Self-Pay'
              }}</strong></span
            >
          </div>
        </div>

        <!-- Quick Primary Actions -->
        <div class="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <a
            routerLink="/patient/appointments"
            hlmBtn
            variant="default"
            size="sm"
            class="gap-2 shadow-xs flex-1 sm:flex-initial"
          >
            <ng-icon name="lucideCalendarClock" size="15" />
            <span>Book Appointment</span>
          </a>
          <a
            routerLink="/patient/chart"
            hlmBtn
            variant="outline"
            size="sm"
            class="gap-1.5 text-xs flex-1 sm:flex-initial"
          >
            <ng-icon name="lucideFileText" size="14" class="text-primary" />
            <span>My Health Chart</span>
          </a>
          <a
            routerLink="/patient/billing"
            hlmBtn
            variant="outline"
            size="sm"
            class="gap-1.5 text-xs flex-1 sm:flex-initial"
          >
            <ng-icon name="lucideReceipt" size="14" class="text-primary" />
            <span>Invoices & Pay</span>
          </a>
          <button
            (click)="downloadFhirRecord()"
            hlmBtn
            variant="ghost"
            size="sm"
            class="gap-1.5 text-xs hidden sm:inline-flex"
            title="Download FHIR standard summary"
          >
            <ng-icon name="lucideDownload" size="14" />
            <span>Export Record</span>
          </button>
        </div>
      </div>

      <!-- 2. Critical Health / Onboarding Alert Ribbons -->
      <!-- Profile Completion Banner -->
      <div
        *ngIf="isProfileIncomplete()"
        class="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
      >
        <div class="flex items-center gap-3">
          <div
            class="size-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0"
          >
            <ng-icon name="lucideTriangleAlert" size="16" />
          </div>
          <div>
            <h4 class="text-xs font-bold text-foreground">
              Action Needed: Profile & Emergency Contact Setup
            </h4>
            <p class="text-[11px] text-muted-foreground">
              Keep your emergency contacts and insurance details updated for faster clinical care.
            </p>
          </div>
        </div>
        <a
          routerLink="/patient/profile"
          hlmBtn
          variant="default"
          size="xs"
          class="bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs gap-1 self-end sm:self-center shrink-0"
        >
          <span>Complete Profile</span>
          <ng-icon name="lucideChevronRight" size="12" />
        </a>
      </div>

      <!-- Severe Allergy Warning Banner -->
      <div
        *ngIf="hasCriticalSafetyAlert()"
        class="p-4 rounded-2xl border border-destructive/30 bg-destructive/10 flex items-center justify-between gap-3 shadow-xs"
      >
        <div class="flex items-center gap-3">
          <div
            class="size-8 rounded-lg bg-destructive/20 text-destructive flex items-center justify-center shrink-0"
          >
            <ng-icon name="lucideShieldAlert" size="16" />
          </div>
          <div>
            <h4 class="text-xs font-bold text-destructive">Severe Allergy Safety Notice</h4>
            <p class="text-[11px] text-foreground">{{ getCriticalAllergiesText() }}</p>
          </div>
        </div>
        <a
          routerLink="/patient/chart"
          [queryParams]="{ tab: 'allergies' }"
          class="text-xs text-destructive hover:underline font-semibold shrink-0"
        >
          View Safety Record
        </a>
      </div>

      <!-- 3. Key Health Vital Snapshot Cards (4 Airy Metric Tiles) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Tile 1: Next Scheduled Consultation -->
        <div
          class="p-4 rounded-2xl border border-border bg-card shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all space-y-3"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >Upcoming Visit</span
            >
            <div
              class="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center"
            >
              <ng-icon name="lucideCalendarClock" size="14" />
            </div>
          </div>

          <div *ngIf="nextAppointment()" class="space-y-1">
            <div class="text-sm font-bold text-foreground truncate">
              {{
                nextAppointment()?.doctor?.fullName ||
                  nextAppointment()?.doctorName ||
                  'Attending Physician'
              }}
            </div>
            <div class="text-xs text-primary font-semibold flex items-center gap-1.5">
              <ng-icon name="lucideClock" size="13" />
              <span
                >{{ nextAppointment()?.appointmentDate | date: 'mediumDate' }} •
                {{ nextAppointment()?.appointmentDate | date: 'shortTime' }}</span
              >
            </div>
          </div>

          <div *ngIf="!nextAppointment()" class="space-y-1">
            <div class="text-sm font-semibold text-muted-foreground">No upcoming visits</div>
            <a
              routerLink="/patient/appointments"
              class="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>Schedule now</span>
              <ng-icon name="lucideArrowRight" size="12" />
            </a>
          </div>

          <div class="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
            <span class="text-muted-foreground">{{
              nextAppointment()?.status || 'Active Schedule'
            }}</span>
            <a
              routerLink="/patient/appointments"
              class="text-primary hover:underline font-medium flex items-center gap-0.5"
            >
              <span>Appointments</span>
              <ng-icon name="lucideChevronRight" size="12" />
            </a>
          </div>
        </div>

        <!-- Tile 2: Active Prescriptions -->
        <div
          class="p-4 rounded-2xl border border-border bg-card shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all space-y-3"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >Active Medications</span
            >
            <div
              class="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"
            >
              <ng-icon name="lucidePill" size="14" />
            </div>
          </div>

          <div class="flex items-baseline justify-between">
            <span class="text-2xl font-extrabold text-foreground">{{
              activePrescriptions().length
            }}</span>
            <span
              hlmBadge
              variant="secondary"
              class="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold"
            >
              Current eRx
            </span>
          </div>

          <div class="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
            <span class="text-muted-foreground">Regimen active</span>
            <a
              routerLink="/patient/chart"
              [queryParams]="{ tab: 'prescriptions' }"
              class="text-primary hover:underline font-medium flex items-center gap-0.5"
            >
              <span>Prescriptions</span>
              <ng-icon name="lucideChevronRight" size="12" />
            </a>
          </div>
        </div>

        <!-- Tile 3: Latest Blood Pressure -->
        <div
          class="p-4 rounded-2xl border border-border bg-card shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all space-y-3"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >Blood Pressure</span
            >
            <div
              class="size-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center"
            >
              <ng-icon name="lucideHeartPulse" size="14" />
            </div>
          </div>

          <div class="flex items-baseline justify-between">
            <span class="text-xl font-extrabold font-mono text-foreground">
              {{
                latestVitals()?.systolicBp && latestVitals()?.diastolicBp
                  ? latestVitals()!.systolicBp + '/' + latestVitals()!.diastolicBp
                  : '120/80'
              }}
            </span>
            <span
              hlmBadge
              [variant]="getBpCategoryBadgeVariant(latestVitals())"
              class="text-[10px] font-semibold"
            >
              {{ getBpCategoryText(latestVitals()) }}
            </span>
          </div>

          <div class="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
            <span class="text-muted-foreground">{{
              latestVitals()?.recordedAt
                ? (latestVitals()?.recordedAt | date: 'shortDate')
                : 'Baseline'
            }}</span>
            <a
              routerLink="/patient/vitals"
              class="text-primary hover:underline font-medium flex items-center gap-0.5"
            >
              <span>Flowsheet</span>
              <ng-icon name="lucideChevronRight" size="12" />
            </a>
          </div>
        </div>

        <!-- Tile 4: Diagnostic Tests & Labs -->
        <div
          class="p-4 rounded-2xl border border-border bg-card shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all space-y-3"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >Lab & Radiology</span
            >
            <div
              class="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center"
            >
              <ng-icon name="lucideMicroscope" size="14" />
            </div>
          </div>

          <div class="flex items-baseline justify-between">
            <span class="text-2xl font-extrabold text-foreground">{{
              labResults().length + imagingReports().length
            }}</span>
            <span hlmBadge variant="outline" class="text-[10px] font-semibold">
              Reports On File
            </span>
          </div>

          <div class="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
            <span class="text-muted-foreground">Clinical tests</span>
            <a
              routerLink="/patient/chart"
              [queryParams]="{ tab: 'labs' }"
              class="text-primary hover:underline font-medium flex items-center gap-0.5"
            >
              <span>View Reports</span>
              <ng-icon name="lucideChevronRight" size="12" />
            </a>
          </div>
        </div>
      </div>

      <!-- 4. Two-Column Dashboard Content -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- LEFT COLUMN (8 Cols): Care Feed & Active Medications -->
        <div class="lg:col-span-8 space-y-6">
          <!-- Card A: Active Daily Medication Schedule -->
          <div class="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xs">
            <div class="flex items-center justify-between pb-3 border-b border-border">
              <div class="flex items-center gap-2.5">
                <div
                  class="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"
                >
                  <ng-icon name="lucidePill" size="16" />
                </div>
                <div>
                  <h3 class="text-sm font-bold text-foreground">Current Medications</h3>
                  <p class="text-[11px] text-muted-foreground">
                    Prescribed treatments and daily dose regimens
                  </p>
                </div>
              </div>
              <a
                routerLink="/patient/chart"
                [queryParams]="{ tab: 'prescriptions' }"
                class="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
              >
                <span>View Full eRx</span>
                <ng-icon name="lucideChevronRight" size="12" />
              </a>
            </div>

            <div
              *ngIf="activePrescriptions().length > 0; else noMeds"
              class="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <div
                *ngFor="let rx of activePrescriptions().slice(0, 4)"
                class="p-3.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors space-y-2"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <span class="font-bold text-foreground text-xs block truncate">{{
                      rx.medicationName
                    }}</span>
                    <span class="text-[11px] font-mono text-muted-foreground"
                      >{{ rx.dosage }} • {{ rx.route || 'Oral' }}</span
                    >
                  </div>
                  <span
                    hlmBadge
                    variant="secondary"
                    class="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shrink-0"
                  >
                    {{ rx.frequency }}
                  </span>
                </div>

                <p
                  *ngIf="rx.instructions"
                  class="text-[11px] text-muted-foreground line-clamp-1 italic"
                >
                  "{{ rx.instructions }}"
                </p>
              </div>
            </div>

            <ng-template #noMeds>
              <div class="py-8 text-center text-xs text-muted-foreground space-y-1">
                <ng-icon name="lucidePill" class="text-muted-foreground/50 mx-auto" size="24" />
                <p>No active prescriptions on file.</p>
              </div>
            </ng-template>
          </div>

          <!-- Card B: Recent Clinical History & Timeline Stream -->
          <div class="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xs">
            <div class="flex items-center justify-between pb-3 border-b border-border">
              <div class="flex items-center gap-2.5">
                <div
                  class="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center"
                >
                  <ng-icon name="lucideStethoscope" size="16" />
                </div>
                <div>
                  <h3 class="text-sm font-bold text-foreground">Recent Clinical Care Activity</h3>
                  <p class="text-[11px] text-muted-foreground">
                    Consultations, lab releases, and clinical summaries
                  </p>
                </div>
              </div>
              <a
                routerLink="/patient/chart"
                class="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
              >
                <span>All Chart History</span>
                <ng-icon name="lucideChevronRight" size="12" />
              </a>
            </div>

            <div
              *ngIf="recentEncounters().length > 0 || labResults().length > 0; else noActivity"
              class="space-y-3"
            >
              <!-- Encounter Items -->
              <div
                *ngFor="let enc of recentEncounters().slice(0, 3)"
                class="p-3.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"
                  >
                    <ng-icon name="lucideStethoscope" size="14" />
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-foreground truncate">
                      {{ enc.chiefComplaint || enc.encounterType || 'Doctor Consultation' }}
                    </div>
                    <div class="text-[11px] text-muted-foreground">
                      {{ enc.startedAt || enc.createdAt | date: 'mediumDate' }} • Dr.
                      {{
                        enc.attendingProvider?.fullName ||
                          enc.createdByEmail ||
                          'Attending Physician'
                      }}
                    </div>
                  </div>
                </div>

                <a
                  routerLink="/patient/chart"
                  [queryParams]="{ tab: 'encounters' }"
                  hlmBtn
                  variant="ghost"
                  size="xs"
                  class="shrink-0 text-primary hover:underline gap-0.5 text-xs"
                >
                  <span>Details</span>
                  <ng-icon name="lucideChevronRight" size="12" />
                </a>
              </div>

              <!-- Lab Release Items -->
              <div
                *ngFor="let lab of labResults().slice(0, 2)"
                class="p-3.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"
                  >
                    <ng-icon name="lucideMicroscope" size="14" />
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-foreground truncate">{{ lab.testName }}</div>
                    <div class="text-[11px] text-muted-foreground">
                      Released: {{ lab.orderedAt | date: 'mediumDate' }} • LOINC:
                      {{ lab.loincCode || '4548-4' }}
                    </div>
                  </div>
                </div>

                <a
                  routerLink="/patient/chart"
                  [queryParams]="{ tab: 'labs' }"
                  hlmBtn
                  variant="ghost"
                  size="xs"
                  class="shrink-0 text-primary hover:underline gap-0.5 text-xs"
                >
                  <span>Report</span>
                  <ng-icon name="lucideChevronRight" size="12" />
                </a>
              </div>
            </div>

            <ng-template #noActivity>
              <div class="py-8 text-center text-xs text-muted-foreground space-y-1">
                <ng-icon name="lucideFileText" class="text-muted-foreground/50 mx-auto" size="24" />
                <p>No recent clinical activity recorded yet.</p>
              </div>
            </ng-template>
          </div>
        </div>

        <!-- RIGHT COLUMN (4 Cols): Vitals Snapshot & Quick Hub -->
        <div class="lg:col-span-4 space-y-6">
          <!-- Card 1: Vitals & Physiology Snapshot -->
          <div class="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-2xs">
            <div class="flex items-center justify-between pb-3 border-b border-border">
              <div class="flex items-center gap-2">
                <ng-icon name="lucideActivity" size="16" class="text-rose-500" />
                <h3 class="text-sm font-bold text-foreground">Physiology & Vitals</h3>
              </div>
              <a
                routerLink="/patient/vitals"
                class="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5"
              >
                <span>Log Vitals</span>
                <ng-icon name="lucideChevronRight" size="12" />
              </a>
            </div>

            <div class="grid grid-cols-2 gap-2.5 text-xs">
              <div class="p-3 rounded-xl bg-muted/20 border border-border/80 space-y-0.5">
                <span class="text-[10px] uppercase font-bold text-muted-foreground block"
                  >Heart Rate</span
                >
                <div class="text-base font-extrabold font-mono text-foreground">
                  {{ latestVitals()?.heartRate || '--' }}
                  <span *ngIf="latestVitals()?.heartRate" class="text-[10px] font-normal text-muted-foreground">bpm</span>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-muted/20 border border-border/80 space-y-0.5">
                <span class="text-[10px] uppercase font-bold text-muted-foreground block"
                  >Oxygen (SpO2)</span
                >
                <div class="text-base font-extrabold font-mono text-foreground">
                  {{ latestVitals()?.oxygenSaturation ? (latestVitals()?.oxygenSaturation + '%') : '--' }}
                </div>
              </div>

              <div class="p-3 rounded-xl bg-muted/20 border border-border/80 space-y-0.5">
                <span class="text-[10px] uppercase font-bold text-muted-foreground block"
                  >Temperature</span
                >
                <div class="text-base font-extrabold font-mono text-foreground">
                  {{ latestVitals()?.temperature || '--' }}
                  <span *ngIf="latestVitals()?.temperature" class="text-[10px] font-normal text-muted-foreground">°F</span>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-muted/20 border border-border/80 space-y-0.5">
                <span class="text-[10px] uppercase font-bold text-muted-foreground block">BMI</span>
                <div class="text-base font-extrabold font-mono text-foreground">
                  {{ latestVitals()?.bmi || '--' }}
                </div>
              </div>
            </div>

            <div class="pt-1 text-[11px] text-muted-foreground text-center">
              <span>Track historical trends in </span>
              <a routerLink="/patient/vitals" class="text-primary font-semibold hover:underline"
                >Interactive Flowsheet</a
              >
            </div>
          </div>

          <!-- Card 2: Quick Clinical Access Hub -->
          <div class="rounded-2xl border border-border bg-card p-5 space-y-3.5 shadow-2xs">
            <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Clinical Shortcuts
            </h3>

            <div class="space-y-2">
              <a
                routerLink="/patient/chart"
                class="p-3 rounded-xl border border-border/80 bg-muted/20 hover:bg-primary/5 hover:border-primary/30 transition-all flex items-center justify-between group"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"
                  >
                    <ng-icon name="lucideFileText" size="14" />
                  </div>
                  <div>
                    <span
                      class="text-xs font-bold text-foreground block group-hover:text-primary transition-colors"
                      >12-Tab Clinical Chart</span
                    >
                    <span class="text-[10px] text-muted-foreground block"
                      >Labs, PACS imaging & records</span
                    >
                  </div>
                </div>
                <ng-icon
                  name="lucideChevronRight"
                  size="14"
                  class="text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5"
                />
              </a>

              <a
                routerLink="/patient/appointments"
                class="p-3 rounded-xl border border-border/80 bg-muted/20 hover:bg-primary/5 hover:border-primary/30 transition-all flex items-center justify-between group"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"
                  >
                    <ng-icon name="lucideCalendar" size="14" />
                  </div>
                  <div>
                    <span
                      class="text-xs font-bold text-foreground block group-hover:text-primary transition-colors"
                      >Book Consultations</span
                    >
                    <span class="text-[10px] text-muted-foreground block"
                      >Physician schedule & intake</span
                    >
                  </div>
                </div>
                <ng-icon
                  name="lucideChevronRight"
                  size="14"
                  class="text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5"
                />
              </a>

              <a
                routerLink="/patient/profile"
                class="p-3 rounded-xl border border-border/80 bg-muted/20 hover:bg-primary/5 hover:border-primary/30 transition-all flex items-center justify-between group"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"
                  >
                    <ng-icon name="lucideUserCheck" size="14" />
                  </div>
                  <div>
                    <span
                      class="text-xs font-bold text-foreground block group-hover:text-primary transition-colors"
                      >Health Profile & Insurance</span
                    >
                    <span class="text-[10px] text-muted-foreground block"
                      >Emergency contacts & ABDM</span
                    >
                  </div>
                </div>
                <ng-icon
                  name="lucideChevronRight"
                  size="14"
                  class="text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PatientDashboardComponent implements OnInit {
  isLoading: boolean = false;
  errorMessage: string = "";
  patient = signal<Patient | null>(null);
  appointments = signal<Appointment[]>([]);
  prescriptions = signal<Prescription[]>([]);
  vitalsList = signal<Vitals[]>([]);
  allergies = signal<Allergy[]>([]);
  diagnoses = signal<Diagnosis[]>([]);
  encounters = signal<Encounter[]>([]);

  // Computed signals for smart UI presentation
  latestVitals = computed(() => {
    const list = this.vitalsList();
    if (!Array.isArray(list) || list.length === 0) return null;
    return list[0];
  });

  activePrescriptions = computed(() => {
    const list = this.prescriptions();
    if (!Array.isArray(list)) return [];
    return list.filter(
      (rx) =>
        rx.status?.toUpperCase() !== 'CANCELLED' && rx.status?.toUpperCase() !== 'DISCONTINUED',
    );
  });

  nextAppointment = computed(() => {
    const apps = this.appointments();
    if (!Array.isArray(apps) || apps.length === 0) return null;
    const filtered = apps.filter(
      (a) => a.status?.toUpperCase() !== 'CANCELLED' && a.status?.toUpperCase() !== 'COMPLETED',
    );
    return filtered.length > 0 ? filtered[0] : null;
  });

  recentEncounters = computed(() => {
    const encs = this.encounters();
    if (!Array.isArray(encs)) return [];
    return encs.slice(0, 3);
  });

  activeDiagnoses = computed(() => {
    const list = this.diagnoses();
    if (!Array.isArray(list)) return [];
    return list.filter((d) => d.status?.toUpperCase() !== 'RESOLVED');
  });

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    public patientContext: PatientContextService,
  ) {}

  get currentUser() {
    return this.authService.currentUser();
  }

  ngOnInit(): void {
    this.apiService.getMyPatientProfile().subscribe({
      next: (p) => {
        this.patient.set(p);
        if (p && p.id) {
          this.loadPatientHealthData(p.id);
        }
      },
      error: (err) => { this.errorMessage = err.message || 'Failed'; this.isLoading = false; },
    });
  }

  labResults = signal<LabResult[]>([]);
  imagingReports = signal<ImagingOrder[]>([]);
  clinicalDocuments = signal<ClinicalDocument[]>([]);
  invoices = signal<Invoice[]>([]);
  consents = signal<PatientConsent[]>([]);
  insurances = signal<PatientInsurancePolicy[]>([]);

  private loadPatientHealthData(patientId: string): void {
    this.apiService.getAppointmentsByPatient(patientId).subscribe({
      next: (apps) => this.appointments.set(Array.isArray(apps) ? apps : []),
      error: (err) => { this.errorMessage = err.message || 'Failed'; this.isLoading = false; }
    });

    this.apiService.getPrescriptionsByPatient(patientId).subscribe({
      next: (rx) => this.prescriptions.set(Array.isArray(rx) ? rx : []),
      error: (err) => { this.errorMessage = err.message || 'Failed'; this.isLoading = false; },
    });

    this.apiService.getVitalsByPatient(patientId).subscribe({
      next: (v) => this.vitalsList.set(Array.isArray(v) ? v : []),
      error: (err) => { this.errorMessage = err.message || 'Failed'; this.isLoading = false; },
    });

    this.apiService.getAllergiesByPatient(patientId).subscribe({
      next: (a) => this.allergies.set(Array.isArray(a) ? a : []),
      error: (err) => { this.errorMessage = err.message || 'Failed'; this.isLoading = false; },
    });

    this.apiService.getDiagnosesByPatient(patientId).subscribe({
      next: (d) => this.diagnoses.set(Array.isArray(d) ? d : []),
      error: (err) => { this.errorMessage = err.message || 'Failed'; this.isLoading = false; },
    });

    this.apiService.getEncountersByPatient(patientId).subscribe({
      next: (e) => this.encounters.set(Array.isArray(e) ? e : []),
      error: (err) => { this.errorMessage = err.message || 'Failed'; this.isLoading = false; },
    });

    this.apiService.getPatientLabResults(patientId).subscribe({
      next: (res) => this.labResults.set(res),
      error: (err) => { this.errorMessage = err.message || 'Failed'; this.isLoading = false; },
    });

    this.apiService.getImagingOrdersByPatient(patientId).subscribe({
      next: (orders) => this.imagingReports.set(orders),
      error: (err) => { this.errorMessage = err.message || 'Failed'; this.isLoading = false; },
    });

    this.apiService.getPatientDocuments(patientId).subscribe({
      next: (docs) => this.clinicalDocuments.set(docs),
      error: (err) => { this.errorMessage = err.message || 'Failed'; this.isLoading = false; },
    });

    this.apiService.getPatientInvoices(patientId).subscribe({
      next: (invs) => this.invoices.set(invs),
      error: (err) => { this.errorMessage = err.message || 'Failed'; this.isLoading = false; },
    });

    this.apiService.getPatientConsents(patientId).subscribe({
      next: (c) => this.consents.set(c),
      error: (err) => { this.errorMessage = err.message || 'Failed'; this.isLoading = false; },
    });

    this.apiService.getPatientInsurances(patientId).subscribe({
      next: (ins) => this.insurances.set(ins),
      error: (err) => { this.errorMessage = err.message || 'Failed'; this.isLoading = false; },
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }

  getAge(dob?: string): string {
    if (!dob) return '';
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? `${age} yrs` : '';
  }

  formatEmergencyContact(): string {
    const ec = this.patient()?.emergencyContact;
    if (!ec || !ec.name) return 'Not Specified';
    const rel = ec.relationship ? ` (${ec.relationship})` : '';
    const phone = ec.phone ? ` - ${ec.phone}` : '';
    return `${ec.name}${rel}${phone}`;
  }

  isProfileIncomplete(): boolean {
    const p = this.patient();
    if (!p) return true;
    return (
      !p.phone ||
      !p.address ||
      !p.emergencyContact ||
      !p.emergencyContact?.name ||
      !p.insuranceProvider
    );
  }

  hasCriticalSafetyAlert(): boolean {
    const p = this.patient();
    if (p?.medicalAlerts) return true;
    return this.allergies().some(
      (a) =>
        a.severity?.toUpperCase() === 'SEVERE' || a.severity?.toUpperCase() === 'LIFE_THREATENING',
    );
  }

  hasSevereAllergy(): boolean {
    return this.allergies().some(
      (a) =>
        a.severity?.toUpperCase() === 'SEVERE' || a.severity?.toUpperCase() === 'LIFE_THREATENING',
    );
  }

  getCriticalAllergiesText(): string {
    const severe = this.allergies().filter(
      (a) =>
        a.severity?.toUpperCase() === 'SEVERE' || a.severity?.toUpperCase() === 'LIFE_THREATENING',
    );
    if (severe.length === 0) return 'High-priority medical safety alert.';
    return `Severe Allergy Alert: ${severe.map((s) => `${s.allergenName} (${s.reactionDescription || s.severity})`).join(', ')}`;
  }

  getBpCategoryText(v?: Vitals | null): string {
    if (!v || v.systolicBp == null || v.diastolicBp == null) return 'Standard';
    const sys = v.systolicBp;
    const dia = v.diastolicBp;

    if (sys < 120 && dia < 80) return 'Normal';
    if (sys >= 120 && sys <= 129 && dia < 80) return 'Elevated';
    if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) return 'Stage 1 HTN';
    if (sys >= 140 || dia >= 90) return 'Stage 2 HTN';
    return 'Observed';
  }

  getBpCategoryBadgeVariant(
    v?: Vitals | null,
  ): 'secondary' | 'outline' | 'destructive' | 'default' {
    const cat = this.getBpCategoryText(v);
    if (cat === 'Normal') return 'secondary';
    if (cat === 'Elevated') return 'outline';
    if (cat.includes('HTN')) return 'destructive';
    return 'secondary';
  }

  downloadFhirRecord(): void {
    const patientId = this.patient()?.id;
    if (!patientId) return;
    this.apiService.getFhirPatientEverything(patientId).subscribe({
      next: (bundle) => {
        const dataStr =
          'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `FHIR_Health_Summary_Patient_${patientId}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      },
      error: (err) => { this.errorMessage = err.message || 'Failed'; this.isLoading = false; },
    });
  }
}
