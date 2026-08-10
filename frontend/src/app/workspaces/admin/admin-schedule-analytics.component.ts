import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Appointment } from '../../core/models/models';
import { StatCardComponent } from '../../shared/ui/stat-card.component';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendarClock,
  lucideCheckCircle2,
  lucideXCircle,
  lucideStethoscope,
  lucideUsers,
  lucideActivity,
  lucideBuilding2,
  lucideTrendingUp,
  lucideClock,
  lucideShieldCheck,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-admin-schedule-analytics',
  standalone: true,
  imports: [
    CommonModule,
    StatCardComponent,
    HlmCardImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmButtonImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideCalendarClock,
      lucideCheckCircle2,
      lucideXCircle,
      lucideStethoscope,
      lucideUsers,
      lucideActivity,
      lucideBuilding2,
      lucideTrendingUp,
      lucideClock,
      lucideShieldCheck,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Dashboard Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-3">
          <div class="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ng-icon name="lucideCalendarClock" size="22" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Facility Capacity & Schedule Analytics
              <span hlmBadge variant="secondary" class="text-[10px]">Executive Governance</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">
              System-wide appointment volume, cancellation ratios, provider utilization rates, and department capacity monitoring.
            </p>
          </div>
        </div>
      </div>

      <!-- Executive KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stat-card
          title="Total Bookings"
          [value]="totalBookings()"
          subtitle="Facility-Wide Appointments"
          icon="lucideCalendarClock"
          iconBgClass="bg-primary/10 text-primary" />
        <app-stat-card
          title="Fulfillment Rate"
          [value]="completionRate() + '%'"
          subtitle="Checked-in & Completed"
          icon="lucideCheckCircle2"
          iconBgClass="bg-emerald-500/10 text-emerald-600"
          valueClass="text-emerald-600" />
        <app-stat-card
          title="Cancellation Rate"
          [value]="cancellationRate() + '%'"
          subtitle="Cancelled / No-Show Roster"
          icon="lucideXCircle"
          iconBgClass="bg-destructive/10 text-destructive"
          valueClass="text-destructive" />
        <app-stat-card
          title="Active Providers"
          [value]="providerMetrics().length"
          subtitle="Assigned Clinical Staff"
          icon="lucideStethoscope"
          iconBgClass="bg-sky-500/10 text-sky-600" />
      </div>

      <!-- Schedule Breakdown & Utilization Visuals -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Status Breakdown Card -->
        <div class="p-5 rounded-xl border border-border bg-card shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-border pb-3">
            <h2 class="text-sm font-semibold text-foreground flex items-center gap-2">
              <ng-icon name="lucideTrendingUp" size="16" class="text-primary" />
              Schedule Status Breakdown
            </h2>
            <span hlmBadge variant="outline" class="text-[10px]">Live Roster</span>
          </div>

          <div class="space-y-3.5">
            <!-- Checked In -->
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-medium">
                <span class="text-foreground flex items-center gap-1.5">
                  <span class="size-2 rounded-full bg-emerald-500"></span> Checked In & In Triage
                </span>
                <span class="font-mono text-muted-foreground">{{ checkedInCount() }} ({{ getStatusPct(checkedInCount()) }}%)</span>
              </div>
              <div class="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div class="h-full bg-emerald-500 transition-all duration-500" [style.width.%]="getStatusPct(checkedInCount())"></div>
              </div>
            </div>

            <!-- Completed -->
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-medium">
                <span class="text-foreground flex items-center gap-1.5">
                  <span class="size-2 rounded-full bg-blue-500"></span> Consultation Completed
                </span>
                <span class="font-mono text-muted-foreground">{{ completedCount() }} ({{ getStatusPct(completedCount()) }}%)</span>
              </div>
              <div class="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div class="h-full bg-blue-500 transition-all duration-500" [style.width.%]="getStatusPct(completedCount())"></div>
              </div>
            </div>

            <!-- Scheduled / Pending -->
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-medium">
                <span class="text-foreground flex items-center gap-1.5">
                  <span class="size-2 rounded-full bg-amber-500"></span> Upcoming / Scheduled
                </span>
                <span class="font-mono text-muted-foreground">{{ scheduledCount() }} ({{ getStatusPct(scheduledCount()) }}%)</span>
              </div>
              <div class="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div class="h-full bg-amber-500 transition-all duration-500" [style.width.%]="getStatusPct(scheduledCount())"></div>
              </div>
            </div>

            <!-- Cancelled -->
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-medium">
                <span class="text-foreground flex items-center gap-1.5">
                  <span class="size-2 rounded-full bg-destructive"></span> Cancelled / No-Show
                </span>
                <span class="font-mono text-muted-foreground">{{ cancelledCount() }} ({{ getStatusPct(cancelledCount()) }}%)</span>
              </div>
              <div class="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div class="h-full bg-destructive transition-all duration-500" [style.width.%]="getStatusPct(cancelledCount())"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Provider Utilization Summary Table -->
        <div class="lg:col-span-2 p-5 rounded-xl border border-border bg-card shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-border pb-3">
            <h2 class="text-sm font-semibold text-foreground flex items-center gap-2">
              <ng-icon name="lucideStethoscope" size="16" class="text-sky-500" />
              Provider Capacity & Utilization Roster
            </h2>
            <span class="text-xs text-muted-foreground font-mono">Shift Capacity Target: 10 Slots</span>
          </div>

          <div class="overflow-x-auto">
            <table hlmTable class="w-full text-xs">
              <thead hlmTableHeader>
                <tr hlmTableRow class="bg-muted/50 border-b border-border">
                  <th hlmTableHead class="py-2.5 px-3 text-left">Provider Name</th>
                  <th hlmTableHead class="py-2.5 px-3 text-center">Booked</th>
                  <th hlmTableHead class="py-2.5 px-3 text-center">Fulfilled</th>
                  <th hlmTableHead class="py-2.5 px-3 text-center">Cancelled</th>
                  <th hlmTableHead class="py-2.5 px-3 text-left">Capacity Utilization</th>
                  <th hlmTableHead class="py-2.5 px-3 text-right">Load Status</th>
                </tr>
              </thead>
              <tbody hlmTableBody class="divide-y divide-border">
                <tr *ngFor="let doc of providerMetrics()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                  <td hlmTableCell class="py-2.5 px-3 font-semibold text-foreground flex items-center gap-2">
                    <span class="size-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                      {{ doc.name.charAt(4) || 'D' }}
                    </span>
                    {{ doc.name }}
                  </td>
                  <td hlmTableCell class="py-2.5 px-3 text-center font-mono">{{ doc.total }}</td>
                  <td hlmTableCell class="py-2.5 px-3 text-center font-mono text-emerald-600 font-semibold">
                    {{ doc.completed + doc.checkedIn }}
                  </td>
                  <td hlmTableCell class="py-2.5 px-3 text-center font-mono text-destructive">
                    {{ doc.cancelled }}
                  </td>
                  <td hlmTableCell class="py-2.5 px-3">
                    <div class="space-y-1 min-w-[120px]">
                      <div class="flex justify-between text-[10px]">
                        <span class="font-mono text-muted-foreground">{{ doc.utilizationPct }}%</span>
                      </div>
                      <div class="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          class="h-full rounded-full transition-all duration-500"
                          [ngClass]="doc.utilizationPct > 80 ? 'bg-amber-500' : 'bg-primary'"
                          [style.width.%]="doc.utilizationPct">
                        </div>
                      </div>
                    </div>
                  </td>
                  <td hlmTableCell class="py-2.5 px-3 text-right">
                    <span
                      hlmBadge
                      [variant]="doc.utilizationPct > 80 ? 'secondary' : 'outline'"
                      class="text-[10px]">
                      {{ doc.utilizationPct > 80 ? 'High Demand' : 'Optimal Capacity' }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="providerMetrics().length === 0" hlmTableRow>
                  <td colspan="6" hlmTableCell class="py-8 text-center text-muted-foreground text-xs">
                    No active provider load recorded today.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Facility Schedule Master Roster (Read-Only Audit Ledger) -->
      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs space-y-3">
        <div class="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-muted/20">
          <div>
            <h2 class="text-sm font-semibold text-foreground flex items-center gap-2">
              <ng-icon name="lucideBuilding2" size="16" class="text-muted-foreground" />
              Master Facility Schedule Log
            </h2>
            <p class="text-xs text-muted-foreground">Read-only administrative audit log of all facility consultations across units.</p>
          </div>
          <span hlmBadge variant="outline" class="text-[10px] font-mono">
            Total Records: {{ appointments().length }}
          </span>
        </div>

        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Date & Time</th>
                <th hlmTableHead class="py-3 px-4 text-left">Patient</th>
                <th hlmTableHead class="py-3 px-4 text-left">Assigned Doctor</th>
                <th hlmTableHead class="py-3 px-4 text-left">Consultation Reason</th>
                <th hlmTableHead class="py-3 px-4 text-left">Status</th>
                <th hlmTableHead class="py-3 px-4 text-right">Audit State</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let apt of appointments()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">
                  {{ apt.appointmentDate | date:'short' }}
                </td>
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">
                  {{ apt.patient.fullName }}
                </td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">
                  Dr. {{ apt.doctor.fullName || 'Assigned Staff' }}
                </td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">
                  {{ apt.reason }}
                </td>
                <td hlmTableCell class="py-3 px-4">
                  <span
                    hlmBadge
                    [variant]="getBadgeVariant(apt.status)"
                    class="text-[10px]">
                    {{ apt.status }}
                  </span>
                </td>
                <td hlmTableCell class="py-3 px-4 text-right font-mono text-[11px] text-muted-foreground">
                  <span class="inline-flex items-center gap-1 text-emerald-600">
                    <ng-icon name="lucideShieldCheck" size="13" /> Verified
                  </span>
                </td>
              </tr>
              <tr *ngIf="appointments().length === 0" hlmTableRow>
                <td colspan="6" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">
                  No appointments recorded in the master schedule log.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class AdminScheduleAnalyticsComponent implements OnInit {
  appointments = signal<Appointment[]>([]);

  totalBookings = computed(() => this.appointments().length);

  scheduledCount = computed(
    () =>
      this.appointments().filter(
        (a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED' || a.status === 'PENDING'
      ).length
  );

  checkedInCount = computed(
    () => this.appointments().filter((a) => a.status === 'CHECKED_IN').length
  );

  completedCount = computed(
    () => this.appointments().filter((a) => a.status === 'COMPLETED').length
  );

  cancelledCount = computed(
    () =>
      this.appointments().filter(
        (a) => a.status === 'CANCELLED' || a.status === 'NO_SHOW'
      ).length
  );

  completionRate = computed(() => {
    const total = this.totalBookings();
    if (!total) return 0;
    const resolved = this.checkedInCount() + this.completedCount();
    return Math.round((resolved / total) * 100);
  });

  cancellationRate = computed(() => {
    const total = this.totalBookings();
    if (!total) return 0;
    return Math.round((this.cancelledCount() / total) * 100);
  });

  providerMetrics = computed(() => {
    const apts = this.appointments();
    const doctorMap = new Map<
      string,
      {
        name: string;
        total: number;
        completed: number;
        checkedIn: number;
        cancelled: number;
        scheduled: number;
      }
    >();

    for (const apt of apts) {
      const docName = apt.doctor.fullName
        ? `Dr. ${apt.doctor.fullName}`
        : 'Assigned Clinical Staff';
      const entry = doctorMap.get(docName) || {
        name: docName,
        total: 0,
        completed: 0,
        checkedIn: 0,
        cancelled: 0,
        scheduled: 0,
      };
      entry.total += 1;
      if (apt.status === 'COMPLETED') entry.completed += 1;
      else if (apt.status === 'CHECKED_IN') entry.checkedIn += 1;
      else if (apt.status === 'CANCELLED' || apt.status === 'NO_SHOW') entry.cancelled += 1;
      else entry.scheduled += 1;

      doctorMap.set(docName, entry);
    }

    return Array.from(doctorMap.values()).map((doc) => {
      const utilizationPct = Math.min(100, Math.round((doc.total / 10) * 100));
      return {
        ...doc,
        utilizationPct,
      };
    });
  });

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getAppointments().subscribe((res) => this.appointments.set(res));
  }

  getStatusPct(count: number): number {
    const total = this.totalBookings();
    if (!total) return 0;
    return Math.round((count / total) * 100);
  }

  getBadgeVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (status) {
      case 'CHECKED_IN':
        return 'secondary';
      case 'COMPLETED':
        return 'default';
      case 'CANCELLED':
      case 'NO_SHOW':
        return 'destructive';
      default:
        return 'outline';
    }
  }
}
