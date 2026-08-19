import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrganizationService } from '../../core/services/organization.service';
import { OrganizationRegistrationRequest, Organization } from '../../core/models/organization.model';
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
} from '@ng-icons/lucide';

interface StepItem {
  number: 1 | 2 | 3;
  title: string;
  subtitle: string;
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
    }),
  ],
  template: `
    <div class="min-h-screen bg-background text-foreground flex flex-col lg:flex-row overflow-hidden font-sans">

      <!-- LEFT BRAND & TRUST PANEL -->
      <div class="hidden lg:flex lg:w-5/12 bg-muted/30 border-r border-border p-10 xl:p-12 flex-col justify-between relative overflow-hidden">
        <!-- Background Image with Overlay & Glassmorphism -->
        <div
          class="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000 z-0"
          style="background-image: url('/assets/images/hospital_hero.jpg');"
        ></div>
        <div class="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/30 z-10"></div>
        <div class="absolute inset-0 bg-primary/5 mix-blend-overlay z-10"></div>

        <!-- Top Header / Brand Mark -->
        <div class="relative z-20 flex items-center gap-3">
          <div class="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25 ring-1 ring-white/20">
            <ng-icon name="lucideHeartPulse" size="20" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-lg tracking-tight">Sentinel</span>
              <span hlmBadge variant="outline" class="text-[10px] bg-background/60 backdrop-blur-sm border-primary/30 text-primary font-semibold">
                Enterprise Cloud
              </span>
            </div>
            <p class="text-[11px] text-muted-foreground">Healthcare Information System & Tenant Provisioning</p>
          </div>
        </div>

        <!-- Middle Step Progress / Value Proposition Card -->
        <div class="relative z-20 space-y-6 max-w-lg p-6 xl:p-7 rounded-2xl bg-background/50 backdrop-blur-xl border border-border/60 shadow-2xl ring-1 ring-black/5 my-auto">
          <div class="space-y-2.5">
            <div class="inline-flex items-center gap-2 text-xs text-primary font-semibold px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
              <span class="size-1.5 rounded-full bg-primary animate-pulse"></span>
              Tenant Onboarding & Facility Governance
            </div>
            <h2 class="text-2xl xl:text-3xl font-bold tracking-tight leading-tight text-foreground">
              Register Healthcare Facility
            </h2>
            <p class="text-xs xl:text-sm text-muted-foreground leading-relaxed">
              Instantly configure your isolated EHR domain, activate FHIR R4 clinical repositories, and provision primary Org Admin credentials.
            </p>
          </div>

          <!-- Step Progress Visualizer (Desktop Left Rail) -->
          <div class="space-y-3 pt-2">
            <div
              *ngFor="let step of steps"
              (click)="canJumpToStep(step.number) ? goToStep(step.number) : null"
              [class.cursor-pointer]="canJumpToStep(step.number)"
              class="flex items-center gap-3 p-2.5 rounded-xl border transition-all"
              [ngClass]="{
                'bg-primary/10 border-primary/40 shadow-xs': currentStep() === step.number,
                'bg-background/40 border-border/40 opacity-75': currentStep() !== step.number && currentStep() > step.number,
                'bg-background/20 border-border/20 opacity-50': currentStep() < step.number
              }"
            >
              <div
                class="size-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors"
                [ngClass]="{
                  'bg-primary text-primary-foreground': currentStep() === step.number,
                  'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40': currentStep() > step.number,
                  'bg-muted text-muted-foreground border border-border': currentStep() < step.number
                }"
              >
                <ng-icon *ngIf="currentStep() > step.number" name="lucideCheckCircle2" size="14" />
                <span *ngIf="currentStep() <= step.number">{{ step.number }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-foreground truncate">{{ step.title }}</p>
                <p class="text-[11px] text-muted-foreground truncate">{{ step.subtitle }}</p>
              </div>
              <span *ngIf="currentStep() === step.number" class="size-2 rounded-full bg-primary animate-ping"></span>
            </div>
          </div>

          <!-- Compliance Badges -->
          <div class="flex flex-wrap gap-1.5 pt-2 text-[11px]">
            <span hlmBadge variant="secondary" class="gap-1.5 py-1 px-2.5 bg-background/70 backdrop-blur-md border border-border/50 text-foreground font-medium">
              <ng-icon name="lucideShieldCheck" size="13" class="text-primary" />
              ABDM & DPDP Compliant
            </span>
            <span hlmBadge variant="secondary" class="gap-1.5 py-1 px-2.5 bg-background/70 backdrop-blur-md border border-border/50 text-foreground font-medium">
              <ng-icon name="lucideKeyRound" size="13" class="text-primary" />
              Tenant Isolation
            </span>
            <span hlmBadge variant="secondary" class="gap-1.5 py-1 px-2.5 bg-background/70 backdrop-blur-md border border-border/50 text-foreground font-medium">
              <ng-icon name="lucideBadgeCheck" size="13" class="text-primary" />
              FHIR R4 Schema
            </span>
          </div>
        </div>

        <!-- Footer Info -->
        <div class="relative z-20 text-xs text-muted-foreground flex items-center justify-between">
          <span>&copy; 2026 Sentinel EHR System. All rights reserved.</span>
          <span class="text-[11px] text-muted-foreground/80">v2.4.0 • Multi-Tenant Edition</span>
        </div>
      </div>

      <!-- RIGHT REGISTRATION FORM WORKSPACE -->
      <div class="w-full lg:w-7/12 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 overflow-y-auto max-h-screen">

        <!-- Top Navigation Bar -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2.5 lg:hidden">
            <div class="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
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
              class="text-xs gap-1.5 h-8 border-dashed border-primary/40 text-primary hover:bg-primary/5"
              title="Pre-populate with sample healthcare facility data for quick testing"
            >
              <ng-icon name="lucideActivity" size="13" />
              <span>Fill Demo Data</span>
            </button>

            <a routerLink="/" hlmBtn variant="ghost" size="sm" class="gap-1.5 text-muted-foreground hover:text-foreground text-xs h-8">
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

          <!-- Interactive Mobile / Inline Step Indicator -->
          <div class="grid grid-cols-3 gap-2 pt-1 pb-1">
            <div
              *ngFor="let step of steps"
              (click)="canJumpToStep(step.number) ? goToStep(step.number) : null"
              [class.cursor-pointer]="canJumpToStep(step.number)"
              class="relative flex flex-col p-2.5 rounded-xl border text-center transition-all"
              [ngClass]="{
                'bg-primary/10 border-primary text-primary shadow-xs font-semibold': currentStep() === step.number,
                'bg-muted/50 border-border text-foreground': currentStep() > step.number,
                'bg-muted/20 border-border/40 text-muted-foreground': currentStep() < step.number
              }"
            >
              <div class="flex items-center justify-center gap-1 text-xs font-bold">
                <ng-icon *ngIf="currentStep() > step.number" name="lucideCheckCircle2" size="13" class="text-emerald-500" />
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
              <div class="size-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
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
            <div class="p-4 rounded-xl bg-card border border-border/70 text-foreground space-y-2.5">
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
                <span class="text-muted-foreground">Primary Admin Username:</span>
                <span class="font-mono font-semibold">{{ formData.adminUsername }}</span>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span class="text-muted-foreground">Tenant Status:</span>
                <span class="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
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
              <div class="p-3.5 rounded-xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground flex items-center gap-2.5">
                <ng-icon name="lucideBuilding2" size="16" class="text-primary shrink-0" />
                <span>Specify the facility's identity, unique organization code, and healthcare provider type.</span>
              </div>

              <!-- Facility Display Name -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Facility / Hospital Name *</span>
                  <span class="text-[11px] text-muted-foreground font-normal">Primary Display Title</span>
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
                  <ng-icon name="lucideBuilding2" size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <!-- Org Code & Slug Generator Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Organization Code *</span>
                    <button
                      type="button"
                      (click)="autoGenerateCode()"
                      class="text-[11px] text-primary hover:underline font-medium"
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
                    <ng-icon name="lucideKeyRound" size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <p class="text-[10px] text-muted-foreground">Unique tenant slug (alphanumeric & hyphens, max 50 chars).</p>
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-foreground block">Facility Type *</label>
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
                <label class="text-xs font-semibold text-foreground flex items-center justify-between">
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
                  <ng-icon name="lucideFileText" size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
                  class="gap-2 font-semibold text-xs h-10 px-6 shadow-sm"
                >
                  <span>Continue to Licensing & Contact</span>
                  <ng-icon name="lucideArrowRight" size="14" />
                </button>
              </div>
            </div>

            <!-- STEP 2: LICENSING, LOCATION & CONTACT -->
            <div *ngIf="currentStep() === 2" class="space-y-4 animate-in fade-in duration-200">
              <div class="p-3.5 rounded-xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground flex items-center gap-2.5">
                <ng-icon name="lucideFileText" size="16" class="text-primary shrink-0" />
                <span>Provide clinical registration credentials and facility contact details for verification.</span>
              </div>

              <!-- Medical License Number -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-foreground block">Medical License / Accreditation # *</label>
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
                  <ng-icon name="lucideShieldCheck" size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
                <p class="text-[10px] text-muted-foreground">State Health Dept, NABH, or National Clinical Registry identifier.</p>
              </div>

              <!-- Email & Phone Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-foreground block">Facility Contact Email *</label>
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
                    <ng-icon name="lucideMail" size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-foreground block">Reception / Emergency Phone *</label>
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
                    <ng-icon name="lucidePhone" size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <!-- Physical Address -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-foreground block">Physical Facility Address</label>
                <div class="relative">
                  <input
                    hlmInput
                    type="text"
                    [(ngModel)]="formData.address"
                    name="address"
                    placeholder="Plot 13, Sector 4, Navi Mumbai, Maharashtra 400614"
                    class="w-full h-10 text-xs pl-9"
                  />
                  <ng-icon name="lucideMapPin" size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
                  class="gap-1.5 text-xs h-10 px-4"
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
                  class="gap-2 font-semibold text-xs h-10 px-6 shadow-sm"
                >
                  <span>Configure Admin Account</span>
                  <ng-icon name="lucideArrowRight" size="14" />
                </button>
              </div>
            </div>

            <!-- STEP 3: PRIMARY ORG ADMIN ACCOUNT -->
            <div *ngIf="currentStep() === 3" class="space-y-4 animate-in fade-in duration-200">
              <div class="p-3.5 rounded-xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground flex items-center gap-2.5">
                <ng-icon name="lucideUserCheck" size="16" class="text-primary shrink-0" />
                <span>Set up the primary super-administrator account who will manage staff onboarding & permissions.</span>
              </div>

              <!-- Admin Full Name -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-foreground block">Admin Full Legal Name & Title *</label>
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
                  <ng-icon name="lucideUser" size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <!-- Admin Username & Email Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-foreground block">Admin Username *</label>
                  <div class="relative">
                    <input
                      hlmInput
                      type="text"
                      [(ngModel)]="formData.adminUsername"
                      name="adminUsername"
                      required
                      placeholder="e.g. orgadmin_vikram"
                      class="w-full h-10 text-xs pl-9 font-mono"
                    />
                    <ng-icon name="lucideUserCheck" size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-foreground block">Admin Official Work Email *</label>
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
                    <ng-icon name="lucideMail" size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <!-- Password & Confirm Password Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Admin Master Password *</span>
                    <button
                      type="button"
                      (click)="toggleShowPassword()"
                      class="text-[11px] text-primary hover:underline font-medium"
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
                    <ng-icon name="lucideLock" size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-foreground block">Confirm Master Password *</label>
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
                    <ng-icon name="lucideLock" size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <!-- Password Strength Meter -->
              <div *ngIf="formData.adminPassword" class="space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border text-xs">
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
                <p *ngIf="confirmPassword && formData.adminPassword !== confirmPassword" class="text-[11px] text-destructive font-medium pt-0.5">
                  Passwords do not match.
                </p>
                <p *ngIf="confirmPassword && formData.adminPassword === confirmPassword" class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-0.5 flex items-center gap-1">
                  <ng-icon name="lucideCheckCircle2" size="12" />
                  Passwords match successfully.
                </p>
              </div>

              <!-- Terms & Data Governance Checkbox -->
              <div class="pt-2">
                <label class="flex items-start gap-2.5 p-3 rounded-xl bg-muted/30 border border-border cursor-pointer select-none text-xs text-muted-foreground leading-relaxed hover:bg-muted/50 transition-colors">
                  <input
                    type="checkbox"
                    [(ngModel)]="agreedToTerms"
                    name="agreedToTerms"
                    required
                    class="mt-0.5 size-4 rounded text-primary focus:ring-primary/40 border-input bg-background"
                  />
                  <span>
                    I confirm that I am authorized to register this facility under the ABDM Health Data Management Policy and DPDP Act 2023, and agree to Sentinel EHR's
                    <a routerLink="/terms-of-service" target="_blank" class="text-foreground font-semibold underline">Terms of Service</a> &
                    <a routerLink="/privacy-policy" target="_blank" class="text-foreground font-semibold underline">Privacy Policy</a>.
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
                  class="gap-1.5 text-xs h-10 px-4"
                >
                  <ng-icon name="lucideArrowLeft" size="14" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  [disabled]="isLoading() || !isStep3Valid()"
                  hlmBtn
                  variant="default"
                  class="gap-2 font-semibold text-xs h-10 px-6 shadow-md"
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
        <div class="mt-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-3">
          <span>Enterprise Support: <a href="mailto:support@sentinel-ehr.com" class="text-foreground underline">Helpdesk</a></span>
          <span>&bull;</span>
          <a routerLink="/privacy-policy" class="text-foreground hover:underline">Privacy Policy</a>
          <span>&bull;</span>
          <a routerLink="/terms-of-service" class="text-foreground hover:underline">Terms of Service</a>
        </div>

      </div>

    </div>
  `
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
    { number: 1, title: 'Facility Profile', subtitle: 'Name, Slug Code & Facility Category' },
    { number: 2, title: 'Licensing & Contact', subtitle: 'Accreditation, Email, Phone & Address' },
    { number: 3, title: 'Org Admin Security', subtitle: 'Super-User Master Account Credentials' },
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
    adminUsername: '',
    adminPassword: '',
    adminEmail: '',
    adminFullName: '',
  };

  constructor(
    private orgService: OrganizationService,
    private router: Router
  ) { }

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
      adminUsername: 'orgadmin_vikram',
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
    const emailValid = !!this.formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email);
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
      !!this.formData.adminUsername?.trim() &&
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
      return { text: 'Weak', percentage: 25, barColor: 'bg-destructive', textColor: 'text-destructive' };
    } else if (score <= 50) {
      return { text: 'Fair', percentage: 50, barColor: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400' };
    } else if (score <= 75) {
      return { text: 'Good', percentage: 75, barColor: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' };
    } else {
      return { text: 'Strong', percentage: 100, barColor: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400' };
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
      adminUsername: this.formData.adminUsername.trim(),
      adminEmail: this.formData.adminEmail.trim(),
      adminPassword: this.formData.adminPassword,
    };

    this.orgService.registerOrganization(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const facilityName = res.name || this.formData.orgName;
        const tenantCode = res.orgCode || res.code || code;
        this.successMessage.set(
          `Your healthcare organization '${facilityName}' (Tenant Code: ${tenantCode}) has been registered in PENDING_VERIFICATION status. Primary Admin credentials for '${this.formData.adminUsername}' are configured.`
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
      adminUsername: '',
      adminPassword: '',
      adminEmail: '',
      adminFullName: '',
    };
  }
}

