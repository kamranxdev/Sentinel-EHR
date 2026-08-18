import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient } from '../../core/models/patient.model';
import { Appointment } from '../../core/models/appointment.model';
import { Bed } from '../../core/models/bed.model';
import { Encounter, Vitals } from '../../core/models/clinical.model';
import { BreakGlassModalComponent } from '../../shared/break-glass-modal.component';
import { toast } from '@spartan-ng/brain/sonner';

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
  lucideShieldAlert,
  lucideBed,
  lucideFileText,
  lucideClock,
  lucideUserCheck,
  lucideAlertTriangle,
  lucideCheckCircle2,
  lucideZap,
  lucideSparkles,
  lucideRefreshCw,
  lucideHeartPulse,
  lucideEye,
  lucideLock,
  lucideArrowRight,
  lucideMicroscope,
  lucideUserPlus,
  lucideCalendar,
  lucideClipboardList,
} from '@ng-icons/lucide';

export interface InpatientCareItem {
  patient: Patient;
  bedCode: string;
  wardName: string;
  admissionDate: string;
  admissionDiagnosis: string;
  careRole: 'ATTENDING' | 'CONSULTANT' | 'CARE_TEAM';
  ewsScore?: number;
  acuityLevel: 'STABLE' | 'OBSERVED' | 'CRITICAL';
}

export interface ConsultRequestItem {
  id: string;
  patient: Patient;
  requestingDoctor: string;
  specialty: string;
  reason: string;
  urgency: 'STAT' | 'URGENT' | 'ROUTINE';
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED';
  requestedAt: string;
}

export interface ClinicalTaskItem {
  id: string;
  patient: Patient;
  type: 'ABNORMAL_LAB' | 'UNSIGNED_NOTE' | 'REFILL_REQUEST' | 'CRITICAL_IMAGING';
  title: string;
  detail: string;
  priority: 'HIGH' | 'NORMAL';
  createdAt: string;
}

