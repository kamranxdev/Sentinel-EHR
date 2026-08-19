import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrganizationService } from '../../core/services/organization.service';
import {
  OrganizationRegistrationRequest,
  Organization,
} from '../../core/models/organization.model';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2,
  lucideShieldCheck,
  lucideUserCheck,
  lucideCheckCircle2,
  lucideAlertCircle,
  lucideArrowRight,
  lucideArrowLeft,
  lucideLock,
  lucideMail,
  lucideFileText,
  lucidePhone,
  lucideMapPin,
  lucideHeartPulse,
  lucideHome,
  lucideKeyRound,
  lucideLoader2,
  lucideUserPlus,
  lucideUser,
  lucideBadgeCheck,
  lucideActivity,
  lucideCheck,
  lucideSparkles,
} from '@ng-icons/lucide';

interface StepItem {
  number: 1 | 2 | 3;
  title: string;
  subtitle: string;
  description: string;
}

@Component({
  selector: 'app-register-org',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HlmButtonImports,
    HlmInputImports,
    HlmBadgeImports,
    HlmCardImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideBuilding2,
      lucideShieldCheck,
      lucideUserCheck,
      lucideCheckCircle2,
      lucideAlertCircle,
      lucideArrowRight,
      lucideArrowLeft,
      lucideLock,
      lucideMail,
      lucideFileText,
      lucidePhone,
      lucideMapPin,
      lucideHeartPulse,
      lucideHome,
      lucideKeyRound,
      lucideLoader2,
      lucideUserPlus,
      lucideUser,
      lucideBadgeCheck,
      lucideActivity,
      lucideCheck,
      lucideSparkles,
    }),
  ],
  template: `
    <div
      class="min-h-screen bg-background text-foreground flex flex-col lg:flex-row overflow-hidden font-sans"
    >
      <!-- LEFT FULL COLUMN STEP TRACKER & GOVERNANCE SIDEBAR (PRIMARY BRANDED) -->
      <div
        class="hidden lg:flex lg:w-5/12 xl:w-4/12 bg-primary text-primary-foreground border-r border-primary/20 p-7 xl:p-9 flex-col justify-between relative overflow-hidden h-screen select-none"
      >
        <!-- Subtle Ambient Background Accents for Depth -->
        <div
          class="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"
        ></div>
        <div
          class="absolute -bottom-24 -left-24 w-72 h-72 bg-black/10 rounded-full blur-3xl pointer-events-none"
        ></div>

        <!-- 1. Top Brand Header -->
        <div class="relative z-10">
          <div class="flex items-center gap-3">
            <div
              class="size-10 rounded-xl bg-white text-primary flex items-center justify-center shadow-lg shadow-black/10 ring-1 ring-white/40"
            >
              <ng-icon name="lucideHeartPulse" size="20" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-lg tracking-tight text-white">Sentinel</span>
                <span
                  class="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-white/15 text-white border border-white/25 backdrop-blur-xs"
                >
                  Enterprise Cloud
                </span>
              </div>
              <p class="text-xs text-white/80">Healthcare Tenant Onboarding & Governance</p>
            </div>
          </div>
        </div>

        <!-- 2. Full Column Step Tracker / Timeline -->
        <div class="relative z-10 my-auto py-2 space-y-0">
          <div
            *ngFor="let step of steps; let last = last; let i = index"
            class="relative flex items-start gap-4 group"
          >
            <!-- Connecting Vertical Line -->
            <div
              *ngIf="!last"
              class="absolute left-[17px] top-9 w-0.5 h-[calc(100%-12px)] transition-colors duration-300"
              [ngClass]="{
                'bg-emerald-400': currentStep() > step.number,
                'bg-white/40': currentStep() === step.number,
                'bg-white/15': currentStep() < step.number,
              }"
            ></div>

            <!-- Step Node Icon / Status Indicator -->
            <div
              (click)="canJumpToStep(step.number) ? goToStep(step.number) : null"
              [class.cursor-pointer]="canJumpToStep(step.number)"
              class="relative z-10 size-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-all duration-300 shadow-sm"
              [ngClass]="{
                'bg-white text-primary ring-4 ring-white/30 shadow-lg shadow-black/15 scale-105':
                  currentStep() === step.number,
                'bg-emerald-400 text-slate-950 shadow-emerald-500/30': currentStep() > step.number,
                'bg-white/10 text-white/60 border border-white/20 group-hover:border-white/40 group-hover:text-white':
                  currentStep() < step.number,
              }"
            >
              <ng-icon
                *ngIf="currentStep() > step.number"
                name="lucideCheck"
                size="16"
                class="stroke-2"
              />
              <span *ngIf="currentStep() <= step.number">{{ step.number }}</span>
            </div>

            <!-- Step Details Card / Row -->
            <div
              (click)="canJumpToStep(step.number) ? goToStep(step.number) : null"
              [class.cursor-pointer]="canJumpToStep(step.number)"
              class="flex-1 pb-6 transition-all duration-200"
            >
              <div class="flex items-center justify-between gap-2">
                <p
                  class="text-sm font-semibold tracking-tight transition-colors"
                  [ngClass]="{
                    'text-white font-bold': currentStep() === step.number,
                    'text-white/95': currentStep() > step.number,
                    'text-white/60': currentStep() < step.number,
                  }"
                >
                  {{ step.title }}
                </p>

                <!-- Status Badge -->
                <span
                  *ngIf="currentStep() === step.number"
                  class="inline-flex items-center gap-1 text-[10px] font-semibold text-white px-2 py-0.5 rounded-full bg-white/20 border border-white/30 backdrop-blur-xs"
                >
                  <span class="size-1.5 rounded-full bg-white animate-pulse"></span>
                  Active
                </span>
                <span
                  *ngIf="currentStep() > step.number"
                  class="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-200 px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400/35 backdrop-blur-xs"
                >
                  <ng-icon name="lucideCheckCircle2" size="11" />
                  Done
                </span>
                <span
                  *ngIf="currentStep() < step.number"
                  class="text-[10px] font-medium text-white/40 px-2 py-0.5 rounded-full bg-white/5 border border-white/10"
                >
                  Pending
                </span>
              </div>

              <p class="text-xs mt-0.5 leading-relaxed text-white/75">
                {{ step.description }}
              </p>

              <!-- Step Summary Preview Chips (When Completed) -->
              <div *ngIf="currentStep() > step.number" class="mt-1.5 flex flex-wrap gap-1.5">
                <ng-container *ngIf="step.number === 1 && formData.orgName">
                  <span
                    class="text-[10px] font-mono bg-white/15 px-2 py-0.5 rounded text-white font-medium border border-white/20 truncate max-w-[170px]"
                  >
                    {{ formData.orgName }}
                  </span>
                  <span
                    class="text-[10px] font-mono text-emerald-200 bg-emerald-400/20 px-1.5 py-0.5 rounded font-semibold border border-emerald-400/30"
                  >
                    {{ formData.orgCode || formData.code }}
                  </span>
                </ng-container>

                <ng-container *ngIf="step.number === 2 && formData.licenseNumber">
                  <span
                    class="text-[10px] font-mono bg-white/15 px-2 py-0.5 rounded text-white font-medium border border-white/20 truncate max-w-[170px]"
                  >
                    Lic: {{ formData.licenseNumber }}
                  </span>
                </ng-container>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Bottom Contextual Assistance & Security Trust Assurance -->
        <div class="relative z-10 space-y-3">
          <!-- Dynamic Helper / Assurance Card -->
          <div
            class="p-3.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md space-y-1.5 text-white"
          >
            <div class="flex items-center gap-2 text-xs font-semibold">
              <ng-icon name="lucideShieldCheck" size="15" class="text-emerald-300 shrink-0" />
              <span *ngIf="currentStep() === 1">Multi-Tenant Isolation Guaranteed</span>
              <span *ngIf="currentStep() === 2">Accreditation & Registry Verification</span>
              <span *ngIf="currentStep() === 3">Zero-Trust Super-Admin Security</span>
            </div>
            <p class="text-[11px] text-white/80 leading-relaxed">
              <span *ngIf="currentStep() === 1">
                Provisioning creates dedicated schema instances, HL7/FHIR R4 resource stores, and
                encrypted database partitions.
              </span>
              <span *ngIf="currentStep() === 2">
                All clinical registrations are validated in accordance with National Health
                Authority and ABDM standards.
              </span>
              <span *ngIf="currentStep() === 3">
                Your Org Admin account will have master authority over role-based access control
                (RBAC) and clinical workspaces.
              </span>
            </p>
          </div>

          <!-- Compliance Badges -->
          <div class="flex flex-wrap gap-1.5 text-[11px]">
            <span
              class="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md bg-white/10 border border-white/20 text-white font-medium text-[11px] backdrop-blur-xs"
            >
              <ng-icon name="lucideShieldCheck" size="13" class="text-emerald-300" />
              ABDM & DPDP
            </span>
            <span
              class="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md bg-white/10 border border-white/20 text-white font-medium text-[11px] backdrop-blur-xs"
            >
              <ng-icon name="lucideKeyRound" size="13" class="text-emerald-300" />
              Tenant Isolation
            </span>
            <span
              class="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md bg-white/10 border border-white/20 text-white font-medium text-[11px] backdrop-blur-xs"
            >
              <ng-icon name="lucideBadgeCheck" size="13" class="text-emerald-300" />
              FHIR R4
            </span>
          </div>

          <!-- Footer Metadata -->
          <div
            class="text-[11px] text-white/65 flex items-center justify-between pt-1 border-t border-white/15"
          >
            <span>&copy; 2026 Sentinel EHR System</span>
            <span class="text-white/50">v2.4.0 &bull; Enterprise</span>
          </div>
        </div>
      </div>

      <!-- RIGHT REGISTRATION FORM WORKSPACE -->
      <div
        class="w-full lg:w-7/12 xl:w-8/12 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 overflow-y-auto max-h-screen"
      >
        <!-- Top Navigation Bar -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2.5 lg:hidden">
            <div
              class="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs"
            >
              <ng-icon name="lucideHeartPulse" size="16" />
            </div>
            <span class="font-bold text-sm">Sentinel EHR</span>
          </div>

          <div class="flex items-center gap-2 ml-auto">
            <button
              type="button"
              (click)="fillDemoData()"
              hlmBtn
              variant="outline"
              size="sm"
              class="text-xs gap-1.5 h-8 border-dashed border-primary/40 text-primary hover:bg-primary/5 cursor-pointer"
              title="Pre-populate with sample healthcare facility data for quick testing"
            >
              <ng-icon name="lucideActivity" size="13" />
              <span>Fill Demo Data</span>
            </button>

            <a
              routerLink="/"
              hlmBtn
              variant="ghost"
              size="sm"
              class="gap-1.5 text-muted-foreground hover:text-foreground text-xs h-8"
            >
              <ng-icon name="lucideHome" size="14" />
              <span class="hidden sm:inline">Home</span>
            </a>
          </div>
        </div>

        <div class="max-w-xl w-full mx-auto space-y-6 my-auto">
          <!-- Page Header -->
          <div class="space-y-1.5">
            <div class="inline-flex items-center gap-1.5 text-xs text-primary font-semibold">
              <ng-icon name="lucideBuilding2" size="15" />
              <span>Organization Onboarding Portal</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Register New Organization
            </h1>
            <p class="text-xs sm:text-sm text-muted-foreground">
              Complete the facility profile and configure the primary administrator account.
            </p>
          </div>

          <!-- Interactive Mobile / Responsive Step Indicator (Hidden on lg+ where left sidebar tracker is active) -->
          <div class="grid grid-cols-3 gap-2 pt-1 pb-1 lg:hidden">
            <div
              *ngFor="let step of steps"
              (click)="canJumpToStep(step.number) ? goToStep(step.number) : null"
              [class.cursor-pointer]="canJumpToStep(step.number)"
              class="relative flex flex-col p-2.5 rounded-xl border text-center transition-all"
              [ngClass]="{
                'bg-primary/10 border-primary text-primary shadow-xs font-semibold':
                  currentStep() === step.number,
                'bg-muted/50 border-border text-foreground': currentStep() > step.number,
                'bg-muted/20 border-border/40 text-muted-foreground': currentStep() < step.number,
              }"
            >
              <div class="flex items-center justify-center gap-1 text-xs font-bold">
                <ng-icon
                  *ngIf="currentStep() > step.number"
                  name="lucideCheckCircle2"
                  size="13"
                  class="text-emerald-500"
                />
                <span>Step {{ step.number }}</span>
              </div>
              <span class="text-[11px] truncate opacity-90">{{ step.title }}</span>
            </div>
          </div>

          <!-- Error Alert Banner -->
          <div
            *ngIf="errorMessage()"
            class="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium flex items-start gap-3 animate-in fade-in duration-200"
          >
            <ng-icon name="lucideAlertCircle" size="18" class="shrink-0 mt-0.5" />
            <div class="space-y-1">
              <p class="font-bold">Registration Error</p>
              <p>{{ errorMessage() }}</p>
            </div>
          </div>

          <!-- Success Alert Screen -->
          <div
            *ngIf="successMessage()"
            class="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs space-y-4 animate-in fade-in duration-300"
          >
            <div class="flex items-start gap-3.5">
              <div
                class="size-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"
              >
                <ng-icon name="lucideCheckCircle2" size="22" />
              </div>
              <div class="space-y-1">
                <h3 class="font-bold text-base text-foreground">Healthcare Facility Registered!</h3>
                <p class="text-xs text-muted-foreground leading-relaxed">
                  {{ successMessage() }}
                </p>
              </div>
            </div>

            <!-- Summary Card -->
            <div
              class="p-4 rounded-xl bg-card border border-border/70 text-foreground space-y-2.5 shadow-xs"
            >
              <div class="flex justify-between items-center pb-2 border-b border-border text-xs">
                <span class="text-muted-foreground">Facility Name:</span>
                <span class="font-bold text-foreground">{{ formData.orgName }}</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-border text-xs">
                <span class="text-muted-foreground">Tenant Code:</span>
                <span class="font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                  {{ formData.orgCode || formData.code }}
                </span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-border text-xs">
                <span class="text-muted-foreground">Primary Admin Email:</span>
                <span class="font-mono font-semibold">{{ formData.adminEmail }}</span>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span class="text-muted-foreground">Tenant Status:</span>
                <span
                  class="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400"
                >
                  <span class="size-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  PENDING_VERIFICATION
                </span>
              </div>
            </div>

            <div class="pt-2 flex flex-col sm:flex-row gap-3">
              <a
                routerLink="/login"
                hlmBtn
                variant="default"
                class="w-full sm:w-auto flex-1 gap-2 font-semibold text-xs h-10 shadow-sm"
              >
                <span>Proceed to Staff Login</span>
                <ng-icon name="lucideArrowRight" size="14" />
              </a>
              <button
                type="button"
                (click)="resetForm()"
                hlmBtn
                variant="outline"
                class="w-full sm:w-auto text-xs h-10"
              >
                Register Another Facility
              </button>
            </div>
          </div>

          <!-- Multi-Step Registration Form -->
          <form *ngIf="!successMessage()" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- STEP 1: FACILITY PROFILE -->
            <div *ngIf="currentStep() === 1" class="space-y-4 animate-in fade-in duration-200">
              <div
                class="p-3.5 rounded-xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground flex items-center gap-2.5"
              >
                <ng-icon name="lucideBuilding2" size="16" class="text-primary shrink-0" />
                <span
                  >Specify the hospital or clinic's identity, unique organization code, and
                  healthcare provider type.</span
                >
              </div>

              <!-- Hospital Display Name -->
              <div class="space-y-1.5">
                <label
                  class="text-xs font-semibold text-foreground flex items-center justify-between"
                >
                  <span>Hospital / Clinic Name *</span>
                  <span class="text-[11px] text-muted-foreground font-normal"
                    >Primary Display Title</span
                  >
                </label>
                <div class="relative">
                  <input
                    hlmInput
                    type="text"
                    [(ngModel)]="formData.orgName"
                    (ngModelChange)="onOrgNameChange($event)"
                    name="orgName"
                    required
                    placeholder="e.g. Apollo Multi-Specialty Hospital"
                    class="w-full h-10 text-xs pl-9"
                  />
                  <ng-icon
                    name="lucideBuilding2"
                    size="15"
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
              </div>

              <!-- Org Code & Slug Generator Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div class="space-y-1.5">
                  <label
                    class="text-xs font-semibold text-foreground flex items-center justify-between"
                  >
                    <span>Organization Code *</span>
                    <button
                      type="button"
                      (click)="autoGenerateCode()"
                      class="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                    >
                      Auto-generate
                    </button>
                  </label>
                  <div class="relative">
                    <input
                      hlmInput
                      type="text"
                      [(ngModel)]="formData.orgCode"
                      name="orgCode"
                      required
                      placeholder="e.g. APOLLO-MUM"
                      class="w-full h-10 text-xs pl-9 font-mono uppercase"
                    />
                    <ng-icon
                      name="lucideKeyRound"
                      size="15"
                      class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                  </div>
                  <p class="text-[10px] text-muted-foreground">
                    Unique tenant slug (alphanumeric & hyphens, max 50 chars).
                  </p>
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-foreground block"
                    >Organization Type *</label
                  >
                  <select
                    [(ngModel)]="formData.organizationType"
                    name="organizationType"
                    required
                    class="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="HOSPITAL">Tertiary / General Hospital</option>
                    <option value="CLINIC">Multi-Specialty Clinic</option>
                    <option value="DIAGNOSTIC_CENTER">Diagnostics & Imaging Lab</option>
                    <option value="DAYCARE_SURGERY">Daycare Surgery Center</option>
                    <option value="PHARMACY">Institutional Pharmacy</option>
                    <option value="RESEARCH_INSTITUTE">Research & Clinical Trial Site</option>
                  </select>
                </div>
              </div>

              <!-- Legal Entity Name -->
              <div class="space-y-1.5">
                <label
                  class="text-xs font-semibold text-foreground flex items-center justify-between"
                >
                  <span>Legal Business Entity Name</span>
                  <span class="text-[11px] text-muted-foreground font-normal">Optional</span>
                </label>
                <div class="relative">
                  <input
                    hlmInput
                    type="text"
                    [(ngModel)]="formData.legalName"
                    name="legalName"
                    placeholder="e.g. Apollo Hospitals Enterprise Limited"
                    class="w-full h-10 text-xs pl-9"
                  />
                  <ng-icon
                    name="lucideFileText"
                    size="15"
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
              </div>

              <!-- Action Bar Step 1 -->
              <div class="pt-3 flex justify-end">
                <button
                  type="button"
                  (click)="goToStep(2)"
                  [disabled]="!isStep1Valid()"
                  hlmBtn
                  variant="default"
                  class="gap-2 font-semibold text-xs h-10 px-6 shadow-sm cursor-pointer"
                >
                  <span>Continue to Licensing & Contact</span>
                  <ng-icon name="lucideArrowRight" size="14" />
                </button>
              </div>
            </div>

            <!-- STEP 2: LICENSING, LOCATION & CONTACT -->
            <div *ngIf="currentStep() === 2" class="space-y-4 animate-in fade-in duration-200">
              <div
                class="p-3.5 rounded-xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground flex items-center gap-2.5"
              >
                <ng-icon name="lucideFileText" size="16" class="text-primary shrink-0" />
                <span
                  >Provide clinical registration credentials and facility contact details for
                  verification.</span
                >
              </div>

              <!-- Medical License Number -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-foreground block"
                  >Medical License / Accreditation # *</label
                >
                <div class="relative">
                  <input
                    hlmInput
                    type="text"
                    [(ngModel)]="formData.licenseNumber"
                    name="licenseNumber"
                    required
                    placeholder="e.g. NABH/2026/DEL/0482 or LIC-MH-98401"
                    class="w-full h-10 text-xs pl-9"
                  />
                  <ng-icon
                    name="lucideShieldCheck"
                    size="15"
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
                <p class="text-[10px] text-muted-foreground">
                  State Health Dept, NABH, or National Clinical Registry identifier.
                </p>
              </div>

              <!-- Email & Phone Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-foreground block"
                    >Facility Contact Email *</label
                  >
                  <div class="relative">
                    <input
                      hlmInput
                      type="email"
                      [(ngModel)]="formData.email"
                      name="email"
                      required
                      placeholder="contact@facility.org"
                      class="w-full h-10 text-xs pl-9"
                    />
                    <ng-icon
                      name="lucideMail"
                      size="15"
                      class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                  </div>
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-foreground block"
                    >Reception / Emergency Phone *</label
                  >
                  <div class="relative">
                    <input
                      hlmInput
                      type="text"
                      [(ngModel)]="formData.phone"
                      name="phone"
                      required
                      placeholder="+91 22 2490 1000"
                      class="w-full h-10 text-xs pl-9"
                    />
                    <ng-icon
                      name="lucidePhone"
                      size="15"
                      class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                  </div>
                </div>
              </div>

              <!-- Physical Address -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-foreground block"
                  >Physical Facility Address</label
                >
                <div class="relative">
                  <input
                    hlmInput
                    type="text"
                    [(ngModel)]="formData.address"
                    name="address"
                    placeholder="Plot 13, Sector 4, Navi Mumbai, Maharashtra 400614"
                    class="w-full h-10 text-xs pl-9"
                  />
                  <ng-icon
                    name="lucideMapPin"
                    size="15"
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
              </div>

              <!-- Website, Country & Timezone Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-foreground block">Website URL</label>
                  <input
                    hlmInput
                    type="text"
                    [(ngModel)]="formData.website"
                    name="website"
                    placeholder="https://facility.org"
                    class="w-full h-10 text-xs"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-foreground block">Country</label>
                  <select
                    [(ngModel)]="formData.countryCode"
                    name="countryCode"
                    class="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="IN">India (IN)</option>
                    <option value="US">United States (US)</option>
                    <option value="GB">United Kingdom (GB)</option>
                    <option value="AE">United Arab Emirates (AE)</option>
                    <option value="SG">Singapore (SG)</option>
                    <option value="CA">Canada (CA)</option>
                    <option value="AU">Australia (AU)</option>
                  </select>
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-foreground block">Timezone</label>
                  <select
                    [(ngModel)]="formData.timezone"
                    name="timezone"
                    class="w-full h-10 px-3 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                  </select>
                </div>
              </div>

              <!-- Action Bar Step 2 -->
              <div class="pt-3 flex justify-between items-center">
                <button
                  type="button"
                  (click)="goToStep(1)"
                  hlmBtn
                  variant="outline"
                  class="gap-1.5 text-xs h-10 px-4 cursor-pointer"
                >
                  <ng-icon name="lucideArrowLeft" size="14" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  (click)="goToStep(3)"
                  [disabled]="!isStep2Valid()"
                  hlmBtn
                  variant="default"
                  class="gap-2 font-semibold text-xs h-10 px-6 shadow-sm cursor-pointer"
                >
                  <span>Configure Admin Account</span>
                  <ng-icon name="lucideArrowRight" size="14" />
                </button>
              </div>
            </div>

            <!-- STEP 3: PRIMARY ORG ADMIN ACCOUNT -->
            <div *ngIf="currentStep() === 3" class="space-y-4 animate-in fade-in duration-200">
              <div
                class="p-3.5 rounded-xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground flex items-center gap-2.5"
              >
                <ng-icon name="lucideUserCheck" size="16" class="text-primary shrink-0" />
                <span
                  >Set up the primary super-administrator account who will manage staff onboarding &
                  permissions.</span
                >
              </div>

              <!-- Admin Full Name -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-foreground block"
                  >Admin Full Legal Name & Title *</label
                >
                <div class="relative">
                  <input
                    hlmInput
                    type="text"
                    [(ngModel)]="formData.adminFullName"
                    name="adminFullName"
                    required
                    placeholder="e.g. Dr. Vikram Singh"
                    class="w-full h-10 text-xs pl-9"
                  />
                  <ng-icon
                    name="lucideUser"
                    size="15"
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
              </div>

              <!-- Admin Official Work Email -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-foreground block"
                  >Admin Official Work Email *</label
                >
                <div class="relative">
                  <input
                    hlmInput
                    type="email"
                    [(ngModel)]="formData.adminEmail"
                    name="adminEmail"
                    required
                    placeholder="vikram.singh@facility.org"
                    class="w-full h-10 text-xs pl-9"
                  />
                  <ng-icon
                    name="lucideMail"
                    size="15"
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
                <p class="text-[10px] text-muted-foreground">
                  This email address will be used to log into the Sentinel Organization Admin
                  Console.
                </p>
              </div>

              <!-- Password & Confirm Password Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div class="space-y-1.5">
                  <label
                    class="text-xs font-semibold text-foreground flex items-center justify-between"
                  >
                    <span>Admin Master Password *</span>
                    <button
                      type="button"
                      (click)="toggleShowPassword()"
                      class="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                    >
                      {{ showPassword() ? 'Hide' : 'Show' }}
                    </button>
                  </label>
                  <div class="relative">
                    <input
                      hlmInput
                      [type]="showPassword() ? 'text' : 'password'"
                      [(ngModel)]="formData.adminPassword"
                      name="adminPassword"
                      required
                      placeholder="••••••••••••"
                      class="w-full h-10 text-xs pl-9"
                    />
                    <ng-icon
                      name="lucideLock"
                      size="15"
                      class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                  </div>
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-foreground block"
                    >Confirm Master Password *</label
                  >
                  <div class="relative">
                    <input
                      hlmInput
                      [type]="showPassword() ? 'text' : 'password'"
                      [(ngModel)]="confirmPassword"
                      name="confirmPassword"
                      required
                      placeholder="••••••••••••"
                      class="w-full h-10 text-xs pl-9"
                    />
                    <ng-icon
                      name="lucideLock"
                      size="15"
                      class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                  </div>
                </div>
              </div>

              <!-- Password Strength Meter -->
              <div
                *ngIf="formData.adminPassword"
                class="space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border text-xs"
              >
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-muted-foreground">Password strength:</span>
                  <span class="font-bold" [ngClass]="getPasswordStrength().textColor">
                    {{ getPasswordStrength().text }}
                  </span>
                </div>
                <div class="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    class="h-full transition-all duration-300 rounded-full"
                    [ngClass]="getPasswordStrength().barColor"
                    [style.width.%]="getPasswordStrength().percentage"
                  ></div>
                </div>
                <p
                  *ngIf="confirmPassword && formData.adminPassword !== confirmPassword"
                  class="text-[11px] text-destructive font-medium pt-0.5"
                >
                  Passwords do not match.
                </p>
                <p
                  *ngIf="confirmPassword && formData.adminPassword === confirmPassword"
                  class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-0.5 flex items-center gap-1"
                >
                  <ng-icon name="lucideCheckCircle2" size="12" />
                  Passwords match successfully.
                </p>
              </div>

              <!-- Terms & Data Governance Checkbox -->
              <div class="pt-2">
                <label
                  class="flex items-start gap-2.5 p-3 rounded-xl bg-muted/30 border border-border cursor-pointer select-none text-xs text-muted-foreground leading-relaxed hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    [(ngModel)]="agreedToTerms"
                    name="agreedToTerms"
                    required
                    class="mt-0.5 size-4 rounded text-primary focus:ring-primary/40 border-input bg-background"
                  />
                  <span>
                    I confirm that I am authorized to register this facility under the ABDM Health
                    Data Management Policy and DPDP Act 2023, and agree to Sentinel EHR's
                    <a
                      routerLink="/terms-of-service"
                      target="_blank"
                      class="text-foreground font-semibold underline"
                      >Terms of Service</a
                    >
                    &
                    <a
                      routerLink="/privacy-policy"
                      target="_blank"
                      class="text-foreground font-semibold underline"
                      >Privacy Policy</a
                    >.
                  </span>
                </label>
              </div>

              <!-- Action Bar Step 3 -->
              <div class="pt-3 flex justify-between items-center">
                <button
                  type="button"
                  (click)="goToStep(2)"
                  hlmBtn
                  variant="outline"
                  class="gap-1.5 text-xs h-10 px-4 cursor-pointer"
                >
                  <ng-icon name="lucideArrowLeft" size="14" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  [disabled]="isLoading() || !isStep3Valid()"
                  hlmBtn
                  variant="default"
                  class="gap-2 font-semibold text-xs h-10 px-6 shadow-md cursor-pointer"
                >
                  <span *ngIf="!isLoading()" class="flex items-center gap-1.5">
                    <span>Submit & Provision Workspace</span>
                    <ng-icon name="lucideArrowRight" size="14" />
                  </span>
                  <span *ngIf="isLoading()" class="flex items-center gap-2">
                    <ng-icon name="lucideLoader2" size="14" class="animate-spin" />
                    <span>Provisioning Organization...</span>
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Bottom Footer Links -->
        <div
          class="mt-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-3"
        >
          <span
            >Enterprise Support:
            <a href="mailto:support@sentinel-ehr.com" class="text-foreground underline"
              >Helpdesk</a
            ></span
          >
          <span>&bull;</span>
          <a routerLink="/privacy-policy" class="text-foreground hover:underline">Privacy Policy</a>
          <span>&bull;</span>
          <a routerLink="/terms-of-service" class="text-foreground hover:underline"
            >Terms of Service</a
          >
        </div>
      </div>
    </div>
  `,
})
export class RegisterOrgComponent {
  currentStep = signal<1 | 2 | 3>(1);
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  confirmPassword = '';
  agreedToTerms = false;

