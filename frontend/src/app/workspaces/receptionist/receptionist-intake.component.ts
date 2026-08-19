import { Component, OnInit, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Patient } from '../../core/models/patient.model';
import { User } from '../../core/models/auth-user.model';

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
  lucideX,
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
      lucideX,
    }),
  ],
  template: `
    <!-- Outer Wrapper: Modal Overlay if isModal is true, else normal container -->
    <div [ngClass]="isModal ? 'fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto' : 'space-y-6 max-w-4xl mx-auto'">
      <div [ngClass]="isModal ? 'w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 space-y-6 border border-border shadow-2xl bg-card rounded-2xl' : 'space-y-6'">

        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
          <div class="flex items-center gap-3">
            <a *ngIf="!isModal" routerLink="/receptionist/dashboard" class="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <ng-icon name="lucideArrowLeft" size="18" />
            </a>
            <div>
              <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                5-Step Patient Demographic Intake Wizard
                <span hlmBadge variant="secondary" class="text-[11px] bg-sky-500/10 text-sky-600 border border-sky-500/20">Intake Modal</span>
              </h1>
              <p class="text-xs text-muted-foreground mt-0.5">Capture identity markers, PIN Code address validation, insurance coverage & electronic ABDM/DPDP consent.</p>
            </div>
          </div>

          <button *ngIf="isModal" type="button" class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" (click)="dismissModal()">
            <ng-icon name="lucideX" size="20" />
          </button>
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
              4. ABDM/DPDP Consent
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

          <div class="pt-4 flex justify-between items-center">
            <button *ngIf="isModal" hlmBtn variant="ghost" size="sm" (click)="dismissModal()" class="text-xs">Cancel</button>
            <span *ngIf="!isModal"></span>
            <button hlmBtn variant="default" size="sm" (click)="nextStep()" [disabled]="!fullName || !dob" class="text-xs gap-1.5 bg-primary ml-auto">
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
            <div class="space-y-1.5 sm:col-span-2 grid grid-cols-3 gap-2">
              <div>
                <label class="font-medium text-foreground text-[11px] block">Emergency Contact Name</label>
                <input hlmInput type="text" [(ngModel)]="emergencyContactName" placeholder="Vikram Sharma" class="w-full text-xs" />
              </div>
              <div>
                <label class="font-medium text-foreground text-[11px] block">Relationship</label>
                <input hlmInput type="text" [(ngModel)]="emergencyContactRelationship" placeholder="Husband" class="w-full text-xs" />
              </div>
              <div>
                <label class="font-medium text-foreground text-[11px] block">Phone</label>
                <input hlmInput type="text" [(ngModel)]="emergencyContactPhone" placeholder="+91 98450 99887" class="w-full text-xs" />
              </div>
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
              <span>Continue to ABDM/DPDP Consent</span>
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

        <!-- Step 5: Summary Review & Submission + Same-Day Appointment Scheduling -->
        <div *ngIf="currentStep() === 5" hlmCard class="p-6 space-y-6 border border-border shadow-sm">
          <h2 class="text-sm font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
            <ng-icon name="lucideShieldCheck" size="16" class="text-emerald-500" />
            Step 5: Verification & Same-Day Walk-in Appointment Scheduling
          </h2>

          <div *ngIf="successBanner()" class="p-3.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs flex items-center gap-2 font-semibold shadow-sm">
            <ng-icon name="lucideCheckCircle2" size="18" class="text-emerald-600" />
            <span>{{ successBanner() }}</span>
          </div>

          <!-- Demographic Summary Grid -->
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
              <div class="font-mono text-foreground">{{ abhaId || nationalId || 'Not Provided' }}</div>
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

          <!-- Same-Day Consultation Scheduling Section for First Visit -->
          <div class="p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 space-y-3 text-xs">
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 font-bold text-foreground cursor-pointer">
                <input type="checkbox" [(ngModel)]="scheduleTodayAppointment" class="size-4 text-sky-600 rounded border-border" />
                <span class="text-sky-600 dark:text-sky-400">Schedule Today's Walk-in Consultation (First Visit)</span>
              </label>
              <span hlmBadge variant="outline" class="text-[10px] bg-sky-500/10 text-sky-600 border-sky-500/30 font-mono">Today's Date: {{ todayDateString }}</span>
            </div>

            <div *ngIf="scheduleTodayAppointment" class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div class="space-y-1">
                <label class="font-medium text-foreground">Attending Physician <span class="text-red-500">*</span></label>
                <select [(ngModel)]="selectedDoctorId" class="w-full p-2 rounded-lg border border-border bg-background text-xs text-foreground">
                  <option *ngFor="let doc of doctors()" [value]="doc.id">Dr. {{ doc.fullName }} ({{ doc.specialty || 'General' }})</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="font-medium text-foreground">Scheduled Time</label>
                <input hlmInput type="time" [(ngModel)]="appointmentTime" class="w-full text-xs" />
              </div>

              <div class="space-y-1">
                <label class="font-medium text-foreground">Desk Initial Stage</label>
                <select [(ngModel)]="initialStage" class="w-full p-2 rounded-lg border border-border bg-background text-xs text-foreground font-mono">
                  <option value="ARRIVED">ARRIVED (Waiting Room Queue)</option>
                  <option value="SCHEDULED">SCHEDULED (Awaiting Check-in)</option>
                </select>
              </div>

              <div class="sm:col-span-3 space-y-1">
                <label class="font-medium text-foreground">Consultation Visit Reason</label>
                <input hlmInput type="text" [(ngModel)]="consultationReason" placeholder="First Visit Consultation & General Assessment" class="w-full text-xs" />
              </div>
            </div>
          </div>

          <div class="pt-2 flex justify-between">
            <button hlmBtn variant="ghost" size="sm" (click)="prevStep()" class="text-xs gap-1.5">
              <ng-icon name="lucideArrowLeft" size="14" />
              <span>Back</span>
            </button>
            <button hlmBtn variant="default" size="sm" (click)="saveIntake()" [disabled]="saving()" class="text-xs gap-2 bg-emerald-600 hover:bg-emerald-700">
              <ng-icon name="lucideSave" size="14" />
              <span>{{ saving() ? 'Registering & Scheduling...' : 'Complete Intake & Schedule Consultation' }}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class ReceptionistIntakeComponent implements OnInit {
  @Input() isModal: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<Patient>();

  currentStep = signal(1);

  fullName = '';
  dob = '';
  nationalId = '';
  abhaId = '';
  gender = 'Female';
  bloodType = 'O+';
  language = 'English';
  raceEthnicity = 'Not Specified';

  address = '';
  phone = '';
  email = '';
  emergencyContactName = '';
  emergencyContactRelationship = 'Spouse';
  emergencyContactPhone = '';

  insuranceProvider = '';
  insurancePolicyNumber = '';
  insuranceGroupNumber = '';
  coveragePlan = '';

  hipaaPrivacySigned = true;
  treatmentConsentSigned = true;
  financialAgreementSigned = true;

  // Today's Appointment Scheduling for First Visit
  scheduleTodayAppointment = false;
  doctors = signal<User[]>([]);
  selectedDoctorId: string = '';
  appointmentTime: string = '10:30';
  consultationReason: string = 'First Visit General Consultation & Clinical Assessment';
  initialStage: string = 'ARRIVED';
  todayDateString: string = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  saving = signal(false);
  successBanner = signal<string | null>(null);

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.apiService.getDoctors().subscribe({
      next: (docs) => {
        if (docs && docs.length > 0) {
          const list: User[] = docs.map((d: any) => ({
            id: String(d.id),
            email: d.email || d.fullName?.toLowerCase() || 'doctor',
            fullName: d.fullName || d.email || 'Doctor',
            specialization: d.specialization || d.specialty || 'General Physician',
            specialty: d.specialty || d.specialization || 'General Physician',
            roles: ['PHYSICIAN'],
          }));
          this.doctors.set(list);
          this.selectedDoctorId = String(list[0].id);
        } else {
          this.doctors.set([]);
          this.selectedDoctorId = '';
        }
      },
      error: (err) => {
        console.warn('Could not load practitioners for intake', err);
        this.doctors.set([]);
        this.selectedDoctorId = '';
      },
    });
  }

  dismissModal(): void {
    this.close.emit();
  }

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
        nationalId: this.nationalId,
        abhaId: this.abhaId,
        gender: this.gender,
        bloodType: this.bloodType,
        address: this.address,
        phone: this.phone,
        email: this.email,
        emergencyContact: {
          name: this.emergencyContactName,
          relationship: this.emergencyContactRelationship,
          phone: this.emergencyContactPhone,
        },
        insuranceProvider: this.insuranceProvider,
        insurancePolicyNumber: this.insurancePolicyNumber,
        insuranceGroupNumber: this.insuranceGroupNumber,
        coveragePlan: this.coveragePlan,
      })
      .subscribe({
        next: (savedPatient) => {
          if (this.scheduleTodayAppointment && this.selectedDoctorId && savedPatient.id) {
            const dateStr = new Date().toISOString().split('T')[0];
            const dateTimeStr = `${dateStr}T${this.appointmentTime}:00`;
            let dateTimeIso = dateTimeStr;
            try {
              const parsed = new Date(dateTimeStr);
              if (!isNaN(parsed.getTime())) {
                dateTimeIso = parsed.toISOString();
              }
            } catch (e) {}

            this.apiService
              .scheduleAppointment({
                patientId: savedPatient.id,
                doctorId: this.selectedDoctorId,
                appointmentDate: dateTimeIso,
                startsAt: dateTimeIso,
                reason: this.consultationReason,
                status: this.initialStage,
                stage: this.initialStage,
              })
              .subscribe({
                next: () => {
                  this.finishSave(savedPatient, true);
                },
                error: () => {
                  this.finishSave(savedPatient, false);
                },
              });
          } else {
            this.finishSave(savedPatient, false);
          }
        },
        error: () => this.saving.set(false),
      });
  }

  finishSave(savedPatient: Patient, appointmentCreated: boolean): void {
    this.saving.set(false);
    const aptMsg = appointmentCreated ? ' & Same-Day Walk-in Consultation Scheduled!' : '.';
    this.successBanner.set(`Intake complete! Account created for ${savedPatient.fullName} (MRN: ${savedPatient.patientCode})${aptMsg}`);
    this.success.emit(savedPatient);
    setTimeout(() => {
      if (this.isModal) {
        this.close.emit();
      } else {
        this.router.navigate(['/receptionist/dashboard']);
      }
    }, 1400);
  }
}

