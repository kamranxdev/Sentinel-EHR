import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { Patient } from '../../core/models/patient.model';
import { InpatientCareItem, CareTeamMemberInfo } from '../../core/models/care-team.model';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBed,
  lucideHeartPulse,
  lucideSearch,
  lucideRefreshCw,
  lucideActivity,
  lucideClock,
  lucideChevronRight,
  lucideShieldAlert,
  lucideUsers,
  lucideUserCheck,
  lucideAlertTriangle,
  lucideCheckCircle2,
  lucideUserPlus,
  lucideX,
  lucideMail,
  lucideCalendar,
  lucidePill,
  lucideFileText,
  lucideDroplet,
  lucideStethoscope,
  lucideClipboardList,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-nurse-inpatients',
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
      lucideHeartPulse,
      lucideSearch,
      lucideRefreshCw,
      lucideActivity,
      lucideClock,
      lucideChevronRight,
      lucideShieldAlert,
      lucideUsers,
      lucideUserCheck,
      lucideAlertTriangle,
      lucideCheckCircle2,
      lucideUserPlus,
      lucideX,
      lucideMail,
      lucideCalendar,
      lucidePill,
      lucideFileText,
      lucideDroplet,
      lucideStethoscope,
      lucideClipboardList,
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
              Inpatient Care & Bedside Census
            </h1>
            <span
              hlmBadge
              variant="secondary"
              class="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-semibold"
            >
              Assigned Nursing Care Team
            </span>
          </div>
          <p class="text-xs text-muted-foreground">
            Admitted inpatients assigned to your nursing care team, unit station, and bedside shifts.
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
            <span>Refresh Roster</span>
          </button>
          <a
            routerLink="/nurse/beds"
            hlmBtn
            variant="outline"
            size="sm"
            class="gap-1.5 text-xs flex-1 sm:flex-initial"
          >
            <ng-icon name="lucideBed" size="14" />
            <span>Spatial Ward Census</span>
          </a>
          <a
            routerLink="/nurse/chart"
            hlmBtn
            variant="default"
            size="sm"
            class="gap-1.5 text-xs shadow-xs flex-1 sm:flex-initial"
          >
            <ng-icon name="lucideHeartPulse" size="14" />
            <span>Active Nursing Chart</span>
          </a>
        </div>
      </div>

      <!-- Census Summary Cards (4 Cards) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Card 1: Total Assigned -->
        <div class="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >Assigned Patients</span
            >
            <div class="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ng-icon name="lucideUsers" size="14" />
            </div>
          </div>
          <div class="text-2xl font-extrabold text-foreground">{{ inpatientsList().length }}</div>
          <p class="text-[11px] text-muted-foreground">Active bedside care roster</p>
        </div>

        <!-- Card 2: Primary Bedside Nurse -->
        <div class="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >Primary Nurse</span
            >
            <div
              class="size-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center"
            >
              <ng-icon name="lucideUserCheck" size="14" />
            </div>
          </div>
          <div class="text-2xl font-extrabold text-foreground">{{ getPrimaryNurseCount() }}</div>
          <p class="text-[11px] text-muted-foreground">
            Direct shift accountability & intake
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
          <div class="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{{ getHighAcuityCount() }}</div>
          <p class="text-[11px] text-muted-foreground">
            Frequent vital sign rechecks needed
          </p>
        </div>

        <!-- Card 4: High Fall Risk -->
        <div class="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
              >Fall Risk Precautions</span
            >
            <div
              class="size-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center"
            >
              <ng-icon name="lucideAlertTriangle" size="14" />
            </div>
          </div>
          <div class="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{{ getFallRiskCount() }}</div>
          <p class="text-[11px] text-muted-foreground">Bed alarms & assistance active</p>
        </div>
      </div>

      <!-- Filters & Inpatient Table Container -->
      <div class="rounded-2xl border border-border bg-card overflow-hidden shadow-xs space-y-0">
        <div
          class="p-4 border-b border-border bg-muted/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
        >
          <!-- Category Filters -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <button
              (click)="selectedCategoryFilter = 'ALL'"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              [ngClass]="
                selectedCategoryFilter === 'ALL'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              "
            >
              All Inpatients ({{ inpatientsList().length }})
            </button>
            <button
              (click)="selectedCategoryFilter = 'PRIMARY_NURSE'"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              [ngClass]="
                selectedCategoryFilter === 'PRIMARY_NURSE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              "
            >
              Primary Nurse ({{ getPrimaryNurseCount() }})
            </button>
            <button
              (click)="selectedCategoryFilter = 'HIGH_ACUITY'"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              [ngClass]="
                selectedCategoryFilter === 'HIGH_ACUITY'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              "
            >
              High Acuity EWS ({{ getHighAcuityCount() }})
            </button>
          </div>

          <!-- Search Bar -->
          <div class="relative w-full md:w-80">
            <ng-icon
              name="lucideSearch"
              size="14"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              hlmInput
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search patient, MRN, bed, ward, or doctor..."
              class="pl-9 h-9 w-full text-xs bg-background"
            />
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="py-16 text-center text-muted-foreground space-y-2">
          <ng-icon name="lucideRefreshCw" class="animate-spin text-primary mx-auto" size="24" />
          <p class="text-xs font-medium">Retrieving active nursing inpatient census...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="errorMessage && !isLoading" class="p-6 text-center space-y-2 text-destructive">
          <ng-icon name="lucideAlertTriangle" size="28" class="mx-auto" />
          <p class="text-xs font-medium">{{ errorMessage }}</p>
          <button hlmBtn variant="outline" size="sm" (click)="loadInpatients()" class="text-xs">
            Retry
          </button>
        </div>

        <!-- Main Inpatient Table -->
        <div *ngIf="!isLoading && !errorMessage" class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Location / Bed</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Patient Demographics</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Admission Diagnosis</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Attending & Care Team</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Acuity & Precautions</th>
                <th hlmTableHead class="py-3 px-4 text-right font-semibold">Nursing Actions</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr
                *ngFor="let inp of filteredInpatients()"
                hlmTableRow
                class="hover:bg-muted/30 transition-colors cursor-pointer"
                (click)="openPatientChart(inp, 'chart')"
              >
                <!-- Location -->
                <td hlmTableCell class="py-3.5 px-4 font-mono">
                  <div class="font-bold text-foreground flex items-center gap-1.5">
                    <ng-icon name="lucideBed" size="14" class="text-emerald-600" />
                    <span>{{ inp.bedCode || inp.bedNumber || 'Unassigned' }}</span>
                  </div>
                  <span class="text-[11px] text-muted-foreground block truncate">
                    {{ inp.wardName || 'Inpatient Ward' }}
                    <span *ngIf="inp.roomNumber"> • Rm {{ inp.roomNumber }}</span>
                  </span>
                </td>

                <!-- Patient -->
                <td hlmTableCell class="py-3.5 px-4">
                  <div class="font-bold text-foreground text-sm flex items-center gap-2">
                    <span>{{ inp.fullName }}</span>
                    <span hlmBadge variant="outline" class="text-[10px] font-mono">{{
                      inp.patientCode
                    }}</span>
                  </div>
                  <div class="text-[11px] text-muted-foreground mt-0.5">
                    {{ inp.gender || 'Unknown' }} • {{ inp.dateOfBirth || 'DOB N/A' }}
                    <span *ngIf="inp.bloodGroup" class="ml-1 font-semibold text-foreground">({{ inp.bloodGroup }})</span>
                  </div>
                </td>

                <!-- Diagnosis -->
                <td hlmTableCell class="py-3.5 px-4 max-w-xs">
                  <span class="font-semibold text-foreground block truncate" [title]="inp.admissionDiagnosis || ''">
                    {{ inp.admissionDiagnosis || 'Inpatient Clinical Care' }}
                  </span>
                  <div class="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span>Admitted: {{ inp.admissionDate | date: 'mediumDate' }}</span>
                    <span *ngIf="inp.admissionType" class="uppercase font-mono">[{{ inp.admissionType }}]</span>
                  </div>
                </td>

                <!-- Care Team & Attending -->
                <td hlmTableCell class="py-3.5 px-4" (click)="$event.stopPropagation()">
                  <div class="space-y-1">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <div
                        *ngFor="let member of inp.careTeamMembers.slice(0, 2)"
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-foreground border border-border"
                        [title]="member.name + ' (' + member.role + ')'"
                      >
                        <span class="size-1.5 rounded-full" [ngClass]="member.roleCategory === 'PHYSICIAN' ? 'bg-indigo-500' : (member.roleCategory === 'NURSE' ? 'bg-emerald-500' : 'bg-amber-500')"></span>
                        <span class="truncate max-w-[100px]">{{ member.name }}</span>
                      </div>
                      <button
                        hlmBtn
                        variant="ghost"
                        size="sm"
                        (click)="openCareTeamModal(inp)"
                        class="h-6 px-2 text-[10px] font-semibold text-primary hover:bg-primary/10 rounded-md gap-1"
                      >
                        <ng-icon name="lucideUsers" size="11" />
                        <span>{{ inp.careTeamMembers.length > 2 ? '+' + (inp.careTeamMembers.length - 2) + ' more' : 'View Team' }}</span>
                      </button>
                    </div>
                  </div>
                </td>

                <!-- Acuity & Precautions -->
                <td hlmTableCell class="py-3.5 px-4">
                  <div class="flex flex-col gap-1 items-start">
                    <span
                      hlmBadge
                      [variant]="
                        inp.acuityLevel === 'CRITICAL' || (inp.ewsScore ?? 0) >= 5
                          ? 'destructive'
                          : (inp.acuityLevel === 'OBSERVED' || (inp.ewsScore ?? 0) >= 3
                            ? 'outline'
                            : 'secondary')
                      "
                      class="text-[10px] font-bold"
                    >
                      EWS {{ inp.ewsScore ?? 0 }} • {{ inp.acuityLevel || 'STABLE' }}
                    </span>
                    <div class="flex items-center gap-1 text-[10px] text-muted-foreground flex-wrap">
                      <span *ngIf="inp.fallRisk === 'HIGH'" class="text-amber-600 font-semibold flex items-center gap-0.5">
                        <ng-icon name="lucideAlertTriangle" size="10" />
                        Fall Risk
                      </span>
                      <span *ngIf="inp.codeStatus" class="font-mono">[{{ inp.codeStatus }}]</span>
                    </div>
                  </div>
                </td>

                <!-- Actions -->
                <td hlmTableCell class="py-3.5 px-4 text-right" (click)="$event.stopPropagation()">
                  <div class="flex items-center justify-end gap-1.5 flex-wrap">
                    <button
                      hlmBtn
                      variant="outline"
                      size="sm"
                      class="h-8 text-xs font-semibold gap-1"
                      (click)="openPatientChart(inp, 'vitals')"
                      title="Record Bedside Vitals / Flowsheet"
                    >
                      <ng-icon name="lucideHeartPulse" size="12" class="text-rose-500" />
                      <span class="hidden xl:inline">Vitals</span>
                    </button>
                    <button
                      hlmBtn
                      variant="outline"
                      size="sm"
                      class="h-8 text-xs font-semibold gap-1"
                      (click)="openPatientChart(inp, 'mar')"
                      title="View eMAR Medication Administration"
                    >
                      <ng-icon name="lucidePill" size="12" class="text-indigo-500" />
                      <span class="hidden xl:inline">eMAR</span>
                    </button>
                    <button
                      hlmBtn
                      variant="default"
                      size="sm"
                      class="h-8 text-xs font-semibold gap-1 shadow-xs"
                      (click)="openPatientChart(inp, 'chart')"
                    >
                      <ng-icon name="lucideClipboardList" size="12" />
                      <span>Bedside Chart</span>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="filteredInpatients().length === 0" hlmTableRow>
                <td colspan="6" class="py-16 text-center text-xs text-muted-foreground space-y-2">
                  <ng-icon name="lucideBed" class="text-muted-foreground/40 mx-auto" size="32" />
                  <p class="font-semibold text-foreground">No active inpatients found</p>
                  <p class="text-[11px]">No admitted patients match your current filter criteria.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Care Team Detail Modal / Dialog -->
      <div
        *ngIf="selectedInpatientForCareTeam"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        (click)="closeCareTeamModal()"
      >
        <div
          class="bg-card border border-border rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150"
          (click)="$event.stopPropagation()"
        >
          <!-- Modal Header -->
          <div class="flex items-start justify-between border-b border-border pb-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <div class="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <ng-icon name="lucideUsers" size="16" />
                </div>
                <h3 class="text-lg font-bold text-foreground">Patient Care Team Roster</h3>
              </div>
              <p class="text-xs text-muted-foreground">
                Patient: <span class="font-semibold text-foreground">{{ selectedInpatientForCareTeam.fullName }}</span>
                (MRN: {{ selectedInpatientForCareTeam.patientCode }}) • Bed: {{ selectedInpatientForCareTeam.bedCode || 'N/A' }} ({{ selectedInpatientForCareTeam.wardName || 'Ward' }})
              </p>
            </div>
            <button
              hlmBtn
              variant="ghost"
              size="icon"
              (click)="closeCareTeamModal()"
              class="size-8 text-muted-foreground hover:text-foreground"
            >
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <!-- Members List -->
          <div class="space-y-3 max-h-96 overflow-y-auto pr-1">
            <div
              *ngFor="let member of selectedInpatientForCareTeam.careTeamMembers"
              class="p-3.5 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3"
            >
              <div class="flex items-center gap-3">
                <div
                  class="size-10 rounded-full flex items-center justify-center font-bold text-xs"
                  [ngClass]="
                    member.roleCategory === 'PHYSICIAN'
                      ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                      : member.roleCategory === 'NURSE'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  "
                >
                  {{ getInitials(member.name) }}
                </div>
                <div class="space-y-0.5">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-foreground">{{ member.name }}</span>
                    <span
                      hlmBadge
                      [variant]="member.roleCategory === 'PHYSICIAN' ? 'default' : (member.roleCategory === 'NURSE' ? 'secondary' : 'outline')"
                      class="text-[10px] py-0 px-1.5"
                    >
                      {{ member.role }}
                    </span>
                  </div>
                  <div class="text-[11px] text-muted-foreground flex items-center gap-3 flex-wrap">
                    <span *ngIf="member.specialty">{{ member.specialty }}</span>
                    <span *ngIf="member.email" class="flex items-center gap-1">
                      <ng-icon name="lucideMail" size="11" />
                      {{ member.email }}
                    </span>
                    <span *ngIf="member.startedAt" class="flex items-center gap-1 text-[10px]">
                      <ng-icon name="lucideCalendar" size="10" />
                      Assigned: {{ member.startedAt | date: 'mediumDate' }}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span
                  class="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md"
                  [ngClass]="
                    member.roleCategory === 'PHYSICIAN'
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                      : member.roleCategory === 'NURSE'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  "
                >
                  {{ member.roleCategory || 'TEAM' }}
                </span>
              </div>
            </div>

            <div
              *ngIf="selectedInpatientForCareTeam.careTeamMembers.length === 0"
              class="p-8 text-center text-xs text-muted-foreground space-y-1"
            >
              <ng-icon name="lucideUsers" size="24" class="mx-auto text-muted-foreground/50" />
              <p>No other care team members assigned yet.</p>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex items-center justify-between border-t border-border pt-4">
            <button
              hlmBtn
              variant="outline"
              size="sm"
              (click)="closeCareTeamModal()"
              class="text-xs"
            >
              Close
            </button>
            <button
              hlmBtn
              variant="default"
              size="sm"
              (click)="openPatientChart(selectedInpatientForCareTeam, 'chart'); closeCareTeamModal()"
              class="text-xs gap-1.5"
            >
              <ng-icon name="lucideHeartPulse" size="13" />
              <span>Open Bedside Chart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NurseInpatientsComponent implements OnInit {
  inpatientsList = signal<InpatientCareItem[]>([]);
  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  selectedCategoryFilter: 'ALL' | 'PRIMARY_NURSE' | 'HIGH_ACUITY' = 'ALL';
  selectedInpatientForCareTeam: InpatientCareItem | null = null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    public patientContext: PatientContextService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadInpatients();
  }

  loadInpatients(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const user = this.authService.currentUser();
    const orgId = this.authService.activeContext()?.organizationId;
    const userId = user?.userId || user?.id;

    this.apiService
      .getPractitionerInpatients(undefined, orgId, undefined, userId)
      .subscribe({
        next: (items) => {
          this.inpatientsList.set(Array.isArray(items) ? items : []);
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to retrieve inpatient care roster';
          this.isLoading = false;
        },
      });
  }

  filteredInpatients = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    const cat = this.selectedCategoryFilter;
    let list = this.inpatientsList();

    if (cat === 'PRIMARY_NURSE') {
      list = list.filter((i) => i.isPrimaryNurse || i.myRole?.toUpperCase().includes('NURSE'));
    } else if (cat === 'HIGH_ACUITY') {
      list = list.filter((i) => (i.ewsScore ?? 0) >= 3 || i.acuityLevel === 'CRITICAL' || i.acuityLevel === 'OBSERVED');
    }

    if (!q) return list;
    return list.filter(
      (i) =>
        i.fullName?.toLowerCase().includes(q) ||
        i.patientCode?.toLowerCase().includes(q) ||
        i.wardName?.toLowerCase().includes(q) ||
        i.bedCode?.toLowerCase().includes(q) ||
        i.admissionDiagnosis?.toLowerCase().includes(q) ||
        i.careTeamMembers.some((m) => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q)),
    );
  });

  getPrimaryNurseCount(): number {
    return this.inpatientsList().filter(
      (i) => i.isPrimaryNurse || i.myRole?.toUpperCase().includes('NURSE'),
    ).length;
  }

  getHighAcuityCount(): number {
    return this.inpatientsList().filter(
      (i) => (i.ewsScore ?? 0) >= 3 || i.acuityLevel === 'CRITICAL' || i.acuityLevel === 'OBSERVED',
    ).length;
  }

  getFallRiskCount(): number {
    return this.inpatientsList().filter((i) => i.fallRisk === 'HIGH' || (i.ewsScore ?? 0) >= 3).length;
  }

  openCareTeamModal(inpatient: InpatientCareItem): void {
    this.selectedInpatientForCareTeam = inpatient;
  }

  closeCareTeamModal(): void {
    this.selectedInpatientForCareTeam = null;
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  openPatientChart(inpatient: InpatientCareItem, tab: 'chart' | 'vitals' | 'mar' = 'chart'): void {
    const patientObj: Patient = {
      id: inpatient.patientId,
      patientCode: inpatient.patientCode,
      fullName: inpatient.fullName,
      gender: inpatient.gender,
      dateOfBirth: inpatient.dateOfBirth,
      phone: inpatient.phoneNumber || '',
      phoneNumber: inpatient.phoneNumber,
      bloodGroup: inpatient.bloodGroup,
    };

    this.patientContext.setActivePatient(patientObj);
    if (tab === 'vitals') {
      this.router.navigate(['/nurse/chart'], { queryParams: { tab: 'vitals' } });
    } else if (tab === 'mar') {
      this.router.navigate(['/nurse/chart'], { queryParams: { tab: 'mar' } });
    } else {
      this.router.navigate(['/nurse/chart']);
    }
  }
}