  steps: StepItem[] = [
    {
      number: 1,
      title: 'Facility Profile',
      subtitle: 'Facility Identity & Category',
      description:
        'Enter organizational identity, unique tenant slug code, and facility operational type.',
    },
    {
      number: 2,
      title: 'Licensing & Contact',
      subtitle: 'Accreditation & Registry',
      description:
        'Provide official healthcare accreditation numbers, emergency contact, and location.',
    },
    {
      number: 3,
      title: 'Org Admin Security',
      subtitle: 'Master Super-Admin Access',
      description:
        'Establish primary administrator credentials for tenant governance and staff management.',
    },
  ];

  formData: OrganizationRegistrationRequest = {
    orgName: '',
    orgCode: '',
    code: '',
    legalName: '',
    organizationType: 'HOSPITAL',
    licenseNumber: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    countryCode: 'IN',
    timezone: 'Asia/Kolkata',
    adminEmail: '',
    adminPassword: '',
    adminFullName: '',
  };

  constructor(
    private orgService: OrganizationService,
    private router: Router,
  ) {}

  getProgressPercentage(): number {
    if (this.currentStep() === 1) return 33;
    if (this.currentStep() === 2) return 66;
    return 100;
  }

  goToStep(step: 1 | 2 | 3): void {
    this.errorMessage.set(null);
    this.currentStep.set(step);
  }

