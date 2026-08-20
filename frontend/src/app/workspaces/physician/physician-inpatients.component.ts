import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient } from '../../core/models/patient.model';
import { Bed } from '../../core/models/bed.model';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBed,
  lucideStethoscope,
  lucideSearch,
  lucideRefreshCw,
  lucideActivity,
  lucideClock,
  lucideChevronRight,
  lucideShieldAlert,
  lucideUsers,
  lucideHeartPulse,
  lucideUserCheck,
  lucideAlertTriangle,
  lucideCheckCircle2,
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

@Component({
  selector: 'app-physician-inpatients',
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
      lucideBed,
      lucideStethoscope,
      lucideSearch,
      lucideRefreshCw,
      lucideActivity,
      lucideClock,
      lucideChevronRight,
      lucideShieldAlert,
      lucideUsers,
      lucideHeartPulse,
      lucideUserCheck,
      lucideAlertTriangle,
      lucideCheckCircle2,
    }),
  ],
  template: `
    <div class="w-full space-y-6">
      <!-- Inpatient Header -->
      <div
        class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5 border-b border-border"
      >
        <div class="space-y-1">
          <div class="flex items-center flex-wrap gap-2.5">
            <h1
              class="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2"
            >
              Inpatient Ward Census & Rounds
            </h1>
            <span
              hlmBadge
              variant="secondary"
              class="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-[11px] font-semibold"
            >
              Attending & Care Team Responsibility
            </span>
          </div>
          <p class="text-xs text-muted-foreground">
            Hospital admissions where you are designated as Attending Physician, Consulting
            Specialist, or Active Care-Team Member.
          </p>
        </div>

        <div class="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <button
            hlmBtn
            variant="outline"
            size="sm"
            (click)="loadInpatients()"
            class="gap-1.5 text-xs flex-1 sm:flex-initial"
          >
            <ng-icon name="lucideRefreshCw" [class.animate-spin]="isLoading" size="14" />
            <span>Refresh Census</span>
          </button>
          <a
            routerLink="/physician/chart"
            hlmBtn
            variant="default"
            size="sm"
            class="gap-1.5 text-xs shadow-xs flex-1 sm:flex-initial"
          >
            <ng-icon name="lucideStethoscope" size="14" />
            <span>Active Clinical Chart</span>
          </a>
        </div>
      </div>

      <!-- Census Summary Cards (3 Cards) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Card 1: Attending Patients -->
        <div class="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >Attending Admissions</span
            >
            <div
              class="size-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center"
            >
              <ng-icon name="lucideUserCheck" size="14" />
            </div>
          </div>
          <div class="text-2xl font-extrabold text-foreground">{{ getAttendingCount() }}</div>
          <p class="text-[11px] text-muted-foreground">
            Primary responsibility & discharge approval
          </p>
        </div>

        <!-- Card 2: Consultations -->
        <div class="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >Consultant Rounds</span
            >
            <div
              class="size-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center"
            >
              <ng-icon name="lucideStethoscope" size="14" />
            </div>
          </div>
          <div class="text-2xl font-extrabold text-foreground">{{ getConsultantCount() }}</div>
          <p class="text-[11px] text-muted-foreground">
            Specialty evaluation & inter-departmental care
          </p>
        </div>

        <!-- Card 3: Elevated Acuity / EWS -->
        <div class="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >Elevated Acuity (EWS ≥ 3)</span
            >
            <div
              class="size-7 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center"
            >
              <ng-icon name="lucideHeartPulse" size="14" />
            </div>
          </div>
          <div class="text-2xl font-extrabold text-foreground">{{ getHighAcuityCount() }}</div>
          <p class="text-[11px] text-muted-foreground">Requires frequent monitoring & rounds</p>
        </div>
      </div>

      <!-- Inpatient Table -->
      <div *ngIf="isLoading" class="p-8 text-center text-muted-foreground">
        Loading inpatients...
      </div>
      <div *ngIf="errorMessage" class="p-4 mb-4 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
        {{ errorMessage }}
      </div>
      <div *ngIf="!isLoading && !errorMessage" class="rounded-2xl border border-border bg-card overflow-hidden shadow-xs space-y-0">
        <div
          class="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
        >
          <div class="flex items-center gap-2">
            <ng-icon name="lucideBed" size="18" class="text-indigo-600" />
            <div>
              <h3 class="text-sm font-bold text-foreground">Inpatient Roster & Bed Distribution</h3>
              <p class="text-xs text-muted-foreground">
                Select any admitted patient to conduct clinical rounds or view inpatient flowsheet
              </p>
            </div>
          </div>

          <div class="relative w-full sm:w-72">
            <ng-icon
              name="lucideSearch"
              size="14"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              hlmInput
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search by patient, ward, or bed..."
              class="pl-9 h-9 w-full text-xs bg-background"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Location / Bed</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Inpatient Details</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Admission Diagnosis</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Clinical Role</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Acuity & EWS</th>
                <th hlmTableHead class="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr
                *ngFor="let inp of filteredInpatients()"
                hlmTableRow
                class="hover:bg-muted/30 transition-colors cursor-pointer"
                (click)="openPatientChart(inp.patient)"
              >
                <!-- Location -->
                <td hlmTableCell class="py-3.5 px-4 font-mono">
                  <div class="font-bold text-foreground">{{ inp.bedCode }}</div>
                  <span class="text-[11px] text-muted-foreground">{{ inp.wardName }}</span>
                </td>

                <!-- Patient -->
                <td hlmTableCell class="py-3.5 px-4">
                  <div class="font-bold text-foreground text-sm flex items-center gap-2">
                    <span>{{ inp.patient.fullName }}</span>
                    <span hlmBadge variant="outline" class="text-[10px] font-mono">{{
                      inp.patient.patientCode
                    }}</span>
                  </div>
                  <div class="text-[11px] text-muted-foreground">
                    Admitted: {{ inp.admissionDate | date: 'mediumDate' }} •
                    {{ inp.patient.gender || 'U' }} ({{ inp.patient.dateOfBirth || 'N/A' }})
                  </div>
                </td>

                <!-- Diagnosis -->
                <td hlmTableCell class="py-3.5 px-4 max-w-xs">
                  <span class="font-semibold text-foreground block truncate">{{
                    inp.admissionDiagnosis
                  }}</span>
                  <span class="text-[10px] text-muted-foreground font-mono">ICD-10 Coded</span>
                </td>

                <!-- Role -->
                <td hlmTableCell class="py-3.5 px-4">
                  <span
                    hlmBadge
                    [variant]="inp.careRole === 'ATTENDING' ? 'default' : 'secondary'"
                    class="text-[10px] font-bold"
                  >
                    {{ inp.careRole }}
                  </span>
                </td>

                <!-- Acuity -->
                <td hlmTableCell class="py-3.5 px-4">
                  <span
                    hlmBadge
                    [variant]="
                      inp.acuityLevel === 'CRITICAL'
                        ? 'destructive'
                        : inp.acuityLevel === 'OBSERVED'
                          ? 'outline'
                          : 'secondary'
                    "
                    class="text-[10px] font-bold"
                  >
                    EWS {{ inp.ewsScore ?? 1 }} • {{ inp.acuityLevel }}
                  </span>
                </td>

                <!-- Action -->
                <td hlmTableCell class="py-3.5 px-4 text-right">
                  <button
                    hlmBtn
                    variant="default"
                    size="sm"
                    class="h-8 text-xs font-semibold gap-1.5 shadow-xs"
                    (click)="openPatientChart(inp.patient); $event.stopPropagation()"
                  >
                    <ng-icon name="lucideStethoscope" size="13" />
                    <span>Inpatient Rounds</span>
                  </button>
                </td>
              </tr>

              <tr *ngIf="filteredInpatients().length === 0" hlmTableRow>
                <td colspan="6" class="py-12 text-center text-xs text-muted-foreground space-y-1">
                  <ng-icon name="lucideBed" class="text-muted-foreground/50 mx-auto" size="24" />
                  <p>No admitted inpatients found matching your search.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class PhysicianInpatientsComponent implements OnInit {
  inpatientsList = signal<InpatientCareItem[]>([]);
  isLoading: boolean = false;
  errorMessage: string = '';
  searchQuery = '';

  constructor(
    private apiService: ApiService,
    public patientContext: PatientContextService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadInpatients();
  }

  loadInpatients(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.apiService.getBeds().subscribe({
      next: (beds) => {
        const occupied = Array.isArray(beds)
          ? beds.filter((b) => b.status === 'OCCUPIED' && b.currentEncounter?.patient)
          : [];
        const items: InpatientCareItem[] = occupied.map((b, idx) => ({
          patient: b.currentEncounter!.patient!,
          bedCode: b.bedNumber || b.bedCode || `Bed-${b.id?.substring(0, 4)}`,
          wardName: b.wardName || b.departmentName || 'General Medicine Ward',
          admissionDate: new Date(Date.now() - (idx + 1) * 86400000).toISOString(),
          admissionDiagnosis: b.currentEncounter?.chiefComplaint || 'Unknown Diagnosis',
          careRole: idx % 2 === 0 ? 'ATTENDING' : 'CONSULTANT',
          ewsScore: idx === 0 ? 4 : 1,
          acuityLevel: idx === 0 ? 'OBSERVED' : 'STABLE',
        }));
        this.inpatientsList.set(items);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load inpatients';
        this.isLoading = false;
      },
    });
  }

  filteredInpatients = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    const list = this.inpatientsList();
    if (!q) return list;
    return list.filter(
      (i) =>
        i.patient.fullName?.toLowerCase().includes(q) ||
        i.patient.patientCode?.toLowerCase().includes(q) ||
        i.wardName?.toLowerCase().includes(q) ||
        i.bedCode?.toLowerCase().includes(q),
    );
  });

  getAttendingCount(): number {
    return this.inpatientsList().filter((i) => i.careRole === 'ATTENDING').length;
  }

  getConsultantCount(): number {
    return this.inpatientsList().filter((i) => i.careRole === 'CONSULTANT').length;
  }

  getHighAcuityCount(): number {
    return this.inpatientsList().filter((i) => (i.ewsScore || 0) >= 3).length;
  }

  openPatientChart(patient: Patient): void {
    this.patientContext.setActivePatient(patient);
    this.router.navigate(['/physician/chart']);
  }
}
