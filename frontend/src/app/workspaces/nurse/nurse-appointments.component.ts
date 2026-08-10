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
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideCalendarClock, lucideCheckCircle2, lucideX, lucideClipboardList } from '@ng-icons/lucide';

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
  ],
  providers: [provideIcons({ lucideActivity, lucideCalendarClock, lucideCheckCircle2, lucideX, lucideClipboardList })],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Unit Triage Schedule
            <span hlmBadge variant="secondary" class="text-[10px]">Nurse Triage</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Pre-consultation triage vitals intake and patient preparation schedule.</p>
        </div>
      </div>

      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Time</th>
                <th hlmTableHead class="py-3 px-4 text-left">Patient</th>
                <th hlmTableHead class="py-3 px-4 text-left">Reason for Visit</th>
                <th hlmTableHead class="py-3 px-4 text-left">Clinical Status</th>
                <th hlmTableHead class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let apt of appointments()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">{{ apt.appointmentDate | date:'shortTime' }}</td>
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ apt.patientName || apt.patient?.fullName || 'Patient Profile' }}</td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">{{ apt.reason }}</td>
                <td hlmTableCell class="py-3 px-4">
                  <span
                    hlmBadge
                    [variant]="
                      (apt.stage || apt.status) === 'CHECKED_IN' ? 'secondary' :
                      (apt.stage || apt.status) === 'TRIAGED' ? 'default' : 'outline'
                    "
                    class="text-[10px]"
                  >
                    {{ getStageBadgeLabel(apt.stage || apt.status) }}
                  </span>
                </td>
                <td hlmTableCell class="py-3 px-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <!-- Perform Triage button ONLY available when patient is CHECKED_IN (desk checked in) -->
                    <button
                      *ngIf="(apt.stage || apt.status) === 'CHECKED_IN'"
                      hlmBtn
                      variant="outline"
                      size="sm"
                      (click)="openTriageModal(apt)"
                      class="h-8 text-xs gap-1 border-amber-500/30 text-amber-600 hover:bg-amber-500/10 font-semibold"
                    >
                      <ng-icon name="lucideActivity" size="14" />
                      <span>Perform Triage Vitals</span>
                    </button>

                    <span *ngIf="['SCHEDULED', 'ARRIVED'].includes(apt.stage || apt.status)" class="text-xs text-muted-foreground italic">
                      Awaiting Desk Check-In
                    </span>

                    <span *ngIf="(apt.stage || apt.status) === 'TRIAGED'" class="text-xs text-sky-600 font-semibold flex items-center gap-1">
                      <ng-icon name="lucideCheckCircle2" size="14" />
                      Triaged (Ready for Doctor)
                    </span>

                    <span *ngIf="['IN_CONSULTATION', 'COMPLETED'].includes(apt.stage || apt.status)" class="text-xs text-muted-foreground">
                      In Doctor Session / Done
                    </span>
                  </div>
                </td>
              </tr>
              <tr *ngIf="appointments().length === 0" hlmTableRow>
                <td colspan="5" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No active triage appointments.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Nurse Triage Vitals Modal -->
    <div *ngIf="activeApt()" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div class="flex justify-between items-center px-6 py-4 border-b border-border bg-muted/30">
          <div class="flex items-center gap-2">
            <div class="size-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ng-icon name="lucideClipboardList" size="18" />
            </div>
            <div>
              <h2 class="text-base font-bold text-foreground">Record Triage Vitals Intake</h2>
              <p class="text-xs text-muted-foreground">Patient: {{ activeApt()?.patientName || activeApt()?.patient?.fullName }}</p>
            </div>
          </div>
          <button (click)="closeModal()" class="text-muted-foreground hover:text-foreground">
            <ng-icon name="lucideX" size="18" />
          </button>
        </div>

        <div class="p-6 space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-semibold text-foreground block mb-1">Blood Pressure (mmHg)</label>
              <input type="text" [(ngModel)]="bp" placeholder="120/80" class="w-full p-2 rounded-md border border-input bg-background text-xs" />
            </div>
            <div>
              <label class="font-semibold text-foreground block mb-1">Heart Rate (bpm)</label>
              <input type="number" [(ngModel)]="hr" placeholder="72" class="w-full p-2 rounded-md border border-input bg-background text-xs" />
            </div>
            <div>
              <label class="font-semibold text-foreground block mb-1">Temperature (°C)</label>
              <input type="number" step="0.1" [(ngModel)]="temp" placeholder="36.8" class="w-full p-2 rounded-md border border-input bg-background text-xs" />
            </div>
            <div>
              <label class="font-semibold text-foreground block mb-1">Oxygen Saturation SpO2 (%)</label>
              <input type="number" [(ngModel)]="spo2" placeholder="98" class="w-full p-2 rounded-md border border-input bg-background text-xs" />
            </div>
          </div>

          <div>
            <label class="font-semibold text-foreground block mb-1">Nursing Triage Notes & Observations</label>
            <textarea
              [(ngModel)]="nursingNotes"
              rows="3"
              placeholder="Patient chief complaint, physical state, mobility, alertness..."
              class="w-full p-2.5 rounded-md border border-input bg-background text-xs"
            ></textarea>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-border bg-muted/20 flex justify-end gap-3">
          <button hlmBtn variant="outline" size="sm" (click)="closeModal()">Cancel</button>
          <button
            hlmBtn
            variant="default"
            size="sm"
            [disabled]="submitting()"
            (click)="submitTriage()"
            class="bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-1"
          >
            <ng-icon name="lucideCheckCircle2" size="14" />
            <span>{{ submitting() ? 'Saving Triage...' : 'Save Vitals & Complete Triage' }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class NurseAppointmentsComponent implements OnInit {
  appointments = signal<Appointment[]>([]);
  activeApt = signal<Appointment | null>(null);

  bp: string = '120/80';
  hr: number = 74;
  temp: number = 36.8;
  spo2: number = 98;
  nursingNotes: string = 'Patient is alert and oriented. Chief complaint reviewed and vitals stable.';
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
      case 'CHECKED_IN': return 'Checked In (Desk)';
      case 'TRIAGED': return 'Triaged';
      case 'IN_CONSULTATION': return 'In Consultation';
      case 'COMPLETED': return 'Completed';
      default: return stage || 'Scheduled';
    }
  }

  openTriageModal(apt: Appointment): void {
    this.activeApt.set(apt);
  }

  closeModal(): void {
    this.activeApt.set(null);
  }

  submitTriage(): void {
    const apt = this.activeApt();
    if (!apt || !apt.id) return;

    this.submitting.set(true);

    const payload = {
      bloodPressure: this.bp || '120/80',
      heartRate: this.hr ? Number(this.hr) : 74,
      temperature: this.temp ? Number(this.temp) : 36.8,
      oxygenSaturation: this.spo2 ? Number(this.spo2) : 98,
      nursingNotes: this.nursingNotes || 'Patient triaged by nurse.',
    };

    this.apiService.recordTriageVitals(apt.id, payload).subscribe({
      next: () => {
        this.submitting.set(false);
        toast.success('Triage Vitals Recorded', {
          description: `Vitals & Nursing notes recorded for appointment #${apt.id}. Patient status updated to TRIAGED.`
        });
        this.closeModal();
        this.loadAppointments();
      },
      error: (err) => {
        this.submitting.set(false);
        toast.error('Failed to Record Triage', {
          description: err?.error?.message || 'Error occurred while saving triage vitals.'
        });
      },
    });
  }
}