  canJumpToStep(step: 1 | 2 | 3): boolean {
    if (step === 1) return true;
    if (step === 2) return this.isStep1Valid();
    if (step === 3) return this.isStep1Valid() && this.isStep2Valid();
    return false;
  }

  toggleShowPassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  onOrgNameChange(val: string): void {
    if (!this.formData.orgCode || this.formData.orgCode === this.slugify(val.slice(0, -1))) {
      this.formData.orgCode = this.slugify(val);
      this.formData.code = this.formData.orgCode;
    }
  }

  autoGenerateCode(): void {
    if (this.formData.orgName) {
      this.formData.orgCode = this.slugify(this.formData.orgName);
      this.formData.code = this.formData.orgCode;
    }
  }

  private slugify(text: string): string {
    return text
      .toUpperCase()
      .trim()
      .replace(/[^A-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);
  }

  fillDemoData(): void {
    this.formData = {
      orgName: 'Apollo Specialty Hospital Mumbai',
      orgCode: 'APOLLO-MUMBAI',
      code: 'APOLLO-MUMBAI',
      legalName: 'Apollo Hospitals Enterprise Ltd',
      organizationType: 'HOSPITAL',
      licenseNumber: 'NABH/2026/MH/0912',
      email: 'admin@apollomumbai.org',
      phone: '+91 22 6692 0000',
      address: 'Plot 13, Parsik Hill Rd, Sector 23, CBD Belapur, Navi Mumbai 400614',
      website: 'https://www.apollohospitals.com',
      countryCode: 'IN',
      timezone: 'Asia/Kolkata',
      adminFullName: 'Dr. Vikramaditya Singh',
      adminEmail: 'vikram.singh@apollomumbai.org',
      adminPassword: 'Sentinel@Admin2026',
    };
    this.confirmPassword = 'Sentinel@Admin2026';
    this.agreedToTerms = true;
  }

  isStep1Valid(): boolean {
    return (
      !!this.formData.orgName?.trim() &&
      !!(this.formData.orgCode?.trim() || this.formData.code?.trim()) &&
      !!this.formData.organizationType
    );
  }

  isStep2Valid(): boolean {
    const emailValid =
      !!this.formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email);
    return !!this.formData.licenseNumber?.trim() && emailValid && !!this.formData.phone?.trim();
  }

