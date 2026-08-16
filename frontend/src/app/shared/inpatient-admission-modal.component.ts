import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/services/api.service';
import { PatientContextService } from '../core/services/patient-context.service';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHospital, lucideUserPlus, lucideX, lucideUser, lucideStethoscope, lucideActivity, lucideLock } from '@ng-icons/lucide';

@Component({
  selector: 'app-inpatient-admission-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmCardImports,
    HlmButtonImports,
    HlmBadgeImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideHospital,
      lucideUserPlus,
      lucideX,
      lucideUser,
      lucideStethoscope,
      lucideActivity,
      lucideLock,
    }),
  ],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-card border border-border rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <!-- Header -->
        <div class="bg-primary/10 border-b border-primary/20 p-5 flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2.5 rounded-xl bg-primary/20 text-primary font-bold">
              <ng-icon name="lucideHospital" class="text-xl"></ng-icon>
            </div>
            <div>
              <h2 class="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                Inpatient Admission & Registration
                <span hlmBadge variant="secondary" class="text-[10px]">Hospitalization</span>
              </h2>
              <p class="text-xs text-muted-foreground mt-0.5">Register inpatient hospitalization encounter and enter bed assignment queue</p>
            </div>
          </div>
          <button (click)="closeModal()" class="text-muted-foreground hover:text-foreground p-1 rounded-lg">
            <ng-icon name="lucideX" class="text-lg"></ng-icon>
          </button>
        </div>

        <!-- Body Form -->
        <div class="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          <!-- Patient Selection -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-semibold text-foreground">Target Patient *</label>
              <span *ngIf="isPatientLocked()" hlmBadge variant="secondary" class="text-[10px] bg-primary/10 text-primary border border-primary/20 flex items-center gap-1 font-medium">
                <ng-icon name="lucideLock" size="10" /> Auto-filled from Active Chart Context
              </span>
            </div>
            <select
              [(ngModel)]="selectedPatientId"
              [disabled]="isPatientLocked()"
              class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs disabled:opacity-80 disabled:cursor-not-allowed disabled:bg-muted/40 font-medium"
            >
              <option [ngValue]="null">-- Select Patient from Registry --</option>
              <option *ngFor="let p of patientList()" [value]="p.id">
                {{ p.fullName }} (MRN: {{ p.patientCode }})
              </option>
            </select>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Admission Type -->
            <div>
              <label class="block font-semibold text-foreground mb-1">Admission Type *</label>
              <select [(ngModel)]="admissionType" class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs">
                <option value="EMERGENCY">Emergency Admission</option>
                <option value="URGENT">Urgent Inpatient Stay</option>
                <option value="ELECTIVE">Elective / Surgical Admission</option>
                <option value="NEWBORN">Newborn Delivery Admission</option>
                <option value="TRAUMA">Trauma Resuscitation Stay</option>
              </select>
            </div>

            <!-- Admission Source -->
            <div>
              <label class="block font-semibold text-foreground mb-1">Admission Source *</label>
              <select [(ngModel)]="admissionSource" class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs">
                <option value="EMERGENCY_DEPARTMENT">Emergency Department (ED)</option>
                <option value="OUTPATIENT_CLINIC">Outpatient Clinic (OPD Referral)</option>
                <option value="ELECTIVE_SCHEDULED">Elective / Scheduled Booking</option>
                <option value="INTER_FACILITY_TRANSFER">Inter-Facility Hospital Transfer</option>
                <option value="INTRA_FACILITY_TRANSFER">Internal Department Transfer</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Department / Ward -->
            <div>
              <label class="block font-semibold text-foreground mb-1">Target Ward / Unit *</label>
              <select [(ngModel)]="targetDepartment" class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs">
                <option value="Cardiology Inpatient">Cardiovascular Medicine Ward</option>
                <option value="ICU">Intensive Care Unit (ICU)</option>
                <option value="Emergency Ward">Emergency & Acute Care Ward</option>
                <option value="General Medical">General Medical Surgical Ward</option>
                <option value="Pediatrics">Pediatric Unit</option>
              </select>
            </div>

            <!-- Acuity Level -->
            <div>
              <label class="block font-semibold text-foreground mb-1">Initial Triage Acuity Level *</label>
              <select [(ngModel)]="acuityScore" class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs">
                <option value="Level 1 - Resuscitation">Level 1 - Resuscitation (Immediate STAT)</option>
                <option value="Level 2 - Emergent">Level 2 - Emergent (High Risk / Acute)</option>
                <option value="Level 3 - Urgent">Level 3 - Urgent (Multiple Resources Required)</option>
                <option value="Level 4 - Less Urgent">Level 4 - Less Urgent (Single Resource)</option>
                <option value="Level 5 - Non-Urgent">Level 5 - Non-Urgent (Baseline Routine)</option>
              </select>
            </div>
          </div>

          <!-- Chief Complaint -->
          <div>
            <label class="block font-semibold text-foreground mb-1">Primary Admission Complaint & ICD-10 Diagnosis *</label>
            <input
              type="text"
              [(ngModel)]="chiefComplaint"
              placeholder="e.g. Acute myocardial infarction, Chest pain with ST elevation (ICD-10 I21.9)..."
              class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
            />
          </div>

          <!-- Admitting Notes -->
          <div>
            <label class="block font-semibold text-foreground mb-1">Admitting Clinical Directives & Directives</label>
            <textarea
              [(ngModel)]="clinicalNotes"
              rows="2"
              placeholder="Enter initial orders, telemetry directives, isolation level, or special nursing requirements..."
              class="w-full p-2.5 rounded-md border border-input bg-background text-xs"
            ></textarea>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-muted/30 border-t border-border p-4 flex items-center justify-between">
          <button hlmBtn variant="outline" (click)="closeModal()" class="text-xs">Cancel</button>
          <button
            hlmBtn
            [disabled]="isSubmitting() || !selectedPatientId || !chiefComplaint"
            (click)="submitAdmission()"
            class="text-xs gap-2 font-semibold shadow-md bg-primary text-primary-foreground"
          >
            <ng-icon name="lucideUserPlus" class="text-sm"></ng-icon>
            {{ isSubmitting() ? 'Registering Admission...' : 'Register Inpatient Admission' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class InpatientAdmissionModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() targetPatientId: string | null | undefined = null;
  @Input() lockPatient = false;
  @Output() closed = new EventEmitter<void>();
  @Output() admitted = new EventEmitter<any>();

  patientList = signal<any[]>([]);
  selectedPatientId: string | null = null;
  isPatientLocked = signal(false);

  admissionType = 'EMERGENCY';
  admissionSource = 'EMERGENCY_DEPARTMENT';
  targetDepartment = 'Cardiology Inpatient';
  acuityScore = 'Level 2 - Emergent';
  chiefComplaint = '';
  clinicalNotes = '';
  isSubmitting = signal(false);

  constructor(
    private apiService: ApiService,
    private patientContext: PatientContextService
  ) {}

  ngOnInit() {
    this.apiService.getPatients().subscribe({
      next: (data) => {
        this.patientList.set(data);
        this.syncPatientContext();
      },
      error: () => {
        this.syncPatientContext();
      },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue || changes['targetPatientId']?.currentValue || changes['lockPatient']?.currentValue) {
      this.syncPatientContext();
    }
  }

  private syncPatientContext(): void {
    const active = this.targetPatientId || this.patientContext.activePatient()?.id;
    if (active) {
      this.selectedPatientId = String(active);
      this.isPatientLocked.set(true);
    } else {
      this.isPatientLocked.set(this.lockPatient);
    }
  }

  closeModal() {
    this.isOpen = false;
    this.closed.emit();
  }

  submitAdmission() {
    if (!this.selectedPatientId || !this.chiefComplaint) {
      toast.error('Please select a patient and enter admission chief complaint.');
      return;
    }

    this.isSubmitting.set(true);

    const payload = {
      patientId: this.selectedPatientId,
      encounterType: 'INPATIENT',
      location: this.targetDepartment,
      chiefComplaint: this.chiefComplaint,
      clinicalNotes: `[Acuity: ${this.acuityScore} | Source: ${this.admissionSource}] ${this.clinicalNotes}`,
      status: 'ADMITTED',
    };

    this.apiService.createEncounter(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting.set(false);
        toast.success(`Inpatient Admission registered successfully. Encounter #ENC-${res.id || 'NEW'} status set to ADMITTED.`);
        this.admitted.emit(res);
        this.closeModal();
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        toast.error(err.error?.message || 'Failed to register inpatient admission.');
      },
    });
  }
}

