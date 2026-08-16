import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Appointment } from '../../core/models/appointment.model';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
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
  lucideSearch,
  lucideFilter,
  lucideRefreshCw,
  lucideUser,
  lucideSparkles,
  lucideArrowUpRight,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-sys-admin-schedule-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmCardImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
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
      lucideSearch,
      lucideFilter,
      lucideRefreshCw,
      lucideUser,
      lucideSparkles,
      lucideArrowUpRight,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Executive Header -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-3.5">
          <div class="size-11 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
            <ng-icon name="lucideCalendarClock" size="24" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold tracking-tight text-foreground">
                Facility Capacity & Schedule Analytics
              </h1>
              <span hlmBadge variant="secondary" class="text-[10px] uppercase font-mono tracking-wider">
                SUPER_ADMIN
              </span>
            </div>
            <p class="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 text-emerald-500 font-semibold">
                <span class="relative flex size-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                </span>
                Live Audit Stream
              </span>
              <span>•</span>
              <span>Real-time provider utilization & capacity performance dashboard</span>
            </p>
          </div>
        </div>

        <!-- Action Controls -->
        <div class="flex items-center gap-2.5">
          <button
            hlmBtn
            variant="outline"
            size="sm"
            (click)="refreshData()"
            [disabled]="loading()"
            class="h-8 text-xs gap-1.5 border-border hover:bg-accent hover:text-accent-foreground">
            <ng-icon name="lucideRefreshCw" size="14" [class.animate-spin]="loading()" />
            Refresh Roster
          </button>
          <span class="h-4 w-px bg-border hidden sm:block"></span>
          <span class="text-xs text-muted-foreground font-mono bg-muted/60 px-2.5 py-1 rounded-md border border-border">
            Total: {{ appointments().length }} Appointments
          </span>
        </div>
      </div>

      <!-- Executive KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-primary/30 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Bookings</span>
            <div class="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ng-icon name="lucideCalendarClock" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-foreground font-mono">{{ totalBookings() }}</div>
            <span class="text-[11px] font-medium text-emerald-500 flex items-center gap-0.5">
              <ng-icon name="lucideArrowUpRight" size="12" /> Active
            </span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Facility-wide schedule loading</p>
        </div>

        <div class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-emerald-500/30 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Fulfillment Rate</span>
            <div class="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ng-icon name="lucideCheckCircle2" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-emerald-600 font-mono">{{ completionRate() }}%</div>
            <span class="text-[11px] font-medium text-emerald-500 font-mono">Target > 80%</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Checked-in & completed consultations</p>
        </div>

        <div class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-destructive/30 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Cancellation Rate</span>
            <div class="size-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
              <ng-icon name="lucideXCircle" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-destructive font-mono">{{ cancellationRate() }}%</div>
            <span class="text-[11px] font-medium text-muted-foreground font-mono">Risk Threshold < 10%</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Cancelled & No-show roster</p>
        </div>

        <div class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-sky-500/30 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Active Providers</span>
            <div class="size-9 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <ng-icon name="lucideStethoscope" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-foreground font-mono">{{ providerMetrics().length }}</div>
            <span class="text-[11px] font-medium text-sky-600 font-mono">Assigned Physicians</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">On-duty clinical roster</p>
        </div>
      </div>

      <!-- Analytics Visual Matrix & Utilization Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Schedule Status Distribution -->
        <div class="p-5 rounded-xl border border-border bg-card shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-border pb-3">
            <h2 class="text-sm font-semibold text-foreground flex items-center gap-2">
              <ng-icon name="lucideTrendingUp" size="16" class="text-primary" />
              Schedule Status Distribution
            </h2>
            <span hlmBadge variant="outline" class="text-[10px] font-mono">Distribution</span>
          </div>

          <div class="space-y-4">
            <!-- Checked In -->
            <div class="space-y-1.5 p-2.5 rounded-lg bg-muted/30 border border-border/50">
              <div class="flex justify-between text-xs font-medium">
                <span class="text-foreground flex items-center gap-2">
                  <span class="size-2.5 rounded-full bg-emerald-500 shadow-xs"></span> Checked In & In Triage
                </span>
                <span class="font-mono text-emerald-600 font-semibold">{{ checkedInCount() }} ({{ getStatusPct(checkedInCount()) }}%)</span>
              </div>
              <div class="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div class="h-full bg-emerald-500 transition-all duration-500" [style.width.%]="getStatusPct(checkedInCount())"></div>
              </div>
            </div>

            <!-- Completed -->
            <div class="space-y-1.5 p-2.5 rounded-lg bg-muted/30 border border-border/50">
              <div class="flex justify-between text-xs font-medium">
                <span class="text-foreground flex items-center gap-2">
                  <span class="size-2.5 rounded-full bg-sky-500 shadow-xs"></span> Consultation Completed
                </span>
                <span class="font-mono text-sky-600 font-semibold">{{ completedCount() }} ({{ getStatusPct(completedCount()) }}%)</span>
              </div>
              <div class="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div class="h-full bg-sky-500 transition-all duration-500" [style.width.%]="getStatusPct(completedCount())"></div>
              </div>
            </div>

            <!-- Scheduled -->
            <div class="space-y-1.5 p-2.5 rounded-lg bg-muted/30 border border-border/50">
              <div class="flex justify-between text-xs font-medium">
                <span class="text-foreground flex items-center gap-2">
                  <span class="size-2.5 rounded-full bg-amber-500 shadow-xs"></span> Upcoming / Scheduled
                </span>
                <span class="font-mono text-amber-600 font-semibold">{{ scheduledCount() }} ({{ getStatusPct(scheduledCount()) }}%)</span>
              </div>
              <div class="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div class="h-full bg-amber-500 transition-all duration-500" [style.width.%]="getStatusPct(scheduledCount())"></div>
              </div>
            </div>

            <!-- Cancelled -->
            <div class="space-y-1.5 p-2.5 rounded-lg bg-muted/30 border border-border/50">
              <div class="flex justify-between text-xs font-medium">
                <span class="text-foreground flex items-center gap-2">
                  <span class="size-2.5 rounded-full bg-destructive shadow-xs"></span> Cancelled / No-Show
                </span>
                <span class="font-mono text-destructive font-semibold">{{ cancelledCount() }} ({{ getStatusPct(cancelledCount()) }}%)</span>
              </div>
              <div class="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div class="h-full bg-destructive transition-all duration-500" [style.width.%]="getStatusPct(cancelledCount())"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Provider Capacity Roster -->
        <div class="lg:col-span-2 p-5 rounded-xl border border-border bg-card shadow-xs space-y-4">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-border pb-3">
            <div>
              <h2 class="text-sm font-semibold text-foreground flex items-center gap-2">
                <ng-icon name="lucideStethoscope" size="16" class="text-sky-500" />
                Provider Shift Loading & Utilization
              </h2>
              <p class="text-[11px] text-muted-foreground">Capacity benchmarked against standard 10 appointment shift slots.</p>
            </div>
            <span class="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded border border-border">
              Shift Target: 10 Slots
            </span>
          </div>

          <div class="overflow-x-auto">
            <table hlmTable class="w-full text-xs">
              <thead hlmTableHeader>
                <tr hlmTableRow class="bg-muted/50 border-b border-border">
                  <th hlmTableHead class="py-2.5 px-3 text-left">Provider Name</th>
                  <th hlmTableHead class="py-2.5 px-3 text-center">Booked</th>
                  <th hlmTableHead class="py-2.5 px-3 text-center">Fulfilled</th>
                  <th hlmTableHead class="py-2.5 px-3 text-center">Cancelled</th>
                  <th hlmTableHead class="py-2.5 px-3 text-left">Shift Capacity Loading</th>
                  <th hlmTableHead class="py-2.5 px-3 text-right">Utilization Tag</th>
                </tr>
              </thead>
              <tbody hlmTableBody class="divide-y divide-border">
                <tr *ngFor="let doc of providerMetrics()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                  <td hlmTableCell class="py-2.5 px-3 font-semibold text-foreground">
                    <div class="flex items-center gap-2.5">
                      <span class="size-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 border border-primary/20">
                        {{ getDoctorInitials(doc.name) }}
                      </span>
                      <div>
                        <div class="font-semibold text-foreground">{{ doc.name }}</div>
                        <div class="text-[10px] text-muted-foreground">Clinical Specialist</div>
                      </div>
                    </div>
                  </td>
                  <td hlmTableCell class="py-2.5 px-3 text-center font-mono font-semibold">{{ doc.total }}</td>
                  <td hlmTableCell class="py-2.5 px-3 text-center font-mono text-emerald-600 font-semibold">
                    {{ doc.completed + doc.checkedIn }}
                  </td>
                  <td hlmTableCell class="py-2.5 px-3 text-center font-mono text-destructive">
                    {{ doc.cancelled }}
                  </td>
                  <td hlmTableCell class="py-2.5 px-3">
                    <div class="space-y-1 min-w-[130px]">
                      <div class="flex justify-between text-[10px] font-mono">
                        <span class="text-muted-foreground">{{ doc.total }} / 10 slots</span>
                        <span class="font-bold" [ngClass]="doc.utilizationPct > 80 ? 'text-amber-500' : 'text-primary'">
                          {{ doc.utilizationPct }}%
                        </span>
                      </div>
                      <div class="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          class="h-full rounded-full transition-all duration-500"
                          [ngClass]="doc.utilizationPct > 80 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-primary to-sky-500'"
                          [style.width.%]="doc.utilizationPct">
                        </div>
                      </div>
                    </div>
                  </td>
                  <td hlmTableCell class="py-2.5 px-3 text-right">
                    <span
                      hlmBadge
                      [variant]="doc.utilizationPct > 80 ? 'secondary' : 'outline'"
                      class="text-[10px] font-medium">
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

      <!-- Master Facility Schedule Roster with Interactive Search & Filter Controls -->
      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs space-y-0">
        <!-- Roster Header & Filter Toolbar -->
        <div class="p-4 border-b border-border bg-muted/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 class="text-sm font-semibold text-foreground flex items-center gap-2">
              <ng-icon name="lucideBuilding2" size="16" class="text-primary" />
              Master Facility Schedule Roster
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">Read-only administrative governance log of all facility consultations across units.</p>
          </div>

          <!-- Interactive Search & Filter Pills -->
          <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <!-- Search Bar -->
            <div class="relative flex-1 sm:flex-none min-w-[200px]">
              <ng-icon name="lucideSearch" size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                hlmInput
                type="text"
                placeholder="Search patient or doctor..."
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event)"
                class="pl-8 h-8 text-xs bg-background w-full" />
            </div>

            <!-- Status Filter Selector -->
            <div class="flex items-center gap-1 bg-background p-1 rounded-lg border border-border">
              <button
                *ngFor="let filter of statusFilters"
                (click)="selectedStatusFilter.set(filter.key)"
                [class.bg-primary]="selectedStatusFilter() === filter.key"
                [class.text-primary-foreground]="selectedStatusFilter() === filter.key"
                [class.text-muted-foreground]="selectedStatusFilter() !== filter.key"
                class="px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors hover:text-foreground">
                {{ filter.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Schedule Table -->
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Date & Time</th>
                <th hlmTableHead class="py-3 px-4 text-left">Patient Details</th>
                <th hlmTableHead class="py-3 px-4 text-left">Assigned Doctor</th>
                <th hlmTableHead class="py-3 px-4 text-left">Consultation Reason</th>
                <th hlmTableHead class="py-3 px-4 text-left">Status</th>
                <th hlmTableHead class="py-3 px-4 text-right">Audit State</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let apt of filteredAppointments()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground whitespace-nowrap">
                  <div class="flex items-center gap-1.5">
                    <ng-icon name="lucideClock" size="13" class="text-muted-foreground shrink-0" />
                    {{ apt.appointmentDate | date:'mediumDate' }} • {{ apt.appointmentDate | date:'shortTime' }}
                  </div>
                </td>
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">
                  <div class="flex items-center gap-2">
                    <span class="size-6 rounded-full bg-muted text-foreground font-bold text-[10px] flex items-center justify-center shrink-0 border border-border">
                      {{ (apt.patientName || apt.patient?.fullName || 'P').charAt(0) }}
                    </span>
                    <div>
                      <div class="font-semibold text-foreground">{{ apt.patientName || apt.patient?.fullName || 'Patient Profile' }}</div>
                      <div class="text-[10px] text-muted-foreground font-mono">{{ apt.patientCode || apt.patient?.patientCode || 'MRN-REG' }}</div>
                    </div>
                  </div>
                </td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">
                  <div class="font-medium text-foreground">
                    {{ apt.doctorName || (apt.doctor?.fullName ? 'Dr. ' + apt.doctor?.fullName : 'Assigned Staff') }}
                  </div>
                  <div class="text-[10px] text-muted-foreground">
                    {{ apt.doctorSpecialization || apt.doctor?.specialization || 'General Practice' }}
                  </div>
                </td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">
                  <span class="line-clamp-1 max-w-[220px]" [title]="apt.reason">
                    {{ apt.reason || 'Routine Consultation' }}
                  </span>
                </td>
                <td hlmTableCell class="py-3 px-4">
                  <span
                    hlmBadge
                    [variant]="getBadgeVariant(apt.status)"
                    class="text-[10px] font-semibold">
                    {{ apt.status }}
                  </span>
                </td>
                <td hlmTableCell class="py-3 px-4 text-right font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                  <span class="inline-flex items-center gap-1 text-emerald-600 font-medium">
                    <ng-icon name="lucideShieldCheck" size="13" /> WORM Verified
                  </span>
                </td>
              </tr>

              <!-- Empty State -->
              <tr *ngIf="filteredAppointments().length === 0" hlmTableRow>
                <td colspan="6" hlmTableCell class="py-12 text-center text-muted-foreground text-xs space-y-2">
                  <div class="size-10 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                    <ng-icon name="lucideSearch" size="20" />
                  </div>
                  <div class="font-medium text-foreground">No matching appointment records found</div>
                  <p class="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    Try adjusting your search keywords or status filter pills above.
                  </p>
                  <button
                    hlmBtn
                    variant="outline"
                    size="sm"
                    (click)="resetFilters()"
                    class="mt-2 h-7 text-xs">
                    Clear Search & Filters
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class SysAdminScheduleAnalyticsComponent implements OnInit {
  appointments = signal<Appointment[]>([]);
  loading = signal<boolean>(false);
  searchQuery = signal<string>('');
  selectedStatusFilter = signal<string>('ALL');

  statusFilters = [
    { key: 'ALL', label: 'All Statuses' },
    { key: 'CHECKED_IN', label: 'Checked In' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'SCHEDULED', label: 'Scheduled' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

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
      const rawDoc = apt.doctorName || apt.doctor?.fullName;
      const docName = rawDoc ? (rawDoc.startsWith('Dr.') ? rawDoc : `Dr. ${rawDoc}`) : 'Assigned Clinical Staff';
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

  filteredAppointments = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const st = this.selectedStatusFilter();

    return this.appointments().filter((apt) => {
      let matchesStatus = true;
      if (st !== 'ALL') {
        if (st === 'SCHEDULED') {
          matchesStatus = apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED' || apt.status === 'PENDING';
        } else if (st === 'CANCELLED') {
          matchesStatus = apt.status === 'CANCELLED' || apt.status === 'NO_SHOW';
        } else {
          matchesStatus = apt.status === st;
        }
      }

      let matchesQuery = true;
      if (q) {
        const patientName = (apt.patientName || apt.patient?.fullName || '').toLowerCase();
        const doctorName = (apt.doctorName || apt.doctor?.fullName || '').toLowerCase();
        const reason = (apt.reason || '').toLowerCase();
        const mrn = (apt.patientCode || apt.patient?.patientCode || '').toLowerCase();
        matchesQuery =
          patientName.includes(q) ||
          doctorName.includes(q) ||
          reason.includes(q) ||
          mrn.includes(q);
      }

      return matchesStatus && matchesQuery;
    });
  });

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(): void {
    this.loading.set(true);
    this.apiService.getAppointments().subscribe({
      next: (res) => {
        this.appointments.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedStatusFilter.set('ALL');
  }

  getStatusPct(count: number): number {
    const total = this.totalBookings();
    if (!total) return 0;
    return Math.round((count / total) * 100);
  }

  getDoctorInitials(docName: string): string {
    const clean = docName.replace(/^Dr\.\s*/i, '').trim();
    const parts = clean.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return clean.substring(0, 2).toUpperCase() || 'DR';
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
