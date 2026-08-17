import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Appointment, AppointmentTriageRequestDTO } from '../../core/models/appointment.model';
import { toast } from '@spartan-ng/brain/sonner';
import { StatCardComponent } from '../../shared/ui/stat-card.component';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucideCalendarClock,
  lucideCheckCircle2,
  lucideX,
  lucideClipboardList,
  lucideSearch,
  lucideFilter,
  lucideClock,
  lucideUsers,
  lucideHeartPulse,
  lucideStethoscope,
  lucideRefreshCw,
  lucideUser,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-nurse-appointments',
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
    StatCardComponent,
  ],
  providers: [
    provideIcons({
      lucideActivity,
      lucideCalendarClock,
      lucideCheckCircle2,
      lucideX,
      lucideClipboardList,
      lucideSearch,
      lucideFilter,
      lucideClock,
      lucideUsers,
      lucideHeartPulse,
      lucideStethoscope,
      lucideRefreshCw,
      lucideUser,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Unit Ward & Triage Schedule
            <span hlmBadge variant="secondary" class="text-[11px] bg-amber-500/10 text-amber-600 border border-amber-500/20 font-mono">Nursing Station</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Track patient arrivals, perform pre-consultation vitals intake, and manage unit triage queue.</p>
        </div>

        <div class="flex items-center gap-2">
          <button hlmBtn variant="outline" size="sm" (click)="loadAppointments()" class="gap-2 text-xs">
            <ng-icon name="lucideRefreshCw" class="text-sm"></ng-icon> Refresh Schedule
          </button>
        </div>
      </div>

      <!-- Stat Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stat-card
          title="Total Ward Patients"
          [value]="totalCount()"
          icon="lucideUsers"
          trend="Today's Schedule"
        ></app-stat-card>
        <app-stat-card
          title="Awaiting Desk Check-in"
          [value]="awaitingCheckInCount()"
          icon="lucideClock"
          trend="Pre-Triage Stage"
        ></app-stat-card>
        <app-stat-card
          title="Ready for Nurse Triage"
          [value]="checkedInCount()"
          icon="lucideActivity"
          trend="Requires Vitals Intake"
        ></app-stat-card>
        <app-stat-card
          title="Triaged for Doctor"
          [value]="triagedCount()"
          icon="lucideCheckCircle2"
          trend="Consultation Ready"
        ></app-stat-card>
      </div>

      <!-- Filter Controls & Search -->
      <div class="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3">
        <div class="flex flex-col md:flex-row gap-3 items-center justify-between">
          <!-- View Tabs -->
          <div class="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg text-xs font-semibold w-full md:w-auto">
            <button
              (click)="setViewMode('TODAY')"
              [class.bg-background]="viewMode() === 'TODAY'"
              [class.shadow-xs]="viewMode() === 'TODAY'"
              class="px-3 py-1.5 rounded-md transition-all flex-1 md:flex-initial text-center"
            >
              Today's Queue
            </button>
            <button
              (click)="setViewMode('CHECKED_IN')"
              [class.bg-background]="viewMode() === 'CHECKED_IN'"
              [class.shadow-xs]="viewMode() === 'CHECKED_IN'"
              class="px-3 py-1.5 rounded-md transition-all flex-1 md:flex-initial text-center text-amber-600"
            >
              Pending Triage ({{ checkedInCount() }})
            </button>
            <button
              (click)="setViewMode('ALL')"
              [class.bg-background]="viewMode() === 'ALL'"
              [class.shadow-xs]="viewMode() === 'ALL'"
              class="px-3 py-1.5 rounded-md transition-all flex-1 md:flex-initial text-center"
            >
              All Ward Roster
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative w-full md:w-72">
            <ng-icon name="lucideSearch" size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Filter by patient name, MRN, or doctor..."
              class="w-full pl-9 pr-3 h-9 rounded-md border border-input bg-background text-xs"
            />
          </div>
        </div>
      </div>

      <!-- Main Appointments Table -->
      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Appointment Time</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Patient Name</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Chief Complaint / Reason</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Attending Physician</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Clinical Stage</th>
                <th hlmTableHead class="py-3 px-4 text-right font-semibold">Triage Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let apt of filteredAppointments()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-mono font-bold text-foreground">
                  {{ apt.appointmentDate | date:'shortTime' }}
                </td>
                <td hlmTableCell class="py-3 px-4">
                  <div class="font-semibold text-foreground flex items-center gap-1.5">
                    <ng-icon name="lucideUser" class="text-xs text-primary"></ng-icon>
                    {{ apt.patientName || apt.patient?.fullName || 'Patient Profile' }}
                  </div>
                  <div class="text-[10px] font-mono text-muted-foreground">MRN: {{ apt.patientCode || apt.patient?.patientCode || 'N/A' }}</div>
                </td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">
                  {{ apt.reason || 'Routine clinical intake' }}
                </td>
                <td hlmTableCell class="py-3 px-4 text-foreground font-medium">
                  {{ apt.doctorName || (apt.doctor?.fullName ? 'Dr. ' + apt.doctor?.fullName : 'Assigned Physician') }}
                </td>
                <td hlmTableCell class="py-3 px-4">
                  <span hlmBadge [variant]="getStageBadgeVariant(apt.stage || apt.status)" class="text-[10px] uppercase font-bold">
                    {{ getStageBadgeLabel(apt.stage || apt.status) }}
                  </span>
                </td>
                <td hlmTableCell class="py-3 px-4 text-right">
                  <button
                    *ngIf="(apt.stage || apt.status) === 'CHECKED_IN'"
                    hlmBtn
                    variant="default"
                    size="xs"
                    (click)="openTriageModal(apt)"
                    class="text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs"
                  >
                    <ng-icon name="lucideActivity" size="14" />
                    <span>Perform Triage Vitals</span>
                  </button>

                  <span *ngIf="['SCHEDULED', 'ARRIVED'].includes(apt.stage || apt.status)" class="text-xs text-muted-foreground italic">
                    Awaiting Desk Check-in
                  </span>

                  <span *ngIf="(apt.stage || apt.status) === 'TRIAGED'" class="text-xs text-sky-600 font-semibold flex items-center justify-end gap-1">
                    <ng-icon name="lucideCheckCircle2" size="14" />
                    Triaged (Ready for Doctor)
                  </span>

                  <span *ngIf="['IN_CONSULTATION', 'COMPLETED'].includes(apt.stage || apt.status)" class="text-xs text-muted-foreground">
                    In Session / Completed
                  </span>
                </td>
              </tr>
              <tr *ngIf="filteredAppointments().length === 0" hlmTableRow>
                <td colspan="6" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">
                  No unit ward appointments match the selected filter.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Triage Vitals Input Modal -->
      <div *ngIf="selectedApt" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-card border border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
          <div class="flex items-center justify-between border-b border-border pb-3">
            <h3 class="text-base font-bold text-foreground flex items-center gap-2">
              Clinical Triage Vitals Intake
              <span hlmBadge variant="outline" class="text-[10px]">NEWS2 Protocol</span>
            </h3>
            <button (click)="closeTriageModal()" class="text-muted-foreground hover:text-foreground">
              <ng-icon name="lucideX" class="text-lg"></ng-icon>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div class="p-3 bg-muted/40 rounded-lg border border-border">
              <span class="font-semibold text-foreground">Patient:</span> {{ selectedApt.patientName || selectedApt.patient?.fullName }}
            </div>

            <div>
              <label class="block font-semibold mb-1">Chief Complaint Notes *</label>
              <input type="text" [(ngModel)]="triageChiefComplaint" class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold mb-1">Systolic BP (mmHg) *</label>
                <input type="number" [(ngModel)]="systolic" class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs" />
              </div>
              <div>
                <label class="block font-semibold mb-1">Diastolic BP (mmHg) *</label>
                <input type="number" [(ngModel)]="diastolic" class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs" />
              </div>
              <div>
                <label class="block font-semibold mb-1">Heart Rate (bpm) *</label>
                <input type="number" [(ngModel)]="heartRate" class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs" />
              </div>
              <div>
                <label class="block font-semibold mb-1">SpO2 Oxygen Saturation (%) *</label>
                <input type="number" [(ngModel)]="spo2" class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs" />
              </div>
              <div>
                <label class="block font-semibold mb-1">Temperature (°C) *</label>
                <input type="number" step="0.1" [(ngModel)]="temperature" class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs" />
              </div>
              <div>
                <label class="block font-semibold mb-1">Respiratory Rate (/min)</label>
                <input type="number" [(ngModel)]="respiratoryRate" class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs" />
              </div>
            </div>

            <div>
              <label class="block font-semibold mb-1">Triage Priority Level *</label>
              <select [(ngModel)]="triageLevel" class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs">
                <option value="ROUTINE">Routine (Standard Consultation)</option>
                <option value="URGENT">Urgent (Priority Examination Required)</option>
                <option value="EMERGENT">Emergent (Immediate Resuscitation / STAT)</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 border-t border-border pt-4">
            <button hlmBtn variant="outline" size="sm" (click)="closeTriageModal()">Cancel</button>
            <button hlmBtn size="sm" [disabled]="isSubmitting" (click)="submitTriage()" class="bg-amber-600 hover:bg-amber-700 text-white font-semibold">
              {{ isSubmitting ? 'Saving Vitals...' : 'Submit Triage Assessment' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NurseAppointmentsComponent implements OnInit {
  appointments = signal<Appointment[]>([]);
  viewMode = signal<'TODAY' | 'CHECKED_IN' | 'ALL'>('CHECKED_IN');
  searchQuery = '';

  selectedApt: Appointment | null = null;
  triageChiefComplaint = '';
  systolic = 120;
  diastolic = 80;
  heartRate = 72;
  spo2 = 98;
  temperature = 36.8;
  respiratoryRate = 16;
  triageLevel = 'ROUTINE';
  isSubmitting = false;

  constructor(
    private apiService: ApiService,
    private patientContext: PatientContextService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.apiService.getAppointments().subscribe({
      next: (data) => this.appointments.set(data),
      error: () => toast.error('Failed to load unit ward appointments.'),
    });
  }

  setViewMode(mode: 'TODAY' | 'CHECKED_IN' | 'ALL'): void {
    this.viewMode.set(mode);
  }

  totalCount = computed(() => this.appointments().length);
  awaitingCheckInCount = computed(() => this.appointments().filter(a => ['SCHEDULED', 'ARRIVED'].includes(a.stage || a.status)).length);
  checkedInCount = computed(() => this.appointments().filter(a => (a.stage || a.status) === 'CHECKED_IN').length);
  triagedCount = computed(() => this.appointments().filter(a => ['TRIAGED', 'IN_CONSULTATION', 'COMPLETED'].includes(a.stage || a.status)).length);

  filteredAppointments = computed(() => {
    let list = this.appointments();
    const mode = this.viewMode();
    const q = this.searchQuery.toLowerCase().trim();

    if (mode === 'CHECKED_IN') {
      list = list.filter(a => (a.stage || a.status) === 'CHECKED_IN');
    }

    if (q) {
      list = list.filter(a =>
        (a.patientName || a.patient?.fullName || '').toLowerCase().includes(q) ||
        (a.patientCode || a.patient?.patientCode || '').toLowerCase().includes(q) ||
        (a.doctorName || a.doctor?.fullName || '').toLowerCase().includes(q)
      );
    }

    return list;
  });

  getStageBadgeLabel(stage: string): string {
    switch (stage) {
      case 'CHECKED_IN': return '3. Desk Checked In';
      case 'TRIAGED': return '4. Triaged for Doctor';
      case 'IN_CONSULTATION': return '5. In Doctor Session';
      case 'COMPLETED': return '6. Discharged & Done';
      default: return '1. Booked (Pre-Arrival)';
    }
  }

  getStageBadgeVariant(stage: string): 'outline' | 'secondary' | 'default' | 'destructive' {
    switch (stage) {
      case 'CHECKED_IN': return 'secondary';
      case 'TRIAGED': return 'default';
      case 'IN_CONSULTATION': return 'default';
      case 'COMPLETED': return 'secondary';
      default: return 'outline';
    }
  }

  openTriageModal(apt: Appointment): void {
    this.selectedApt = apt;
    this.triageChiefComplaint = apt.reason || '';
    if (apt.patientId) {
      this.patientContext.selectPatientById(apt.patientId);
    }
  }

  closeTriageModal(): void {
    this.selectedApt = null;
  }

  submitTriage(): void {
    if (!this.selectedApt || !this.selectedApt.id) return;
    this.isSubmitting = true;

    const patientId = this.selectedApt.patientId || this.selectedApt.patient?.id;

    const triagePayload: AppointmentTriageRequestDTO = {
      systolicBp: this.systolic,
      diastolicBp: this.diastolic,
      heartRate: this.heartRate,
      oxygenSaturation: this.spo2,
      temperature: this.temperature,
      respiratoryRate: this.respiratoryRate,
      notes: `Chief Complaint: ${this.triageChiefComplaint || 'Routine Triage'}. Level: ${this.triageLevel}`,
    };

    if (patientId) {
      this.apiService.recordVitals({
        patientId,
        systolicBp: this.systolic,
        diastolicBp: this.diastolic,
        heartRate: this.heartRate,
        oxygenSaturation: this.spo2,
        temperature: this.temperature,
        respiratoryRate: this.respiratoryRate,
      }).subscribe({ error: () => {} });
    }

    this.apiService.recordAppointmentTriage(this.selectedApt.id, triagePayload).subscribe({
      next: () => {
        this.isSubmitting = false;
        toast.success(`Triage completed for ${this.selectedApt?.patientName || 'Patient'}. Stage set to TRIAGED.`);
        this.closeTriageModal();
        this.loadAppointments();
      },
      error: () => {
        this.isSubmitting = false;
        toast.error('Failed to submit triage vitals.');
      },
    });
  }
}
