import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import {
  Patient,
  Vitals,
  Prescription,
  Appointment,
  Allergy,
  Diagnosis,
  Encounter,
} from '../../core/models/models';

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
} from '@ng-icons/lucide';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    NgIcon,
  ],
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
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- 1. Header Banner & Patient Orientation -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-start sm:items-center gap-4">
          <div class="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
            <ng-icon name="lucideUserRound" size="28" />
          </div>
          <div class="space-y-1">
            <div class="flex items-center flex-wrap gap-2">
              <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {{ getGreeting() }}, {{ patient()?.fullName || currentUser?.fullName }}
              </h1>
              <span hlmBadge variant="outline" class="text-[10px] bg-primary/5 text-primary border-primary/20">
                Patient Portal
              </span>
            </div>

            <div class="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span class="flex items-center gap-1.5 font-medium">
                <span class="text-muted-foreground">MRN:</span>
                <span hlmBadge variant="secondary" class="font-mono text-[11px] py-0 px-1.5">{{ patient()?.patientCode || 'N/A' }}</span>
              </span>
              <span class="text-border">•</span>
              <span>DOB: <strong class="text-foreground">{{ patient()?.dateOfBirth || 'N/A' }}</strong> <span *ngIf="getAge(patient()?.dateOfBirth)" class="text-muted-foreground">({{ getAge(patient()?.dateOfBirth) }})</span></span>
              <span class="text-border">•</span>
              <span>Blood: <strong class="text-foreground">{{ patient()?.bloodType || 'N/A' }}</strong></span>
              <span class="text-border">•</span>
              <span>Coverage: <strong class="text-foreground">{{ patient()?.insuranceProvider || 'Self-Pay' }}</strong></span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <a routerLink="/patient/appointments" hlmBtn variant="default" size="sm" class="gap-2 shadow-xs flex-1 sm:flex-initial">
            <ng-icon name="lucideCalendarClock" size="16" />
            <span>Book Consultation</span>
          </a>
          <button (click)="downloadFhirRecord()" hlmBtn variant="outline" size="sm" class="gap-1.5 text-xs flex-1 sm:flex-initial">
            <ng-icon name="lucideDownload" size="14" />
            <span>Health Summary</span>
          </button>
          <a routerLink="/patient/profile" hlmBtn variant="ghost" size="sm" class="gap-1 text-xs hidden sm:flex">
            <span>Profile Settings</span>
            <ng-icon name="lucideChevronRight" size="14" />
          </a>
        </div>
      </div>

      <!-- 2. Patient Action & Critical Banners -->
      <!-- Incomplete Onboarding Warning Banner -->
      <div *ngIf="isProfileIncomplete()" class="p-4 sm:p-5 rounded-2xl border border-amber-500/40 bg-amber-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
        <div class="flex items-start gap-3">
          <div class="size-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <ng-icon name="lucideTriangleAlert" size="20" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2 flex-wrap">
              <span>Action Required: Complete Health Profile Setup</span>
              <span hlmBadge variant="outline" class="text-[10px] border-amber-500/40 text-amber-600 dark:text-amber-400">Incomplete Chart</span>
            </h3>
            <p class="text-xs text-muted-foreground mt-0.5">
              Your patient record is missing vital contact info, emergency contacts, or insurance details. Completing your profile ensures seamless clinical intake and emergency readiness.
            </p>
          </div>
        </div>

        <a routerLink="/patient/profile" hlmBtn variant="default" size="sm" class="shrink-0 gap-1.5 font-bold text-xs shadow-sm bg-amber-600 hover:bg-amber-700 text-white border-0 w-full sm:w-auto justify-center">
          <ng-icon name="lucideSparkles" size="14" />
          <span>Complete Profile Now</span>
        </a>
      </div>

      <!-- Severe Allergy / Critical Medical Alert Banner -->
      <div *ngIf="hasCriticalSafetyAlert()" class="p-4 rounded-2xl border border-destructive/40 bg-destructive/10 flex items-start gap-3 shadow-xs">
        <div class="size-9 rounded-xl bg-destructive/20 text-destructive flex items-center justify-center shrink-0 mt-0.5">
          <ng-icon name="lucideShieldAlert" size="18" />
        </div>
        <div class="space-y-1 flex-1 text-xs">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-destructive uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>Critical Medical & Allergy Safety Alerts</span>
            </h4>
            <a routerLink="/patient/allergies" class="text-destructive underline hover:text-destructive/80 font-medium">View Safety Record</a>
          </div>
          <p class="text-foreground">
            {{ patient()?.medicalAlerts || getCriticalAllergiesText() }}
          </p>
        </div>
      </div>

      <!-- 3. Key Clinical Overview Grid (Quick Metrics Bar) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Next Consultation Metric -->
        <div class="p-4 rounded-xl border border-border bg-card space-y-2 shadow-xs hover:border-primary/40 transition-colors">
          <div class="flex items-center justify-between text-muted-foreground">
            <span class="text-[11px] font-semibold uppercase tracking-wider">Next Appointment</span>
            <ng-icon name="lucideCalendar" size="16" class="text-primary" />
          </div>
          <div *ngIf="nextAppointment()" class="space-y-0.5">
            <div class="text-sm font-bold text-foreground truncate">{{ nextAppointment()?.doctor?.fullName || nextAppointment()?.doctorName || 'Unknown' }}</div>
            <div class="text-xs text-primary font-medium flex items-center gap-1">
              <ng-icon name="lucideClock" size="12" />
              <span>{{ nextAppointment()?.appointmentDate | date:'mediumDate' }}</span>
            </div>
          </div>
          <div *ngIf="!nextAppointment()" class="space-y-0.5">
            <div class="text-sm font-semibold text-muted-foreground">No upcoming visits</div>
            <a routerLink="/patient/appointments" class="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1">
              <span>Schedule Visit</span>
              <ng-icon name="lucideArrowRight" size="12" />
            </a>
          </div>
        </div>

        <!-- Active Prescriptions Metric -->
        <div class="p-4 rounded-xl border border-border bg-card space-y-2 shadow-xs hover:border-primary/40 transition-colors">
          <div class="flex items-center justify-between text-muted-foreground">
            <span class="text-[11px] font-semibold uppercase tracking-wider">Active Medications</span>
            <ng-icon name="lucidePill" size="16" class="text-emerald-500" />
          </div>
          <div class="flex items-baseline justify-between">
            <span class="text-2xl font-bold text-foreground">{{ activePrescriptions().length }}</span>
            <span hlmBadge variant="secondary" class="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
              Rx Active
            </span>
          </div>
          <a routerLink="/patient/prescriptions" class="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <span>View Prescriptions</span>
            <ng-icon name="lucideChevronRight" size="12" />
          </a>
        </div>

        <!-- Latest Blood Pressure Metric -->
        <div class="p-4 rounded-xl border border-border bg-card space-y-2 shadow-xs hover:border-primary/40 transition-colors">
          <div class="flex items-center justify-between text-muted-foreground">
            <span class="text-[11px] font-semibold uppercase tracking-wider">Blood Pressure</span>
            <ng-icon name="lucideHeartPulse" size="16" class="text-rose-500" />
          </div>
          <div class="flex items-baseline justify-between">
            <span class="text-xl font-bold font-mono text-foreground">{{ latestVitals()?.bloodPressure || 'N/A' }}</span>
            <span *ngIf="latestVitals()" hlmBadge [variant]="getBpCategoryBadgeVariant(latestVitals()?.bloodPressure)" class="text-[10px]">
              {{ getBpCategoryText(latestVitals()?.bloodPressure) }}
            </span>
          </div>
          <div class="text-[11px] text-muted-foreground">
            Recorded: {{ latestVitals()?.recordedAt | date:'shortDate' }}
          </div>
        </div>

        <!-- Documented Allergies Metric -->
        <div class="p-4 rounded-xl border border-border bg-card space-y-2 shadow-xs hover:border-primary/40 transition-colors">
          <div class="flex items-center justify-between text-muted-foreground">
            <span class="text-[11px] font-semibold uppercase tracking-wider">Allergies & Alerts</span>
            <ng-icon name="lucideShieldCheck" size="16" class="text-amber-500" />
          </div>
          <div class="flex items-baseline justify-between">
            <span class="text-2xl font-bold text-foreground">{{ allergies().length }}</span>
            <span hlmBadge variant="outline" class="text-[10px]">
              {{ hasSevereAllergy() ? 'Severe Alert' : 'Documented' }}
            </span>
          </div>
          <a routerLink="/patient/allergies" class="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <span>Safety Record</span>
            <ng-icon name="lucideChevronRight" size="12" />
          </a>
        </div>
      </div>

      <!-- 4. Main Two-Column Clinical Dashboard -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- LEFT COLUMN: Primary Clinical Cards (7 Cols) -->
        <div class="lg:col-span-7 space-y-6">

          <!-- Next Scheduled Appointment Card -->
          <div class="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div class="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div class="flex items-center gap-2">
                <ng-icon name="lucideStethoscope" size="18" class="text-primary" />
                <h2 class="text-sm font-bold text-foreground">Upcoming Consultation Details</h2>
              </div>
              <a routerLink="/patient/appointments" hlmBtn variant="ghost" size="sm" class="h-7 text-xs gap-1">
                <span>View All Visits</span>
                <ng-icon name="lucideChevronRight" size="14" />
              </a>
            </div>

            <div class="p-4 sm:p-5">
              <div *ngIf="nextAppointment()" class="space-y-4">
                <div class="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-primary/10">
                    <div>
                      <span class="text-[11px] font-semibold text-primary uppercase tracking-wider block">Attending Provider</span>
                      <h3 class="text-base font-bold text-foreground">{{ nextAppointment()?.doctor?.fullName || nextAppointment()?.doctorName || 'Unknown' }}</h3>
                      <p class="text-xs text-muted-foreground">{{ nextAppointment()?.doctor?.specialization || nextAppointment()?.doctorSpecialization || 'General Practice' }}</p>
                    </div>
                    <span hlmBadge variant="default" class="self-start sm:self-center text-xs">
                      {{ nextAppointment()?.status }}
                    </span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div class="flex items-center gap-2 text-foreground">
                      <ng-icon name="lucideCalendarClock" size="15" class="text-muted-foreground" />
                      <span><strong>Date:</strong> {{ nextAppointment()?.appointmentDate | date:'fullDate' }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-foreground">
                      <ng-icon name="lucideClock" size="15" class="text-muted-foreground" />
                      <span><strong>Time:</strong> {{ nextAppointment()?.appointmentDate | date:'shortTime' }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-foreground sm:col-span-2" *ngIf="nextAppointment()?.reason">
                      <ng-icon name="lucideFileText" size="15" class="text-muted-foreground shrink-0" />
                      <span><strong>Chief Reason:</strong> {{ nextAppointment()?.reason }}</span>
                    </div>
                  </div>
                </div>

                <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                  <div class="flex items-center gap-2 text-xs text-muted-foreground">
                    <ng-icon name="lucideShieldCheck" size="16" class="text-emerald-500 shrink-0" />
                    <span>Insurance Pre-Authorization: <strong>{{ nextAppointment()?.insuranceVerified ? 'Verified' : 'Pending' }}</strong></span>
                  </div>
                  <a routerLink="/patient/appointments" hlmBtn variant="default" size="sm" class="gap-1.5 text-xs shadow-xs">
                    <ng-icon name="lucideCheckCircle2" size="14" />
                    <span>Pre-Visit Intake & Check-In</span>
                  </a>
                </div>
              </div>

              <!-- Empty Upcoming Visit State -->
              <div *ngIf="!nextAppointment()" class="py-8 text-center space-y-3">
                <div class="size-12 rounded-2xl bg-muted text-muted-foreground mx-auto flex items-center justify-center">
                  <ng-icon name="lucideCalendarClock" size="24" />
                </div>
                <div class="space-y-1">
                  <h3 class="text-sm font-semibold text-foreground">No upcoming consultations scheduled</h3>
                  <p class="text-xs text-muted-foreground max-w-sm mx-auto">
                    Book an appointment with your primary care provider or specialist for routine check-ups or follow-up consultations.
                  </p>
                </div>
                <a routerLink="/patient/appointments" hlmBtn variant="default" size="sm" class="gap-2 text-xs shadow-xs mt-2">
                  <ng-icon name="lucidePlus" size="14" />
                  <span>Book New Appointment</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Active Prescriptions & Medication Adherence -->
          <div class="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div class="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div class="flex items-center gap-2">
                <ng-icon name="lucidePill" size="18" class="text-emerald-500" />
                <h2 class="text-sm font-bold text-foreground">Active Medications & Prescriptions</h2>
              </div>
              <a routerLink="/patient/prescriptions" hlmBtn variant="ghost" size="sm" class="h-7 text-xs gap-1">
                <span>View All Rx</span>
                <ng-icon name="lucideChevronRight" size="14" />
              </a>
            </div>

            <div class="p-4 sm:p-5">
              <div *ngIf="activePrescriptions().length > 0" class="space-y-3">
                <div *ngFor="let rx of activePrescriptions().slice(0, 3)" class="p-3.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-foreground text-sm">{{ rx.medicationName }}</span>
                      <span hlmBadge variant="outline" class="text-[10px] font-mono">{{ rx.dosage }}</span>
                    </div>
                    <p class="text-muted-foreground">
                      <span>Frequency: <strong>{{ rx.frequency }}</strong></span> • 
                      <span>Duration: <strong>{{ rx.durationDays }} days</strong></span>
                    </p>
                    <p *ngIf="rx.instructions" class="text-[11px] text-muted-foreground italic">
                      "{{ rx.instructions }}"
                    </p>
                  </div>

                  <div class="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border">
                    <span hlmBadge variant="secondary" class="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {{ rx.status || 'ACTIVE' }}
                    </span>
                    <span class="text-[11px] text-muted-foreground">Refills: <strong>{{ rx.refills ?? 'N/A' }}</strong></span>
                  </div>
                </div>
              </div>

              <div *ngIf="activePrescriptions().length === 0" class="py-6 text-center text-xs text-muted-foreground">
                No active prescriptions on file.
              </div>
            </div>
          </div>

          <!-- Recent Encounters & Clinical Notes -->
          <div class="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div class="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div class="flex items-center gap-2">
                <ng-icon name="lucideFileText" size="18" class="text-primary" />
                <h2 class="text-sm font-bold text-foreground">Recent Clinical Encounters</h2>
              </div>
            </div>

            <div class="p-4 sm:p-5">
              <div *ngIf="recentEncounters().length > 0" class="space-y-3">
                <div *ngFor="let enc of recentEncounters()" class="p-4 rounded-xl border border-border bg-muted/20 space-y-2 text-xs">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-border">
                    <span class="font-bold text-foreground text-sm flex items-center gap-2">
                      <span>{{ enc.encounterType }} Encounter</span>
                      <span hlmBadge variant="outline" class="text-[10px]">{{ enc.status }}</span>
                    </span>
                    <span class="text-muted-foreground font-mono text-[11px]">{{ enc.encounterDate | date:'mediumDate' }}</span>
                  </div>

                  <div *ngIf="enc.chiefComplaint" class="text-foreground">
                    <strong class="text-muted-foreground">Chief Complaint:</strong> {{ enc.chiefComplaint }}
                  </div>
                  <div *ngIf="enc.clinicalNotes" class="text-muted-foreground line-clamp-2 italic">
                    "{{ enc.clinicalNotes }}"
                  </div>
                </div>
              </div>

              <div *ngIf="recentEncounters().length === 0" class="py-6 text-center text-xs text-muted-foreground">
                No previous clinical encounters logged.
              </div>
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN: Clinical Vitals & Safety Sidebar (5 Cols) -->
        <div class="lg:col-span-5 space-y-6">

          <!-- Vital Signs Flowsheet Summary -->
          <div class="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div class="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div class="flex items-center gap-2">
                <ng-icon name="lucideActivity" size="18" class="text-rose-500" />
                <h2 class="text-sm font-bold text-foreground">Vital Signs Flowsheet</h2>
              </div>
              <a routerLink="/patient/vitals" hlmBtn variant="ghost" size="sm" class="h-7 text-xs px-2">Flowsheet</a>
            </div>

            <div class="p-4 space-y-3 text-xs">
              <div *ngIf="latestVitals()" class="space-y-2">
                <!-- BP -->
                <div class="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                  <div class="space-y-0.5">
                    <span class="text-muted-foreground block text-[11px]">Blood Pressure</span>
                    <span class="font-bold font-mono text-foreground text-base">{{ latestVitals()?.bloodPressure }}</span>
                  </div>
                  <span hlmBadge [variant]="getBpCategoryBadgeVariant(latestVitals()?.bloodPressure)" class="text-[10px]">
                    {{ getBpCategoryText(latestVitals()?.bloodPressure) }}
                  </span>
                </div>

                <!-- Heart Rate & SpO2 -->
                <div class="grid grid-cols-2 gap-2">
                  <div class="p-3 rounded-xl bg-muted/40 border border-border space-y-0.5">
                    <span class="text-muted-foreground block text-[11px]">Heart Rate</span>
                    <span class="font-bold font-mono text-foreground text-sm">{{ latestVitals()?.heartRate }} <span class="text-[10px] font-normal text-muted-foreground">bpm</span></span>
                  </div>
                  <div class="p-3 rounded-xl bg-muted/40 border border-border space-y-0.5">
                    <span class="text-muted-foreground block text-[11px]">Oxygen (SpO2)</span>
                    <span class="font-bold font-mono text-foreground text-sm">{{ latestVitals()?.oxygenSaturation }}%</span>
                  </div>
                </div>

                <!-- Temp & BMI -->
                <div class="grid grid-cols-2 gap-2">
                  <div class="p-3 rounded-xl bg-muted/40 border border-border space-y-0.5">
                    <span class="text-muted-foreground block text-[11px]">Temperature</span>
                    <span class="font-bold font-mono text-foreground text-sm">{{ latestVitals()?.temperature }} <span class="text-[10px] font-normal text-muted-foreground">°F</span></span>
                  </div>
                  <div class="p-3 rounded-xl bg-muted/40 border border-border space-y-0.5">
                    <span class="text-muted-foreground block text-[11px]">BMI / Weight</span>
                    <span class="font-bold font-mono text-foreground text-sm">{{ latestVitals()?.bmi || 'N/A' }} <span *ngIf="latestVitals()?.weightKg" class="text-[10px] font-normal text-muted-foreground">({{ latestVitals()?.weightKg }} kg)</span></span>
                  </div>
                </div>

                <div class="text-[10px] text-muted-foreground text-right pt-1">
                  Last recorded: {{ latestVitals()?.recordedAt | date:'medium' }}
                </div>
              </div>

              <div *ngIf="!latestVitals()" class="py-6 text-center text-xs text-muted-foreground">
                No recent vital signs logged.
              </div>
            </div>
          </div>

          <!-- Active Diagnoses & Problem List -->
          <div class="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div class="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div class="flex items-center gap-2">
                <ng-icon name="lucideHeartPulse" size="18" class="text-primary" />
                <h2 class="text-sm font-bold text-foreground">Active Conditions & Diagnoses</h2>
              </div>
            </div>

            <div class="p-4 text-xs space-y-2">
              <div *ngIf="activeDiagnoses().length > 0" class="space-y-2">
                <div *ngFor="let d of activeDiagnoses()" class="p-3 rounded-xl border border-border bg-muted/30 flex items-center justify-between gap-2">
                  <div>
                    <span class="font-bold text-foreground block">{{ d.conditionName }}</span>
                    <span class="text-[11px] text-muted-foreground">Onset: {{ d.onsetDate || 'N/A' }}</span>
                  </div>
                  <span hlmBadge variant="outline" class="text-[10px] font-mono shrink-0">
                    {{ d.icdCode || 'ICD-10' }}
                  </span>
                </div>
              </div>

              <div *ngIf="activeDiagnoses().length === 0" class="py-4 text-center text-xs text-muted-foreground">
                No active chronic diagnoses logged.
              </div>
            </div>
          </div>

          <!-- Emergency Contact & Coverage Info Card -->
          <div class="p-4 rounded-2xl border border-border bg-card space-y-3 shadow-xs text-xs">
            <h3 class="font-bold text-foreground flex items-center gap-2 text-sm border-b border-border pb-2">
              <ng-icon name="lucidePhone" size="16" class="text-primary" />
              <span>Emergency Contact & Insurance</span>
            </h3>

            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-muted-foreground">Emergency Contact:</span>
                <span class="font-semibold text-foreground">{{ patient()?.emergencyContact || 'Not Specified' }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-muted-foreground">Insurance Carrier:</span>
                <span class="font-semibold text-foreground">{{ patient()?.insuranceProvider || 'Self-Pay' }}</span>
              </div>
              <div *ngIf="patient()?.insurancePolicyNumber" class="flex justify-between items-center">
                <span class="text-muted-foreground">Policy Number:</span>
                <span class="font-mono text-foreground">{{ patient()?.insurancePolicyNumber }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- 5. Portal Workspaces Quick Navigation Hub -->
      <div class="space-y-3 pt-4 border-t border-border">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-foreground">Patient Portal Workspaces</h2>
            <p class="text-xs text-muted-foreground">Single-click access to your complete health management hub.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a routerLink="/patient/appointments" class="p-4 rounded-2xl border border-border bg-card hover:bg-accent/40 transition-colors flex items-center justify-between group shadow-xs">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ng-icon name="lucideCalendarClock" size="20" />
              </div>
              <div>
                <span class="text-xs font-bold text-foreground block">Appointments</span>
                <span class="text-[11px] text-muted-foreground block">Schedule & telehealth</span>
              </div>
            </div>
            <ng-icon name="lucideChevronRight" size="18" class="text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
          </a>

          <a routerLink="/patient/prescriptions" class="p-4 rounded-2xl border border-border bg-card hover:bg-accent/40 transition-colors flex items-center justify-between group shadow-xs">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ng-icon name="lucidePill" size="20" />
              </div>
              <div>
                <span class="text-xs font-bold text-foreground block">Prescriptions</span>
                <span class="text-[11px] text-muted-foreground block">Rx refills & active meds</span>
              </div>
            </div>
            <ng-icon name="lucideChevronRight" size="18" class="text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
          </a>

          <a routerLink="/patient/vitals" class="p-4 rounded-2xl border border-border bg-card hover:bg-accent/40 transition-colors flex items-center justify-between group shadow-xs">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <ng-icon name="lucideActivity" size="20" />
              </div>
              <div>
                <span class="text-xs font-bold text-foreground block">Vital Signs</span>
                <span class="text-[11px] text-muted-foreground block">Health flowsheet & trends</span>
              </div>
            </div>
            <ng-icon name="lucideChevronRight" size="18" class="text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
          </a>

          <a routerLink="/patient/allergies" class="p-4 rounded-2xl border border-border bg-card hover:bg-accent/40 transition-colors flex items-center justify-between group shadow-xs">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <ng-icon name="lucideShieldCheck" size="20" />
              </div>
              <div>
                <span class="text-xs font-bold text-foreground block">Allergies & Safety</span>
                <span class="text-[11px] text-muted-foreground block">Safety record & alerts</span>
              </div>
            </div>
            <ng-icon name="lucideChevronRight" size="18" class="text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </div>
  `,
})
export class PatientDashboardComponent implements OnInit {
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
    return list.length > 0 ? list[list.length - 1] : null;
  });

  activePrescriptions = computed(() => {
    return this.prescriptions().filter(
      (rx) => rx.status?.toUpperCase() !== 'CANCELLED' && rx.status?.toUpperCase() !== 'DISCONTINUED',
    );
  });

  nextAppointment = computed(() => {
    const apps = this.appointments().filter(
      (a) => a.status?.toUpperCase() !== 'CANCELLED' && a.status?.toUpperCase() !== 'COMPLETED',
    );
    if (apps.length === 0) return null;
    return apps[0];
  });

  recentEncounters = computed(() => {
    return [...this.encounters()].reverse().slice(0, 3);
  });

  activeDiagnoses = computed(() => {
    return this.diagnoses().filter((d) => d.status?.toUpperCase() !== 'RESOLVED');
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
      error: (err) => {
        console.warn('Could not load patient record for dashboard', err);
      },
    });
  }

  private loadPatientHealthData(patientId: number): void {
    this.apiService.getAppointmentsByPatient(patientId).subscribe({
      next: (apps) => this.appointments.set(apps),
      error: (err) => console.warn('Error loading appointments', err),
    });

    this.apiService.getPrescriptionsByPatient(patientId).subscribe({
      next: (rx) => this.prescriptions.set(rx),
      error: (err) => console.warn('Error loading prescriptions', err),
    });

    this.apiService.getVitalsByPatient(patientId).subscribe({
      next: (v) => this.vitalsList.set(v),
      error: (err) => console.warn('Error loading vitals', err),
    });

    this.apiService.getAllergiesByPatient(patientId).subscribe({
      next: (a) => this.allergies.set(a),
      error: (err) => console.warn('Error loading allergies', err),
    });

    this.apiService.getDiagnosesByPatient(patientId).subscribe({
      next: (d) => this.diagnoses.set(d),
      error: (err) => console.warn('Error loading diagnoses', err),
    });

    this.apiService.getEncountersByPatient(patientId).subscribe({
      next: (e) => this.encounters.set(e),
      error: (err) => console.warn('Error loading encounters', err),
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

  isProfileIncomplete(): boolean {
    const p = this.patient();
    if (!p) return true;
    return !p.phone || !p.address || !p.emergencyContact || !p.insuranceProvider;
  }

  hasCriticalSafetyAlert(): boolean {
    const p = this.patient();
    if (p?.medicalAlerts) return true;
    return this.allergies().some(
      (a) => a.severity?.toUpperCase() === 'SEVERE' || a.severity?.toUpperCase() === 'LIFE_THREATENING',
    );
  }

  hasSevereAllergy(): boolean {
    return this.allergies().some(
      (a) => a.severity?.toUpperCase() === 'SEVERE' || a.severity?.toUpperCase() === 'LIFE_THREATENING',
    );
  }

  getCriticalAllergiesText(): string {
    const severe = this.allergies().filter(
      (a) => a.severity?.toUpperCase() === 'SEVERE' || a.severity?.toUpperCase() === 'LIFE_THREATENING',
    );
    if (severe.length === 0) return 'High-priority medical safety alert.';
    return `Severe Allergy Alert: ${severe.map((s) => `${s.allergenName} (${s.reactionDescription || s.severity})`).join(', ')}`;
  }

  getBpCategoryText(bp?: string): string {
    if (!bp || !bp.includes('/')) return 'Standard';
    const parts = bp.split('/');
    const sys = parseInt(parts[0], 10);
    const dia = parseInt(parts[1], 10);
    if (isNaN(sys) || isNaN(dia)) return 'Standard';

    if (sys < 120 && dia < 80) return 'Normal';
    if (sys >= 120 && sys <= 129 && dia < 80) return 'Elevated';
    if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) return 'Stage 1 HTN';
    if (sys >= 140 || dia >= 90) return 'Stage 2 HTN';
    return 'Observed';
  }

  getBpCategoryBadgeVariant(bp?: string): 'secondary' | 'outline' | 'destructive' | 'default' {
    const cat = this.getBpCategoryText(bp);
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
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `FHIR_Health_Summary_Patient_${patientId}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      },
      error: (err) => {
        console.warn('Could not fetch FHIR patient record', err);
      },
    });
  }
}
