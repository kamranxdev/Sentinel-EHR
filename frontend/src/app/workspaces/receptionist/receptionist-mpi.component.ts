import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideHeartPulse,
  lucideSearch,
  lucideGitMerge,
  lucideCheckCircle2,
  lucideAlertTriangle,
  lucideUserCheck,
  lucideArrowLeft,
  lucideInfo,
  lucideShieldAlert,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-receptionist-mpi',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    HlmTableImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideHeartPulse,
      lucideSearch,
      lucideGitMerge,
      lucideCheckCircle2,
      lucideAlertTriangle,
      lucideUserCheck,
      lucideArrowLeft,
      lucideInfo,
      lucideShieldAlert,
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
              Master Patient Index (MPI) Probabilistic Search
              <span hlmBadge variant="secondary" class="text-[11px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Fellegi-Sunter</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">Chart de-duplication engine & identity match verification to prevent duplicate medical charts.</p>
          </div>
        </div>
      </div>

      <!-- Search Criteria Form Card -->
      <div hlmCard class="p-6 space-y-4 border border-border shadow-sm">
        <div class="flex items-center justify-between pb-2 border-b border-border/50">
          <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
            <ng-icon name="lucideSearch" size="16" class="text-primary" />
            Patient Identity Query Parameters
          </h2>
          <span class="text-[10px] text-muted-foreground font-mono">Algorithm: Fellegi-Sunter Agreement Vector</span>
        </div>

        <form (ngSubmit)="onSearch()" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-foreground">Full Name (Fuzzy/Phonetic)</label>
            <input hlmInput type="text" [(ngModel)]="fullName" name="fullName" placeholder="e.g. Ramesh Kumar" class="w-full text-xs" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-foreground">Date of Birth</label>
            <input hlmInput type="date" [(ngModel)]="dateOfBirth" name="dateOfBirth" class="w-full text-xs" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-foreground">ABHA Health ID / National ID</label>
            <input hlmInput type="text" [(ngModel)]="ssn" name="ssn" placeholder="12-3456-7890-1234" class="w-full text-xs" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-foreground">MRN / Patient Code</label>
            <input hlmInput type="text" [(ngModel)]="mrn" name="mrn" placeholder="MRN-100482" class="w-full text-xs" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-foreground">Phone Number</label>
            <input hlmInput type="text" [(ngModel)]="phone" name="phone" placeholder="+91 98765 43210" class="w-full text-xs" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-foreground">Email Address</label>
            <input hlmInput type="email" [(ngModel)]="email" name="email" placeholder="patient@domain.com" class="w-full text-xs" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-foreground">Gender</label>
            <input hlmInput type="text" [(ngModel)]="gender" name="gender" placeholder="Male / Female" class="w-full text-xs" />
          </div>

          <div class="space-y-1.5 flex items-end gap-2">
            <button hlmBtn variant="default" type="submit" [disabled]="searching()" class="flex-1 text-xs gap-2 bg-primary">
              <ng-icon name="lucideSearch" size="14" />
              <span>{{ searching() ? 'Scoring Matches...' : 'Execute MPI Search' }}</span>
            </button>
            <button hlmBtn variant="outline" type="button" (click)="clearSearch()" class="text-xs">
              Reset
            </button>
          </div>
        </form>
      </div>

      <!-- Notification Banner -->
      <div *ngIf="mergeNotice()" class="p-3 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-2 font-medium">
          <ng-icon name="lucideCheckCircle2" size="16" class="text-emerald-600" />
          <span>{{ mergeNotice() }}</span>
        </div>
        <button class="text-emerald-600 hover:text-emerald-800 text-xs font-bold" (click)="mergeNotice.set(null)">&times;</button>
      </div>

      <!-- Match Results Table -->
      <div hlmCard class="p-6 space-y-4 border border-border shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-foreground">MPI Ranked Candidate Profiles</h2>
            <p class="text-xs text-muted-foreground">Scored by probabilistic demographic similarity. High confidence matches indicate existing chart.</p>
          </div>
          <span *ngIf="candidates().length > 0" hlmBadge variant="outline" class="text-xs font-mono">
            {{ candidates().length }} Candidates Found
          </span>
        </div>

        <div class="overflow-x-auto rounded-xl border border-border">
          <table hlmTable class="w-full">
            <thead hlmTableHeader class="bg-muted/40">
              <tr hlmTableRow>
                <th hlmTableHead class="text-xs font-semibold">Match Score</th>
                <th hlmTableHead class="text-xs font-semibold">Classification</th>
                <th hlmTableHead class="text-xs font-semibold">Patient MRN & Identity</th>
                <th hlmTableHead class="text-xs font-semibold">Demographics</th>
                <th hlmTableHead class="text-xs font-semibold">Matched Vector Fields</th>
                <th hlmTableHead class="text-xs font-semibold text-right">Chart Actions</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr *ngFor="let candidate of candidates()" hlmTableRow class="hover:bg-muted/30 transition-colors">
                <td hlmTableCell>
                  <div class="font-mono text-sm font-bold" [ngClass]="getScoreColor(candidate.matchScore)">
                    {{ candidate.matchScore | number:'1.0-1' }}%
                  </div>
                  <div class="w-20 bg-muted rounded-full h-1.5 mt-1 overflow-hidden">
                    <div class="h-full bg-emerald-500 rounded-full" [style.width.%]="candidate.matchScore"></div>
                  </div>
                </td>
                <td hlmTableCell>
                  <span hlmBadge [variant]="getClassificationVariant(candidate.matchClassification)" class="text-[10px] font-mono">
                    {{ candidate.matchClassification }}
                  </span>
                </td>
                <td hlmTableCell>
                  <div class="font-bold text-foreground text-xs">{{ candidate.patient.fullName }}</div>
                  <div class="text-[10px] font-mono text-muted-foreground">MRN: {{ candidate.patient.patientCode }}</div>
                </td>
                <td hlmTableCell class="text-xs text-muted-foreground">
                  <div>DOB: {{ candidate.patient.dateOfBirth || 'N/A' }} ({{ candidate.patient.gender }})</div>
                  <div>Ph: {{ candidate.patient.phone || 'N/A' }}</div>
                </td>
                <td hlmTableCell>
                  <div class="flex flex-wrap gap-1">
                    <span *ngFor="let f of candidate.matchingFields" class="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-medium border border-emerald-500/20">
                      &check; {{ f }}
                    </span>
                    <span *ngFor="let c of candidate.conflictingFields" class="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[10px] font-medium border border-amber-500/20">
                      &excl; {{ c }}
                    </span>
                  </div>
                </td>
                <td hlmTableCell class="text-right">
                  <button hlmBtn size="sm" variant="outline" class="text-xs gap-1 text-purple-600 hover:text-purple-700 h-8" (click)="openMergeModal(candidate.patient)">
                    <ng-icon name="lucideGitMerge" size="14" />
                    <span>Request Merge</span>
                  </button>
                </td>
              </tr>
              <tr *ngIf="candidates().length === 0" hlmTableRow>
                <td hlmTableCell colspan="6" class="text-center text-xs text-muted-foreground py-10">
                  Execute query above to calculate Master Patient Index (MPI) probabilistic match scores.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Merge Request Modal -->
      <div *ngIf="selectedMergePatient()" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div hlmCard class="w-full max-w-lg p-6 space-y-4 border border-border shadow-lg">
          <div class="flex items-center justify-between pb-3 border-b border-border">
            <h3 class="text-base font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideGitMerge" size="18" class="text-purple-500" />
              Chart De-duplication Merge Request
            </h3>
            <button class="text-muted-foreground hover:text-foreground text-xs" (click)="selectedMergePatient.set(null)">&times;</button>
          </div>

          <p class="text-xs text-muted-foreground">
            Initiating formal chart merge for duplicate profile <strong>{{ selectedMergePatient()?.fullName }}</strong> (MRN: {{ selectedMergePatient()?.patientCode }}).
          </p>

          <div class="space-y-3">
            <div class="space-y-1">
              <label class="text-xs font-medium text-foreground">Primary Master MRN (Target)</label>
              <input hlmInput type="number" [(ngModel)]="primaryPatientId" placeholder="Primary Patient ID" class="w-full text-xs" />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-medium text-foreground">Merge Rationale & Auditor Note</label>
              <textarea hlmInput [(ngModel)]="mergeReason" rows="3" placeholder="Explain reason for chart de-duplication (e.g., Duplicate registration during emergency intake)..." class="w-full text-xs p-2"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button hlmBtn variant="ghost" size="sm" (click)="selectedMergePatient.set(null)" class="text-xs">Cancel</button>
            <button hlmBtn variant="default" size="sm" (click)="submitMerge()" [disabled]="merging()" class="text-xs bg-purple-600 hover:bg-purple-700">
              {{ merging() ? 'Submitting...' : 'Submit Merge Request' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ReceptionistMPIComponent implements OnInit {
  fullName = 'Ramesh Kumar';
  dateOfBirth = '';
  ssn = '';
  mrn = '';
  phone = '';
  email = '';
  gender = '';

  searching = signal(false);
  merging = signal(false);
  mergeNotice = signal<string | null>(null);
  candidates = signal<any[]>([]);

  selectedMergePatient = signal<any>(null);
  primaryPatientId: number | null = 1;
  mergeReason = 'Duplicate patient identity confirmed via DOB and ABHA/Aadhaar ID matching.';

  constructor(
    public authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.onSearch();
  }

  clearSearch(): void {
    this.fullName = '';
    this.dateOfBirth = '';
    this.ssn = '';
    this.mrn = '';
    this.phone = '';
    this.email = '';
    this.gender = '';
    this.candidates.set([]);
  }

  onSearch(): void {
    this.searching.set(true);
    this.apiService
      .searchMPI({
        fullName: this.fullName,
        dateOfBirth: this.dateOfBirth,
        ssn: this.ssn,
        mrn: this.mrn,
        phone: this.phone,
        email: this.email,
        gender: this.gender,
      })
      .subscribe({
        next: (results) => {
          this.candidates.set(results);
          this.searching.set(false);
        },
        error: () => this.searching.set(false),
      });
  }

  openMergeModal(patient: any): void {
    this.selectedMergePatient.set(patient);
    this.primaryPatientId = patient.id === 1 ? 2 : 1;
  }

  submitMerge(): void {
    const dup = this.selectedMergePatient();
    if (!dup || !this.primaryPatientId) return;

    this.merging.set(true);
    this.apiService
      .requestMPIMerge({
        primaryPatientId: Number(this.primaryPatientId),
        duplicatePatientId: dup.id,
        mergeReason: this.mergeReason,
      })
      .subscribe({
        next: () => {
          this.merging.set(false);
          this.selectedMergePatient.set(null);
          this.mergeNotice.set(`MPI Chart Merge Request for ${dup.fullName || 'MRN ' + dup.patientCode} submitted and logged in WORM Audit Ledger.`);
          setTimeout(() => this.mergeNotice.set(null), 6000);
        },
        error: () => this.merging.set(false),
      });
  }

  getScoreColor(score: number): string {
    if (score >= 90) return 'text-emerald-500';
    if (score >= 75) return 'text-sky-500';
    if (score >= 55) return 'text-amber-500';
    return 'text-muted-foreground';
  }

  getClassificationVariant(classification: string): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (classification) {
      case 'EXACT_MATCH': return 'default';
      case 'HIGH_PROBABILITY_MATCH': return 'secondary';
      case 'POSSIBLE_DUPLICATE': return 'outline';
      default: return 'secondary';
    }
  }
}
