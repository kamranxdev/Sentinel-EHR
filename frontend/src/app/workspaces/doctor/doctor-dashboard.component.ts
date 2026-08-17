import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient } from '../../core/models/patient.model';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideHospital,
  lucideStethoscope,
  lucidePill,
  lucideListChecks,
  lucideCalendarClock,
  lucideChevronRight,
  lucideUsers,
  lucideSearch,
  lucideActivity,
} from '@ng-icons/lucide';

interface QuickAction {
  label: string;
  description: string;
  icon: string;
  route: string;
  queryParams?: Record<string, string>;
  iconBgClass: string;
  iconColorClass: string;
}

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HlmCardImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideHospital,
      lucideStethoscope,
      lucidePill,
      lucideListChecks,
      lucideCalendarClock,
      lucideChevronRight,
      lucideUsers,
      lucideSearch,
      lucideActivity,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Doctor Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <ng-icon name="lucideHospital" size="24" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {{ currentUser?.fullName }}
              <span hlmBadge variant="secondary" class="text-[11px] bg-primary/10 text-primary border border-primary/20">
                Physician Desk
              </span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">Active Clinical Shift • Patient MPI Roster • SOAP Notes & eRx Orders</p>
          </div>
        </div>
      </div>

      <!-- Quick Action Cards (DRY layout) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a
          *ngFor="let act of quickActions"
          [routerLink]="act.route"
          [queryParams]="act.queryParams"
          class="p-4 rounded-xl border border-border bg-card hover:bg-accent/40 transition-all space-y-3 flex flex-col justify-between group shadow-2xs hover:shadow-xs"
        >
          <div class="flex items-center justify-between">
            <div [class]="'size-9 rounded-lg flex items-center justify-center ' + act.iconBgClass + ' ' + act.iconColorClass">
              <ng-icon [name]="act.icon" size="18" />
            </div>
            <ng-icon name="lucideChevronRight" size="16" class="text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
          <div>
            <h3 class="text-xs font-bold text-foreground">{{ act.label }}</h3>
            <p class="text-[11px] text-muted-foreground mt-0.5 leading-snug">{{ act.description }}</p>
          </div>
        </a>
      </div>

      <!-- MPI Patient Roster Table -->
      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs space-y-0">
        <div class="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div class="flex items-center gap-2">
            <ng-icon name="lucideUsers" size="18" class="text-primary" />
            <div>
              <h3 class="text-sm font-bold text-foreground">Master Patient Index (MPI Census)</h3>
              <p class="text-xs text-muted-foreground">Select any patient below to open active clinical EHR chart</p>
            </div>
          </div>

          <div class="relative w-full sm:w-72">
            <ng-icon name="lucideSearch" size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              hlmInput
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search patients by name or MRN..."
              class="pl-9 h-9 w-full text-xs bg-background"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Patient Name</th>
                <th hlmTableHead class="py-3 px-4 text-left">MRN Code</th>
                <th hlmTableHead class="py-3 px-4 text-left">DOB / Gender</th>
                <th hlmTableHead class="py-3 px-4 text-left">Blood Type</th>
                <th hlmTableHead class="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr
                *ngFor="let p of filteredPatients()"
                hlmTableRow
                class="hover:bg-muted/40 transition-colors cursor-pointer"
                [ngClass]="patientContext.activePatient()?.id === p.id ? 'bg-primary/5' : ''"
              >
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground flex items-center gap-2">
                  <div class="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold">
                    {{ p.fullName.charAt(0) }}
                  </div>
                  {{ p.fullName }}
                </td>
                <td hlmTableCell class="py-3 px-4 font-mono">
                  <span hlmBadge variant="outline" class="font-mono text-[10px]">{{ p.patientCode }}</span>
                </td>
                <td hlmTableCell class="py-3 px-4 text-muted-foreground">
                  {{ p.dateOfBirth || 'N/A' }} ({{ p.gender || 'U' }})
                </td>
                <td hlmTableCell class="py-3 px-4">
                  <span hlmBadge variant="secondary" class="text-[10px] font-semibold">
                    {{ p.bloodType || 'A+' }}
                  </span>
                </td>
                <td hlmTableCell class="py-3 px-4 text-right">
                  <button
                    hlmBtn
                    [variant]="patientContext.activePatient()?.id === p.id ? 'default' : 'secondary'"
                    size="sm"
                    class="h-7 text-[11px] font-medium gap-1"
                    (click)="selectPatient(p); $event.stopPropagation()"
                  >
                    Open Clinical Chart <ng-icon name="lucideChevronRight" size="12" />
                  </button>
                </td>
              </tr>
              <tr *ngIf="filteredPatients().length === 0" hlmTableRow>
                <td colspan="5" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">
                  No matching patients found in MPI census.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class DoctorDashboardComponent implements OnInit {
  patients = signal<Patient[]>([]);
  searchQuery = signal('');

  filteredPatients = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.patients();
    return this.patients().filter(
      (p) =>
        p.fullName?.toLowerCase().includes(q) ||
        p.patientCode?.toLowerCase().includes(q)
    );
  });

  quickActions: QuickAction[] = [
    {
      label: 'SOAP Notes & Encounters',
      description: 'Progress notes & visit finalization',
      icon: 'lucideStethoscope',
      route: '/doctor/chart',
      queryParams: { tab: 'encounters' },
      iconBgClass: 'bg-primary/10',
      iconColorClass: 'text-primary',
    },
    {
      label: 'Pharmacy & eRx Orders',
      description: 'Issue eRx orders with drug safety check',
      icon: 'lucidePill',
      route: '/doctor/chart',
      queryParams: { tab: 'erx' },
      iconBgClass: 'bg-emerald-500/10',
      iconColorClass: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Problem List (ICD-10)',
      description: 'ICD-10 & SNOMED coded conditions',
      icon: 'lucideListChecks',
      route: '/doctor/chart',
      queryParams: { tab: 'diagnoses' },
      iconBgClass: 'bg-blue-500/10',
      iconColorClass: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Consultation Schedule',
      description: 'View appointment calendar & queue',
      icon: 'lucideCalendarClock',
      route: '/doctor/appointments',
      iconBgClass: 'bg-purple-500/10',
      iconColorClass: 'text-purple-600 dark:text-purple-400',
    },
  ];

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    public patientContext: PatientContextService,
    private router: Router
  ) { }

  get currentUser() {
    return this.authService.currentUser();
  }

  ngOnInit(): void {
    this.apiService.getPatients().subscribe((pts) => {
      this.patients.set(pts);
      if (pts.length > 0 && !this.patientContext.activePatient()) {
        this.patientContext.setActivePatient(pts[0]);
      }
    });
  }

  selectPatient(p: Patient): void {
    this.patientContext.setActivePatient(p);
    this.router.navigate(['/doctor/chart']);
  }
}
