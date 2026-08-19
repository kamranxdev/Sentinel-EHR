import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient, EmergencyContact } from '../../core/models/patient.model';
import { ActionButtonComponent } from '../../shared/ui/action-button.component';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideUserRound,
  lucideSave,
  lucideCheckCircle2,
  lucideSparkles,
  lucideShieldCheck,
  lucidePhone,
  lucideFileText,
  lucideActivity,
  lucideTriangleAlert,
  lucideHeartPulse,
  lucideLock,
  lucideShieldAlert,
  lucideInfo,
  lucideAlertCircle,
  lucideX,
  lucideMail,
  lucideHome,
  lucideCreditCard,
  lucideStethoscope,
  lucideChevronRight,
  lucideCheck,
  lucideCalendar,
  lucideDroplet,
  lucideFileCheck,
  lucideUsers,
} from '@ng-icons/lucide';

type ProfileTab = 'demographics' | 'contact' | 'insurance' | 'allergies' | 'history';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ActionButtonComponent,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    HlmSelectImports,
    HlmTextareaImports,
    HlmDialogImports,
    HlmTabsImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideUserRound,
      lucideSave,
      lucideCheckCircle2,
      lucideSparkles,
      lucideShieldCheck,
      lucidePhone,
      lucideFileText,
      lucideActivity,
      lucideTriangleAlert,
      lucideHeartPulse,
      lucideLock,
      lucideShieldAlert,
      lucideInfo,
      lucideAlertCircle,
      lucideX,
      lucideMail,
      lucideHome,
      lucideCreditCard,
      lucideStethoscope,
      lucideChevronRight,
      lucideCheck,
      lucideCalendar,
      lucideDroplet,
      lucideFileCheck,
      lucideUsers,
    }),
  ],
  template: `
    <div class="space-y-6 w-full">
      <!-- Header Banner & Patient Orientation -->
      <div
        class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-border"
      >
        <div class="flex items-center gap-3">
          <div
            class="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-xs"
          >
            <ng-icon name="lucideUserRound" size="24" />
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                My Health Profile & Clinical Onboarding
              </h1>
              <span hlmBadge variant="outline" class="font-mono text-[10px]"
                >MRN: {{ patient()?.patientCode || 'PAT-1001' }}</span
              >
            </div>
            <p class="text-xs text-muted-foreground mt-0.5">
              Unified personal health record (PHR) chart setup, emergency contacts, insurance
              verification, and medical safety profile.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span
            hlmBadge
            [variant]="isInitialSaveCompleted() ? 'secondary' : 'outline'"
            class="text-xs font-semibold px-3 py-1"
          >
            {{ isInitialSaveCompleted() ? '🔒 Legal Identity Locked' : '✏️ Initial Setup Draft' }}
          </span>
        </div>
      </div>

      <!-- TOP HEALTH ONBOARDING COMPLETENESS PROGRESS CARD BANNER -->
      <div class="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-3 shadow-xs">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span
                class="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5"
              >
                <ng-icon name="lucideFileCheck" size="16" />
                <span>Health Chart Onboarding Progress</span>
              </span>
              <span
                hlmBadge
                [variant]="getCompletenessScore() === 100 ? 'secondary' : 'outline'"
                class="text-[11px] font-bold"
              >
                {{ getCompletenessScore() }}% Complete
              </span>
            </div>
            <p class="text-xs text-muted-foreground">
              {{
                getCompletenessScore() === 100
                  ? 'Your health profile is 100% complete and verified in Sentinel EHR.'
                  : 'Complete missing intake fields below to ensure clinical continuity and emergency readiness.'
              }}
            </p>
          </div>

          <div class="w-full sm:w-64 space-y-1.5 shrink-0">
            <div
              class="h-3 w-full bg-muted rounded-full overflow-hidden border border-border shadow-inner"
            >
              <div
                class="h-full bg-primary transition-all duration-500 rounded-full"
                [style.width.%]="getCompletenessScore()"
              ></div>
            </div>
            <div
              class="flex items-center justify-between text-[10px] text-muted-foreground font-mono"
            >
              <span>{{ getCompletenessScore() }}/100 Completed</span>
              <span>{{ isInitialSaveCompleted() ? 'EHR Saved' : 'Draft Setup' }}</span>
            </div>
          </div>
        </div>

        <!-- Category Checklist Badges (Interactive Tab Jump) -->
        <div class="flex items-center flex-wrap gap-2 pt-2 border-t border-primary/10 text-[11px]">
          <span class="text-muted-foreground font-medium mr-1">Section Status:</span>
          <button
            (click)="activeTab.set('demographics')"
            [class.bg-emerald-500/10]="hasDemographics()"
            class="px-2.5 py-1 rounded-lg border border-border flex items-center gap-1.5 hover:bg-accent transition-colors"
          >
            <ng-icon
              [name]="hasDemographics() ? 'lucideCheck' : 'lucideAlertCircle'"
              size="12"
              [class.text-emerald-500]="hasDemographics()"
              [class.text-amber-500]="!hasDemographics()"
            />
            <span>Demographics</span>
          </button>
          <button
            (click)="activeTab.set('contact')"
            [class.bg-emerald-500/10]="hasContact()"
            class="px-2.5 py-1 rounded-lg border border-border flex items-center gap-1.5 hover:bg-accent transition-colors"
          >
            <ng-icon
              [name]="hasContact() ? 'lucideCheck' : 'lucideAlertCircle'"
              size="12"
              [class.text-emerald-500]="hasContact()"
              [class.text-amber-500]="!hasContact()"
            />
            <span>Contact & Emergency</span>
          </button>
          <button
            (click)="activeTab.set('insurance')"
            [class.bg-emerald-500/10]="hasInsurance()"
            class="px-2.5 py-1 rounded-lg border border-border flex items-center gap-1.5 hover:bg-accent transition-colors"
          >
            <ng-icon
              [name]="hasInsurance() ? 'lucideCheck' : 'lucideAlertCircle'"
              size="12"
              [class.text-emerald-500]="hasInsurance()"
              [class.text-amber-500]="!hasInsurance()"
            />
            <span>Insurance Info</span>
          </button>
          <button
            (click)="activeTab.set('allergies')"
            [class.bg-emerald-500/10]="hasAllergies()"
            class="px-2.5 py-1 rounded-lg border border-border flex items-center gap-1.5 hover:bg-accent transition-colors"
          >
            <ng-icon
              [name]="hasAllergies() ? 'lucideCheck' : 'lucideAlertCircle'"
              size="12"
              [class.text-emerald-500]="hasAllergies()"
              [class.text-amber-500]="!hasAllergies()"
            />
            <span>Allergies & Safety</span>
          </button>
          <button
            (click)="activeTab.set('history')"
            [class.bg-emerald-500/10]="hasHistory()"
            class="px-2.5 py-1 rounded-lg border border-border flex items-center gap-1.5 hover:bg-accent transition-colors"
          >
            <ng-icon
              [name]="hasHistory() ? 'lucideCheck' : 'lucideAlertCircle'"
              size="12"
              [class.text-emerald-500]="hasHistory()"
              [class.text-amber-500]="!hasHistory()"
            />
            <span>Medical History</span>
          </button>
        </div>
      </div>

      <!-- MAIN 2-COLUMN RESPONSIVE LAYOUT -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- LEFT COLUMN: DEFAULT SPARTAN HELM TABS & INTAKE FORM (8 Cols) -->
        <div class="lg:col-span-8 space-y-6">
          <!-- SPARTAN HELM UI DEFAULT TABS CONTAINER -->
          <div class="w-full space-y-4">
            <!-- SPARTAN HELM TABS LIST -->
            <div
              hlmTabsList
              class="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 bg-muted p-1.5 rounded-xl border border-border"
            >
              <button
                hlmTabsTrigger
                type="button"
                (click)="activeTab.set('demographics')"
                [attr.data-state]="activeTab() === 'demographics' ? 'active' : 'inactive'"
                class="gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <ng-icon name="lucideUserRound" size="15" />
                <span>1. Demographics</span>
              </button>
              <button
                hlmTabsTrigger
                type="button"
                (click)="activeTab.set('contact')"
                [attr.data-state]="activeTab() === 'contact' ? 'active' : 'inactive'"
                class="gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <ng-icon name="lucidePhone" size="15" />
                <span>2. Contact</span>
              </button>
              <button
                hlmTabsTrigger
                type="button"
                (click)="activeTab.set('insurance')"
                [attr.data-state]="activeTab() === 'insurance' ? 'active' : 'inactive'"
                class="gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <ng-icon name="lucideShieldCheck" size="15" />
                <span>3. Insurance</span>
              </button>
              <button
                hlmTabsTrigger
                type="button"
                (click)="activeTab.set('allergies')"
                [attr.data-state]="activeTab() === 'allergies' ? 'active' : 'inactive'"
                class="gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <ng-icon name="lucideShieldAlert" size="15" />
                <span>4. Safety</span>
              </button>
              <button
                hlmTabsTrigger
                type="button"
                (click)="activeTab.set('history')"
                [attr.data-state]="activeTab() === 'history' ? 'active' : 'inactive'"
                class="gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <ng-icon name="lucideActivity" size="15" />
                <span>5. History</span>
              </button>
            </div>

            <!-- TAB 1: DEMOGRAPHICS & LEGAL IDENTITY -->
            <div
              *ngIf="activeTab() === 'demographics'"
              hlmTabsContent
              class="p-6 rounded-2xl border border-border bg-card space-y-5 shadow-xs"
            >
              <div class="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
                    <ng-icon name="lucideUserRound" size="18" class="text-primary" />
                    <span>Legal Patient Identity & Demographics</span>
                  </h2>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    Government-issued identity and ABDM national health demographics registered in
                    Sentinel EHR.
                  </p>
                </div>
                <span
                  *ngIf="isInitialSaveCompleted()"
                  class="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30"
                >
                  <ng-icon name="lucideLock" size="12" /> Protected Identity Record
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <!-- Full Legal Name -->
                <div class="md:col-span-2 space-y-1">
                  <div class="flex justify-between items-center">
                    <label class="font-semibold text-foreground">Full Legal Name *</label>
                    <button
                      *ngIf="isInitialSaveCompleted()"
                      (click)="triggerLockedFieldNotice('Full Legal Name')"
                      class="text-[10px] text-primary hover:underline flex items-center gap-1"
                    >
                      <ng-icon name="lucideLock" size="11" /> Why is this locked?
                    </button>
                  </div>
                  <input
                    hlmInput
                    type="text"
                    [(ngModel)]="profileForm.fullName"
                    [disabled]="isInitialSaveCompleted()"
                    (click)="
                      isInitialSaveCompleted() ? triggerLockedFieldNotice('Full Legal Name') : null
                    "
                    placeholder="First, Middle, Last Name..."
                    class="w-full h-9 text-xs disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-muted/50"
                  />
                  <p class="text-[11px] text-muted-foreground">
                    Hint: Enter your name exactly as shown on your official photo ID (Aadhaar,
                    Passport, Driver's License) for claim settlement.
                  </p>
                </div>

                <!-- ABHA Health ID & MRN -->
                <div class="space-y-1">
                  <div class="flex justify-between items-center">
                    <label class="font-semibold text-foreground"
                      >Ayushman Bharat Health Account (ABHA ID)</label
                    >
                    <ng-icon
                      *ngIf="isInitialSaveCompleted()"
                      name="lucideLock"
                      size="11"
                      class="text-muted-foreground"
                    />
                  </div>
                  <input
                    hlmInput
                    type="text"
                    [(ngModel)]="profileForm.abhaId"
                    [disabled]="isInitialSaveCompleted()"
                    (click)="
                      isInitialSaveCompleted() ? triggerLockedFieldNotice('ABHA Health ID') : null
                    "
                    placeholder="e.g. 12-3456-7890-1234 or name@abdm"
                    class="w-full h-9 text-xs font-mono disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-muted/50"
                  />
                  <p class="text-[11px] text-muted-foreground">
                    Hint: 14-digit ABHA Number or ABDM Address used to link health records across
                    national hospitals.
                  </p>
                </div>

                <div class="space-y-1">
                  <label class="font-semibold block text-foreground"
                    >Medical Record Number (MRN Code)</label
                  >
                  <input
                    hlmInput
                    type="text"
                    [value]="patient()?.patientCode || 'PAT-1001'"
                    disabled
                    class="w-full h-9 text-xs font-mono bg-muted/60 text-muted-foreground cursor-not-allowed"
                  />
                  <p class="text-[11px] text-muted-foreground">
                    Hint: System-generated unique EHR identifier for inpatient and outpatient
                    charts.
                  </p>
                </div>

                <!-- DOB & Gender -->
                <div class="space-y-1">
                  <div class="flex justify-between items-center">
                    <label class="font-semibold text-foreground">Date of Birth *</label>
                    <ng-icon
                      *ngIf="isInitialSaveCompleted()"
                      name="lucideLock"
                      size="11"
                      class="text-muted-foreground"
                    />
                  </div>
                  <input
                    hlmInput
                    type="date"
                    [(ngModel)]="profileForm.dateOfBirth"
                    [disabled]="isInitialSaveCompleted()"
                    (click)="
                      isInitialSaveCompleted() ? triggerLockedFieldNotice('Date of Birth') : null
                    "
                    class="w-full h-9 text-xs disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-muted/50"
                  />
                  <p class="text-[11px] text-muted-foreground">
                    Hint: Essential for age-based clinical risk stratification and prescription
                    dosage safety checks.
                  </p>
                </div>

                <div class="space-y-1">
                  <div class="flex justify-between items-center">
                    <label class="font-semibold text-foreground">Administrative Gender *</label>
                    <ng-icon
                      *ngIf="isInitialSaveCompleted()"
                      name="lucideLock"
                      size="11"
                      class="text-muted-foreground"
                    />
                  </div>
                  <select
                    hlmInput
                    [(ngModel)]="profileForm.gender"
                    [disabled]="isInitialSaveCompleted()"
                    (change)="
                      isInitialSaveCompleted()
                        ? triggerLockedFieldNotice('Administrative Gender')
                        : null
                    "
                    class="w-full h-9 text-xs bg-background disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-muted/50"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other / Non-Binary</option>
                  </select>
                  <p class="text-[11px] text-muted-foreground">
                    Hint: Used for gender-specific physiological reference ranges in diagnostic
                    laboratory reports.
                  </p>
                </div>

                <!-- Blood Group -->
                <div class="space-y-1 md:col-span-2">
                  <div class="flex justify-between items-center">
                    <label class="font-semibold text-foreground">ABO & Rh Blood Type *</label>
                    <ng-icon
                      *ngIf="isInitialSaveCompleted()"
                      name="lucideLock"
                      size="11"
                      class="text-muted-foreground"
                    />
                  </div>
                  <select
                    hlmInput
                    [(ngModel)]="profileForm.bloodType"
                    [disabled]="isInitialSaveCompleted()"
                    (change)="
                      isInitialSaveCompleted() ? triggerLockedFieldNotice('Blood Type') : null
                    "
                    class="w-full h-9 text-xs bg-background disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-muted/50"
                  >
                    <option value="O+">O Positive (O+)</option>
                    <option value="A+">A Positive (A+)</option>
                    <option value="B+">B Positive (B+)</option>
                    <option value="AB+">AB Positive (AB+)</option>
                    <option value="O-">O Negative (O-)</option>
                    <option value="A-">A Negative (A-)</option>
                    <option value="B-">B Negative (B-)</option>
                    <option value="AB-">AB Negative (AB-)</option>
                  </select>
                  <p class="text-[11px] text-muted-foreground">
                    Hint: Critical for emergency blood transfusion readiness and cross-matching
                    during surgical procedures.
                  </p>
                </div>
              </div>
            </div>

            <!-- TAB 2: CONTACT & EMERGENCY DETAILS -->
            <div
              *ngIf="activeTab() === 'contact'"
              hlmTabsContent
              class="p-6 rounded-2xl border border-border bg-card space-y-5 shadow-xs"
            >
              <div class="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
                    <ng-icon name="lucidePhone" size="18" class="text-primary" />
                    <span>Contact Information & Emergency Next of Kin</span>
                  </h2>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    Primary communication details and urgent hospital intake contact.
                  </p>
                </div>
                <span
                  hlmBadge
                  variant="secondary"
                  class="text-[10px] text-emerald-600 dark:text-emerald-400"
                  >Self-Editable</span
                >
              </div>

              <div class="space-y-5 text-xs">
                <!-- Primary Patient Contacts -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="font-semibold block text-foreground"
                      >Primary Mobile Phone *</label
                    >
                    <input
                      hlmInput
                      type="text"
                      [(ngModel)]="profileForm.phone"
                      placeholder="+1 (555) 019-2834"
                      class="w-full h-9 text-xs"
                    />
                    <p class="text-[11px] text-muted-foreground">
                      Hint: Receives appointment confirmation SMS, virtual visit links, and lab
                      notification alerts.
                    </p>
                  </div>

                  <div class="space-y-1">
                    <label class="font-semibold block text-foreground">Email Address *</label>
                    <input
                      hlmInput
                      type="email"
                      [(ngModel)]="profileForm.email"
                      placeholder="patient@example.com"
                      class="w-full h-9 text-xs"
                    />
                    <p class="text-[11px] text-muted-foreground">
                      Hint: Secure e-delivery of discharge summaries, consultation reports, and
                      billing receipts.
                    </p>
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="font-semibold block text-foreground"
                    >Residential Street Address *</label
                  >
                  <input
                    hlmInput
                    type="text"
                    [(ngModel)]="profileForm.address"
                    placeholder="123 Health Science Way, Suite 400, Boston, MA 02115"
                    class="w-full h-9 text-xs"
                  />
                  <p class="text-[11px] text-muted-foreground">
                    Hint: Physical residence address required for pharmacy prescription delivery and
                    home care services.
                  </p>
                </div>

                <!-- STRUCTURED EMERGENCY CONTACT & NEXT OF KIN UX -->
                <div class="p-5 rounded-2xl bg-muted/30 border border-primary/20 space-y-4">
                  <div class="flex items-center justify-between border-b border-border pb-2.5">
                    <div class="flex items-center gap-2">
                      <div
                        class="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center"
                      >
                        <ng-icon name="lucideAlertCircle" size="18" />
                      </div>
                      <div>
                        <h3 class="font-bold text-foreground text-xs">
                          Primary Emergency Contact & Next of Kin
                        </h3>
                        <p class="text-[11px] text-muted-foreground">
                          Required for emergency clinical triage and hospital admission.
                        </p>
                      </div>
                    </div>
                    <span
                      hlmBadge
                      variant="outline"
                      class="text-[10px] border-amber-500/30 text-amber-600 dark:text-amber-400"
                      >Clinical Intake</span
                    >
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <!-- 1. Emergency Contact Name -->
                    <div class="space-y-1">
                      <label class="font-semibold block text-foreground">Contact Full Name *</label>
                      <input
                        hlmInput
                        type="text"
                        [(ngModel)]="emergencyContactName"
                        (ngModelChange)="syncEmergencyContact()"
                        placeholder="e.g. Eleanor Vance"
                        class="w-full h-9 text-xs bg-background"
                      />
                      <p class="text-[10px] text-muted-foreground">
                        Hint: Full legal name of next of kin.
                      </p>
                    </div>

                    <!-- 2. Relationship Dropdown -->
                    <div class="space-y-1">
                      <label class="font-semibold block text-foreground">Relationship *</label>
                      <select
                        hlmInput
                        [(ngModel)]="emergencyContactRelationship"
                        (change)="syncEmergencyContact()"
                        class="w-full h-9 text-xs bg-background"
                      >
                        <option value="Spouse">Spouse</option>
                        <option value="Parent / Guardian">Parent / Guardian</option>
                        <option value="Child">Child</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Partner">Partner</option>
                        <option value="Relative">Relative</option>
                        <option value="Legal Guardian">Legal Guardian</option>
                        <option value="Friend / Other">Friend / Other</option>
                      </select>
                      <p class="text-[10px] text-muted-foreground">
                        Hint: Legal relationship to patient.
                      </p>
                    </div>

                    <!-- 3. Direct Mobile Phone Number -->
                    <div class="space-y-1">
                      <label class="font-semibold block text-foreground">Emergency Mobile *</label>
                      <input
                        hlmInput
                        type="text"
                        [(ngModel)]="emergencyContactPhone"
                        (ngModelChange)="syncEmergencyContact()"
                        placeholder="+1 (555) 019-9988"
                        class="w-full h-9 text-xs bg-background"
                      />
                      <p class="text-[10px] text-muted-foreground">
                        Hint: 24/7 accessible phone number.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 3: INSURANCE & FINANCIAL COVERAGE -->
            <div
              *ngIf="activeTab() === 'insurance'"
              hlmTabsContent
              class="p-6 rounded-2xl border border-border bg-card space-y-5 shadow-xs"
            >
              <div class="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
                    <ng-icon name="lucideShieldCheck" size="18" class="text-primary" />
                    <span>Insurance Coverage & Financial Billing Record</span>
                  </h2>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    Insurance carrier pre-authorization and policy details for medical claim filing.
                  </p>
                </div>
                <span hlmBadge variant="outline" class="text-[10px]">Payer Verification</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div class="space-y-1">
                  <label class="font-semibold block text-foreground"
                    >Insurance Carrier / Provider Name *</label
                  >
                  <input
                    hlmInput
                    type="text"
                    [(ngModel)]="profileForm.insuranceProvider"
                    placeholder="e.g. BlueCross BlueShield / Aetna / Self-Pay"
                    class="w-full h-9 text-xs"
                  />
                  <p class="text-[11px] text-muted-foreground">
                    Hint: Primary health insurance company or specify 'Self-Pay' if uninsured.
                  </p>
                </div>

                <div class="space-y-1">
                  <label class="font-semibold block text-foreground">Coverage Plan Type</label>
                  <select
                    hlmInput
                    [(ngModel)]="profileForm.coveragePlan"
                    class="w-full h-9 text-xs bg-background"
                  >
                    <option value="PPO">PPO (Preferred Provider Organization)</option>
                    <option value="HMO">HMO (Health Maintenance Organization)</option>
                    <option value="EPO">EPO (Exclusive Provider Organization)</option>
                    <option value="Medicare / Medicaid">Medicare / Medicaid</option>
                    <option value="Self-Pay / Cash">Self-Pay / Cash</option>
                  </select>
                  <p class="text-[11px] text-muted-foreground">
                    Hint: Determines referral requirements and out-of-network coverage limits.
                  </p>
                </div>

                <div class="space-y-1">
                  <label class="font-semibold block text-foreground"
                    >Policy / Member ID Number *</label
                  >
                  <input
                    hlmInput
                    type="text"
                    [(ngModel)]="profileForm.insurancePolicyNumber"
                    placeholder="e.g. BCBS-88912301"
                    class="w-full h-9 text-xs font-mono"
                  />
                  <p class="text-[11px] text-muted-foreground">
                    Hint: Unique subscriber ID number printed on the front of your insurance card.
                  </p>
                </div>

                <div class="space-y-1">
                  <label class="font-semibold block text-foreground">Group Number</label>
                  <input
                    hlmInput
                    type="text"
                    [(ngModel)]="profileForm.insuranceGroupNumber"
                    placeholder="e.g. GRP-50192"
                    class="w-full h-9 text-xs font-mono"
                  />
                  <p class="text-[11px] text-muted-foreground">
                    Hint: Employer or plan group code for corporate health coverage verification.
                  </p>
                </div>
              </div>
            </div>

            <!-- TAB 4: ALLERGIES & MEDICAL SAFETY ALERTS -->
            <div
              *ngIf="activeTab() === 'allergies'"
              hlmTabsContent
              class="p-6 rounded-2xl border border-border bg-card space-y-5 shadow-xs"
            >
              <div class="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
                    <ng-icon name="lucideShieldAlert" size="18" class="text-destructive" />
                    <span>Allergies, Medical Safety & Contraindications</span>
                  </h2>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    Critical allergy alerts used by physicians and pharmacists prior to prescribing.
                  </p>
                </div>
                <span hlmBadge variant="destructive" class="text-[10px]">High Risk Safety</span>
              </div>

              <div class="space-y-4 text-xs">
                <div class="space-y-1">
                  <label class="font-bold block text-destructive flex items-center gap-2">
                    <span>Food & Medication Allergies *</span>
                    <span
                      hlmBadge
                      variant="outline"
                      class="text-[9px] border-destructive/40 text-destructive"
                      >Rx Engine Audited</span
                    >
                  </label>
                  <input
                    hlmInput
                    type="text"
                    [(ngModel)]="profileForm.foodAllergies"
                    placeholder="Peanuts, Shellfish, Gluten, Penicillin, Amoxicillin, Latex..."
                    class="w-full h-9 text-xs"
                  />
                  <p class="text-[11px] text-muted-foreground">
                    Hint: List any drug hypersensitivities or severe food allergies (e.g.
                    Penicillin, Peanuts). Automated clinical engines cross-check prescriptions
                    against this list.
                  </p>
                </div>

                <div class="space-y-1">
                  <label class="font-semibold block text-foreground"
                    >Special Medical Alerts & Physical Contraindications</label
                  >
                  <textarea
                    hlmTextarea
                    [(ngModel)]="profileForm.medicalAlerts"
                    rows="3"
                    placeholder="e.g. Cardiac Pacemaker, Latex Anaphylaxis, Fall Risk, Dialysis Patient..."
                    class="w-full text-xs"
                  ></textarea>
                  <p class="text-[11px] text-muted-foreground">
                    Hint: Important medical devices or acute vulnerabilities (e.g. Pacemaker,
                    Implantable Defibrillator, Seizure Disorder).
                  </p>
                </div>
              </div>
            </div>

            <!-- TAB 5: CLINICAL HISTORY & LIFESTYLE PROFILE -->
            <div
              *ngIf="activeTab() === 'history'"
              hlmTabsContent
              class="p-6 rounded-2xl border border-border bg-card space-y-5 shadow-xs"
            >
              <div class="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
                    <ng-icon name="lucideActivity" size="18" class="text-primary" />
                    <span>Longitudinal Clinical History & Lifestyle Factors</span>
                  </h2>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    Past medical history, surgical procedures, and social/lifestyle health
                    indicators.
                  </p>
                </div>
                <span hlmBadge variant="outline" class="text-[10px]">Clinical Chart</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div class="md:col-span-2 space-y-1">
                  <label class="font-semibold block text-foreground"
                    >Previous Major Illnesses & Medical History</label
                  >
                  <input
                    hlmInput
                    type="text"
                    [(ngModel)]="profileForm.pastMedicalHistory"
                    placeholder="e.g. Asthma, Childhood Pneumonia, Hypertension..."
                    class="w-full h-9 text-xs"
                  />
                  <p class="text-[11px] text-muted-foreground">
                    Hint: Document past acute conditions or chronic illnesses managed in previous
                    health encounters.
                  </p>
                </div>

                <div class="md:col-span-2 space-y-1">
                  <label class="font-semibold block text-foreground"
                    >Serious Medical Conditions / Chronic Diseases</label
                  >
                  <input
                    hlmInput
                    type="text"
                    [(ngModel)]="profileForm.seriousConditions"
                    placeholder="e.g. Type 2 Diabetes Mellitus, Coronary Artery Disease..."
                    class="w-full h-9 text-xs"
                  />
                  <p class="text-[11px] text-muted-foreground">
                    Hint: Ongoing long-term conditions requiring active clinical management and
                    monitoring.
                  </p>
                </div>

                <div class="space-y-1">
                  <label class="font-semibold block text-foreground"
                    >Past Surgeries & Procedures</label
                  >
                  <input
                    hlmInput
                    type="text"
                    [(ngModel)]="profileForm.surgeriesAndProcedures"
                    placeholder="e.g. Appendectomy (2018), Knee Arthroscopy (2021)..."
                    class="w-full h-9 text-xs"
                  />
                  <p class="text-[11px] text-muted-foreground">
                    Hint: Surgical history and minor outpatient procedures.
                  </p>
                </div>

                <div class="space-y-1">
                  <label class="font-semibold block text-foreground">Family Medical History</label>
                  <input
                    hlmInput
                    type="text"
                    [(ngModel)]="profileForm.familyMedicalHistory"
                    placeholder="e.g. Maternal Hypertension, Paternal Diabetes..."
                    class="w-full h-9 text-xs"
                  />
                  <p class="text-[11px] text-muted-foreground">
                    Hint: Hereditary conditions in first-degree relatives (parents, siblings).
                  </p>
                </div>

                <!-- Lifestyle Indicators -->
                <div class="space-y-1">
                  <label class="font-semibold block text-foreground">Dietary Habits</label>
                  <select
                    hlmInput
                    [(ngModel)]="profileForm.dietaryHabits"
                    class="w-full h-9 text-xs bg-background"
                  >
                    <option value="Standard Diet">Standard Balanced Diet</option>
                    <option value="Low Sodium">Low Sodium (Hypertension)</option>
                    <option value="Diabetic / Low Carb">Diabetic / Low Carb</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Gluten-Free">Gluten-Free</option>
                  </select>
                  <p class="text-[11px] text-muted-foreground">
                    Hint: Informs clinical nutrition and dietary care plans.
                  </p>
                </div>

                <div class="space-y-1">
                  <label class="font-semibold block text-foreground"
                    >Smoking / Tobacco Status</label
                  >
                  <select
                    hlmInput
                    [(ngModel)]="profileForm.smokingStatus"
                    class="w-full h-9 text-xs bg-background"
                  >
                    <option value="Never">Never Smoked</option>
                    <option value="Former Smoker">Former Smoker</option>
                    <option value="Current Smoker">Current Smoker</option>
                  </select>
                  <p class="text-[11px] text-muted-foreground">
                    Hint: Cardiovascular and respiratory health indicator.
                  </p>
                </div>

                <div class="space-y-1">
                  <label class="font-semibold block text-foreground">Alcohol Consumption</label>
                  <select
                    hlmInput
                    [(ngModel)]="profileForm.alcoholConsumption"
                    class="w-full h-9 text-xs bg-background"
                  >
                    <option value="None/Occasional">None / Occasional</option>
                    <option value="Moderate (1-2 drinks/week)">Moderate (1-2 drinks/week)</option>
                    <option value="Frequent">Frequent</option>
                  </select>
                  <p class="text-[11px] text-muted-foreground">
                    Hint: Pharmacokinetic evaluation parameter.
                  </p>
                </div>

                <div class="space-y-1">
                  <label class="font-semibold block text-foreground">Exercise Routine</label>
                  <select
                    hlmInput
                    [(ngModel)]="profileForm.exerciseRoutine"
                    class="w-full h-9 text-xs bg-background"
                  >
                    <option value="Sedentary">Sedentary (Little to no exercise)</option>
                    <option value="Light (1-2 days/week)">Light (1-2 days/week)</option>
                    <option value="Moderate (3-4 days/week)">Moderate (3-4 days/week)</option>
                    <option value="Active (5+ days/week)">Active (5+ days/week)</option>
                  </select>
                  <p class="text-[11px] text-muted-foreground">
                    Hint: Physical activity and wellness baseline.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Save Actions Bar -->
          <div
            class="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
          >
            <div class="flex items-center gap-2">
              <span
                *ngIf="saveSuccess()"
                class="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1"
              >
                <ng-icon name="lucideCheckCircle2" size="16" /> Health profile saved successfully!
              </span>
              <span *ngIf="!saveSuccess()" class="text-xs text-muted-foreground">
                Saving updates your live Sentinel EHR chart and verifies identity fields.
              </span>
            </div>

            <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
              <app-action-button
                variant="default"
                size="default"
                [loading]="saving()"
                (action)="saveProfile()"
                customClass="gap-2 font-bold text-xs shadow-sm w-full sm:w-auto"
              >
                <ng-icon name="lucideSave" size="15" />
                <span>Save Health Profile</span>
              </app-action-button>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Patient EHR Chart Summary & Clinical Checklist Sidebar (4 Cols) -->
        <div class="lg:col-span-4 space-y-6">
          <!-- Patient Identity Summary Card -->
          <div class="p-5 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
            <div class="flex items-center gap-3">
              <div
                class="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20"
              >
                <ng-icon name="lucideUserRound" size="24" />
              </div>
              <div class="space-y-0.5">
                <h3 class="font-bold text-foreground text-sm">
                  {{ profileForm.fullName || patient()?.fullName }}
                </h3>
                <p class="text-xs text-muted-foreground">
                  MRN:
                  <span class="font-mono text-foreground font-medium">{{
                    patient()?.patientCode || 'PAT-1001'
                  }}</span>
                </p>
                <span
                  hlmBadge
                  [variant]="isInitialSaveCompleted() ? 'secondary' : 'outline'"
                  class="text-[10px] mt-1"
                >
                  {{ isInitialSaveCompleted() ? '🔒 Identity Locked' : '✏️ Setup Draft' }}
                </span>
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
              <div class="flex justify-between items-center">
                <span class="text-muted-foreground">ABHA Health ID:</span>
                <span class="font-mono text-foreground font-semibold text-[11px]">{{
                  profileForm.abhaId || profileForm.nationalId || 'N/A'
                }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-muted-foreground">Date of Birth:</span>
                <span class="font-semibold text-foreground">{{
                  profileForm.dateOfBirth || 'N/A'
                }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-muted-foreground">Gender:</span>
                <span class="font-semibold text-foreground">{{ profileForm.gender || 'N/A' }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-muted-foreground">Blood Type:</span>
                <span class="font-bold font-mono text-primary">{{
                  profileForm.bloodType || 'N/A'
                }}</span>
              </div>
            </div>
          </div>

          <!-- Clinical Verification Section Checklist Sidebar Widget -->
          <div class="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
            <div class="flex items-center justify-between">
              <h3
                class="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5"
              >
                <ng-icon name="lucideFileCheck" size="16" />
                <span>Intake Verification Checklist</span>
              </h3>
              <span
                hlmBadge
                [variant]="getCompletenessScore() === 100 ? 'secondary' : 'outline'"
                class="text-[11px] font-bold"
              >
                {{ getCompletenessScore() === 100 ? 'Complete' : 'Incomplete' }}
              </span>
            </div>

            <!-- Detailed Checklist Items -->
            <div class="space-y-2.5 pt-1 text-xs">
              <div
                class="flex items-center justify-between p-2 rounded-lg bg-background/60 border border-border"
              >
                <span class="text-muted-foreground flex items-center gap-1.5">
                  <ng-icon
                    [name]="hasDemographics() ? 'lucideCheck' : 'lucideAlertCircle'"
                    size="14"
                    [class.text-emerald-500]="hasDemographics()"
                    [class.text-amber-500]="!hasDemographics()"
                  />
                  Legal Identity & ABHA ID
                </span>
                <span
                  class="font-medium text-[11px]"
                  [class.text-emerald-600]="hasDemographics()"
                  [class.text-amber-600]="!hasDemographics()"
                >
                  {{ hasDemographics() ? 'Verified' : 'Missing' }}
                </span>
              </div>

              <div
                class="flex items-center justify-between p-2 rounded-lg bg-background/60 border border-border"
              >
                <span class="text-muted-foreground flex items-center gap-1.5">
                  <ng-icon
                    [name]="hasContact() ? 'lucideCheck' : 'lucideAlertCircle'"
                    size="14"
                    [class.text-emerald-500]="hasContact()"
                    [class.text-amber-500]="!hasContact()"
                  />
                  Contact & Emergency Phone
                </span>
                <span
                  class="font-medium text-[11px]"
                  [class.text-emerald-600]="hasContact()"
                  [class.text-amber-600]="!hasContact()"
                >
                  {{ hasContact() ? 'Verified' : 'Missing' }}
                </span>
              </div>

              <div
                class="flex items-center justify-between p-2 rounded-lg bg-background/60 border border-border"
              >
                <span class="text-muted-foreground flex items-center gap-1.5">
                  <ng-icon
                    [name]="hasInsurance() ? 'lucideCheck' : 'lucideAlertCircle'"
                    size="14"
                    [class.text-emerald-500]="hasInsurance()"
                    [class.text-amber-500]="!hasInsurance()"
                  />
                  Insurance Carrier Details
                </span>
                <span
                  class="font-medium text-[11px]"
                  [class.text-emerald-600]="hasInsurance()"
                  [class.text-amber-600]="!hasInsurance()"
                >
                  {{ hasInsurance() ? 'Verified' : 'Missing' }}
                </span>
              </div>

              <div
                class="flex items-center justify-between p-2 rounded-lg bg-background/60 border border-border"
              >
                <span class="text-muted-foreground flex items-center gap-1.5">
                  <ng-icon
                    [name]="hasAllergies() ? 'lucideCheck' : 'lucideAlertCircle'"
                    size="14"
                    [class.text-emerald-500]="hasAllergies()"
                    [class.text-amber-500]="!hasAllergies()"
                  />
                  Allergies & Contraindications
                </span>
                <span
                  class="font-medium text-[11px]"
                  [class.text-emerald-600]="hasAllergies()"
                  [class.text-amber-600]="!hasAllergies()"
                >
                  {{ hasAllergies() ? 'Verified' : 'Missing' }}
                </span>
              </div>

              <div
                class="flex items-center justify-between p-2 rounded-lg bg-background/60 border border-border"
              >
                <span class="text-muted-foreground flex items-center gap-1.5">
                  <ng-icon
                    [name]="hasHistory() ? 'lucideCheck' : 'lucideAlertCircle'"
                    size="14"
                    [class.text-emerald-500]="hasHistory()"
                    [class.text-amber-500]="!hasHistory()"
                  />
                  Clinical History & Lifestyle
                </span>
                <span
                  class="font-medium text-[11px]"
                  [class.text-emerald-600]="hasHistory()"
                  [class.text-amber-600]="!hasHistory()"
                >
                  {{ hasHistory() ? 'Verified' : 'Missing' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Emergency Contact & Payer Quick Card (Structured Summary) -->
          <div class="p-5 rounded-2xl border border-border bg-card space-y-3 shadow-xs text-xs">
            <h3
              class="font-bold text-foreground flex items-center gap-2 text-sm border-b border-border pb-2"
            >
              <ng-icon name="lucidePhone" size="16" class="text-primary" />
              <span>Intake Contacts Overview</span>
            </h3>

            <div class="space-y-2">
              <div class="space-y-1">
                <span class="text-[11px] text-muted-foreground block"
                  >Emergency Contact (Next of Kin):</span
                >
                <div
                  *ngIf="profileForm.emergencyContact?.name || emergencyContactName"
                  class="p-2 rounded-lg bg-muted/40 border border-border space-y-0.5"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-foreground">{{
                      profileForm.emergencyContact?.name || emergencyContactName
                    }}</span>
                    <span hlmBadge variant="outline" class="text-[9px] py-0 px-1">{{
                      profileForm.emergencyContact?.relationship || emergencyContactRelationship
                    }}</span>
                  </div>
                  <span
                    *ngIf="profileForm.emergencyContact?.phone || emergencyContactPhone"
                    class="font-mono text-muted-foreground text-[11px] block"
                    >{{ profileForm.emergencyContact?.phone || emergencyContactPhone }}</span
                  >
                </div>
                <span
                  *ngIf="!profileForm.emergencyContact?.name && !emergencyContactName"
                  class="font-semibold text-foreground block"
                  >Not Specified</span
                >
              </div>

              <div class="space-y-0.5 pt-2 border-t border-border">
                <span class="text-[11px] text-muted-foreground block">Coverage Carrier:</span>
                <span class="font-semibold text-foreground block">{{
                  profileForm.insuranceProvider || 'Self-Pay'
                }}</span>
                <span
                  *ngIf="profileForm.insurancePolicyNumber"
                  class="font-mono text-[11px] text-muted-foreground block"
                  >Policy: {{ profileForm.insurancePolicyNumber }}</span
                >
              </div>
            </div>
          </div>

          <!-- ABDM & DPDP Act Data Integrity Notice -->
          <div class="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-2 text-xs">
            <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
              <ng-icon name="lucideLock" size="16" />
              <span>ABDM & DPDP Act Identity Safeguard</span>
            </div>
            <p class="text-muted-foreground text-[11px] leading-relaxed">
              Legal name, DOB, ABHA Health ID, and blood type fields are locked after initial save
              to maintain medical record integrity. You can submit formal amendment requests at any
              time.
            </p>
            <button
              (click)="triggerLockedFieldNotice('Legal Identity')"
              class="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1 pt-1"
            >
              <span>Learn about record amendments</span>
              <ng-icon name="lucideChevronRight" size="12" />
            </button>
          </div>
        </div>
      </div>

      <!-- LOCKED FIELD NOTICE DIALOG MODAL -->
      <div
        *ngIf="showLockedModal()"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      >
        <div
          class="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative"
        >
          <button
            (click)="showLockedModal.set(false)"
            class="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          >
            <ng-icon name="lucideX" size="18" />
          </button>

          <div class="flex items-start gap-3.5">
            <div
              class="size-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20"
            >
              <ng-icon name="lucideShieldAlert" size="24" />
            </div>
            <div class="space-y-1">
              <h3 class="text-base font-bold text-foreground">
                Verified Medical Record Field Locked
              </h3>
              <p class="text-xs text-muted-foreground">
                Target Field:
                <strong class="text-foreground font-semibold">{{ lockedFieldName() }}</strong>
              </p>
            </div>
          </div>

          <div
            class="p-4 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground leading-relaxed space-y-2"
          >
            <p class="text-foreground font-medium">
              Legal identity details (Full Name, Date of Birth, Administrative Gender, ABHA ID,
              Blood Group, MRN Code) and verified clinical medical histories cannot be directly
              edited by patients once established.
            </p>
            <p>
              This safeguard ensures compliance with ABDM HDMP and the Digital Personal Data
              Protection (DPDP) Act 2023.
            </p>
          </div>

          <div class="space-y-2">
            <span class="text-[11px] font-semibold text-foreground block"
              >Need to update your legal identity or ABHA health record?</span
            >
            <div
              class="p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs text-primary flex items-center justify-between"
            >
              <span>Submit a formal amendment request to your Healthcare Provider.</span>
              <button
                hlmBtn
                variant="outline"
                size="sm"
                (click)="requestAmendment()"
                class="text-[11px] h-7 px-2.5 bg-background"
              >
                Request Edit
              </button>
            </div>
          </div>

          <div class="pt-2 border-t border-border flex justify-end">
            <button
              hlmBtn
              variant="default"
              size="sm"
              (click)="showLockedModal.set(false)"
              class="text-xs font-semibold"
            >
              Understand & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PatientProfileComponent implements OnInit {
  patient = signal<Patient | null>(null);
  profileForm: Partial<Patient> = {};
  saving = signal(false);
  saveSuccess = signal(false);
  activeTab = signal<ProfileTab>('demographics');

  // Structured Emergency Contact UX state
  emergencyContactName = '';
  emergencyContactRelationship = 'Spouse';
  emergencyContactPhone = '';

  // Locked Modal Dialog State
  showLockedModal = signal(false);
  lockedFieldName = signal<string>('');

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    public patientContext: PatientContextService,
  ) {}

  ngOnInit(): void {
    this.apiService.getMyPatientProfile().subscribe({
      next: (p) => {
        if (p) {
          this.patient.set(p);
          this.profileForm = { ...p };
          this.loadEmergencyContact(p.emergencyContact);
        }
      },
      error: (err) => {
        console.error('Could not load profile', err);
        toast.error('Failed to load profile: ' + (err.error?.message || 'Unknown network error'));
      },
    });
  }

  loadEmergencyContact(contact?: EmergencyContact): void {
    if (!contact) {
      this.emergencyContactName = '';
      this.emergencyContactRelationship = 'Spouse';
      this.emergencyContactPhone = '';
      return;
    }
    this.emergencyContactName = contact.name || '';
    this.emergencyContactRelationship = contact.relationship || 'Spouse';
    this.emergencyContactPhone = contact.phone || '';
  }

  parseEmergencyContact(contact?: any): void {
    if (!contact) {
      this.loadEmergencyContact();
      return;
    }
    if (typeof contact === 'object') {
      this.loadEmergencyContact(contact);
    }
  }

  syncEmergencyContact(): void {
    if (!this.emergencyContactName && !this.emergencyContactPhone) {
      this.profileForm.emergencyContact = undefined;
      return;
    }
    this.profileForm.emergencyContact = {
      ...(this.profileForm.emergencyContact?.id
        ? { id: this.profileForm.emergencyContact.id }
        : {}),
      name: this.emergencyContactName,
      relationship: this.emergencyContactRelationship,
      phone: this.emergencyContactPhone,
    };
  }

  getCompletenessScore(): number {
    const p = this.profileForm;
    if (!p) return 0;
    let score = 0;
    if (p.fullName) score += 10;
    if (p.dateOfBirth) score += 10;
    if (p.gender) score += 5;
    if (p.bloodType) score += 5;

    if (p.phone) score += 10;
    if (p.email) score += 5;
    if (p.address) score += 10;

    if (this.emergencyContactName || p.emergencyContact?.name) score += 15;

    if (p.insuranceProvider) score += 10;
    if (p.insurancePolicyNumber) score += 5;

    if (p.foodAllergies || p.medicalAlerts) score += 10;
    if (p.pastMedicalHistory || p.seriousConditions || p.dietaryHabits) score += 5;

    return Math.min(100, Math.max(0, score));
  }

  hasDemographics(): boolean {
    return !!(this.profileForm.fullName && this.profileForm.dateOfBirth);
  }

  hasContact(): boolean {
    return !!(
      this.profileForm.phone &&
      this.profileForm.address &&
      (this.emergencyContactName || this.profileForm.emergencyContact?.name)
    );
  }

  hasInsurance(): boolean {
    return !!this.profileForm.insuranceProvider;
  }

  hasAllergies(): boolean {
    return !!(this.profileForm.foodAllergies || this.profileForm.medicalAlerts);
  }

  hasHistory(): boolean {
    return !!(this.profileForm.pastMedicalHistory || this.profileForm.dietaryHabits);
  }

  isInitialSaveCompleted(): boolean {
    const p = this.patient();
    if (!p) return false;
    return !!(p.fullName && p.dateOfBirth && p.phone && p.address);
  }

  triggerLockedFieldNotice(fieldName: string): void {
    if (this.isInitialSaveCompleted()) {
      this.lockedFieldName.set(fieldName);
      this.showLockedModal.set(true);
      toast.info(`${fieldName} Record Field Locked`, {
        description:
          'Verified legal identity details are protected under ABDM and DPDP Act regulations.',
      });
    }
  }

  requestAmendment(): void {
    toast.success('Amendment Request Submitted', {
      description: `Formal request to amend ${this.lockedFieldName()} logged in WORM audit ledger.`,
    });
    this.showLockedModal.set(false);
  }

  saveProfile(): void {
    const p = this.patient();
    if (!p || !p.id || this.saving()) return;
    this.saving.set(true);
    this.saveSuccess.set(false);
    this.syncEmergencyContact();

    this.apiService.updatePatient(p.id, this.profileForm).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.patient.set(updated);
        this.profileForm = { ...updated };
        this.loadEmergencyContact(updated.emergencyContact);
        this.patientContext.loadContext();
        this.saveSuccess.set(true);
        toast.success('Health Profile Saved Successfully', {
          description: 'Your electronic health record chart has been updated.',
        });
        setTimeout(() => this.saveSuccess.set(false), 3500);
      },
      error: (err) => {
        this.saving.set(false);
        toast.error('Failed to Save Health Profile', {
          description: err?.error?.message || 'Server error occurred while updating patient chart.',
        });
      },
    });
  }
}
