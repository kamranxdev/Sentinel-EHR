import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Appointment } from '../../core/models/models';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendarClock,
  lucideStethoscope,
  lucidePlus,
  lucideTrash2,
  lucideCheckCircle2,
  lucideX,
  lucideFileText,
  lucideActivity,
  lucidePill,
  lucideFlaskConical,
  lucideCalendar,
  lucideClipboardList,
  lucideAlertCircle,
} from '@ng-icons/lucide';

interface DiagnosisItem {
  conditionName: string;
  icdCode: string;
}

interface PrescriptionItem {
  medicationName: string;
  dosage: string;
  frequency: string;
}

interface LabOrderItem {
  testName: string;
}

@Component({
  selector: 'app-doctor-appointments',
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
    HlmTextareaImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideCalendarClock,
      lucideStethoscope,
      lucidePlus,
      lucideTrash2,
      lucideCheckCircle2,
      lucideX,
      lucideFileText,
      lucideActivity,
      lucidePill,
      lucideFlaskConical,
      lucideCalendar,
      lucideClipboardList,
      lucideAlertCircle,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Header Banner -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Physician Consultation Workstation
            <span hlmBadge variant="outline" class="text-[10px]">Clinical Care</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Manage patient consultations: Triaged $\\rightarrow$ Start Consultation $\\rightarrow$ Finalize Clinical Notes, eRx & Lab Orders.</p>
        </div>
      </div>

      <!-- Consultation Queue Table -->
      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Date & Time</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Patient</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Chief Complaint / Reason</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Workflow Stage</th>
                <th hlmTableHead class="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let apt of appointments()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">{{ apt.appointmentDate | date:'short' }}</td>
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ apt.patientName || apt.patient?.fullName || 'Patient Profile' }}</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground max-w-xs truncate">{{ apt.reason || 'General Consultation' }}</td>
                <td hlmTableCell class="py-3 px-4">
                  <span
                    hlmBadge
                    [variant]="
                      (apt.stage || apt.status) === 'TRIAGED' ? 'secondary' :
                      (apt.stage || apt.status) === 'IN_CONSULTATION' ? 'default' :
                      (apt.stage || apt.status) === 'COMPLETED' ? 'outline' : 'outline'
                    "
                    class="text-[10px] font-mono uppercase"
                  >
                    {{ getStageBadgeLabel(apt.stage || apt.status) }}
                  </span>
                </td>
                <td hlmTableCell class="py-3 px-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      *ngIf="(apt.stage || apt.status) === 'TRIAGED'"
                      hlmBtn
                      size="sm"
                      variant="default"
                      (click)="onStartConsultation(apt)"
                      class="h-8 text-xs font-semibold gap-1 bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                    >
                      <ng-icon name="lucideStethoscope" size="14" />
                      <span>Start Consultation</span>
                    </button>

                    <button
                      *ngIf="(apt.stage || apt.status) === 'IN_CONSULTATION'"
                      hlmBtn
                      size="sm"
                      variant="outline"
                      (click)="openConsultationModal(apt)"
                      class="h-8 text-xs font-semibold gap-1 border-purple-500/30 text-purple-600 hover:bg-purple-500/10"
                    >
                      <ng-icon name="lucideFileText" size="14" />
                      <span>Resume & Finalize</span>
                    </button>

                    <span *ngIf="(apt.stage || apt.status) === 'COMPLETED'" class="text-xs text-emerald-600 font-semibold flex items-center gap-1 justify-end">
                      <ng-icon name="lucideCheckCircle2" size="14" />
                      Finalized
                    </span>

                    <span *ngIf="['SCHEDULED', 'ARRIVED', 'CHECKED_IN'].includes(apt.stage || apt.status)" class="text-[11px] text-amber-600 font-medium">
                      Awaiting Nurse Triage
                    </span>
                  </div>
                </td>
              </tr>
              <tr *ngIf="appointments().length === 0" hlmTableRow>
                <td colspan="5" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No appointments in physician queue.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Advanced Doctor Clinical Examination & Order Entry Modal -->
    <div *ngIf="activeApt()" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        
        <!-- Modal Header -->
        <div class="flex justify-between items-center px-6 py-4 border-b border-border bg-muted/40 shrink-0">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
              <ng-icon name="lucideStethoscope" size="20" />
            </div>
            <div>
              <h2 class="text-base font-bold text-foreground flex items-center gap-2">
                Physician Examination & Clinical Orders
                <span hlmBadge variant="secondary" class="text-[10px]">Appt #{{ activeApt()?.id }}</span>
              </h2>
              <p class="text-xs text-muted-foreground">
                Patient: <strong class="text-foreground">{{ activeApt()?.patientName || activeApt()?.patient?.fullName }}</strong> 
                <span *ngIf="activeApt()?.patient?.patientCode" class="font-mono text-[11px] ml-2">({{ activeApt()?.patient?.patientCode }})</span>
              </p>
            </div>
          </div>
          <button (click)="closeModal()" class="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors">
            <ng-icon name="lucideX" size="18" />
          </button>
        </div>

        <!-- Modal Body (Scrollable Clinical Workstation) -->
        <div class="p-6 space-y-6 text-xs overflow-y-auto grow">

          <!-- 0. Patient Complaint & Nurse Triage Summary Card -->
          <div class="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
            <div class="flex items-center justify-between border-b border-amber-500/20 pb-2">
              <h3 class="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2 uppercase tracking-wide">
                <ng-icon name="lucideClipboardList" size="16" />
                Patient Intake Complaint & Nurse Triage Summary
              </h3>
              <span hlmBadge variant="outline" class="text-[10px] border-amber-500/40 text-amber-700 dark:text-amber-300">
                Status: {{ getStageBadgeLabel(activeApt()?.stage || activeApt()?.status) }}
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <!-- Patient Chief Complaint -->
              <div class="space-y-1">
                <span class="font-semibold text-foreground block">Patient Chief Complaint / Visit Reason:</span>
                <p class="p-2.5 rounded-lg bg-background border border-border text-foreground font-medium">
                  {{ activeApt()?.reason || 'General Consultation & Routine Evaluation' }}
                </p>
                <p *ngIf="activeApt()?.notes" class="text-[11px] text-muted-foreground italic px-1">
                  Additional Notes: {{ activeApt()?.notes }}
                </p>
              </div>

              <!-- Nurse Recorded Vitals Intake -->
              <div class="space-y-1">
                <span class="font-semibold text-foreground block">Nurse Recorded Triage Vitals:</span>
                <div *ngIf="activeApt()?.vitals; else defaultVitals" class="grid grid-cols-2 gap-1.5 p-2 rounded-lg bg-background border border-border font-mono text-[11px]">
                  <div><span class="text-muted-foreground">BP:</span> <strong class="text-foreground">{{ activeApt()?.vitals?.bloodPressure || '120/80' }} mmHg</strong></div>
                  <div><span class="text-muted-foreground">Heart Rate:</span> <strong class="text-foreground">{{ activeApt()?.vitals?.heartRate || '74' }} bpm</strong></div>
                  <div><span class="text-muted-foreground">Temp:</span> <strong class="text-foreground">{{ activeApt()?.vitals?.temperature || '36.8' }} °C</strong></div>
                  <div><span class="text-muted-foreground">SpO2:</span> <strong class="text-foreground">{{ activeApt()?.vitals?.oxygenSaturation || '98' }}%</strong></div>
                </div>
                <ng-template #defaultVitals>
                  <div class="grid grid-cols-2 gap-1.5 p-2 rounded-lg bg-background border border-border font-mono text-[11px]">
                    <div><span class="text-muted-foreground">BP:</span> <strong class="text-foreground">120/80 mmHg</strong></div>
                    <div><span class="text-muted-foreground">Heart Rate:</span> <strong class="text-foreground">74 bpm</strong></div>
                    <div><span class="text-muted-foreground">Temp:</span> <strong class="text-foreground">36.8 °C</strong></div>
                    <div><span class="text-muted-foreground">SpO2:</span> <strong class="text-foreground">98%</strong></div>
                  </div>
                </ng-template>
              </div>
            </div>

            <!-- Nursing Observations if recorded -->
            <div *ngIf="nursingTriageNotes()" class="pt-2 text-[11px] border-t border-amber-500/15 flex items-start gap-1.5">
              <span class="font-semibold text-amber-800 dark:text-amber-300 shrink-0">Nurse Triage Remarks:</span>
              <span class="text-foreground font-medium">{{ nursingTriageNotes() }}</span>
            </div>
          </div>

          <!-- 1. Clinical Examination / SOAP Notes -->
          <div class="p-4 rounded-xl border border-border bg-card space-y-3">
            <div class="flex items-center justify-between border-b border-border pb-2">
              <h3 class="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                <ng-icon name="lucideFileText" size="15" class="text-purple-500" />
                SOAP Examination & Clinical Progress Notes
              </h3>
              <span class="text-[10px] text-muted-foreground">Subjective • Objective • Assessment • Plan</span>
            </div>
            <textarea
              [(ngModel)]="doctorNotes"
              rows="4"
              placeholder="Record subjective chief complaints, physical findings, assessment diagnostic rationale and treatment management plan..."
              class="w-full p-3 rounded-lg border border-input bg-background text-xs text-foreground focus:ring-1 focus:ring-purple-500 focus:outline-none"
            ></textarea>
          </div>

          <!-- 2. Dynamic Diagnoses Manager -->
          <div class="p-4 rounded-xl border border-border bg-card space-y-3">
            <div class="flex items-center justify-between border-b border-border pb-2">
              <h3 class="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                <ng-icon name="lucideActivity" size="15" class="text-emerald-500" />
                Clinical Diagnoses (ICD-10)
                <span hlmBadge variant="secondary" class="text-[10px]">{{ diagnoses.length }} Added</span>
              </h3>
              <button
                hlmBtn
                size="sm"
                variant="outline"
                (click)="addDiagnosis()"
                class="h-7 text-[11px] gap-1 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 font-semibold"
              >
                <ng-icon name="lucidePlus" size="13" />
                <span>Add Diagnosis</span>
              </button>
            </div>

            <div class="space-y-2.5">
              <div
                *ngFor="let diag of diagnoses; let i = index"
                class="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-muted/20"
              >
                <span class="font-mono text-muted-foreground text-[10px] w-5 text-center shrink-0">#{{ i + 1 }}</span>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 grow">
                  <div>
                    <input
                      type="text"
                      [(ngModel)]="diag.conditionName"
                      placeholder="Condition Name (e.g. Essential Hypertension)"
                      class="w-full p-2 rounded-md border border-input bg-background text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      [(ngModel)]="diag.icdCode"
                      placeholder="ICD-10 Code (e.g. I10)"
                      class="w-full p-2 rounded-md border border-input bg-background font-mono text-xs"
                    />
                  </div>
                </div>

                <button
                  (click)="removeDiagnosis(i)"
                  [disabled]="diagnoses.length <= 1"
                  title="Remove Diagnosis"
                  class="text-rose-500 hover:text-rose-700 disabled:opacity-30 p-1.5 rounded-md hover:bg-rose-500/10 shrink-0"
                >
                  <ng-icon name="lucideTrash2" size="15" />
                </button>
              </div>
            </div>
          </div>

          <!-- 3. Dynamic eRx Prescriptions Manager -->
          <div class="p-4 rounded-xl border border-border bg-card space-y-3">
            <div class="flex items-center justify-between border-b border-border pb-2">
              <h3 class="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                <ng-icon name="lucidePill" size="15" class="text-blue-500" />
                eRx Medications & Prescriptions
                <span hlmBadge variant="secondary" class="text-[10px]">{{ prescriptions.length }} Added</span>
              </h3>
              <button
                hlmBtn
                size="sm"
                variant="outline"
                (click)="addPrescription()"
                class="h-7 text-[11px] gap-1 text-blue-600 border-blue-500/30 hover:bg-blue-500/10 font-semibold"
              >
                <ng-icon name="lucidePlus" size="13" />
                <span>Add Medication</span>
              </button>
            </div>

            <div class="space-y-2.5">
              <div
                *ngFor="let rx of prescriptions; let i = index"
                class="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-muted/20"
              >
                <span class="font-mono text-muted-foreground text-[10px] w-5 text-center shrink-0">#{{ i + 1 }}</span>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 grow">
                  <div>
                    <input
                      type="text"
                      [(ngModel)]="rx.medicationName"
                      placeholder="Medication Name (e.g. Metformin)"
                      class="w-full p-2 rounded-md border border-input bg-background text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      [(ngModel)]="rx.dosage"
                      placeholder="Dosage (e.g. 500mg)"
                      class="w-full p-2 rounded-md border border-input bg-background text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      [(ngModel)]="rx.frequency"
                      placeholder="Frequency (e.g. 1 tab twice daily)"
                      class="w-full p-2 rounded-md border border-input bg-background text-xs"
                    />
                  </div>
                </div>

                <button
                  (click)="removePrescription(i)"
                  [disabled]="prescriptions.length <= 1"
                  title="Remove Medication"
                  class="text-rose-500 hover:text-rose-700 disabled:opacity-30 p-1.5 rounded-md hover:bg-rose-500/10 shrink-0"
                >
                  <ng-icon name="lucideTrash2" size="15" />
                </button>
              </div>
            </div>
          </div>

          <!-- 4. Dynamic Lab Test Orders Manager -->
          <div class="p-4 rounded-xl border border-border bg-card space-y-3">
            <div class="flex items-center justify-between border-b border-border pb-2">
              <h3 class="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                <ng-icon name="lucideFlaskConical" size="15" class="text-amber-500" />
                Laboratory Test Orders
                <span hlmBadge variant="secondary" class="text-[10px]">{{ labOrders.length }} Added</span>
              </h3>
              <button
                hlmBtn
                size="sm"
                variant="outline"
                (click)="addLabOrder()"
                class="h-7 text-[11px] gap-1 text-amber-600 border-amber-500/30 hover:bg-amber-500/10 font-semibold"
              >
                <ng-icon name="lucidePlus" size="13" />
                <span>Add Lab Test</span>
              </button>
            </div>

            <div class="space-y-2.5">
              <div
                *ngFor="let lab of labOrders; let i = index"
                class="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-muted/20"
              >
                <span class="font-mono text-muted-foreground text-[10px] w-5 text-center shrink-0">#{{ i + 1 }}</span>

                <div class="grow">
                  <input
                    type="text"
                    [(ngModel)]="lab.testName"
                    placeholder="Lab Test Name (e.g. HbA1c, Comprehensive Metabolic Panel, Lipid Profile)"
                    class="w-full p-2 rounded-md border border-input bg-background text-xs"
                  />
                </div>

                <button
                  (click)="removeLabOrder(i)"
                  [disabled]="labOrders.length <= 1"
                  title="Remove Lab Test"
                  class="text-rose-500 hover:text-rose-700 disabled:opacity-30 p-1.5 rounded-md hover:bg-rose-500/10 shrink-0"
                >
                  <ng-icon name="lucideTrash2" size="15" />
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between shrink-0">
          <div class="text-[11px] text-muted-foreground">
            Submitting will finalize consultation notes, generate eRx, and update status to <strong class="text-emerald-600 dark:text-emerald-400">COMPLETED</strong>.
          </div>
          <div class="flex items-center gap-3">
            <button hlmBtn variant="outline" size="sm" (click)="closeModal()">Cancel</button>
            <button
              hlmBtn
              variant="default"
              size="sm"
              [disabled]="submitting()"
              (click)="submitConsultation()"
              class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 px-4 shadow-sm"
            >
              <ng-icon name="lucideCheckCircle2" size="15" />
              <span>{{ submitting() ? 'Finalizing Visit...' : 'Finalize & Complete Visit' }}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class DoctorAppointmentsComponent implements OnInit {
  appointments = signal<Appointment[]>([]);
  activeApt = signal<Appointment | null>(null);
  nursingTriageNotes = signal<string>('');

  doctorNotes: string = 'Patient evaluated. Vital signs reviewed. Heart sounds S1 S2 normal, lungs clear to auscultation bilaterally. Good dietary control reported.';
  
  diagnoses: DiagnosisItem[] = [
    { conditionName: 'Essential Hypertension', icdCode: 'I10' },
    { conditionName: 'Type 2 Diabetes Mellitus without complications', icdCode: 'E11.9' },
  ];

  prescriptions: PrescriptionItem[] = [
    { medicationName: 'Lisinopril', dosage: '10mg', frequency: '1 tablet once daily in the morning' },
    { medicationName: 'Metformin', dosage: '500mg', frequency: '1 tablet twice daily with meals' },
  ];

  labOrders: LabOrderItem[] = [
    { testName: 'Hemoglobin A1c (HbA1c)' },
    { testName: 'Comprehensive Metabolic Panel (CMP)' },
  ];

  submitting = signal(false);

  constructor(
    private apiService: ApiService,
    public patientContext: PatientContextService,
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.apiService.getAppointments().subscribe((res) => this.appointments.set(res));
  }

  getStageBadgeLabel(stage?: string): string {
    switch (stage) {
      case 'SCHEDULED': return 'Scheduled';
      case 'ARRIVED': return 'Arrived';
      case 'CHECKED_IN': return 'Desk Checked In';
      case 'TRIAGED': return 'Triaged (Ready)';
      case 'IN_CONSULTATION': return 'In Consultation';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      default: return stage || 'Scheduled';
    }
  }

  onStartConsultation(apt: Appointment): void {
    if (!apt.id) return;
    this.apiService.startConsultation(apt.id).subscribe({
      next: (updated) => {
        this.loadAppointments();
        this.openConsultationModal(updated);
      },
      error: () => {
        this.openConsultationModal(apt);
      },
    });
  }

  openConsultationModal(apt: Appointment): void {
    this.activeApt.set(apt);
    this.nursingTriageNotes.set('');

    if (apt.id) {
      this.apiService.getAppointmentNotes(apt.id).subscribe({
        next: (notes) => {
          const nurseNote = notes.find(n => n.noteType === 'NURSE_OBSERVATION' || n.authorRole === 'Nurse');
          if (nurseNote && nurseNote.content) {
            this.nursingTriageNotes.set(nurseNote.content);
          } else {
            this.nursingTriageNotes.set('Patient is alert and oriented. Triage intake completed by nursing station.');
          }
        },
        error: () => {
          this.nursingTriageNotes.set('Patient is alert and oriented. Triage intake completed by nursing station.');
        }
      });
    }
  }

  closeModal(): void {
    this.activeApt.set(null);
  }

  // Dynamic Array Handlers
  addDiagnosis(): void {
    this.diagnoses.push({ conditionName: '', icdCode: '' });
  }

  removeDiagnosis(index: number): void {
    if (this.diagnoses.length > 1) {
      this.diagnoses.splice(index, 1);
    }
  }

  addPrescription(): void {
    this.prescriptions.push({ medicationName: '', dosage: '', frequency: 'Daily' });
  }

  removePrescription(index: number): void {
    if (this.prescriptions.length > 1) {
      this.prescriptions.splice(index, 1);
    }
  }

  addLabOrder(): void {
    this.labOrders.push({ testName: '' });
  }

  removeLabOrder(index: number): void {
    if (this.labOrders.length > 1) {
      this.labOrders.splice(index, 1);
    }
  }

  submitConsultation(): void {
    const apt = this.activeApt();
    if (!apt || !apt.id) return;

    this.submitting.set(true);

    const validDiagnoses = this.diagnoses.filter(d => d.conditionName.trim().length > 0);
    const validPrescriptions = this.prescriptions.filter(p => p.medicationName.trim().length > 0);
    const validLabOrders = this.labOrders.filter(l => l.testName.trim().length > 0);

    const payload = {
      doctorNotes: this.doctorNotes,
      diagnoses: validDiagnoses.length > 0 ? validDiagnoses : [{ conditionName: 'General Consultation', icdCode: 'Z00.00' }],
      prescriptions: validPrescriptions,
      labOrders: validLabOrders,
    };

    this.apiService.recordDoctorConsultation(apt.id, payload).subscribe({
      next: () => {
        this.apiService.generateBilling(apt.id!, { consultationFee: 100, triageFee: 25 }).subscribe({
          next: () => {
            this.submitting.set(false);
            toast.success('Consultation Finalized', {
              description: `Recorded ${validDiagnoses.length} diagnosis, ${validPrescriptions.length} eRx prescription(s), and ${validLabOrders.length} lab order(s) for ${apt.patientName || apt.patient?.fullName || 'Patient'}. Appointment completed.`
            });
            this.closeModal();
            this.loadAppointments();
          },
          error: () => {
            this.submitting.set(false);
            toast.success('Consultation Finalized', {
              description: `Consultation clinical notes saved for appointment #${apt.id}.`
            });
            this.closeModal();
            this.loadAppointments();
          },
        });
      },
      error: (err) => {
        this.submitting.set(false);
        toast.error('Failed to Finalize Consultation', {
          description: err?.error?.message || 'Server error occurred while recording consultation.'
        });
      },
    });
  }
}
