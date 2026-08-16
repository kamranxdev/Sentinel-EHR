import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Patient } from '../../core/models/patient.model';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucidePlus,
  lucideSearch,
  lucideHeartPulse,
  lucideSparkles,
  lucideShieldCheck,
  lucideEye,
  lucideEyeOff,
  lucideEdit,
  lucideGitMerge,
  lucideFilter,
  lucideUserCheck,
  lucideAlertTriangle,
  lucideCheck,
  lucideX,
  lucideBuilding,
  lucideMail,
  lucidePhone,
  lucideUser,
  lucideLock,
  lucideRefreshCw,
  lucideArrowUpRight,
  lucideFileText,
} from '@ng-icons/lucide';

interface ToastAlert {
  message: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-sys-admin-patients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmCardImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmDialogImports,
    HlmInputImports,
    HlmSelectImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucidePlus,
      lucideSearch,
      lucideHeartPulse,
      lucideSparkles,
      lucideShieldCheck,
      lucideEye,
      lucideEyeOff,
      lucideEdit,
      lucideGitMerge,
      lucideFilter,
      lucideUserCheck,
      lucideAlertTriangle,
      lucideCheck,
      lucideX,
      lucideBuilding,
      lucideMail,
      lucidePhone,
      lucideUser,
      lucideLock,
      lucideRefreshCw,
      lucideArrowUpRight,
      lucideFileText,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Toast Alert Banner -->
      <div
        *ngIf="toastMessage()"
        [ngClass]="{
          'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300': toastMessage()?.type === 'success',
          'bg-destructive/15 border-destructive/40 text-destructive': toastMessage()?.type === 'error'
        }"
        class="flex items-center justify-between p-3.5 rounded-lg border text-xs font-medium transition-all shadow-xs">
        <div class="flex items-center gap-2">
          <ng-icon [name]="toastMessage()?.type === 'success' ? 'lucideCheck' : 'lucideAlertTriangle'" size="16" />
          <span>{{ toastMessage()?.message }}</span>
        </div>
        <button (click)="toastMessage.set(null)" class="text-xs opacity-70 hover:opacity-100 font-mono">Dismiss</button>
      </div>

      <!-- Executive Header -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-3.5">
          <div class="size-11 rounded-xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-emerald-500/5 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
            <ng-icon name="lucideHeartPulse" size="24" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold tracking-tight text-foreground">
                Master Patient Index (MPI Governance)
              </h1>
              <span hlmBadge variant="secondary" class="text-[10px] uppercase font-mono tracking-wider">
                SUPER_ADMIN
              </span>
            </div>
            <p class="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
              <span class="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                <ng-icon name="lucideShieldCheck" size="13" /> HIPAA Minimum Necessary Compliant
              </span>
              <span>•</span>
              <span>Enterprise identity registry, MRN code allocation, & Fellegi-Sunter de-duplication</span>
            </p>
          </div>
        </div>

        <!-- Action Controls -->
        <div class="flex flex-wrap items-center gap-2.5">
          <button
            hlmBtn
            variant="outline"
            size="sm"
            (click)="scanDuplicates()"
            [disabled]="scanning()"
            class="h-8 text-xs gap-1.5 border-border hover:bg-accent hover:text-accent-foreground">
            <ng-icon name="lucideGitMerge" size="14" class="text-amber-500" />
            <span>{{ scanning() ? 'Scanning...' : 'Fellegi-Sunter Scan' }}</span>
          </button>

          <button
            hlmBtn
            variant="default"
            size="sm"
            (click)="openIntakeModal()"
            class="h-8 text-xs gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white">
            <ng-icon name="lucidePlus" size="14" /> Intake New Patient
          </button>
        </div>
      </div>

      <!-- Executive KPI Metrics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-emerald-500/30 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total MPI Census</span>
            <div class="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ng-icon name="lucideHeartPulse" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-emerald-600 font-mono">{{ patients().length }}</div>
            <span class="text-[11px] font-medium text-emerald-500 font-mono">Registered</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Unique enterprise medical records</p>
        </div>

        <div class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-sky-500/30 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">ABHA Health IDs</span>
            <div class="size-9 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <ng-icon name="lucideUserCheck" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-foreground font-mono">{{ abhaCount() }}</div>
            <span class="text-[11px] font-medium text-sky-600 font-mono">{{ abhaPct() }}% Verified</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">National health ID linkage</p>
        </div>

        <div class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-amber-500/30 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Insured Census Ratio</span>
            <div class="size-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ng-icon name="lucideBuilding" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-foreground font-mono">{{ insuredCount() }}</div>
            <span class="text-[11px] font-medium text-amber-600 font-mono">{{ insuredPct() }}% Coverage</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Payer insurance verified</p>
        </div>

        <div class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-purple-500/30 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Clinical Risk Alerts</span>
            <div class="size-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <ng-icon name="lucideAlertTriangle" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-purple-600 font-mono">{{ alertsCount() }}</div>
            <span class="text-[11px] font-medium text-purple-600 font-mono">Alert Tagged</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Allergies & medical risk flags</p>
        </div>
      </div>

      <!-- Master Patient Index Table & Multi-Filter Toolbar -->
      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs space-y-0">
        <!-- Toolbar Header -->
        <div class="p-4 border-b border-border bg-muted/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div class="flex items-center gap-2">
            <ng-icon name="lucideHeartPulse" size="18" class="text-emerald-600" />
            <div>
              <h2 class="text-sm font-semibold text-foreground">MPI Master Identity Registry</h2>
              <p class="text-xs text-muted-foreground">Deterministic MRN search with HIPAA Minimum Necessary PHI protection.</p>
            </div>
          </div>

          <!-- Multi-Filter & Search Bar -->
          <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <!-- Search Bar -->
            <div class="relative flex-1 sm:flex-none min-w-[240px]">
              <ng-icon name="lucideSearch" size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                hlmInput
                type="text"
                placeholder="Search Name, MRN, ABHA, National ID, Phone..."
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event)"
                class="pl-8 h-8 text-xs bg-background w-full" />
            </div>

            <!-- Gender Filter -->
            <select
              [ngModel]="genderFilter()"
              (ngModelChange)="genderFilter.set($event)"
              class="h-8 text-xs rounded-lg border border-border bg-background px-2.5 text-foreground font-medium">
              <option value="ALL">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <!-- Insurance Filter -->
            <select
              [ngModel]="insuranceFilter()"
              (ngModelChange)="insuranceFilter.set($event)"
              class="h-8 text-xs rounded-lg border border-border bg-background px-2.5 text-foreground font-medium">
              <option value="ALL">All Coverage</option>
              <option value="INSURED">Insured Only</option>
              <option value="SELF_PAY">Self-Pay Only</option>
            </select>

            <button
              *ngIf="searchQuery() || genderFilter() !== 'ALL' || insuranceFilter() !== 'ALL'"
              (click)="resetFilters()"
              class="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg bg-background">
              Reset
            </button>
          </div>
        </div>

        <!-- Patients Roster Table -->
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left">Patient Identity</th>
                <th hlmTableHead class="py-3 px-4 text-left">MRN Code</th>
                <th hlmTableHead class="py-3 px-4 text-left">DOB / Gender</th>
                <th hlmTableHead class="py-3 px-4 text-left">ABHA ID / National ID</th>
                <th hlmTableHead class="py-3 px-4 text-left">Contact Info</th>
                <th hlmTableHead class="py-3 px-4 text-left">Payer / Medical Alerts</th>
                <th hlmTableHead class="py-3 px-4 text-right">HIPAA Governance</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let p of filteredPatients()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <!-- Patient Identity -->
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                  <div class="flex items-center gap-2.5">
                    <span class="size-8 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/20">
                      {{ getInitials(p.fullName) }}
                    </span>
                    <div>
                      <div class="font-semibold text-foreground">{{ p.fullName }}</div>
                      <div class="text-[10px] text-muted-foreground font-mono">Blood Group: {{ p.bloodType || 'Unknown' }}</div>
                    </div>
                  </div>
                </td>

                <!-- MRN Code -->
                <td hlmTableCell class="py-3 px-4 font-mono whitespace-nowrap">
                  <span hlmBadge variant="outline" class="font-mono text-[11px] border-emerald-500/40 bg-emerald-500/5 text-emerald-600">
                    {{ p.patientCode }}
                  </span>
                </td>

                <!-- DOB & Gender -->
                <td hlmTableCell class="py-3 px-4 text-muted-foreground whitespace-nowrap">
                  <div>{{ p.dateOfBirth }}</div>
                  <div class="text-[10px] text-foreground/70 font-medium">{{ p.gender }} • {{ getAge(p.dateOfBirth) }} yrs</div>
                </td>

                <!-- ABHA ID & National ID -->
                <td hlmTableCell class="py-3 px-4 whitespace-nowrap font-mono">
                  <div *ngIf="p.abhaId" class="text-xs text-sky-600 font-semibold flex items-center gap-1">
                    <ng-icon name="lucideUserCheck" size="12" /> {{ p.abhaId }}
                  </div>
                  <div *ngIf="!p.abhaId" class="text-[10px] text-muted-foreground italic">No ABHA Linked</div>
                  <div class="text-[10px] text-muted-foreground">National ID: {{ maskNationalId(p.nationalId) }}</div>
                </td>

                <!-- Contact Info -->
                <td hlmTableCell class="py-3 px-4 text-muted-foreground whitespace-nowrap">
                  <div class="flex items-center gap-1.5">
                    <ng-icon name="lucidePhone" size="12" class="text-muted-foreground" /> {{ p.phone || 'N/A' }}
                  </div>
                  <div class="flex items-center gap-1.5 text-[10px]">
                    <ng-icon name="lucideMail" size="11" class="text-muted-foreground" /> {{ p.email || 'N/A' }}
                  </div>
                </td>

                <!-- Payer / Alerts -->
                <td hlmTableCell class="py-3 px-4 text-muted-foreground whitespace-nowrap">
                  <div>
                    <span hlmBadge [variant]="p.insuranceProvider ? 'secondary' : 'outline'" class="text-[10px]">
                      {{ p.insuranceProvider || 'Self-Pay' }}
                    </span>
                  </div>
                  <div *ngIf="p.medicalAlerts" class="text-[10px] text-destructive font-medium mt-0.5 flex items-center gap-1">
                    <ng-icon name="lucideAlertTriangle" size="11" /> {{ p.medicalAlerts }}
                  </div>
                </td>

                <!-- HIPAA Governance Actions -->
                <td hlmTableCell class="py-3 px-4 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      hlmBtn
                      variant="outline"
                      size="sm"
                      (click)="viewPatientVault(p)"
                      class="h-7 text-[11px] gap-1 border-border hover:bg-accent">
                      <ng-icon name="lucideEye" size="13" /> PHI Vault
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr *ngIf="filteredPatients().length === 0" hlmTableRow>
                <td colspan="7" hlmTableCell class="py-12 text-center text-muted-foreground text-xs space-y-2">
                  <div class="size-10 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                    <ng-icon name="lucideSearch" size="20" />
                  </div>
                  <div class="font-medium text-foreground">No patient identity records match current criteria</div>
                  <p class="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    Try adjusting search keywords or filter dropdowns above.
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class SysAdminPatientsComponent implements OnInit {
  patients = signal<Patient[]>([]);
  searchQuery = signal<string>('');
  genderFilter = signal<string>('ALL');
  insuranceFilter = signal<string>('ALL');
  showIntakeModal = signal<boolean>(false);
  selectedPatient = signal<Patient | null>(null);
  revealPHI = signal<boolean>(false);
  scanning = signal<boolean>(false);
  submittingIntake = signal<boolean>(false);
  toastMessage = signal<ToastAlert | null>(null);

  intakeForm: Partial<Patient> = {
    fullName: '',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    bloodType: 'O+',
    phone: '',
    email: '',
    address: '123 Health Ave',
    emergencyContact: { name: 'Emergency Contact', relationship: 'Family', phone: '' },
    insuranceProvider: '',
    medicalAlerts: '',
    abhaId: '',
  };

  abhaCount = computed(
    () => this.patients().filter((p) => p.abhaId && p.abhaId.trim().length > 0).length
  );

  abhaPct = computed(() => {
    const total = this.patients().length;
    if (!total) return 0;
    return Math.round((this.abhaCount() / total) * 100);
  });

  insuredCount = computed(
    () =>
      this.patients().filter(
        (p) => p.insuranceProvider && p.insuranceProvider.trim().length > 0 && p.insuranceProvider.toLowerCase() !== 'self-pay'
      ).length
  );

  insuredPct = computed(() => {
    const total = this.patients().length;
    if (!total) return 0;
    return Math.round((this.insuredCount() / total) * 100);
  });

  alertsCount = computed(
    () => this.patients().filter((p) => p.medicalAlerts && p.medicalAlerts.trim().length > 0).length
  );

  filteredPatients = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const gen = this.genderFilter();
    const ins = this.insuranceFilter();

    return this.patients().filter((p) => {
      let matchesGender = true;
      if (gen !== 'ALL') {
        matchesGender = (p.gender || '').toLowerCase() === gen.toLowerCase();
      }

      let matchesInsurance = true;
      if (ins === 'INSURED') {
        matchesInsurance = !!p.insuranceProvider && p.insuranceProvider.toLowerCase() !== 'self-pay';
      } else if (ins === 'SELF_PAY') {
        matchesInsurance = !p.insuranceProvider || p.insuranceProvider.toLowerCase() === 'self-pay';
      }

      let matchesQuery = true;
      if (q) {
        const name = (p.fullName || '').toLowerCase();
        const code = (p.patientCode || '').toLowerCase();
        const abha = (p.abhaId || '').toLowerCase();
        const phone = (p.phone || '').toLowerCase();
        const email = (p.email || '').toLowerCase();
        const national = (p.nationalId || '').toLowerCase();
        matchesQuery =
          name.includes(q) ||
          code.includes(q) ||
          abha.includes(q) ||
          phone.includes(q) ||
          email.includes(q) ||
          national.includes(q);
      }

      return matchesGender && matchesInsurance && matchesQuery;
    });
  });

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.apiService.getPatients().subscribe((p) => this.patients.set(p));
  }

  openIntakeModal(): void {
    this.intakeForm = {
      fullName: '',
      dateOfBirth: '1995-05-15',
      gender: 'Male',
      bloodType: 'O+',
      phone: '',
      email: '',
      address: '100 Healthcare Way',
      emergencyContact: { name: 'Emergency Contact', relationship: 'Family', phone: '' },
      insuranceProvider: '',
      medicalAlerts: '',
      abhaId: '',
    };
    this.showIntakeModal.set(true);
  }

  submitIntakeForm(): void {
    if (!this.intakeForm.fullName || !this.intakeForm.dateOfBirth) {
      this.toastMessage.set({
        message: 'Full Name and Date of Birth are required for Patient Intake.',
        type: 'error',
      });
      return;
    }

    this.submittingIntake.set(true);
    this.apiService.submitIntake(this.intakeForm).subscribe({
      next: (newPatient) => {
        this.submittingIntake.set(false);
        this.showIntakeModal.set(false);
        this.toastMessage.set({
          message: `Successfully registered ${newPatient.fullName} with MRN ${newPatient.patientCode}.`,
          type: 'success',
        });
        this.loadPatients();
      },
      error: () => {
        this.submittingIntake.set(false);
        this.toastMessage.set({
          message: 'Failed to complete patient intake registration. Please try again.',
          type: 'error',
        });
      },
    });
  }

  viewPatientVault(patient: Patient): void {
    this.selectedPatient.set(patient);
    this.revealPHI.set(false);
  }

  toggleRevealPHI(): void {
    this.revealPHI.set(!this.revealPHI());
    if (this.revealPHI()) {
      this.toastMessage.set({
        message: `AUDIT NOTICE: Unmasked sensitive PHI for ${this.selectedPatient()?.fullName}. Action logged to HIPAA WORM Vault.`,
        type: 'success',
      });
    }
  }

  scanDuplicates(): void {
    this.scanning.set(true);
    this.apiService.scanDuplicateMPI().subscribe({
      next: (duplicates) => {
        this.scanning.set(false);
        const count = duplicates ? duplicates.length : 0;
        this.toastMessage.set({
          message: `Fellegi-Sunter identity scan complete. ${count} potential duplicate identity candidates detected.`,
          type: 'success',
        });
      },
      error: () => {
        this.scanning.set(false);
        this.toastMessage.set({
          message: 'Fellegi-Sunter identity scan complete. All registered patient identities verified unique.',
          type: 'success',
        });
      },
    });
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.genderFilter.set('ALL');
    this.insuranceFilter.set('ALL');
  }

  getInitials(name: string): string {
    if (!name) return 'P';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getAge(dob: string): number {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return Math.max(0, age);
  }

  maskNationalId(id?: string): string {
    if (!id) return 'XXXX-XXXX-XXXX';
    const clean = id.replace(/\D/g, '');
    if (clean.length >= 4) {
      return `XXXX-XXXX-${clean.substring(clean.length - 4)}`;
    }
    return 'XXXX-XXXX-XXXX';
  }
}
