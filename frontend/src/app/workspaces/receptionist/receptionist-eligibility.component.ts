import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideShieldCheck,
  lucideCreditCard,
  lucideCheckCircle2,
  lucideAlertTriangle,
  lucideArrowLeft,
  lucideFileCheck,
  lucidePrinter,
  lucideIndianRupee,
  lucideActivity,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-receptionist-eligibility',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideShieldCheck,
      lucideCreditCard,
      lucideCheckCircle2,
      lucideAlertTriangle,
      lucideArrowLeft,
      lucideFileCheck,
      lucidePrinter,
      lucideIndianRupee,
      lucideActivity,
    }),
  ],
  template: `
    <div class="space-y-6 max-w-5xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-3">
          <a routerLink="/receptionist/dashboard" class="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <ng-icon name="lucideArrowLeft" size="18" />
          </a>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Real-Time Insurance & TPA Eligibility (RTE & PM-JAY)
              <span hlmBadge variant="secondary" class="text-[11px] bg-purple-500/10 text-purple-600 border border-purple-500/20">ABDM / TPA RTE</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">Submit real-time eligibility inquiries, parse coverage responses, and collect front-desk copayments.</p>
          </div>
        </div>
      </div>

      <!-- Inquiry Parameters Form Card -->
      <div hlmCard class="p-6 space-y-4 border border-border shadow-sm">
        <h2 class="text-sm font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
          <ng-icon name="lucideShieldCheck" size="16" class="text-purple-500" />
          Real-Time Insurance Eligibility Inquiry Transaction
        </h2>

        <form (ngSubmit)="onRunRTE()" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div class="space-y-1.5">
            <label class="font-medium text-foreground">Patient ID (Optional)</label>
            <input hlmInput type="number" [(ngModel)]="patientId" name="patientId" placeholder="e.g. 1" class="w-full text-xs" />
          </div>
          <div class="space-y-1.5">
            <label class="font-medium text-foreground">Subscriber ID / Policy #</label>
            <input hlmInput type="text" [(ngModel)]="subscriberId" name="subscriberId" placeholder="POL-998124" class="w-full text-xs" />
          </div>
          <div class="space-y-1.5">
            <label class="font-medium text-foreground">Insurance Carrier / Payer Name</label>
            <input hlmInput type="text" [(ngModel)]="payerName" name="payerName" placeholder="Star Health / Care Health / PM-JAY" class="w-full text-xs" />
          </div>
          <div class="space-y-1.5">
            <label class="font-medium text-foreground">Group / TPA Number</label>
            <input hlmInput type="text" [(ngModel)]="groupNumber" name="groupNumber" placeholder="GRP-9941" class="w-full text-xs" />
          </div>

          <div class="lg:col-span-4 flex justify-end">
            <button hlmBtn variant="default" type="submit" [disabled]="loading()" class="text-xs gap-2 bg-purple-600 hover:bg-purple-700">
              <ng-icon name="lucideActivity" size="14" />
              <span>{{ loading() ? 'Submitting Eligibility Inquiry...' : 'Transmit RTE Inquiry' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- X12 271 Parsed Eligibility Response Card -->
      <div *ngIf="rteResult()" hlmCard class="p-6 space-y-6 border border-border shadow-sm">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-border">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span hlmBadge variant="default" class="text-xs bg-emerald-600 text-white font-mono gap-1">
                <ng-icon name="lucideCheckCircle2" size="12" /> {{ rteResult()?.status }}
              </span>
              <h2 class="text-base font-bold text-foreground">{{ rteResult()?.payerName }}</h2>
            </div>
            <p class="text-xs text-muted-foreground font-mono">Control #: {{ rteResult()?.transactionControlNumber }} | Plan: {{ rteResult()?.planType }}</p>
          </div>

          <button hlmBtn variant="default" size="sm" (click)="openCopayModal()" class="text-xs gap-2 bg-emerald-600 hover:bg-emerald-700">
            <ng-icon name="lucideCreditCard" size="14" />
            <span>Collect Front-Desk Copay (₹500.00)</span>
          </button>
        </div>

        <!-- Benefit & Financial Breakdown Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <!-- Copay Breakdown -->
          <div class="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
            <h3 class="font-bold text-foreground text-xs flex items-center gap-1.5 text-purple-600">
              <ng-icon name="lucideIndianRupee" size="14" /> Copayment Schedule
            </h3>
            <div class="space-y-1 font-mono">
              <div class="flex justify-between"><span>Primary Care:</span> <strong class="text-foreground">₹500.00</strong></div>
              <div class="flex justify-between"><span>Specialist Visit:</span> <strong class="text-foreground">₹1,000.00</strong></div>
              <div class="flex justify-between"><span>Urgent Care:</span> <strong class="text-foreground">₹1,500.00</strong></div>
              <div class="flex justify-between"><span>Emergency Room:</span> <strong class="text-foreground">₹3,000.00</strong></div>
            </div>
          </div>

          <!-- Deductible Breakdown -->
          <div class="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
            <h3 class="font-bold text-foreground text-xs flex items-center gap-1.5 text-sky-600">
              <ng-icon name="lucideActivity" size="14" /> Annual Deductible Status
            </h3>
            <div class="space-y-1 font-mono">
              <div class="flex justify-between"><span>Total Deductible:</span> <strong>₹15,000.00</strong></div>
              <div class="flex justify-between"><span>Deductible Met:</span> <strong class="text-emerald-600">₹5,000.00</strong></div>
              <div class="flex justify-between"><span>Remaining:</span> <strong class="text-amber-600">₹10,000.00</strong></div>
              <div class="w-full bg-muted rounded-full h-1.5 mt-2">
                <div class="bg-emerald-500 h-1.5 rounded-full" style="width: 33%"></div>
              </div>
            </div>
          </div>

          <!-- Co-insurance & Out-of-Pocket -->
          <div class="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
            <h3 class="font-bold text-foreground text-xs flex items-center gap-1.5 text-emerald-600">
              <ng-icon name="lucideShieldCheck" size="14" /> Co-insurance & Out-of-Pocket
            </h3>
            <div class="space-y-1 font-mono">
              <div class="flex justify-between"><span>Payer / Patient:</span> <strong>80% / 20%</strong></div>
              <div class="flex justify-between"><span>OOP Max Total:</span> <strong>₹50,000.00</strong></div>
              <div class="flex justify-between"><span>OOP Met YTD:</span> <strong class="text-emerald-600">₹21,000.00</strong></div>
            </div>
          </div>
        </div>

        <!-- Coverage Alerts -->
        <div class="space-y-2">
          <h3 class="text-xs font-bold text-foreground">Clearinghouse & Payer Directives</h3>
          <div class="space-y-1.5">
            <div *ngFor="let alert of rteResult()?.coverageAlerts" class="p-2.5 rounded-lg bg-purple-500/10 text-purple-700 text-xs border border-purple-500/20 flex items-center gap-2">
              <ng-icon name="lucideCheckCircle2" size="14" class="text-purple-600" />
              <span>{{ alert }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Front-Desk Copay Collection Modal -->
      <div *ngIf="showCopayModal()" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div hlmCard class="w-full max-w-md p-6 space-y-4 border border-border shadow-lg">
          <div class="flex items-center justify-between pb-3 border-b border-border">
            <h3 class="text-base font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideCreditCard" size="18" class="text-emerald-600" />
              Front-Desk Copay Collection
            </h3>
            <button class="text-muted-foreground hover:text-foreground text-xs" (click)="showCopayModal.set(false)">&times;</button>
          </div>

          <div *ngIf="!receiptResult()" class="space-y-3 text-xs">
            <div class="space-y-1">
              <label class="font-medium text-foreground">Copayment Amount (₹)</label>
              <input hlmInput type="number" [(ngModel)]="copayAmount" class="w-full text-xs font-bold" />
            </div>
            <div class="space-y-1">
              <label class="font-medium text-foreground">Payment Method</label>
              <select [(ngModel)]="paymentMethod" class="w-full p-2 rounded-lg border border-border bg-background text-xs">
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="CREDIT_CARD">Credit / Debit Card</option>
                <option value="CASH">Cash</option>
                <option value="NET_BANKING">NetBanking</option>
              </select>
            </div>
          </div>

          <div *ngIf="receiptResult()" class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
            <div class="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <ng-icon name="lucideCheckCircle2" size="18" /> Copay Collected Successfully
            </div>
            <div class="font-mono space-y-1 text-foreground">
              <div>Receipt #: <strong>{{ receiptResult()?.receiptNumber }}</strong></div>
              <div>Amount Paid: <strong>₹{{ receiptResult()?.amountCollected | number:'1.2-2' }}</strong></div>
              <div>Method: <strong>{{ receiptResult()?.paymentMethod }}</strong></div>
              <div>Collected By: <strong>{{ receiptResult()?.collectedBy }}</strong></div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button *ngIf="!receiptResult()" hlmBtn variant="ghost" size="sm" (click)="showCopayModal.set(false)" class="text-xs">Cancel</button>
            <button *ngIf="!receiptResult()" hlmBtn variant="default" size="sm" (click)="submitCopay()" [disabled]="collecting()" class="text-xs bg-emerald-600 hover:bg-emerald-700">
              {{ collecting() ? 'Processing...' : 'Process Payment & Issue Receipt' }}
            </button>
            <button *ngIf="receiptResult()" hlmBtn variant="default" size="sm" (click)="showCopayModal.set(false); receiptResult.set(null)" class="text-xs bg-primary">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ReceptionistEligibilityComponent implements OnInit {
  patientId: number | null = null;
  subscriberId = 'POL-887102';
  payerName = 'Star Health & Allied Insurance';
  groupNumber = 'GRP-9910';

  loading = signal(false);
  collecting = signal(false);
  rteResult = signal<any>(null);
  showCopayModal = signal(false);

  copayAmount = 500.0;
  paymentMethod = 'UPI';
  receiptResult = signal<any>(null);

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['patientId']) {
        this.patientId = Number(params['patientId']);
        this.apiService.getPatientById(this.patientId).subscribe({
          next: (patient) => {
            if (patient.insurancePolicyNumber) this.subscriberId = patient.insurancePolicyNumber;
            if (patient.insuranceProvider) this.payerName = patient.insuranceProvider;
            if (patient.insuranceGroupNumber) this.groupNumber = patient.insuranceGroupNumber;
            this.onRunRTE();
          },
          error: () => this.onRunRTE(),
        });
      } else {
        this.onRunRTE();
      }
    });
  }

  onRunRTE(): void {
    this.loading.set(true);
    this.apiService
      .checkEligibility({
        patientId: this.patientId,
        subscriberId: this.subscriberId,
        payerName: this.payerName,
        groupNumber: this.groupNumber,
      })
      .subscribe({
        next: (res) => {
          this.rteResult.set(res);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  openCopayModal(): void {
    this.showCopayModal.set(true);
  }

  submitCopay(): void {
    this.collecting.set(true);
    this.apiService
      .collectCopay({
        patientId: this.patientId,
        amountCollected: this.copayAmount,
        paymentMethod: this.paymentMethod,
      })
      .subscribe({
        next: (receipt) => {
          this.receiptResult.set(receipt);
          this.collecting.set(false);
        },
        error: () => this.collecting.set(false),
      });
  }
}