  isStep3Valid(): boolean {
    const adminEmailValid =
      !!this.formData.adminEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.adminEmail);
    const passMatch =
      !!this.formData.adminPassword && this.formData.adminPassword === this.confirmPassword;
    const passLength = (this.formData.adminPassword?.length || 0) >= 6;

    return (
      !!this.formData.adminFullName?.trim() &&
      adminEmailValid &&
      passMatch &&
      passLength &&
      this.agreedToTerms
    );
  }

  getPasswordStrength(): { text: string; percentage: number; barColor: string; textColor: string } {
    const p = this.formData.adminPassword || '';
    let score = 0;
    if (p.length >= 8) score += 25;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score += 25;
    if (/\d/.test(p)) score += 25;
    if (/[^A-Za-z0-9]/.test(p)) score += 25;

    if (score <= 25) {
      return {
        text: 'Weak',
        percentage: 25,
        barColor: 'bg-destructive',
        textColor: 'text-destructive',
      };
    } else if (score <= 50) {
      return {
        text: 'Fair',
        percentage: 50,
        barColor: 'bg-amber-500',
        textColor: 'text-amber-600 dark:text-amber-400',
      };
    } else if (score <= 75) {
      return {
        text: 'Good',
        percentage: 75,
        barColor: 'bg-blue-500',
        textColor: 'text-blue-600 dark:text-blue-400',
      };
    } else {
      return {
        text: 'Strong',
        percentage: 100,
        barColor: 'bg-emerald-500',
        textColor: 'text-emerald-600 dark:text-emerald-400',
      };
    }
  }

  onSubmit(): void {
    if (!this.isStep1Valid() || !this.isStep2Valid() || !this.isStep3Valid()) {
      this.errorMessage.set('Please fill in all required fields across all 3 steps.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const code = (this.formData.orgCode || this.formData.code || '').trim().toUpperCase();
    const payload: OrganizationRegistrationRequest = {
      ...this.formData,
      name: this.formData.orgName.trim(),
      orgName: this.formData.orgName.trim(),
      code: code,
      orgCode: code,
      legalName: this.formData.legalName?.trim() || this.formData.orgName.trim(),
      licenseNumber: this.formData.licenseNumber.trim(),
      email: this.formData.email?.trim(),
      phone: this.formData.phone?.trim(),
      address: this.formData.address?.trim(),
      website: this.formData.website?.trim(),
      adminFullName: this.formData.adminFullName.trim(),
      adminEmail: this.formData.adminEmail.trim(),
      adminPassword: this.formData.adminPassword,
    };

    this.orgService.registerOrganization(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const facilityName = res.name || this.formData.orgName;
        const tenantCode = res.orgCode || res.code || code;
        this.successMessage.set(
          `Your healthcare organization '${facilityName}' (Tenant Code: ${tenantCode}) has been registered in PENDING_VERIFICATION status. Primary Admin credentials for '${this.formData.adminEmail}' are configured.`,
        );
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg =
          err.error?.message ||
          (typeof err.error === 'string' ? err.error : null) ||
          'Failed to register facility. Please verify the Organization Code is unique and try again.';
        this.errorMessage.set(msg);
      },
    });
  }

  resetForm(): void {
    this.currentStep.set(1);
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.confirmPassword = '';
    this.agreedToTerms = false;
    this.formData = {
      orgName: '',
      orgCode: '',
      code: '',
      legalName: '',
      organizationType: 'HOSPITAL',
      licenseNumber: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      countryCode: 'IN',
      timezone: 'Asia/Kolkata',
      adminEmail: '',
      adminPassword: '',
      adminFullName: '',
    };
  }
}
