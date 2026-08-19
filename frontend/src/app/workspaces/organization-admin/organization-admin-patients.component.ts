import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Patient } from '../../core/models/patient.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideHeartPulse,
  lucideSearch,
  lucideShieldCheck,
  lucideFilter,
  lucideBuilding,
  lucideMail,
  lucidePhone,
  lucideUser,
  lucideRefreshCw,
  lucidePieChart,
  lucideCheckCircle2,
  lucideLock,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-organization-admin-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgIcon],
  providers: [
    provideIcons({
      lucideHeartPulse,
      lucideSearch,
      lucideShieldCheck,
      lucideFilter,
      lucideBuilding,
      lucideMail,
      lucidePhone,
      lucideUser,
      lucideRefreshCw,
      lucidePieChart,
      lucideCheckCircle2,
      lucideLock,
    }),
  ],
  template: `
    <div class="space-y-6 font-sans">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-border">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Administrative Governance
            </span>
            <span class="text-xs text-muted-foreground font-mono">Patient Census & Registration Policies</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground mt-1">
            Facility Patient Census & Demographics Policy
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Administrative registry oversight, insurance coverage ratios, ABHA linkages, and patient registration metrics for the organization.
          </p>
        </div>

        <button
          (click)="loadCensus()"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground transition-all">
          <ng-icon name="lucideRefreshCw" size="14" [class.animate-spin]="loading()" />
          Refresh Census
        </button>
      </div>

      <!-- Census KPI Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div class="flex items-center justify-between text-muted-foreground">
            <span class="text-[11px] font-semibold uppercase">Total Registered Census</span>
            <ng-icon name="lucideUser" size="18" class="text-emerald-600" />
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="text-2xl font-bold text-emerald-600 font-mono">{{ patients().length }}</span>
            <span class="text-[11px] font-medium text-emerald-500">Active MRNs</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Unique organization records</p>
        </div>

        <div class="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div class="flex items-center justify-between text-muted-foreground">
            <span class="text-[11px] font-semibold uppercase">ABHA ID Linked</span>
            <ng-icon name="lucideShieldCheck" size="18" class="text-sky-600" />
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="text-2xl font-bold text-foreground font-mono">{{ abhaCount() }}</span>
            <span class="text-[11px] font-medium text-sky-600">{{ abhaPct() }}% Linked</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">National health ID integration</p>
        </div>

        <div class="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div class="flex items-center justify-between text-muted-foreground">
            <span class="text-[11px] font-semibold uppercase">Payer Insured Ratio</span>
            <div class="size-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <ng-icon name="lucideBuilding" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="text-2xl font-bold text-foreground font-mono">{{ insuredCount() }}</span>
            <span class="text-[11px] font-medium text-purple-600">{{ insuredPct() }}% Insured</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">PM-JAY & Commercial TPA</p>
        </div>

        <div class="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div class="flex items-center justify-between text-muted-foreground">
            <span class="text-[11px] font-semibold uppercase">Self-Pay Demographics</span>
            <ng-icon name="lucidePieChart" size="18" class="text-amber-600" />
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="text-2xl font-bold text-foreground font-mono">{{ selfPayCount() }}</span>
            <span class="text-[11px] font-medium text-amber-600">{{ selfPayPct() }}% Out-of-Pocket</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Direct billing patients</p>
        </div>
      </div>

      <!-- Administrative Census Table -->
      <div class="bg-card rounded-2xl border border-border shadow-xs overflow-hidden space-y-0">
        <div class="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 class="text-sm font-bold text-foreground">Organization Administrative Registry Census</h2>
            <p class="text-xs text-muted-foreground">Administrative MRN roster with demographic and insurance policy markers (Zero Clinical Data Exposure).</p>
          </div>

          <div class="relative w-full sm:w-80">
            <ng-icon name="lucideSearch" size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search by Name, MRN, ABHA ID..."
              class="w-full pl-9 pr-3 py-1.5 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th class="py-3 px-4">Patient Name & MRN</th>
                <th class="py-3 px-4">Date of Birth / Gender</th>
                <th class="py-3 px-4">ABHA ID / National ID</th>
                <th class="py-3 px-4">Primary Contact</th>
                <th class="py-3 px-4">Insurance Carrier</th>
                <th class="py-3 px-4 text-right">Data Policy</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr *ngFor="let p of filteredPatients()" class="hover:bg-muted/30 transition-colors">
                <td class="py-3.5 px-4 font-semibold text-foreground">
                  <div class="flex items-center gap-2">
                    <span class="size-7 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center justify-center">
                      {{ (p.fullName || 'P')[0] }}
                    </span>
                    <div>
                      <div>{{ p.fullName }}</div>
                      <div class="text-[10px] font-mono text-muted-foreground">MRN: {{ p.patientCode }}</div>
                    </div>
                  </div>
                </td>
                <td class="py-3.5 px-4 text-muted-foreground">
                  <div>{{ p.dateOfBirth }}</div>
                  <div class="text-[10px]">{{ p.gender || 'Not specified' }}</div>
                </td>
                <td class="py-3.5 px-4 font-mono text-muted-foreground">
                  <div *ngIf="p.abhaId" class="text-sky-600 font-semibold text-[11px]">{{ p.abhaId }}</div>
                  <div *ngIf="!p.abhaId" class="italic text-[10px]">No ABHA</div>
                </td>
                <td class="py-3.5 px-4 text-muted-foreground">
                  <div>{{ p.phone || 'N/A' }}</div>
                  <div class="text-[10px]">{{ p.email || 'N/A' }}</div>
                </td>
                <td class="py-3.5 px-4">
                  <span
                    [ngClass]="p.insuranceProvider && p.insuranceProvider !== 'Self-Pay' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' : 'bg-secondary text-secondary-foreground border-border'"
                    class="px-2 py-0.5 rounded text-[10px] font-semibold border">
                    {{ p.insuranceProvider || 'Self-Pay' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground border border-border">
                    Admin Census Only
                  </span>
                </td>
              </tr>

              <tr *ngIf="filteredPatients().length === 0">
                <td colspan="6" class="py-8 text-center text-muted-foreground text-xs">
                  No patient records match the search filter.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class OrganizationAdminPatientsComponent implements OnInit {
  patients = signal<Patient[]>([]);
  loading = signal(false);
  searchQuery = signal('');

  abhaCount = computed(() => this.patients().filter((p) => p.abhaId && p.abhaId.trim().length > 0).length);
  abhaPct = computed(() => {
    const total = this.patients().length;
    if (!total) return 0;
    return Math.round((this.abhaCount() / total) * 100);
  });

  insuredCount = computed(() => this.patients().filter((p) => p.insuranceProvider && p.insuranceProvider !== 'Self-Pay').length);
  insuredPct = computed(() => {
    const total = this.patients().length;
    if (!total) return 0;
    return Math.round((this.insuredCount() / total) * 100);
  });

  selfPayCount = computed(() => this.patients().filter((p) => !p.insuranceProvider || p.insuranceProvider === 'Self-Pay').length);
  selfPayPct = computed(() => {
    const total = this.patients().length;
    if (!total) return 0;
    return Math.round((this.selfPayCount() / total) * 100);
  });

  filteredPatients = computed(() => {
    let list = this.patients();
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(
        (p) =>
          (p.fullName || '').toLowerCase().includes(q) ||
          (p.patientCode || '').toLowerCase().includes(q) ||
          (p.abhaId || '').toLowerCase().includes(q),
      );
    }
    return list;
  });

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCensus();
  }

  loadCensus(): void {
    this.loading.set(true);
    this.apiService.getPatients().subscribe({
      next: (pts) => {
        this.patients.set(pts);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
