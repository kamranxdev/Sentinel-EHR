import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { StatCardComponent } from '../../shared/ui/stat-card.component';
import { Appointment } from '../../core/models/appointment.model';
import { ReceptionistIntakeComponent } from './receptionist-intake.component';
import { ReceptionistEligibilityComponent } from './receptionist-eligibility.component';

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
  lucideCalendarClock,
  lucideHospital,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-receptionist-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    StatCardComponent,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
    NgIcon,
    ReceptionistIntakeComponent,
    ReceptionistEligibilityComponent,
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
      lucideCalendarClock,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Receptionist Header -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border"
      >
        <div class="flex items-center gap-4">
          <div
            class="size-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-sky-500/30 text-sky-500 flex items-center justify-center shrink-0 shadow-sm"
          >
            <ng-icon name="lucideCalendar" size="24" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Front Desk Command Center
              <span
                hlmBadge
                variant="secondary"
                class="text-[11px] bg-sky-500/10 text-sky-600 border border-sky-500/20"
                >RECEPTIONIST</span
              >
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">
              Demographic registration, stage check-ins, MPI identity matching & ABHA/TPA insurance
              verification.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <a
            routerLink="/receptionist/appointments"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-600 text-xs font-semibold hover:bg-sky-500/20 transition-colors"
          >
            <ng-icon name="lucideCalendarClock" size="14" />
            <span>Appointments Roster</span>
          </a>
          <a
            routerLink="/receptionist/mpi"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-xs font-semibold hover:bg-accent transition-colors"
          >
            <ng-icon name="lucideHeartPulse" size="14" class="text-emerald-500" />
            <span>MPI Search</span>
          </a>
          <button
            (click)="openRteModal()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-xs font-semibold hover:bg-accent transition-colors"
          >
            <ng-icon name="lucideShieldCheck" size="14" class="text-sky-500" />
            <span>RTE Verification</span>
          </button>
          <button
            (click)="openIntakeModal()"
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <ng-icon name="lucideUserPlus" size="14" />
            <span>5-Step Patient Intake</span>
          </button>
        </div>
      </div>

      <!-- Stage Workflows Navigation Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          hlmCard
          class="p-5 hover:border-sky-500/40 transition-all flex flex-col justify-between space-y-4"
        >
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="p-2 rounded-lg bg-sky-500/10 text-sky-500">
                <ng-icon name="lucideHeartPulse" size="20" />
              </span>
              <span
                class="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground"
                >Fellegi-Sunter</span
              >
            </div>
            <h3 class="text-sm font-bold text-foreground">MPI Chart De-duplication</h3>
            <p class="text-xs text-muted-foreground">
              Probabilistic matching by Name, DOB, ABHA/Aadhaar ID, MRN, and Phone to prevent
              duplicate charts.
            </p>
          </div>
          <a
            routerLink="/receptionist/mpi"
            class="text-xs font-semibold text-sky-500 hover:text-sky-600 flex items-center gap-1.5"
          >
            <span>Launch MPI Search</span>
            <ng-icon name="lucideArrowRight" size="14" />
          </a>
        </div>

        <div
          hlmCard
          class="p-5 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4"
        >
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <ng-icon name="lucideUserPlus" size="20" />
              </span>
              <span
                class="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground"
                >5-Step Wizard</span
              >
            </div>
            <h3 class="text-sm font-bold text-foreground">Patient Intake & Registration</h3>
            <p class="text-xs text-muted-foreground">
              Demographic wizard with PIN Code address validation & electronic ABDM/DPDP consent.
            </p>
          </div>
          <button
            (click)="openIntakeModal()"
            class="text-xs font-semibold text-emerald-500 hover:text-emerald-600 flex items-center gap-1.5 text-left"
          >
            <span>Start Registration</span>
            <ng-icon name="lucideArrowRight" size="14" />
          </button>
        </div>

        <div
          hlmCard
          class="p-5 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4"
        >
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                <ng-icon name="lucideShieldCheck" size="20" />
              </span>
              <span
                class="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground"
                >ABDM / X12 RTE</span
              >
            </div>
            <h3 class="text-sm font-bold text-foreground">Real-Time Eligibility (RTE)</h3>
            <p class="text-xs text-muted-foreground">
              Submit eligibility inquiries, parse response details, and collect front-desk co-pays
              with digital receipts.
            </p>
          </div>
          <button
            (click)="openRteModal()"
            class="text-xs font-semibold text-purple-500 hover:text-purple-600 flex items-center gap-1.5 text-left"
          >
            <span>Run RTE Inquiry</span>
            <ng-icon name="lucideArrowRight" size="14" />
          </button>
        </div>
      </div>

      <!-- Front Desk Intake & Stage Arrival Roster -->
      <div hlmCard class="p-6 space-y-4 border border-border shadow-sm">
        <div
          class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3 border-b border-border"
        >
          <div>
            <h2 class="text-base font-bold text-foreground flex items-center gap-2">
              Front Desk Today's Patient Stage Board
              <span class="text-xs font-normal text-muted-foreground"
                >({{ displayAppointments().length }} Consultations)</span
              >
            </h2>
            <p class="text-xs text-muted-foreground">
              Manage patient arrivals, stage transitions, queue wait times, and insurance
              verification for selected date.
            </p>
          </div>

          <!-- Date Filter Controls -->
          <div class="flex items-center gap-2 flex-wrap">
            <div class="flex items-center bg-muted/60 p-1 rounded-lg border border-border text-xs">
              <button
                type="button"
                class="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                [ngClass]="
                  viewMode() === 'TODAY'
                    ? 'bg-background text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                "
                (click)="setViewMode('TODAY')"
              >
                Today
              </button>
              <button
                type="button"
                class="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                [ngClass]="
                  viewMode() === 'DATE'
                    ? 'bg-background text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                "
                (click)="setViewMode('DATE')"
              >
                Select Date
              </button>
              <button
                type="button"
                class="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                [ngClass]="
                  viewMode() === 'ALL'
                    ? 'bg-background text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                "
                (click)="setViewMode('ALL')"
              >
                All Dates
              </button>
            </div>

            <input
              *ngIf="viewMode() === 'DATE'"
              type="date"
              [ngModel]="selectedDate()"
              (ngModelChange)="selectedDate.set($event)"
              class="px-2.5 py-1 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />

            <a
              routerLink="/receptionist/appointments"
              class="text-xs font-semibold text-primary hover:underline ml-2"
            >
              View Full Appointments Roster &rarr;
            </a>
          </div>
        </div>

        <!-- Quick Metrics Grid for active view -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <app-stat-card
            title="Scheduled Arrivals"
            [value]="scheduledCount()"
            subtitle="Awaiting Front Desk Check-in"
            icon="lucideCalendar"
            iconBgClass="bg-sky-500/10 text-sky-600"
          />
          <app-stat-card
            title="Arrived & Checked In"
            [value]="arrivedCount()"
            subtitle="In Waiting Room Queue"
            icon="lucideClock"
            iconBgClass="bg-amber-500/10 text-amber-600"
          />
          <app-stat-card
            title="RTE Verification Alerts"
            [value]="pendingRteCount()"
            subtitle="Insurance Action Required"
            icon="lucideAlertTriangle"
            iconBgClass="bg-red-500/10 text-red-600"
          />
          <app-stat-card
            title="Total Registered Patients"
            [value]="patientCount()"
            subtitle="Master Patient Directory"
            icon="lucideUsers"
            iconBgClass="bg-emerald-500/10 text-emerald-600"
          />
        </div>

        <div class="overflow-x-auto rounded-xl border border-border">
          <table hlmTable class="w-full">
            <thead hlmTableHeader class="bg-muted/40">
              <tr hlmTableRow>
                <th hlmTableHead class="text-xs font-semibold">Date & Time</th>
                <th hlmTableHead class="text-xs font-semibold">Patient Name & MRN</th>
                <th hlmTableHead class="text-xs font-semibold">Physician & Dept</th>
                <th hlmTableHead class="text-xs font-semibold">RTE Insurance Status</th>
                <th hlmTableHead class="text-xs font-semibold">Stage Tracker</th>
                <th hlmTableHead class="text-xs font-semibold text-right">Desk Stage Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr
                *ngFor="let apt of displayAppointments()"
                hlmTableRow
                class="hover:bg-muted/30 transition-colors"
              >
                <td hlmTableCell class="font-mono text-xs text-foreground font-semibold">
                  <div>{{ apt.appointmentDate | date: 'shortTime' }}</div>
                  <div
                    *ngIf="viewMode() === 'ALL' || !isToday(apt.appointmentDate)"
                    class="text-[10px] text-muted-foreground font-normal"
                  >
                    {{ apt.appointmentDate | date: 'mediumDate' }}
                  </div>
                </td>
                <td hlmTableCell>
                  <div class="font-medium text-foreground text-xs">
                    {{ apt.patientName || apt.patient?.fullName || 'Patient Profile' }}
                  </div>
                  <div class="text-[10px] font-mono text-muted-foreground">
                    MRN: {{ apt.patientCode || apt.patient?.patientCode || 'N/A' }}
                  </div>
                </td>
                <td hlmTableCell>
                  <div class="text-xs text-foreground font-medium">
                    {{
                      apt.doctorName ||
                        (apt.doctor?.fullName ? 'Dr. ' + apt.doctor?.fullName : 'Assigned Staff')
                    }}
                  </div>
                  <div class="text-[10px] text-muted-foreground">
                    {{ apt.reason || 'General Consultation' }}
                  </div>
                </td>
                <td hlmTableCell>
                  <div class="flex items-center gap-1.5">
                    <span
                      *ngIf="apt.insuranceVerified"
                      hlmBadge
                      variant="outline"
                      class="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1"
                    >
                      <ng-icon name="lucideCheckCircle2" size="12" /> Verified
                    </span>
                    <span
                      *ngIf="!apt.insuranceVerified"
                      hlmBadge
                      variant="outline"
                      class="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1"
                    >
                      <ng-icon name="lucideAlertTriangle" size="12" /> Pending
                    </span>
                  </div>
                </td>
                <td hlmTableCell>
                  <span
                    hlmBadge
                    [variant]="getStageVariant(apt.stage || apt.status)"
                    class="text-[10px] font-medium"
                  >
                    {{ getStageLabel(apt.stage || apt.status) }}
                  </span>
                </td>
                <td hlmTableCell class="text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      *ngIf="apt.stage === 'SCHEDULED' || !apt.stage || apt.stage === 'ARRIVED'"
                      hlmBtn
                      size="sm"
                      variant="default"
                      class="text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                      (click)="transitionStage(apt, 'CHECKED_IN')"
                    >
                      <ng-icon name="lucideUserCheck" size="14" />
                      <span>Complete Desk Check-In</span>
                    </button>
                    <span
                      *ngIf="apt.stage === 'CHECKED_IN'"
                      class="text-xs font-semibold text-amber-600 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20"
                    >
                      Awaiting Nurse Triage
                    </span>
                    <span
                      *ngIf="apt.stage === 'TRIAGED'"
                      class="text-xs font-semibold text-sky-600 px-2 py-1 rounded bg-sky-500/10 border border-sky-500/20"
                    >
                      Ready for Doctor
                    </span>
                    <button
                      *ngIf="apt.patientId || apt.patient?.id"
                      (click)="openRteModal(apt.patientId || apt.patient!.id)"
                      hlmBtn
                      size="sm"
                      variant="ghost"
                      class="text-xs text-sky-600 hover:text-sky-700 h-8"
                    >
                      RTE Check
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="displayAppointments().length === 0" hlmTableRow>
                <td
                  hlmTableCell
                  colspan="6"
                  class="text-center text-xs text-muted-foreground py-10"
                >
                  No appointments scheduled for front-desk reception check-in on this date.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modals for Intake & RTE Verification -->
    <app-receptionist-intake
      *ngIf="showIntakeModal()"
      [isModal]="true"
      (close)="showIntakeModal.set(false); loadData()"
    >
    </app-receptionist-intake>

    <app-receptionist-eligibility
      *ngIf="showRteModal()"
      [isModal]="true"
      [patientIdInput]="rtePatientId()"
      (close)="showRteModal.set(false); loadData()"
    >
    </app-receptionist-eligibility>
  `,
})
export class ReceptionistDashboardComponent implements OnInit {
  appointments = signal<Appointment[]>([]);
  patientCount = signal(0);

  showIntakeModal = signal(false);
  showRteModal = signal(false);
  rtePatientId = signal<string | null>(null);

  todayDateStr = new Date();
  selectedDate = signal<string>(this.getLocalDateString(new Date()));
  viewMode = signal<'TODAY' | 'DATE' | 'ALL'>('TODAY');

  displayAppointments = computed(() => {
    const mode = this.viewMode();
    const targetDate = this.selectedDate();
    const todayStr = this.getLocalDateString(new Date());

    return this.appointments().filter((apt) => {
      if (mode === 'ALL') return true;
      const aptDate = this.getLocalDateString(apt.appointmentDate);
      if (mode === 'TODAY') {
        return aptDate === todayStr;
      }
      return aptDate === targetDate;
    });
  });

  scheduledCount = computed(
    () => this.displayAppointments().filter((a) => (a.stage || a.status) === 'SCHEDULED').length,
  );
  arrivedCount = computed(
    () =>
      this.displayAppointments().filter((a) =>
        ['ARRIVED', 'CHECKED_IN', 'IN_CONSULTATION'].includes(a.stage || a.status),
      ).length,
  );
  pendingRteCount = computed(
    () => this.displayAppointments().filter((a) => !a.insuranceVerified).length,
  );

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getAppointments().subscribe((apts) => this.appointments.set(apts));
    this.apiService.getPatients().subscribe((pts) => this.patientCount.set(pts.length));
  }

  openIntakeModal(): void {
    this.showIntakeModal.set(true);
  }

  openRteModal(patientId?: string): void {
    this.rtePatientId.set(patientId || null);
    this.showRteModal.set(true);
  }

  setViewMode(mode: 'TODAY' | 'DATE' | 'ALL'): void {
    this.viewMode.set(mode);
    if (mode === 'TODAY') {
      this.selectedDate.set(this.getLocalDateString(new Date()));
    }
  }

  getLocalDateString(d: any): string {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isToday(d: any): boolean {
    return this.getLocalDateString(d) === this.getLocalDateString(new Date());
  }

  transitionStage(apt: Appointment, stage: string): void {
    if (!apt.id) return;
    this.apiService.updateAppointmentStage(apt.id, stage).subscribe({
      next: () => this.loadData(),
    });
  }

  getStageLabel(stage: string): string {
    switch (stage) {
      case 'SCHEDULED':
        return '1. Booked (Pre-Arrival)';
      case 'ARRIVED':
        return '2. Lobby Arrival';
      case 'CHECKED_IN':
        return '3. Desk Checked In (Awaiting Triage)';
      case 'TRIAGED':
        return '4. Triaged (Ready for Physician)';
      case 'IN_CONSULTATION':
        return '5. Clinical Consultation';
      case 'COMPLETED':
        return '6. Discharged & Completed';
      case 'CANCELLED':
        return 'Cancelled / No-Show';
      default:
        return stage || 'Scheduled';
    }
  }

  getStageVariant(stage: string): 'outline' | 'secondary' | 'default' | 'destructive' {
    switch (stage) {
      case 'SCHEDULED':
        return 'outline';
      case 'ARRIVED':
        return 'secondary';
      case 'CHECKED_IN':
        return 'outline';
      case 'TRIAGED':
        return 'secondary';
      case 'IN_CONSULTATION':
        return 'default';
      case 'COMPLETED':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  }
}