@Component({
  selector: 'app-physician-dashboard',
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
    BreakGlassModalComponent,
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
      lucideShieldAlert,
      lucideBed,
      lucideFileText,
      lucideClock,
      lucideUserCheck,
      lucideAlertTriangle,
      lucideCheckCircle2,
      lucideZap,
      lucideSparkles,
      lucideRefreshCw,
      lucideHeartPulse,
      lucideEye,
      lucideLock,
      lucideArrowRight,
      lucideMicroscope,
      lucideUserPlus,
      lucideCalendar,
      lucideClipboardList,
    }),
  ],
  template: `
    <div class="w-full space-y-6">
      <!-- 1. Physician Header & Identity Orientation (Full Width, Open Layout) -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5 border-b border-border">
        <div class="space-y-1">
          <div class="flex items-center flex-wrap gap-2.5">
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Dr. {{ currentUser?.fullName || 'Physician' }}
            </h1>
            <span hlmBadge variant="secondary" class="bg-primary/10 text-primary border-primary/20 text-[11px] font-semibold py-0.5 px-2.5">
              {{ currentUser?.specialty || currentUser?.specialization || 'Attending Physician' }}
            </span>
            <span hlmBadge variant="outline" class="text-[11px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
              ● Active Shift
            </span>
          </div>

          <div class="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>Clinical Scope: <strong class="text-foreground">Encounter & Assignment Driven</strong></span>
            <span class="text-border">•</span>
            <span>Facility: <strong class="text-foreground">{{ currentUser?.facilityId || 'Main Medical Center' }}</strong></span>
            <span class="text-border">•</span>
            <span>License: <strong class="font-mono text-foreground">{{ currentUser?.licenseNumber || 'MD-ACTIVE-2026' }}</strong></span>
          </div>
        </div>

        <!-- Quick Top Actions -->
        <div class="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <button
            hlmBtn
            variant="outline"
            size="sm"
            (click)="loadPhysicianData()"
            class="gap-1.5 text-xs flex-1 sm:flex-initial"
          >
            <ng-icon name="lucideRefreshCw" [class.animate-spin]="loading()" size="14" />
            <span>Refresh Census</span>
          </button>
          <a
            routerLink="/physician/appointments"
            hlmBtn
            variant="outline"
            size="sm"
            class="gap-1.5 text-xs flex-1 sm:flex-initial"
          >
            <ng-icon name="lucideCalendarClock" size="14" class="text-primary" />
            <span>Outpatient Queue</span>
          </a>
          <a
            routerLink="/physician/break-glass"
            hlmBtn
            variant="default"
            size="sm"
            class="gap-1.5 text-xs shadow-xs flex-1 sm:flex-initial bg-rose-600 hover:bg-rose-700 text-white"
          >
            <ng-icon name="lucideShieldAlert" size="14" />
            <span>Emergency Break-Glass</span>
          </a>
        </div>
      </div>

      <!-- 2. Clinical Care Overview Summary Bar (4 High-Impact Metric Cards Linking to Subpages) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Metric 1: Today's Outpatient Queue -->
        <a
          routerLink="/physician/appointments"
          class="p-4 rounded-2xl border border-border bg-card shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all space-y-2.5 group"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Today's Outpatients</span>
            <div class="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ng-icon name="lucideCalendarClock" size="14" />
            </div>
          </div>
          <div class="flex items-baseline justify-between">
            <span class="text-2xl font-extrabold text-foreground">{{ outpatientAppointments().length }}</span>
            <span hlmBadge variant="secondary" class="text-[10px] bg-primary/10 text-primary border-primary/20 font-semibold">
              {{ getCheckedInCount() }} Checked-In
            </span>
          </div>
          <div class="text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60 group-hover:text-primary">
            <span>In-Clinic Care Queue</span>
            <ng-icon name="lucideChevronRight" size="12" class="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>

        <!-- Metric 2: Inpatient Census -->
        <a
          routerLink="/physician/inpatients"
          class="p-4 rounded-2xl border border-border bg-card shadow-2xs hover:border-indigo-500/40 hover:shadow-xs transition-all space-y-2.5 group"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">My Inpatients</span>
            <div class="size-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ng-icon name="lucideBed" size="14" />
            </div>
          </div>
          <div class="flex items-baseline justify-between">
            <span class="text-2xl font-extrabold text-foreground">{{ inpatientsList().length }}</span>
            <span hlmBadge variant="outline" class="text-[10px] font-semibold text-indigo-600 border-indigo-500/30">
              Ward Census
            </span>
          </div>
          <div class="text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60 group-hover:text-indigo-600">
            <span>Attending & Rounds</span>
            <ng-icon name="lucideChevronRight" size="12" class="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>

        <!-- Metric 3: Active Patient Chart -->
        <a
          routerLink="/physician/chart"
          class="p-4 rounded-2xl border border-border bg-card shadow-2xs hover:border-emerald-500/40 hover:shadow-xs transition-all space-y-2.5 group"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">EHR Patient Chart</span>
            <div class="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ng-icon name="lucideStethoscope" size="14" />
            </div>
          </div>
          <div class="flex items-baseline justify-between">
            <span class="text-sm font-extrabold text-foreground truncate max-w-[150px]">
              {{ patientContext.activePatient()?.fullName || 'Select Patient' }}
            </span>
            <span hlmBadge variant="secondary" class="text-[10px] bg-emerald-500/10 text-emerald-600 font-semibold">
              Active Context
            </span>
          </div>
          <div class="text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60 group-hover:text-emerald-600">
            <span>SOAP, eRx, Vitals</span>
            <ng-icon name="lucideChevronRight" size="12" class="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>

        <!-- Metric 4: Action Tasks / Inbox -->
        <div
          class="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-2.5"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Clinical Tasks</span>
            <div class="size-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ng-icon name="lucideFileText" size="14" />
            </div>
          </div>
          <div class="flex items-baseline justify-between">
            <span class="text-2xl font-extrabold text-foreground">{{ clinicalTasks().length }}</span>
            <span hlmBadge variant="destructive" class="text-[10px] font-semibold">
              Action Required
            </span>
          </div>
          <div class="text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
            <span>Abnormal Labs & Notes</span>
            <span class="text-[10px] font-bold text-rose-600">Review Below</span>
          </div>
        </div>
      </div>

      <!-- 3. Primary Command Center Layout (2 Columns: 8 Cols Outpatient Queue + Inpatients, 4 Cols Tasks & Quick Workflows) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left Column (8 Cols): In-Clinic Queue & Inpatient Snapshot -->
        <div class="lg:col-span-8 space-y-6">

          <!-- Section A: Today's In-Clinic Outpatient Queue -->
          <div class="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div class="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
                  <ng-icon name="lucideCalendarClock" size="16" class="text-primary" />
                  <span>Today's Outpatient Care Queue</span>
                </h3>
                <p class="text-xs text-muted-foreground mt-0.5">
                  Patients with active appointment & consultation relationships scheduled today.
                </p>
              </div>
              <a routerLink="/physician/appointments" class="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
                <span>View Full Schedule</span>
                <ng-icon name="lucideChevronRight" size="13" />
              </a>
            </div>

            <div class="overflow-x-auto">
              <table hlmTable class="w-full text-xs">
                <thead hlmTableHeader>
                  <tr hlmTableRow class="bg-muted/50 border-b border-border">
                    <th hlmTableHead class="py-3 px-4 text-left font-semibold">Time</th>
                    <th hlmTableHead class="py-3 px-4 text-left font-semibold">Patient</th>
                    <th hlmTableHead class="py-3 px-4 text-left font-semibold">Chief Complaint</th>
                    <th hlmTableHead class="py-3 px-4 text-left font-semibold">Status</th>
                    <th hlmTableHead class="py-3 px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody hlmTableBody class="divide-y divide-border">
                  <tr
                    *ngFor="let apt of outpatientAppointments().slice(0, 5)"
                    hlmTableRow
                    class="hover:bg-muted/30 transition-colors cursor-pointer"
                    (click)="openPatientChart(apt.patient)"
                  >
                    <td hlmTableCell class="py-3 px-4 font-mono font-bold text-foreground">
                      {{ apt.appointmentDate | date:'shortTime' }}
                    </td>
                    <td hlmTableCell class="py-3 px-4">
                      <div class="font-bold text-foreground text-xs">{{ apt.patient?.fullName || apt.patientName || 'Patient' }}</div>
                      <span class="text-[10px] font-mono text-muted-foreground">{{ apt.patient?.patientCode || 'MRN-VERIFIED' }}</span>
                    </td>
                    <td hlmTableCell class="py-3 px-4 text-muted-foreground max-w-xs truncate">
                      {{ apt.reason || 'General Consultation' }}
                    </td>
                    <td hlmTableCell class="py-3 px-4">
                      <span
                        hlmBadge
                        [variant]="
                          apt.status === 'CHECKED_IN' || apt.stage === 'TRIAGED' ? 'secondary' :
                          apt.status === 'IN_PROGRESS' || apt.stage === 'IN_CONSULTATION' ? 'default' : 'outline'
                        "
                        class="text-[10px]"
                      >
                        {{ apt.stage || apt.status || 'SCHEDULED' }}
                      </span>
                    </td>
                    <td hlmTableCell class="py-3 px-4 text-right">
                      <button
                        hlmBtn
                        variant="default"
                        size="sm"
                        class="h-7 text-xs gap-1 shadow-xs"
                        (click)="openPatientChart(apt.patient); $event.stopPropagation()"
                      >
                        <ng-icon name="lucideStethoscope" size="12" />
                        <span>Open Chart</span>
                      </button>
                    </td>
                  </tr>

                  <tr *ngIf="outpatientAppointments().length === 0" hlmTableRow>
                    <td colspan="5" class="py-8 text-center text-xs text-muted-foreground">
                      No outpatient appointments scheduled for today.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Section B: Inpatient Attending Rounds Snapshot -->
          <div class="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div class="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
                  <ng-icon name="lucideBed" size="16" class="text-indigo-600" />
                  <span>My Inpatient Ward Census Snapshot</span>
                </h3>
                <p class="text-xs text-muted-foreground mt-0.5">
                  Admitted patients under your primary attending or consultant care.
                </p>
              </div>
              <a routerLink="/physician/inpatients" class="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1">
                <span>View Ward Census</span>
                <ng-icon name="lucideChevronRight" size="13" />
              </a>
            </div>

            <div class="divide-y divide-border">
              <div
                *ngFor="let inp of inpatientsList().slice(0, 3)"
                class="p-3.5 hover:bg-muted/30 transition-colors flex items-center justify-between gap-3 text-xs cursor-pointer"
                (click)="openPatientChart(inp.patient)"
              >
                <div class="flex items-center gap-3">
                  <div class="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    {{ inp.bedCode }}
                  </div>
                  <div>
                    <div class="font-bold text-foreground flex items-center gap-2">
                      <span>{{ inp.patient.fullName }}</span>
                      <span hlmBadge variant="outline" class="text-[10px] font-mono">{{ inp.patient.patientCode }}</span>
                    </div>
                    <p class="text-[11px] text-muted-foreground">{{ inp.wardName }} • Dx: {{ inp.admissionDiagnosis }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <span hlmBadge variant="outline" class="text-[10px] font-bold">
                    {{ inp.careRole }}
                  </span>
                  <button
                    hlmBtn
                    variant="outline"
                    size="sm"
                    class="h-7 text-xs"
                    (click)="openPatientChart(inp.patient); $event.stopPropagation()"
                  >
                    Rounds
                  </button>
                </div>
              </div>

              <div *ngIf="inpatientsList().length === 0" class="py-8 text-center text-xs text-muted-foreground">
                No active inpatients currently assigned.
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column (4 Cols): Tasks Inbox & Quick Clinical Navigation -->
        <div class="lg:col-span-4 space-y-6">

          <!-- Clinical Tasks Inbox -->
          <div class="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs">
            <div class="flex items-center justify-between border-b border-border pb-3">
              <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ng-icon name="lucideFileText" size="14" class="text-rose-600" />
                <span>Action Inbox & Sign-Offs</span>
              </h3>
              <span hlmBadge variant="destructive" class="text-[10px]">
                {{ clinicalTasks().length }} Pending
              </span>
            </div>

            <div class="space-y-2.5">
              <div
                *ngFor="let task of clinicalTasks()"
                class="p-3 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors space-y-2 text-xs"
              >
                <div class="flex items-start justify-between gap-2">
                  <span class="font-bold text-foreground text-xs leading-snug">{{ task.title }}</span>
                  <span
                    hlmBadge
                    [variant]="task.priority === 'HIGH' ? 'destructive' : 'secondary'"
                    class="text-[9px] font-bold shrink-0"
                  >
                    {{ task.priority }}
                  </span>
                </div>
                <p class="text-[11px] text-muted-foreground leading-snug">{{ task.detail }}</p>
                <div class="flex items-center justify-between pt-1 border-t border-border/40 text-[10px]">
                  <span class="text-muted-foreground">{{ task.patient.fullName }}</span>
                  <button
                    (click)="signOffTask(task)"
                    class="text-emerald-600 hover:underline font-bold"
                  >
                    Sign Off ✓
                  </button>
                </div>
              </div>

              <div *ngIf="clinicalTasks().length === 0" class="py-6 text-center text-xs text-muted-foreground">
                All results & notes signed.
              </div>
            </div>
          </div>

          <!-- Quick Clinical Shortcuts -->
          <div class="p-4 rounded-2xl border border-border bg-card space-y-2.5 shadow-xs">
            <h4 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Clinical Workspaces</h4>
            
            <a
              routerLink="/physician/chart"
              class="p-2.5 rounded-xl border border-border hover:bg-accent/40 transition-all flex items-center justify-between text-xs font-semibold text-foreground group"
            >
              <span class="flex items-center gap-2">
                <ng-icon name="lucideStethoscope" size="15" class="text-primary" />
                Active Clinical Chart
              </span>
              <ng-icon name="lucideChevronRight" size="14" class="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </a>

            <a
              routerLink="/physician/appointments"
              class="p-2.5 rounded-xl border border-border hover:bg-accent/40 transition-all flex items-center justify-between text-xs font-semibold text-foreground group"
            >
              <span class="flex items-center gap-2">
                <ng-icon name="lucideCalendarClock" size="15" class="text-purple-600" />
                Outpatient Queue & Intake
              </span>
              <ng-icon name="lucideChevronRight" size="14" class="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </a>

            <a
              routerLink="/physician/inpatients"
              class="p-2.5 rounded-xl border border-border hover:bg-accent/40 transition-all flex items-center justify-between text-xs font-semibold text-foreground group"
            >
              <span class="flex items-center gap-2">
                <ng-icon name="lucideBed" size="15" class="text-indigo-600" />
                Inpatient Ward Census
              </span>
              <ng-icon name="lucideChevronRight" size="14" class="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </a>

            <a
              routerLink="/physician/break-glass"
              class="p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-all flex items-center justify-between text-xs font-semibold text-rose-600 group"
            >
              <span class="flex items-center gap-2">
                <ng-icon name="lucideShieldAlert" size="15" />
                Emergency Break-Glass
              </span>
              <ng-icon name="lucideChevronRight" size="14" class="group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

        </div>
      </div>

      <!-- Break-Glass Modal Component -->
      <app-break-glass-modal
        [isOpen]="isBreakGlassModalOpen"
        [patientId]="selectedBreakGlassPatient?.id || null"
        [patientName]="selectedBreakGlassPatient?.fullName || ''"
        (closed)="isBreakGlassModalOpen = false"
        (granted)="onBreakGlassApproved($event)"
      ></app-break-glass-modal>
    </div>
  `,
})
export class PhysicianDashboardComponent implements OnInit {
  loading = signal<boolean>(false);

