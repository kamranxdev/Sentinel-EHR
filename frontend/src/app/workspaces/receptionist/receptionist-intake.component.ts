import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideUserPlus,
  lucideSave,
  lucideArrowLeft,
  lucideArrowRight,
  lucideCheckCircle2,
  lucideShieldCheck,
  lucideFileText,
  lucideMapPin,
  lucidePhoneCall,
  lucideBuilding,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-receptionist-intake',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideUserPlus,
      lucideSave,
      lucideArrowLeft,
      lucideArrowRight,
      lucideCheckCircle2,
      lucideShieldCheck,
      lucideFileText,
      lucideMapPin,
      lucidePhoneCall,
      lucideBuilding,
    }),
  ],
  template: `
    <div class="space-y-6 max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-3">
          <a routerLink="/receptionist/dashboard" class="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <ng-icon name="lucideArrowLeft" size="18" />
          </a>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              5-Step Patient Demographic Intake Wizard
              <span hlmBadge variant="secondary" class="text-[11px] bg-sky-500/10 text-sky-600 border border-sky-500/20">Intake Desk</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">Capture identity markers, PIN Code address validation, insurance coverage & electronic ABDM/HIPAA consent.</p>
          </div>
        </div>
      </div>

      <!-- Stepper Header Bar -->
      <div hlmCard class="p-4 border border-border shadow-sm">
        <div class="grid grid-cols-5 gap-2 text-center text-xs font-semibold">
          <div [ngClass]="currentStep() === 1 ? 'text-primary font-bold border-b-2 border-primary pb-2' : 'text-muted-foreground pb-2'">
            1. Core Identity
          </div>
          <div [ngClass]="currentStep() === 2 ? 'text-primary font-bold border-b-2 border-primary pb-2' : 'text-muted-foreground pb-2'">
            2. Address & Contact
          </div>
          <div [ngClass]="currentStep() === 3 ? 'text-primary font-bold border-b-2 border-primary pb-2' : 'text-muted-foreground pb-2'">
            3. Insurance
          </div>
          <div [ngClass]="currentStep() === 4 ? 'text-primary font-bold border-b-2 border-primary pb-2' : 'text-muted-foreground pb-2'">
            4. HIPAA Consent
          </div>
          <div [ngClass]="currentStep() === 5 ? 'text-primary font-bold border-b-2 border-primary pb-2' : 'text-muted-foreground pb-2'">
            5. Final Review
          </div>
        </div>
      </div>

      <!-- Step 1: Core Identity Markers -->
      <div *ngIf="currentStep() === 1" hlmCard class="p-6 space-y-4 border border-border shadow-sm">
        <h2 class="text-sm font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
          <ng-icon name="lucideUserPlus" size="16" class="text-sky-500" />
          Step 1: Patient Core Identity Markers
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div class="space-y-1.5 sm:col-span-2">
            <label class="font-medium text-foreground">Legal Full Name <span class="text-red-500">*</span></label>
            <input hlmInput type="text" [(ngModel)]="fullName" placeholder="e.g. Ramesh Kumar" class="w-full text-xs" />
          </div>
          <div class="space-y-1.5">
            <label class="font-medium text-foreground">Date of Birth <span class="text-red-500">*</span></label>
            <input hlmInput type="date" [(ngModel)]="dob" class="w-full text-xs" />
          </div>
          <div class="space-y-1.5">
            <label class="font-medium text-foreground">ABHA Health ID / National ID</label>
            <input hlmInput type="text" [(ngModel)]="abhaId" placeholder="12-3456-7890-1234" class="w-full text-xs" />
          </div>
          <div class="space-y-1.5">
            <label class="font-medium text-foreground">Gender / Sex</label>
            <input hlmInput type="text" [(ngModel)]="gender" placeholder="Male / Female / Other" class="w-full text-xs" />
          </div>
          <div class="space-y-1.5">
            <label class="font-medium text-foreground">Blood Type</label>
            <input hlmInput type="text" [(ngModel)]="bloodType" placeholder="O+ / A+ / B+" class="w-full text-xs" />
          </div>
          <div class="space-y-1.5">
            <label class="font-medium text-foreground">Primary Language</label>
            <input hlmInput type="text" [(ngModel)]="language" placeholder="English / Hindi / Spanish" class="w-full text-xs" />
          </div>
          <div class="space-y-1.5">
            <label class="font-medium text-foreground">Race & Ethnicity</label>
            <input hlmInput type="text" [(ngModel)]="raceEthnicity" placeholder="Caucasian / Asian / Hispanic" class="w-full text-xs" />
          </div>
        </div>

        <div class="pt-4 flex justify-end">
          <button hlmBtn variant="default" size="sm" (click)="nextStep()" [disabled]="!fullName || !dob" class="text-xs gap-1.5 bg-primary">
            <span>Continue to Address & Contact</span>
            <ng-icon name="lucideArrowRight" size="14" />
          </button>
        </div>
      </div>

      <!-- Step 2: Address Standardization & Contact -->
      <div *ngIf="currentStep() === 2" hlmCard class="p-6 space-y-4 border border-border shadow-sm">
        <h2 class="text-sm font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
          <ng-icon name="lucideMapPin" size="16" class="text-emerald-500" />
          Step 2: Address Standardization & Contact Details
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div class="space-y-1.5 sm:col-span-2">
            <label class="font-medium text-foreground">Residential Street Address</label>
            <input hlmInput type="text" [(ngModel)]="address" placeholder="123 Healthcare Avenue, Sector 15, City, State - PIN 110001" class="w-full text-xs" />
            <span class="text-[10px] text-emerald-600 flex items-center gap-1 font-mono">
              <ng-icon name="lucideCheckCircle2" size="12" /> PIN Code & Address Validated
            </span>
          </div>
          <div class="space-y-1.5">
            <label class="font-medium text-foreground">Mobile Phone Number</label>
            <input hlmInput type="text" [(ngModel)]="phone" placeholder="+91 98765 43210" class="w-full text-xs" />
          </div>
          <div class="space-y-1.5">
            <label class="font-medium text-foreground">Email Address</label>
            <input hlmInput type="email" [(ngModel)]="email" placeholder="patient@example.com" class="w-full text-xs" />
          </div>
          <div class="space-y-1.5 sm:col-span-2">
            <label class="font-medium text-foreground">Emergency Contact (Name & Phone)</label>
            <input hlmInput type="text" [(ngModel)]="emergencyContact" placeholder="Sita Kumar (Spouse) - +91 98765 12345" class="w-full text-xs" />
          </div>
        </div>

        <div class="pt-4 flex justify-between">
          <button hlmBtn variant="ghost" size="sm" (click)="prevStep()" class="text-xs gap-1.5">
            <ng-icon name="lucideArrowLeft" size="14" />
            <span>Back</span>
          </button>
          <button hlmBtn variant="default" size="sm" (click)="nextStep()" class="text-xs gap-1.5 bg-primary">
            <span>Continue to Insurance</span>
            <ng-icon name="lucideArrowRight" size="14" />
          </button>
        </div>
      </div>

      <!-- Step 3: Insurance Coverage -->
      <div *ngIf="currentStep() === 3" hlmCard class="p-6 space-y-4 border border-border shadow-sm">
        <h2 class="text-sm font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
          <ng-icon name="lucideBuilding" size="16" class="text-purple-500" />
          Step 3: Primary & Secondary Insurance Coverage
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div class="space-y-1.5 sm:col-span-2">
            <label class="font-medium text-foreground">Primary Insurance Carrier / Payer</label>
            <input hlmInput type="text" [(ngModel)]="insuranceProvider" placeholder="Blue Cross Blue Shield / Star Health" class="w-full text-xs" />
          </div>
          <div class="space-y-1.5">
            <label class="font-medium text-foreground">Policy Number / Subscriber ID</label>
            <input hlmInput type="text" [(ngModel)]="insurancePolicyNumber" placeholder="POL-9981240" class="w-full text-xs" />
          </div>
          <div class="space-y-1.5">
            <label class="font-medium text-foreground">Group Number</label>
            <input hlmInput type="text" [(ngModel)]="insuranceGroupNumber" placeholder="GRP-44120" class="w-full text-xs" />
          </div>
          <div class="space-y-1.5 sm:col-span-2">
            <label class="font-medium text-foreground">Coverage Plan Type</label>
            <input hlmInput type="text" [(ngModel)]="coveragePlan" placeholder="Preferred Provider Organization (PPO)" class="w-full text-xs" />
          </div>
        </div>

        <div class="pt-4 flex justify-between">
          <button hlmBtn variant="ghost" size="sm" (click)="prevStep()" class="text-xs gap-1.5">
            <ng-icon name="lucideArrowLeft" size="14" />
            <span>Back</span>
          </button>
          <button hlmBtn variant="default" size="sm" (click)="nextStep()" class="text-xs gap-1.5 bg-primary">
            <span>Continue to HIPAA Directives</span>
            <ng-icon name="lucideArrowRight" size="14" />
          </button>
        </div>
      </div>

      <!-- Step 4: Electronic ABDM & DISHA Consent Directives -->
      <div *ngIf="currentStep() === 4" hlmCard class="p-6 space-y-4 border border-border shadow-sm">
        <h2 class="text-sm font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
          <ng-icon name="lucideFileText" size="16" class="text-amber-500" />
          Step 4: Electronic ABDM & DISHA Health Data Consent
        </h2>

        <div class="space-y-3 text-xs">
          <label class="flex items-start gap-2.5 p-3 rounded-lg border border-border bg-muted/20 cursor-pointer">
            <input type="checkbox" [(ngModel)]="hipaaPrivacySigned" class="mt-0.5" />
            <div>
              <span class="font-bold text-foreground">ABDM & DISHA Data Privacy Policy Acknowledgment</span>
              <p class="text-[11px] text-muted-foreground mt-0.5">Patient acknowledges consent for digital health record access and ABDM consent artifact processing.</p>
            </div>
          </label>

          <label class="flex items-start gap-2.5 p-3 rounded-lg border border-border bg-muted/20 cursor-pointer">
            <input type="checkbox" [(ngModel)]="treatmentConsentSigned" class="mt-0.5" />
            <div>
              <span class="font-bold text-foreground">General Consent for Medical Treatment & Diagnostic Procedures</span>
              <p class="text-[11px] text-muted-foreground mt-0.5">Authorizes clinicians and staff to render diagnostic evaluations and therapeutic care.</p>
            </div>
          </label>

          <label class="flex items-start gap-2.5 p-3 rounded-lg border border-border bg-muted/20 cursor-pointer">
            <input type="checkbox" [(ngModel)]="financialAgreementSigned" class="mt-0.5" />
            <div>
              <span class="font-bold text-foreground">Financial Responsibility & Insurance Assignment Agreement</span>
              <p class="text-[11px] text-muted-foreground mt-0.5">Patient agrees to satisfy applicable copayments, deductibles, and non-covered services.</p>
            </div>
          </label>
        </div>

        <div class="pt-4 flex justify-between">
          <button hlmBtn variant="ghost" size="sm" (click)="prevStep()" class="text-xs gap-1.5">
            <ng-icon name="lucideArrowLeft" size="14" />
            <span>Back</span>
          </button>
          <button hlmBtn variant="default" size="sm" (click)="nextStep()" [disabled]="!hipaaPrivacySigned || !treatmentConsentSigned" class="text-xs gap-1.5 bg-primary">
            <span>Review Final Summary</span>
            <ng-icon name="lucideArrowRight" size="14" />
          </button>
        </div>
      </div>

      <!-- Step 5: Summary Review & Submission -->
      <div *ngIf="currentStep() === 5" hlmCard class="p-6 space-y-6 border border-border shadow-sm">
        <h2 class="text-sm font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
          <ng-icon name="lucideShieldCheck" size="16" class="text-emerald-500" />
          Step 5: Final Verification & Intake Registration Submission
        </h2>

        <div *ngIf="successBanner()" class="p-3.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs flex items-center gap-2 font-semibold shadow-sm">
          <ng-icon name="lucideCheckCircle2" size="18" class="text-emerald-600" />
          <span>{{ successBanner() }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-muted/30 p-4 rounded-xl border border-border">
          <div>
            <span class="text-muted-foreground font-medium">Patient Name:</span>
            <div class="font-bold text-foreground text-sm">{{ fullName }}</div>
          </div>
          <div>
            <span class="text-muted-foreground font-medium">Date of Birth (Sex):</span>
            <div class="font-semibold text-foreground">{{ dob }} ({{ gender }})</div>
          </div>
          <div>
            <span class="text-muted-foreground font-medium">ABHA ID / Aadhaar / National ID:</span>
            <div class="font-mono text-foreground">{{ abhaId || ssn || 'Not Provided' }}</div>
          </div>
          <div>
            <span class="text-muted-foreground font-medium">Contact Phone:</span>
            <div class="font-semibold text-foreground">{{ phone }}</div>
          </div>
          <div class="sm:col-span-2">
            <span class="text-muted-foreground font-medium">Standardized Address:</span>
            <div class="font-medium text-foreground">{{ address }}</div>
          </div>
          <div class="sm:col-span-2">
            <span class="text-muted-foreground font-medium">Insurance Carrier & Policy:</span>
            <div class="font-semibold text-foreground">{{ insuranceProvider }} - {{ insurancePolicyNumber }}</div>
          </div>
        </div>

        <div class="pt-2 flex justify-between">
          <button hlmBtn variant="ghost" size="sm" (click)="prevStep()" class="text-xs gap-1.5">
            <ng-icon name="lucideArrowLeft" size="14" />
            <span>Back</span>
          </button>
          <button hlmBtn variant="default" size="sm" (click)="saveIntake()" [disabled]="saving()" class="text-xs gap-2 bg-emerald-600 hover:bg-emerald-700">
            <ng-icon name="lucideSave" size="14" />
            <span>{{ saving() ? 'Registering Patient Chart...' : 'Complete Intake & Create MRN' }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ReceptionistIntakeComponent implements OnInit {
  currentStep = signal(1);

  fullName = 'Sunita Sharma';
  dob = '1988-04-12';
  ssn = '987-65-4321';
  abhaId = '91-4590-1284-9001';
  gender = 'Female';
  bloodType = 'B+';
  language = 'English';
  raceEthnicity = 'Asian';

  address = '402 Sunrise Apartments, MG Road, Ward 12, City 560001';
  phone = '+91 98450 11223';
  email = 'sunita.sharma@example.com';
  emergencyContact = 'Vikram Sharma (Husband) - +91 98450 99887';

  insuranceProvider = 'Star Health & Allied Insurance';
  insurancePolicyNumber = 'POL-887102';
  insuranceGroupNumber = 'GRP-9910';
  coveragePlan = 'Comprehensive Gold PPO Plan';

  hipaaPrivacySigned = true;
  treatmentConsentSigned = true;
  financialAgreementSigned = true;

  saving = signal(false);
  successBanner = signal<string | null>(null);

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  nextStep(): void {
    if (this.currentStep() < 5) {
      this.currentStep.update((s) => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  saveIntake(): void {
    if (!this.fullName || !this.dob) return;
    this.saving.set(true);

    this.apiService
      .submitIntake({
        fullName: this.fullName,
        dateOfBirth: this.dob,
        ssn: this.ssn,
        abhaId: this.abhaId,
        gender: this.gender,
        bloodType: this.bloodType,
        address: this.address,
        phone: this.phone,
        email: this.email,
        emergencyContact: this.emergencyContact,
        insuranceProvider: this.insuranceProvider,
        insurancePolicyNumber: this.insurancePolicyNumber,
        insuranceGroupNumber: this.insuranceGroupNumber,
        coveragePlan: this.coveragePlan,
      })
      .subscribe({
        next: (savedPatient) => {
          this.saving.set(false);
          this.successBanner.set(`Intake complete! Patient profile created for ${savedPatient.fullName} (MRN: ${savedPatient.patientCode}).`);
          setTimeout(() => {
            this.router.navigate(['/receptionist/dashboard']);
          }, 1200);
        },
        error: () => this.saving.set(false),
      });
  }
}
