import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Appointment } from '../../core/models/appointment.model';
import { CreateInsuranceClaimRequest, InsuranceClaim, InsurancePayer } from '../../core/models/insurance.model';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCreditCard,
  lucideSend,
  lucideShieldCheck,
  lucideCheckCircle2,
  lucideXCircle,
  lucideAlertTriangle,
  lucideClock,
  lucideRefreshCw,
  lucidePlus,
} from '@ng-icons/lucide';

export interface ClaimViewModel {
  id: string;
  claimNumber: string;
  patientName: string;
  carrier: string;
  encounterId?: string;
  amount: number;
  approvedAmount?: number;
  rejectedAmount?: number;
  status: 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'ADJUDICATED' | 'DENIED' | 'PAID' | 'SETTLED' | string;
  submittedAt?: string;
}

@Component({
  selector: 'app-billing-staff-claims',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideCreditCard,
      lucideSend,
      lucideShieldCheck,
      lucideCheckCircle2,
      lucideXCircle,
      lucideAlertTriangle,
      lucideClock,
      lucideRefreshCw,
      lucidePlus,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border"
      >
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Insurance Claims Clearinghouse
            <span hlmBadge variant="secondary" class="text-[11px]">Billing Staff</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Submit 837P electronic claims, review payer adjudications, and reconcile reimbursements.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button hlmBtn variant="outline" size="sm" (click)="loadClaims()" class="text-xs gap-1.5">
            <ng-icon name="lucideRefreshCw" size="13" /> Refresh
          </button>
          <button
            hlmBtn
            variant="default"
            size="sm"
            (click)="showCreateModal.set(true)"
            class="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <ng-icon name="lucidePlus" size="13" /> Create Claim
          </button>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div hlmCard class="p-4 border border-border">
          <div class="flex items-center justify-between">
            <span class="text-xs text-muted-foreground font-medium">Total Claims</span>
            <span class="p-1.5 rounded-lg bg-sky-500/10 text-sky-600">
              <ng-icon name="lucideCreditCard" size="16" />
            </span>
          </div>
          <p class="text-2xl font-bold mt-2 text-foreground">{{ claims().length }}</p>
          <span class="text-[11px] text-muted-foreground">All clearinghouse claims</span>
        </div>

        <div hlmCard class="p-4 border border-border">
          <div class="flex items-center justify-between">
            <span class="text-xs text-muted-foreground font-medium">Pending Submission</span>
            <span class="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
              <ng-icon name="lucideClock" size="16" />
            </span>
          </div>
          <p class="text-2xl font-bold mt-2 text-foreground">{{ pendingCount() }}</p>
          <span class="text-[11px] text-muted-foreground">Draft & pending submission</span>
        </div>

        <div hlmCard class="p-4 border border-border">
          <div class="flex items-center justify-between">
            <span class="text-xs text-muted-foreground font-medium">Settled / Paid</span>
            <span class="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <ng-icon name="lucideCheckCircle2" size="16" />
            </span>
          </div>
          <p class="text-2xl font-bold mt-2 text-foreground">{{ settledCount() }}</p>
          <span class="text-[11px] text-muted-foreground">Reimbursed by payer</span>
        </div>

        <div hlmCard class="p-4 border border-border">
          <div class="flex items-center justify-between">
            <span class="text-xs text-muted-foreground font-medium">Denied / Rejected</span>
            <span class="p-1.5 rounded-lg bg-red-500/10 text-red-600">
              <ng-icon name="lucideXCircle" size="16" />
            </span>
          </div>
          <p class="text-2xl font-bold mt-2 text-foreground">{{ deniedCount() }}</p>
          <span class="text-[11px] text-muted-foreground">Requires claim appeal</span>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <input
            type="text"
            [(ngModel)]="searchFilter"
            placeholder="Search claims by patient or claim #..."
            class="px-3 py-1.5 rounded-lg border border-input bg-background text-xs w-64 text-foreground placeholder:text-muted-foreground"
          />
          <select
            [(ngModel)]="statusFilter"
            class="px-3 py-1.5 rounded-lg border border-input bg-background text-xs text-foreground"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="SETTLED">Settled / Paid</option>
            <option value="DENIED">Denied</option>
          </select>
        </div>
      </div>

      <!-- Claims Table -->
      <div hlmCard class="p-0 border border-border shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full">
            <thead hlmTableHeader>
              <tr hlmTableRow>
                <th hlmTableHead class="text-xs font-semibold">Claim #</th>
                <th hlmTableHead class="text-xs font-semibold">Patient Name</th>
                <th hlmTableHead class="text-xs font-semibold">Insurance Carrier / Payer</th>
                <th hlmTableHead class="text-xs font-semibold">Billed Amount</th>
                <th hlmTableHead class="text-xs font-semibold">Approved Amount</th>
                <th hlmTableHead class="text-xs font-semibold">Status</th>
                <th hlmTableHead class="text-xs font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr *ngIf="isLoading" hlmTableRow>
                <td colspan="7" class="py-8 text-center text-xs text-muted-foreground">
                  <div class="flex items-center justify-center gap-2">
                    <ng-icon
                      name="lucideRefreshCw"
                      class="animate-spin text-emerald-600"
                      size="16"
                    />
                    <span>Loading insurance claims from payer clearinghouse...</span>
                  </div>
                </td>
              </tr>
              <tr *ngIf="!isLoading && errorMessage" hlmTableRow>
                <td colspan="7" class="py-6 text-center text-xs text-destructive">
                  <p>{{ errorMessage }}</p>
                  <button (click)="loadClaims()" class="mt-2 text-xs text-emerald-600 underline">
                    Retry
                  </button>
                </td>
              </tr>

              @for (claim of filteredClaims(); track claim.id) {
                <tr hlmTableRow class="hover:bg-muted/30 transition-colors">
                  <td hlmTableCell class="font-mono text-xs font-semibold text-foreground">{{ claim.claimNumber }}</td>
                  <td hlmTableCell class="text-xs font-medium text-foreground">{{ claim.patientName }}</td>
                  <td hlmTableCell class="text-xs text-muted-foreground">{{ claim.carrier }}</td>
                  <td hlmTableCell class="text-xs font-semibold text-foreground">
                    &#8377;{{ claim.amount | number: '1.2-2' }}
                  </td>
                  <td hlmTableCell class="text-xs text-emerald-700 font-medium">
                    &#8377;{{ (claim.approvedAmount || 0) | number: '1.2-2' }}
                  </td>
                  <td hlmTableCell>
                    <span
                      [class]="getStatusBadgeClass(claim.status)"
                      class="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                    >
                      {{ claim.status }}
                    </span>
                  </td>
                  <td hlmTableCell class="text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button
                        *ngIf="claim.status === 'DRAFT' || claim.status === 'PENDING'"
                        (click)="submitClaim(claim)"
                        hlmBtn
                        variant="ghost"
                        size="sm"
                        class="text-xs text-sky-600 hover:text-sky-700 gap-1"
                      >
                        <ng-icon name="lucideSend" size="12" />
                        <span>Submit</span>
                      </button>
                      <button
                        *ngIf="claim.status === 'SUBMITTED'"
                        (click)="settleClaim(claim)"
                        hlmBtn
                        variant="ghost"
                        size="sm"
                        class="text-xs text-emerald-600 hover:text-emerald-700 gap-1"
                      >
                        <ng-icon name="lucideCheckCircle2" size="12" />
                        <span>Reconcile</span>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                @if (!isLoading && !errorMessage) {
                  <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-muted-foreground text-xs">
                      No insurance claims found matching criteria.
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create Claim Modal -->
      <div
        *ngIf="showCreateModal()"
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div class="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-base font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucidePlus" size="16" class="text-emerald-600" />
              Generate Insurance Claim
            </h3>
            <button
              (click)="showCreateModal.set(false)"
              class="p-1 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <ng-icon name="lucideXCircle" size="16" />
            </button>
          </div>
          <div class="space-y-3 text-xs">
            <div>
              <label class="font-medium text-foreground block mb-1">Encounter ID *</label>
              <input
                type="text"
                [(ngModel)]="newClaimForm.encounterId"
                placeholder="Encounter UUID"
                class="w-full p-2.5 rounded-lg border border-input bg-background text-xs"
              />
            </div>
            <div>
              <label class="font-medium text-foreground block mb-1">Insurance Carrier / Payer</label>
              <select
                [(ngModel)]="newClaimForm.payerId"
                class="w-full p-2.5 rounded-lg border border-input bg-background text-xs"
              >
                <option value="" disabled>Select an active payer</option>
                <option *ngFor="let payer of payers()" [value]="payer.id">{{ payer.payerName }}</option>
              </select>
            </div>
            <div>
              <label class="font-medium text-foreground block mb-1">Claim Amount (&#8377;) *</label>
              <input
                type="number"
                [(ngModel)]="newClaimForm.amount"
                class="w-full p-2.5 rounded-lg border border-input bg-background text-xs"
              />
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-3 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="showCreateModal.set(false)" class="text-xs">
              Cancel
            </button>
            <button
              hlmBtn
              variant="default"
              size="sm"
              [disabled]="isSubmitting || !newClaimForm.encounterId || !newClaimForm.payerId || !newClaimForm.amount"
              (click)="createClaimSubmit()"
              class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Create Claim
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class BillingStaffClaimsComponent implements OnInit {
  claims = signal<ClaimViewModel[]>([]);
  payers = signal<InsurancePayer[]>([]);
  isLoading: boolean = false;
  errorMessage: string = '';

  searchFilter = '';
  statusFilter = 'ALL';

  showCreateModal = signal(false);
  newClaimForm = {
    encounterId: '',
    payerId: '',
    amount: null as number | null,
  };
  isSubmitting = false;

  filteredClaims = computed(() => {
    return this.claims().filter((c) => {
      const matchStatus =
        this.statusFilter === 'ALL' ||
        c.status.toUpperCase() === this.statusFilter.toUpperCase() ||
        (this.statusFilter === 'SETTLED' && ['PAID', 'SETTLED', 'CLEARED'].includes(c.status));
      const matchSearch =
        !this.searchFilter.trim() ||
        c.patientName.toLowerCase().includes(this.searchFilter.toLowerCase()) ||
        c.claimNumber.toLowerCase().includes(this.searchFilter.toLowerCase()) ||
        c.carrier.toLowerCase().includes(this.searchFilter.toLowerCase());
      return matchStatus && matchSearch;
    });
  });

  pendingCount = computed(
    () =>
      this.claims().filter((c) => ['DRAFT', 'PENDING', 'SUBMITTED', 'IN_REVIEW'].includes(c.status))
        .length,
  );
  settledCount = computed(
    () => this.claims().filter((c) => ['PAID', 'SETTLED', 'CLEARED'].includes(c.status)).length,
  );
  deniedCount = computed(() => this.claims().filter((c) => c.status === 'DENIED').length);

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    this.loadClaims();
    this.loadPayers();
  }

  loadPayers(): void {
    this.apiService.getInsurancePayers().subscribe({
      next: (payers) => this.payers.set(payers),
      error: (err: unknown) => {
        console.error('Failed to load insurance payers:', err);
        this.errorMessage = 'Unable to load insurance payers. Please retry.';
      },
    });
  }

  loadClaims(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.apiService.getAllClaims().subscribe({
      next: (claims: any[]) => {
        if (!Array.isArray(claims)) {
          throw new Error('The claims API returned an invalid response.');
        }
        const list: ClaimViewModel[] = claims.map(
          (c: InsuranceClaim) => ({
            id: String(c.id),
            claimNumber: c.claimNumber,
            patientName: c.patientName ?? 'Unavailable',
            carrier: c.payerName ?? 'Unavailable',
            amount: c.totalAmount,
            approvedAmount: c.approvedAmount,
            rejectedAmount: c.rejectedAmount,
            status: c.status,
            submittedAt: c.submittedAt,
          })
        );
        this.claims.set(list);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load claims:', err);
        this.errorMessage = err.message || 'Failed to load insurance claims from clearinghouse server.';
        this.isLoading = false;
      },
    });
  }

  submitClaim(claim: ClaimViewModel): void {
    this.apiService.submitInsuranceClaim(claim.id).subscribe({
      next: () => this.loadClaims(),
      error: (err: any) => (this.errorMessage = err?.error?.message || 'Unable to submit claim.'),
    });
  }

  settleClaim(claim: ClaimViewModel): void {
    // Adjudication amounts must be received from the payer; this screen never invents them.
    this.errorMessage = `Claim ${claim.claimNumber} is awaiting payer adjudication.`;
  }

  createClaimSubmit(): void {
    const { encounterId, payerId, amount } = this.newClaimForm;
    if (!encounterId || !payerId || amount === null || amount <= 0) return;
    this.isSubmitting = true;
    const payload: CreateInsuranceClaimRequest = { payerId, totalAmount: amount };
    this.apiService.createInsuranceClaim(encounterId, payload).subscribe({
      next: () => {
        this.showCreateModal.set(false);
        this.newClaimForm = { encounterId: '', payerId: '', amount: null };
        this.isSubmitting = false;
        this.loadClaims();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || 'Unable to create the claim.';
      },
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'SETTLED':
      case 'PAID':
      case 'CLEARED':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'SUBMITTED':
      case 'IN_REVIEW':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
      case 'DENIED':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'DRAFT':
      case 'PENDING':
      default:
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
  }
}
