import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient } from '../../core/models/models';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideHospital,
  lucideActivity,
  lucideTriangleAlert,
  lucidePill,
  lucideUserRound,
  lucideCalendarClock,
  lucideChevronRight,
  lucideUsers,
  lucideClipboardList,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-nurse-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideHospital,
      lucideActivity,
      lucideTriangleAlert,
      lucidePill,
      lucideUserRound,
      lucideCalendarClock,
      lucideChevronRight,
      lucideUsers,
      lucideClipboardList,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Nurse Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ng-icon name="lucideHospital" size="24" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Welcome, Nurse {{ currentUser?.fullName }}
              <span hlmBadge variant="secondary" class="text-[11px]">Nursing Station</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">Active Ward Census • Clinical Triage Intake • Bedside Vitals & Medication MAR</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-lg border border-border bg-card text-center min-w-[110px]">
            <span class="text-xl font-semibold text-foreground block leading-none">{{ patientCount() }}</span>
            <span class="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mt-0.5 block">Unit Ward Census</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a routerLink="/nurse/triage" class="p-5 rounded-xl border border-border bg-card hover:bg-accent/40 transition-colors space-y-3 flex flex-col justify-between group">
          <div class="flex items-center justify-between">
            <div class="size-9 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ng-icon name="lucideClipboardList" size="18" />
            </div>
            <ng-icon name="lucideChevronRight" size="16" class="text-muted-foreground group-hover:text-foreground" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-foreground">Clinical Triage Intake</h3>
            <p class="text-xs text-muted-foreground mt-1">Pre-consultation intake, chief complaint & priority.</p>
          </div>
        </a>

        <a routerLink="/nurse/vitals" class="p-5 rounded-xl border border-border bg-card hover:bg-accent/40 transition-colors space-y-3 flex flex-col justify-between group">
          <div class="flex items-center justify-between">
            <div class="size-9 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ng-icon name="lucideActivity" size="18" />
            </div>
            <ng-icon name="lucideChevronRight" size="16" class="text-muted-foreground group-hover:text-foreground" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-foreground">Bedside Vitals Flowsheet</h3>
            <p class="text-xs text-muted-foreground mt-1">Log BP, Pulse, Temp, SpO2 & BMI.</p>
          </div>
        </a>

        <a routerLink="/nurse/prescriptions" class="p-5 rounded-xl border border-border bg-card hover:bg-accent/40 transition-colors space-y-3 flex flex-col justify-between group">
          <div class="flex items-center justify-between">
            <div class="size-9 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ng-icon name="lucidePill" size="18" />
            </div>
            <ng-icon name="lucideChevronRight" size="16" class="text-muted-foreground group-hover:text-foreground" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-foreground">Medication Administration (MAR)</h3>
            <p class="text-xs text-muted-foreground mt-1">Verify eRx orders & log bedside dose administration.</p>
          </div>
        </a>

        <a routerLink="/nurse/appointments" class="p-5 rounded-xl border border-border bg-card hover:bg-accent/40 transition-colors space-y-3 flex flex-col justify-between group">
          <div class="flex items-center justify-between">
            <div class="size-9 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ng-icon name="lucideCalendarClock" size="18" />
            </div>
            <ng-icon name="lucideChevronRight" size="16" class="text-muted-foreground group-hover:text-foreground" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-foreground">Unit Ward Schedule</h3>
            <p class="text-xs text-muted-foreground mt-1">View patient appointment calendar.</p>
          </div>
        </a>
      </div>

      <!-- Active Patient Census Roster -->
      <div class="p-6 rounded-xl border border-border bg-card space-y-4">
        <div class="flex justify-between items-center border-b border-border pb-3">
          <div class="flex items-center gap-2">
            <ng-icon name="lucideUsers" size="18" class="text-emerald-500" />
            <h3 class="text-sm font-semibold text-foreground">Unit Patient Roster</h3>
          </div>
          <span class="text-xs text-muted-foreground">Select patient to set active clinical context</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4" *ngIf="patients().length > 0; else noPatients">
          <div 
            *ngFor="let p of patients().slice(0, 6)" 
            class="p-4 rounded-lg border transition-all cursor-pointer flex flex-col justify-between space-y-3"
            [ngClass]="patientContext.activePatient()?.id === p.id ? 'border-emerald-500 bg-emerald-500/5 shadow-xs' : 'border-border bg-muted/20 hover:border-muted-foreground/30'"
            (click)="selectPatient(p)"
          >
            <div class="flex justify-between items-start">
              <div>
                <span class="text-sm font-semibold text-foreground block">{{ p.fullName }}</span>
                <span class="text-[11px] font-mono text-muted-foreground block">MRN: {{ p.patientCode }}</span>
              </div>
              <span hlmBadge variant="outline" class="text-[10px]">{{ p.bloodType || 'A+' }}</span>
            </div>

            <button hlmBtn [variant]="patientContext.activePatient()?.id === p.id ? 'default' : 'secondary'" size="sm" class="w-full h-7 text-[11px]">
              {{ patientContext.activePatient()?.id === p.id ? 'Active Patient Chart' : 'Select Patient Chart' }}
            </button>
          </div>
        </div>

        <ng-template #noPatients>
          <div class="p-8 text-center text-xs text-muted-foreground">
            No patients loaded in current unit roster.
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class NurseDashboardComponent implements OnInit {
  patients = signal<Patient[]>([]);
  patientCount = signal(0);

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    public patientContext: PatientContextService,
  ) {}

  get currentUser() {
    return this.authService.currentUser();
  }

  ngOnInit(): void {
    this.apiService.getPatients().subscribe((pts) => {
      this.patients.set(pts);
      this.patientCount.set(pts.length);
      if (pts.length > 0 && !this.patientContext.activePatient()) {
        this.patientContext.setActivePatient(pts[0]);
      }
    });
  }

  selectPatient(p: Patient): void {
    this.patientContext.setActivePatient(p);
  }
}
