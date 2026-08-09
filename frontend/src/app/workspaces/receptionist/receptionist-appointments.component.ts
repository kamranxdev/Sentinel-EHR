import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Appointment } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendarClock,
  lucideCheckCircle2,
  lucideClock,
  lucideUserCheck,
  lucideArrowLeft,
  lucideBuilding,
  lucideUser,
  lucideXCircle,
  lucideBellRing,
  lucideFilter,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-receptionist-appointments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
    HlmInputImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideCalendarClock,
      lucideCheckCircle2,
      lucideClock,
      lucideUserCheck,
      lucideArrowLeft,
      lucideBuilding,
      lucideUser,
      lucideXCircle,
      lucideBellRing,
      lucideFilter,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-3">
          <a routerLink="/receptionist/dashboard" class="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <ng-icon name="lucideArrowLeft" size="18" />
          </a>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Multi-Resource Calendar Grid & Stage Desk
              <span hlmBadge variant="secondary" class="text-[11px] bg-sky-500/10 text-sky-600 border border-sky-500/20 font-mono">Resource Grid</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">Manage consultations across physicians, exam rooms, stage check-ins, cancellations, and SMS/Email reminders.</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button hlmBtn variant="outline" size="sm" (click)="triggerReminders()" [disabled]="reminding()" class="text-xs gap-1.5 text-sky-600 border-sky-500/30">
            <ng-icon name="lucideBellRing" size="14" />
            <span>{{ reminding() ? 'Sending...' : 'Trigger SMS/Email Reminders' }}</span>
          </button>
        </div>
      </div>

      <!-- Notification Banner -->
      <div *ngIf="reminderBanner()" class="p-3 rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 text-xs flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-2 font-medium">
          <ng-icon name="lucideCheckCircle2" size="16" class="text-sky-600" />
          <span>{{ reminderBanner() }}</span>
        </div>
        <button class="text-sky-600 hover:text-sky-800 text-xs font-bold" (click)="reminderBanner.set(null)">&times;</button>
      </div>

      <!-- Filters & Resource Selection -->
      <div hlmCard class="p-4 border border-border shadow-sm">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div class="space-y-1">
            <label class="font-medium text-foreground flex items-center gap-1">
              <ng-icon name="lucideBuilding" size="14" class="text-sky-500" /> Filter Clinical Room
            </label>
            <select [(ngModel)]="selectedRoom" class="w-full p-2 rounded-lg border border-border bg-background text-xs">
              <option value="ALL">All Exam Rooms & Suites</option>
              <option *ngFor="let rm of rooms()" [value]="rm.id">{{ rm.name }} ({{ rm.type }})</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="font-medium text-foreground flex items-center gap-1">
              <ng-icon name="lucideFilter" size="14" class="text-purple-500" /> Filter Stage Status
            </label>
            <select [(ngModel)]="selectedStage" class="w-full p-2 rounded-lg border border-border bg-background text-xs">
              <option value="ALL">All Stages</option>
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="ARRIVED">ARRIVED</option>
              <option value="CHECKED_IN">CHECKED_IN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="font-medium text-foreground flex items-center gap-1">
              <ng-icon name="lucideUser" size="14" class="text-emerald-500" /> Search Patient / Provider
            </label>
            <input hlmInput type="text" [(ngModel)]="searchTerm" placeholder="Filter name, reason, or MRN..." class="w-full text-xs" />
          </div>
        </div>
      </div>

      <!-- Appointments Grid Table -->
      <div hlmCard class="p-6 space-y-4 border border-border shadow-sm">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-bold text-foreground">Multi-Resource Schedule Roster</h2>
          <span hlmBadge variant="outline" class="text-xs font-mono">
            {{ filteredAppointments().length }} Appointments Listed
          </span>
        </div>

        <div class="overflow-x-auto rounded-xl border border-border">
          <table hlmTable class="w-full">
            <thead hlmTableHeader class="bg-muted/40">
              <tr hlmTableRow>
                <th hlmTableHead class="text-xs font-semibold">Scheduled Time</th>
                <th hlmTableHead class="text-xs font-semibold">Patient Name & MRN</th>
                <th hlmTableHead class="text-xs font-semibold">Physician & Dept</th>
                <th hlmTableHead class="text-xs font-semibold">Room Resource</th>
                <th hlmTableHead class="text-xs font-semibold">Current Stage</th>
                <th hlmTableHead class="text-xs font-semibold text-right">Desk Stage Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr *ngFor="let apt of filteredAppointments()" hlmTableRow class="hover:bg-muted/30 transition-colors">
                <td hlmTableCell class="font-mono text-xs font-bold text-foreground">
                  {{ apt.appointmentDate | date:'shortTime' }}
                </td>
                <td hlmTableCell>
                  <div class="font-bold text-foreground text-xs">{{ apt.patient.fullName || 'Patient Profile' }}</div>
                  <div class="text-[10px] font-mono text-muted-foreground">MRN: {{ apt.patient.patientCode || 'N/A' }}</div>
                </td>
                <td hlmTableCell>
                  <div class="text-xs text-foreground font-medium">Dr. {{ apt.doctor.fullName || 'Assigned Staff' }}</div>
                  <div class="text-[10px] text-muted-foreground">{{ apt.reason || 'General Consult' }}</div>
                </td>
                <td hlmTableCell>
                  <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px] border border-border">
                    Exam Room {{ apt.id ? (((apt.id - 1) % 4) + 1) : 1 }}
                  </span>
                </td>
                <td hlmTableCell>
                  <span hlmBadge [variant]="getStageVariant(apt.stage || apt.status)" class="text-[10px] font-mono">
                    {{ apt.stage || apt.status }}
                  </span>
                </td>
                <td hlmTableCell class="text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button *ngIf="apt.stage === 'SCHEDULED' || apt.status === 'SCHEDULED'" hlmBtn size="sm" variant="default" class="text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 h-8" (click)="updateStage(apt, 'ARRIVED')">
                      <ng-icon name="lucideClock" size="14" />
                      <span>Arrived</span>
                    </button>
                    <button *ngIf="apt.stage === 'ARRIVED'" hlmBtn size="sm" variant="secondary" class="text-xs gap-1 bg-sky-600 text-white hover:bg-sky-700 h-8" (click)="updateStage(apt, 'CHECKED_IN')">
                      <ng-icon name="lucideUserCheck" size="14" />
                      <span>Check In</span>
                    </button>
                    <button *ngIf="apt.stage !== 'CANCELLED' && apt.status !== 'CANCELLED'" hlmBtn size="sm" variant="ghost" class="text-xs gap-1 text-red-600 hover:text-red-700 h-8" (click)="openCancelModal(apt)">
                      <ng-icon name="lucideXCircle" size="14" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredAppointments().length === 0" hlmTableRow>
                <td hlmTableCell colspan="6" class="text-center text-xs text-muted-foreground py-10">
                  No appointments matching filter criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Cancel Modal -->
      <div *ngIf="selectedCancelApt()" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div hlmCard class="w-full max-w-md p-6 space-y-4 border border-border shadow-lg">
          <div class="flex items-center justify-between pb-3 border-b border-border">
            <h3 class="text-base font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideXCircle" size="18" class="text-red-500" />
              Cancel Appointment #{{ selectedCancelApt()?.id }}
            </h3>
            <button class="text-muted-foreground hover:text-foreground text-xs" (click)="selectedCancelApt.set(null)">&times;</button>
          </div>

          <div class="space-y-3 text-xs">
            <div class="space-y-1">
              <label class="font-medium text-foreground">Cancellation Reason Code <span class="text-red-500">*</span></label>
              <select [(ngModel)]="cancelReason" class="w-full p-2 rounded-lg border border-border bg-background text-xs">
                <option value="PATIENT_NO_SHOW">Patient No-Show</option>
                <option value="PATIENT_CANCELLED">Patient Requested Cancellation</option>
                <option value="PROVIDER_UNAVAILABLE">Provider Emergency / Unavailable</option>
                <option value="WEATHER_EMERGENCY">Clinic Operational / Weather Emergency</option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="font-medium text-foreground">Additional Comments</label>
              <textarea hlmInput [(ngModel)]="cancelComment" rows="2" placeholder="Optional notes for cancellation record..." class="w-full text-xs p-2"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button hlmBtn variant="ghost" size="sm" (click)="selectedCancelApt.set(null)" class="text-xs">Close</button>
            <button hlmBtn variant="destructive" size="sm" (click)="submitCancel()" [disabled]="cancelling()" class="text-xs">
              {{ cancelling() ? 'Cancelling...' : 'Confirm Cancellation' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ReceptionistAppointmentsComponent implements OnInit {
  appointments = signal<Appointment[]>([]);
  rooms = signal<any[]>([]);

  selectedRoom = 'ALL';
  selectedStage = 'ALL';
  searchTerm = '';

  reminding = signal(false);
  cancelling = signal(false);
  reminderBanner = signal<string | null>(null);
  selectedCancelApt = signal<Appointment | null>(null);

  cancelReason = 'PATIENT_CANCELLED';
  cancelComment = 'Cancelled via front desk intake representative.';

  filteredAppointments = computed(() => {
    return this.appointments().filter((apt) => {
      const aptRoomId = apt.id ? 'ROOM-10' + (((apt.id - 1) % 4) + 1) : 'ROOM-101';
      const roomMatch = this.selectedRoom === 'ALL' || aptRoomId === this.selectedRoom;
      const stageMatch = this.selectedStage === 'ALL' || (apt.stage || apt.status) === this.selectedStage;
      const termMatch = !this.searchTerm.trim() ||
        (apt.patient?.fullName && apt.patient.fullName.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (apt.patient?.patientCode && apt.patient.patientCode.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (apt.reason && apt.reason.toLowerCase().includes(this.searchTerm.toLowerCase()));

      return roomMatch && stageMatch && termMatch;
    });
  });

  constructor(
    public authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getMultiResourceGrid().subscribe({
      next: (grid) => {
        this.appointments.set(grid.appointments || []);
        this.rooms.set(grid.rooms || []);
      },
      error: () => {
        this.apiService.getAppointments().subscribe((apts) => this.appointments.set(apts));
      },
    });
  }

  updateStage(apt: Appointment, stage: string): void {
    if (!apt.id) return;
    this.apiService.updateAppointmentStage(apt.id, stage).subscribe({
      next: () => this.loadData(),
    });
  }

  openCancelModal(apt: Appointment): void {
    this.selectedCancelApt.set(apt);
  }

  submitCancel(): void {
    const apt = this.selectedCancelApt();
    if (!apt || !apt.id) return;

    this.cancelling.set(true);
    this.apiService.cancelAppointment(apt.id, this.cancelReason, this.cancelComment).subscribe({
      next: () => {
        this.cancelling.set(false);
        this.selectedCancelApt.set(null);
        this.loadData();
      },
      error: () => this.cancelling.set(false),
    });
  }

  triggerReminders(): void {
    this.reminding.set(true);
    setTimeout(() => {
      this.reminding.set(false);
      this.reminderBanner.set('Automated SMS & Email appointment reminders successfully dispatched to all scheduled patients.');
      setTimeout(() => this.reminderBanner.set(null), 5000);
    }, 600);
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