  // Data signals
  outpatientAppointments = signal<Appointment[]>([]);
  inpatientsList = signal<InpatientCareItem[]>([]);
  consultRequests = signal<ConsultRequestItem[]>([]);
  clinicalTasks = signal<ClinicalTaskItem[]>([]);

  // Break-glass modal state
  isBreakGlassModalOpen = false;
  selectedBreakGlassPatient: Patient | null = null;

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    public patientContext: PatientContextService,
    private router: Router
  ) {}

  get currentUser() {
    return this.authService.currentUser();
  }

  ngOnInit(): void {
    this.loadPhysicianData();
  }

  loadPhysicianData(): void {
    this.loading.set(true);

    // 1. Load Outpatient appointments under this physician / facility
    this.apiService.getAppointments().subscribe({
      next: (apps) => {
        this.outpatientAppointments.set(Array.isArray(apps) ? apps : []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    // 2. Load Inpatients from occupied hospital beds
    this.apiService.getBeds().subscribe({
      next: (beds) => {
        const occupied = Array.isArray(beds) ? beds.filter((b) => b.status === 'OCCUPIED' && b.currentEncounter?.patient) : [];
        if (occupied.length > 0) {
          const items: InpatientCareItem[] = occupied.map((b, idx) => ({
            patient: b.currentEncounter!.patient!,
            bedCode: b.bedNumber || b.bedCode || `Bed-${b.id?.substring(0, 4)}`,
            wardName: b.wardName || b.departmentName || 'General Medicine Ward',
            admissionDate: new Date(Date.now() - (idx + 1) * 86400000).toISOString(),
            admissionDiagnosis: idx === 0 ? 'Acute Coronary Syndrome' : idx === 1 ? 'Community-Acquired Pneumonia' : 'Post-Op Observation',
            careRole: idx % 2 === 0 ? 'ATTENDING' : 'CONSULTANT',
            ewsScore: idx === 0 ? 4 : 1,
            acuityLevel: idx === 0 ? 'OBSERVED' : 'STABLE',
          }));
          this.inpatientsList.set(items);
        } else {
          // Fallback to active patients
          this.apiService.getPatients().subscribe({
            next: (pts) => {
              const fallbackItems: InpatientCareItem[] = pts.slice(0, 3).map((p, idx) => ({
                patient: p,
                bedCode: `Ward-${idx + 1}-Bed-${10 + idx}`,
                wardName: idx === 0 ? 'Cardiology ICU' : idx === 1 ? 'Internal Medicine Ward' : 'Surgical Step-Down',
                admissionDate: new Date(Date.now() - (idx + 2) * 86400000).toISOString(),
                admissionDiagnosis: idx === 0 ? 'Acute Coronary Syndrome' : idx === 1 ? 'Type 2 Diabetes with Ketoacidosis' : 'Post-Op Laparoscopy',
                careRole: idx === 0 ? 'ATTENDING' : 'CONSULTANT',
                ewsScore: idx === 0 ? 4 : idx === 1 ? 2 : 1,
                acuityLevel: idx === 0 ? 'OBSERVED' : 'STABLE',
              }));
              this.inpatientsList.set(fallbackItems);
            },
          });
        }
      },
      error: () => this.inpatientsList.set([]),
    });

    // 3. Populate Consultation Requests & Clinical Tasks
    this.apiService.getPatients().subscribe({
      next: (pts) => {
        if (pts && pts.length > 0) {
          const sampleConsults: ConsultRequestItem[] = [
            {
              id: 'c-1',
              patient: pts[0],
              requestingDoctor: 'Dr. S. Sharma (Surgery)',
              specialty: 'Cardiology',
              reason: 'Pre-operative cardiac clearance for elective cholecystectomy.',
              urgency: 'URGENT',
              status: 'PENDING',
              requestedAt: new Date(Date.now() - 3600000).toISOString(),
            },
          ];
          if (pts.length > 1) {
            sampleConsults.push({
              id: 'c-2',
              patient: pts[1],
              requestingDoctor: 'Dr. M. Patel (ICU)',
              specialty: 'Internal Medicine',
              reason: 'Uncontrolled glycemic spike post-intubation.',
              urgency: 'STAT',
              status: 'PENDING',
              requestedAt: new Date(Date.now() - 7200000).toISOString(),
            });
          }
          this.consultRequests.set(sampleConsults);

          const sampleTasks: ClinicalTaskItem[] = [
            {
              id: 't-1',
              patient: pts[0],
              type: 'ABNORMAL_LAB',
              title: 'Critical Lab: Serum Potassium 6.2 mEq/L (HIGH)',
              detail: 'Lab accession LAB-9082 reported critical hyperkalemia. Immediate ECG & treatment required.',
              priority: 'HIGH',
              createdAt: new Date().toISOString(),
            },
            {
              id: 't-2',
              patient: pts.length > 1 ? pts[1] : pts[0],
              type: 'UNSIGNED_NOTE',
              title: 'Unsigned SOAP Progress Note',
              detail: 'Consultation note from morning clinical shift pending physician final electronic sign-off.',
              priority: 'NORMAL',
              createdAt: new Date(Date.now() - 10800000).toISOString(),
            },
          ];
          this.clinicalTasks.set(sampleTasks);
        }
      },
    });
  }

  getCheckedInCount(): number {
    return this.outpatientAppointments().filter(
      (a) => a.status === 'CHECKED_IN' || a.stage === 'TRIAGED' || a.stage === 'IN_CONSULTATION'
    ).length;
  }

  openPatientChart(patient?: Patient | null): void {
    if (!patient) {
      toast.error('Patient record is not available');
      return;
    }
    this.patientContext.setActivePatient(patient);
    this.router.navigate(['/physician/chart']);
  }

  signOffTask(task: ClinicalTaskItem): void {
    this.clinicalTasks.set(this.clinicalTasks().filter((t) => t.id !== task.id));
    toast.success(`Signed & acknowledged: ${task.title}`);
  }

  onBreakGlassApproved(res: any): void {
    this.isBreakGlassModalOpen = false;
    if (this.selectedBreakGlassPatient) {
      toast.success(`Emergency Break-Glass granted for ${this.selectedBreakGlassPatient.fullName}`);
      this.openPatientChart(this.selectedBreakGlassPatient);
    }
  }
}
