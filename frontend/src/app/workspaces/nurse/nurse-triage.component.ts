import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideClipboardList,
  lucideUserRound,
  lucideSave,
  lucideClock,
  lucideCheckCircle2,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-nurse-triage',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideClipboardList,
      lucideUserRound,
      lucideSave,
      lucideClock,
      lucideCheckCircle2,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ng-icon name="lucideClipboardList" size="24" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Clinical Triage & Patient Intake
              <span hlmBadge variant="secondary" class="text-[11px]">Nurse Station</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">Pre-consultation triage assessment, chief complaint & priority tagging</p>
          </div>
        </div>

        <div *ngIf="activePatient()" class="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card">
          <ng-icon name="lucideUserRound" size="18" class="text-muted-foreground" />
          <div>
            <span class="text-xs font-semibold text-foreground block">{{ activePatient()?.fullName }}</span>
            <span class="text-[10px] font-mono text-muted-foreground">MRN: {{ activePatient()?.patientCode }}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Input Form -->
        <div class="lg:col-span-2 p-6 rounded-xl border border-border bg-card space-y-5">
          <h2 class="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
            <ng-icon name="lucideClipboardList" size="16" class="text-amber-500" />
            Record Triage Assessment
          </h2>

          <div class="space-y-4 text-xs">
            <div>
              <label class="font-medium text-foreground block mb-1">Chief Complaint / Primary Symptoms</label>
              <input 
                type="text" 
                [(ngModel)]="chiefComplaint" 
                placeholder="e.g. Mild shortness of breath, fever for 2 days..."
                class="w-full p-2.5 rounded-md border border-input bg-background text-xs"
              />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Triage Priority Level</label>
              <select [(ngModel)]="triagePriority" class="w-full p-2.5 rounded-md border border-input bg-background text-xs">
                <option value="ROUTINE">Routine - Non-Urgent Consultation</option>
                <option value="URGENT">Urgent - Requires Prompt Assessment</option>
                <option value="EMERGENT">Emergent - Immediate Care Required</option>
              </select>
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Vitals Summary (BP, Pulse, Temp, SpO2)</label>
              <input 
                type="text" 
                [(ngModel)]="vitalsSummary" 
                placeholder="e.g. BP 120/80, Pulse 74 bpm, Temp 37.1°C, SpO2 98%"
                class="w-full p-2.5 rounded-md border border-input bg-background text-xs"
              />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Nursing Observations & Remarks</label>
              <textarea 
                [(ngModel)]="notes" 
                rows="3" 
                placeholder="Record patient appearance, mobility, hydration, or nursing remarks..."
                class="w-full p-2.5 rounded-md border border-input bg-background text-xs"
              ></textarea>
            </div>

            <div class="flex justify-end pt-2">
              <button 
                hlmBtn 
                variant="default" 
                class="bg-amber-600 hover:bg-amber-700 text-white" 
                [disabled]="saving() || !activePatient()"
                (click)="saveTriageRecord()"
              >
                <ng-icon name="lucideSave" size="14" class="mr-1.5" />
                {{ saving() ? 'Saving Triage...' : 'Save Triage Record' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Priority Indicator Sidebar -->
        <div class="space-y-4">
          <div class="p-6 rounded-xl border border-border bg-card text-center space-y-4">
            <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned Priority</h3>

            <div class="p-4 rounded-lg border text-center space-y-2"
                 [ngClass]="{
                   'border-emerald-500/30 bg-emerald-500/10 text-emerald-600': triagePriority === 'ROUTINE',
                   'border-amber-500/30 bg-amber-500/10 text-amber-600': triagePriority === 'URGENT',
                   'border-red-500/30 bg-red-500/10 text-red-600': triagePriority === 'EMERGENT'
                 }">
              <span class="text-lg font-bold uppercase tracking-wide block">{{ triagePriority }}</span>
              <span class="text-[11px] block">
                {{ triagePriority === 'EMERGENT' ? 'Immediate physician evaluation needed' : triagePriority === 'URGENT' ? 'Priority queue placement' : 'Standard consultation queue' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- History Table -->
      <div class="p-6 rounded-xl border border-border bg-card space-y-4">
        <div class="flex justify-between items-center border-b border-border pb-3">
          <h3 class="text-sm font-semibold text-foreground flex items-center gap-2">
            <ng-icon name="lucideClock" size="16" class="text-muted-foreground" />
            Triage History for {{ activePatient()?.fullName || 'Selected Patient' }}
          </h3>
        </div>

        <div class="overflow-x-auto" *ngIf="triageHistory().length > 0; else noHistory">
          <table class="w-full text-xs text-left">
            <thead class="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th class="p-3">Timestamp</th>
                <th class="p-3">Priority</th>
                <th class="p-3">Chief Complaint</th>
                <th class="p-3">Vitals Summary</th>
                <th class="p-3">Remarks</th>
                <th class="p-3">Assessed By</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr *ngFor="let h of triageHistory()" class="hover:bg-muted/20">
                <td class="p-3 text-muted-foreground">{{ h.recordedAt | date:'short' }}</td>
                <td class="p-3">
                  <span 
                    hlmBadge 
                    [variant]="h.triagePriority === 'EMERGENT' ? 'destructive' : h.triagePriority === 'URGENT' ? 'secondary' : 'outline'"
                    class="text-[10px]"
                  >
                    {{ h.triagePriority }}
                  </span>
                </td>
                <td class="p-3 font-semibold text-foreground">{{ h.chiefComplaint }}</td>
                <td class="p-3 font-mono">{{ h.vitalsSummary || 'N/A' }}</td>
                <td class="p-3 text-muted-foreground">{{ h.notes || 'No extra notes' }}</td>
                <td class="p-3 text-muted-foreground">{{ h.recordedBy?.fullName || 'Nurse' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #noHistory>
          <div class="p-6 text-center text-xs text-muted-foreground">
            No previous triage records found for this patient.
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class NurseTriageComponent implements OnInit {
  chiefComplaint: string = 'Mild shortness of breath, fever for 2 days';
  triagePriority: string = 'ROUTINE';
  vitalsSummary: string = 'BP 120/80, Pulse 74 bpm, Temp 37.1°C, SpO2 98%';
  notes: string = 'Patient is alert and oriented. No acute respiratory distress observed.';

  saving = signal(false);
  triageHistory = signal<any[]>([]);

  constructor(
    private apiService: ApiService,
    public patientContext: PatientContextService,
  ) {}

  activePatient() {
    return this.patientContext.activePatient();
  }

  ngOnInit(): void {
    if (this.activePatient()) {
      this.loadHistory();
    }
  }

  loadHistory(): void {
    const patientId = this.activePatient()?.id;
    if (patientId) {
      this.apiService.getTriageRecordsForPatient(patientId).subscribe((history) => {
        this.triageHistory.set(history);
      });
    }
  }

  saveTriageRecord(): void {
    const patient = this.activePatient();
    if (!patient || !patient.id) return;

    this.saving.set(true);
    const record = {
      patient: { id: patient.id },
      chiefComplaint: this.chiefComplaint,
      triagePriority: this.triagePriority,
      vitalsSummary: this.vitalsSummary,
      notes: this.notes,
    };

    this.apiService.submitTriage(record).subscribe({
      next: () => {
        this.saving.set(false);
        this.loadHistory();
      },
      error: () => {
        this.saving.set(false);
      },
    });
  }
}
