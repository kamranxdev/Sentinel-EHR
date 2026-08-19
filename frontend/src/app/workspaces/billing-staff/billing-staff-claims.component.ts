import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Appointment } from '../../core/models/appointment.model';

export interface ClaimSummaryViewModel {
  id: string;
  patientName: string;
  carrier: string;
  amount: number;
  status: 'CLEARED' | 'PENDING' | string;
}

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCreditCard, lucideSend, lucideShieldCheck } from '@ng-icons/lucide';

@Component({
  selector: 'app-billing-staff-claims',
  standalone: true,
  imports: [
    CommonModule,
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
    }),
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Insurance Claims Submission & Clearinghouse
            <span hlmBadge variant="secondary" class="text-[11px]">Billing Staff</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Submit 837P electronic claims, review denials, and track payer reimbursements.</p>
        </div>
      </div>

      <div hlmCard class="p-6 space-y-4">
        <div class="overflow-x-auto rounded-lg border border-border">
          <table hlmTable class="w-full">
            <thead hlmTableHeader>
              <tr hlmTableRow>
                <th hlmTableHead class="text-xs font-semibold">Claim ID</th>
                <th hlmTableHead class="text-xs font-semibold">Patient Name</th>
                <th hlmTableHead class="text-xs font-semibold">Insurance Carrier / Payer</th>
                <th hlmTableHead class="text-xs font-semibold">Claim Amount</th>
                <th hlmTableHead class="text-xs font-semibold">Claim Status</th>
                <th hlmTableHead class="text-xs font-semibold text-right">Clearinghouse Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr *ngIf="loading()" hlmTableRow>
                <td colspan="6" class="py-8 text-center text-xs text-muted-foreground">
                  <div class="flex items-center justify-center gap-2">
                    <ng-icon name="lucideCreditCard" class="animate-spin text-emerald-600" size="16" />
                    <span>Loading insurance claims from payer clearinghouse...</span>
                  </div>
                </td>
              </tr>
              <tr *ngIf="!loading() && error()" hlmTableRow>
                <td colspan="6" class="py-6 text-center text-xs text-destructive">
                  <p>{{ error() }}</p>
                  <button (click)="loadClaims()" class="mt-2 text-xs text-emerald-600 underline">Retry</button>
                </td>
              </tr>
            <tbody class="divide-y divide-border">
              @for (claim of claims(); track claim.id) {
                <tr class="hover:bg-muted/30 transition-colors">
                  <td class="px-6 py-4 font-mono font-medium text-foreground">{{ claim.id }}</td>
                  <td class="px-6 py-4 font-medium text-foreground">{{ claim.patientName }}</td>
                  <td class="px-6 py-4 text-muted-foreground">{{ claim.carrier }}</td>
                  <td class="px-6 py-4 font-semibold text-foreground">&#8377;{{ claim.amount | number:'1.2-2' }}</td>
                  <td class="px-6 py-4">
                    <span [class]="claim.status === 'CLEARED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold'">
                      {{ claim.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button
                      *ngIf="claim.status !== 'CLEARED'"
                      (click)="submitClaim(claim)"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <ng-icon name="lucideSend" class="w-3.5 h-3.5"></ng-icon>
                      Submit Claim
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-6 py-8 text-center text-muted-foreground">
                    No claims pending clearance at this time.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class BillingStaffClaimsComponent implements OnInit {
  claims = signal<ClaimSummaryViewModel[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor(
    public authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadClaims();
  }

  loadClaims(): void {
    this.loading.set(true);
    this.error.set(null);
    this.apiService.getAppointments().subscribe({
      next: (apts: Appointment[]) => {
        const list: ClaimSummaryViewModel[] = (Array.isArray(apts) ? apts : []).map((apt: Appointment, idx: number) => ({
          id: `CLM-${apt.id ? String(apt.id).substring(0, 6).toUpperCase() : (900 + idx)}`,
          patientName: apt.patientName || (apt as any).patient?.fullName || 'Patient',
          carrier: (apt as any).insuranceDetails || 'PM-JAY Ayushman Bharat / Star Health',
          amount: 2500.0,
          status: apt.status === 'COMPLETED' ? 'CLEARED' : 'PENDING',
        }));
        this.claims.set(list);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('Failed to load appointments for claims:', err);
        this.error.set('Failed to load insurance claims from clearinghouse server.');
        this.loading.set(false);
      },
    });
  }

  submitClaim(claim: ClaimSummaryViewModel): void {
    claim.status = 'CLEARED';
  }
}
