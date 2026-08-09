import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { StatCardComponent } from '../../shared/ui/stat-card.component';
import { Appointment } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideUsers,
  lucideUserPlus,
  lucideClipboardCheck,
  lucideClock,
  lucideSearch,
  lucideCheckCircle2,
  lucideShieldCheck,
  lucideHeartPulse,
  lucideArrowRight,
  lucideUserCheck,
  lucideAlertTriangle,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-receptionist-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatCardComponent,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideCalendar,
      lucideUsers,
      lucideUserPlus,
      lucideClipboardCheck,
      lucideClock,
      lucideSearch,
      lucideCheckCircle2,
      lucideShieldCheck,
      lucideHeartPulse,
      lucideArrowRight,
      lucideUserCheck,
      lucideAlertTriangle,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Receptionist Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-sky-500/30 text-sky-500 flex items-center justify-center shrink-0 shadow-sm">
            <ng-icon name="lucideCalendar" size="24" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Front Desk Command Center
              <span hlmBadge variant="secondary" class="text-[11px] bg-sky-500/10 text-sky-600 border border-sky-500/20">ROLE_RECEPTIONIST</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">Demographic registration, stage check-ins, MPI identity matching & ABHA/TPA insurance verification.</p>
          </div>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <a routerLink="/receptionist/mpi" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-xs font-semibold hover:bg-accent transition-colors">
            <ng-icon name="lucideHeartPulse" size="14" class="text-emerald-500" />
            <span>MPI Search</span>
          </a>
          <a routerLink="/receptionist/eligibility" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-xs font-semibold hover:bg-accent transition-colors">
            <ng-icon name="lucideShieldCheck" size="14" class="text-sky-500" />
            <span>RTE Verification</span>
          </a>
          <a routerLink="/receptionist/intake" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm">
            <ng-icon name="lucideUserPlus" size="14" />
            <span>5-Step Patient Intake</span>
          </a>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stat-card
          title="Scheduled Arrivals"
          [value]="scheduledCount()"
          subtitle="Awaiting Front Desk Check-in"
          icon="lucideCalendar"
          iconBgClass="bg-sky-500/10 text-sky-600" />
        <app-stat-card
          title="Arrived & Checked In"
          [value]="arrivedCount()"
          subtitle="In Waiting Room Queue"
          icon="lucideClock"
          iconBgClass="bg-amber-500/10 text-amber-600" />
        <app-stat-card
          title="RTE Verification Alerts"
          [value]="pendingRteCount()"
          subtitle="Insurance Action Required"
          icon="lucideAlertTriangle"
          iconBgClass="bg-red-500/10 text-red-600" />
        <app-stat-card
          title="Total Registered Patients"
          [value]="patientCount()"
          subtitle="Master Patient Directory"
          icon="lucideUsers"
          iconBgClass="bg-emerald-500/10 text-emerald-600" />
      </div>

      <!-- Stage Workflows Navigation Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div hlmCard class="p-5 hover:border-sky-500/40 transition-all flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="p-2 rounded-lg bg-sky-500/10 text-sky-500">
                <ng-icon name="lucideHeartPulse" size="20" />
              </span>
              <span class="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">Fellegi-Sunter</span>
            </div>
            <h3 class="text-sm font-bold text-foreground">MPI Chart De-duplication</h3>
            <p class="text-xs text-muted-foreground">Probabilistic matching by Name, DOB, ABHA/Aadhaar ID, MRN, and Phone to prevent duplicate charts.</p>
          </div>
          <a routerLink="/receptionist/mpi" class="text-xs font-semibold text-sky-500 hover:text-sky-600 flex items-center gap-1.5">
            <span>Launch MPI Search</span>
            <ng-icon name="lucideArrowRight" size="14" />
          </a>
        </div>

        <div hlmCard class="p-5 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <ng-icon name="lucideUserPlus" size="20" />
              </span>
              <span class="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">5-Step Wizard</span>
            </div>
            <h3 class="text-sm font-bold text-foreground">Patient Intake & Registration</h3>
            <p class="text-xs text-muted-foreground">Demographic wizard with PIN Code address validation & electronic ABDM/HIPAA consent.</p>
          </div>
          <a routerLink="/receptionist/intake" class="text-xs font-semibold text-emerald-500 hover:text-emerald-600 flex items-center gap-1.5">
            <span>Start Registration</span>
            <ng-icon name="lucideArrowRight" size="14" />
          </a>
        </div>

        <div hlmCard class="p-5 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                <ng-icon name="lucideShieldCheck" size="20" />
              </span>
              <span class="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">ABDM / X12 RTE</span>
            </div>
            <h3 class="text-sm font-bold text-foreground">Real-Time Eligibility (RTE)</h3>
            <p class="text-xs text-muted-foreground">Submit eligibility inquiries, parse response details, and collect front-desk co-pays with digital receipts.</p>
          </div>
          <a routerLink="/receptionist/eligibility" class="text-xs font-semibold text-purple-500 hover:text-purple-600 flex items-center gap-1.5">
            <span>Run RTE Inquiry</span>
            <ng-icon name="lucideArrowRight" size="14" />
          </a>
        </div>
      </div>

      <!-- Front Desk Intake & Stage Arrival Roster -->
      <div hlmCard class="p-6 space-y-4 border border-border shadow-sm">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 class="text-base font-bold text-foreground flex items-center gap-2">
              Front Desk Today's Patient Stage Board
              <span class="text-xs font-normal text-muted-foreground">({{ appointments().length }} Consultations)</span>
            </h2>
            <p class="text-xs text-muted-foreground">Manage patient arrivals, stage transitions, queue wait times, and insurance verification.</p>
          </div>
          <a routerLink="/receptionist/appointments" class="text-xs font-semibold text-primary hover:underline">
            View Multi-Resource Calendar Grid &rarr;
          </a>
        </div>

        <div class="overflow-x-auto rounded-xl border border-border">
          <table hlmTable class="w-full">
            <thead hlmTableHeader class="bg-muted/40">
              <tr hlmTableRow>
                <th hlmTableHead class="text-xs font-semibold">Time</th>
                <th hlmTableHead class="text-xs font-semibold">Patient Name & MRN</th>
                <th hlmTableHead class="text-xs font-semibold">Physician & Dept</th>
                <th hlmTableHead class="text-xs font-semibold">RTE Insurance Status</th>
                <th hlmTableHead class="text-xs font-semibold">Stage Tracker</th>
                <th hlmTableHead class="text-xs font-semibold text-right">Desk Stage Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr *ngFor="let apt of appointments()" hlmTableRow class="hover:bg-muted/30 transition-colors">
                <td hlmTableCell class="font-mono text-xs text-foreground font-semibold">
                  {{ apt.appointmentDate | date:'shortTime' }}
                </td>
                <td hlmTableCell>
                  <div class="font-medium text-foreground text-xs">{{ apt.patient.fullName || 'Patient Profile' }}</div>
                  <div class="text-[10px] font-mono text-muted-foreground">MRN: {{ apt.patient.patientCode }}</div>
                </td>
                <td hlmTableCell>
                  <div class="text-xs text-foreground font-medium">Dr. {{ apt.doctor.fullName || 'Assigned Staff' }}</div>
                  <div class="text-[10px] text-muted-foreground">{{ apt.reason || 'General Consultation' }}</div>
                </td>
                <td hlmTableCell>
                  <div class="flex items-center gap-1.5">
                    <span *ngIf="apt.insuranceVerified" hlmBadge variant="outline" class="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1">
                      <ng-icon name="lucideCheckCircle2" size="12" /> Verified
                    </span>
                    <span *ngIf="!apt.insuranceVerified" hlmBadge variant="outline" class="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1">
                      <ng-icon name="lucideAlertTriangle" size="12" /> RTE Pending
                    </span>
                  </div>
                </td>
                <td hlmTableCell>
                  <span hlmBadge [variant]="getStageVariant(apt.stage || apt.status)" class="text-[10px] font-mono">
                    {{ apt.stage || apt.status }}
                  </span>
                </td>
                <td hlmTableCell class="text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button *ngIf="apt.stage === 'SCHEDULED' || apt.status === 'SCHEDULED'" hlmBtn size="sm" variant="default" class="text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 h-8" (click)="transitionStage(apt, 'ARRIVED')">
                      <ng-icon name="lucideClock" size="14" />
                      <span>Arrived</span>
                    </button>
                    <button *ngIf="apt.stage === 'ARRIVED'" hlmBtn size="sm" variant="secondary" class="text-xs gap-1 bg-sky-600 text-white hover:bg-sky-700 h-8" (click)="transitionStage(apt, 'CHECKED_IN')">
                      <ng-icon name="lucideUserCheck" size="14" />
                      <span>Check In</span>
                    </button>
                    <a [routerLink]="['/receptionist/eligibility']" [queryParams]="{ patientId: apt.patient.id }" hlmBtn size="sm" variant="ghost" class="text-xs text-sky-600 hover:text-sky-700 h-8">
                      RTE Check
                    </a>
                  </div>
                </td>
              </tr>
              <tr *ngIf="appointments().length === 0" hlmTableRow>
                <td hlmTableCell colspan="6" class="text-center text-xs text-muted-foreground py-10">
                  No appointments scheduled for front-desk reception check-in today.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class ReceptionistDashboardComponent implements OnInit {
  appointments = signal<Appointment[]>([]);
  patientCount = signal(0);

  scheduledCount = computed(() =>
    this.appointments().filter((a) => (a.stage || a.status) === 'SCHEDULED').length
  );
  arrivedCount = computed(() =>
    this.appointments().filter((a) => ['ARRIVED', 'CHECKED_IN', 'IN_PROGRESS'].includes(a.stage || a.status)).length
  );
  pendingRteCount = computed(() =>
    this.appointments().filter((a) => !a.insuranceVerified).length
  );

  constructor(
    public authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getAppointments().subscribe((apts) => this.appointments.set(apts));
    this.apiService.getPatients().subscribe((pts) => this.patientCount.set(pts.length));
  }

  transitionStage(apt: Appointment, stage: string): void {
    if (!apt.id) return;
    this.apiService.updateAppointmentStage(apt.id, stage).subscribe({
      next: () => this.loadData(),
    });
  }

  getStageVariant(stage: string): 'outline' | 'secondary' | 'default' | 'destructive' {
    switch (stage) {
      case 'SCHEDULED': return 'outline';
      case 'ARRIVED': return 'secondary';
      case 'CHECKED_IN':
      case 'IN_PROGRESS': return 'default';
      case 'CANCELLED': return 'destructive';
      default: return 'secondary';
    }
  }
}
