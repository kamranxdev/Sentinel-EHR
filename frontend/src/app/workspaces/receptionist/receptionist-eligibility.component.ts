import { Component, OnInit, OnChanges, SimpleChanges, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Patient } from '../../core/models/patient.model';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideShieldCheck,
  lucideCreditCard,
  lucideCheckCircle2,
  lucideArrowLeft,
  lucidePrinter,
  lucideIndianRupee,
  lucideActivity,
  lucideX,
  lucideUser,
  lucideZap,
  lucideSend,
  lucideRefreshCw,
  lucideAlertCircle,
  lucideInfo,
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
      lucideArrowLeft,
      lucidePrinter,
      lucideIndianRupee,
      lucideActivity,
      lucideX,
      lucideUser,
      lucideZap,
      lucideSend,
      lucideRefreshCw,
      lucideAlertCircle,
      lucideInfo,
    }),
  ],
  template: `
    <!-- Container: Modal Overlay if isModal, else normal card container -->
    <div [ngClass]="isModal ? 'fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto' : 'space-y-6 max-w-5xl mx-auto pb-12'">
      <div [ngClass]="isModal ? 'w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-6 border border-border shadow-2xl bg-card rounded-2xl' : 'space-y-6 bg-card p-6 rounded-2xl border border-border shadow-sm'">

        <!-- Simple Header -->
        <div class="flex items-center justify-between pb-4 border-b border-border">
          <div class="flex items-center gap-3">
            <a *ngIf="!isModal" routerLink="/receptionist/dashboard" class="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <ng-icon name="lucideArrowLeft" size="18" />
            </a>
            <div>
              <h1 class="text-lg font-bold text-foreground flex items-center gap-2">
                <ng-icon name="lucideShieldCheck" size="20" class="text-purple-600" />
                Insurance & TPA Real-Time Eligibility (RTE)
              </h1>
              <p class="text-xs text-muted-foreground">Verify active coverage, check copays & collect front-desk payments</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button *ngIf="rteResult()" type="button" hlmBtn variant="outline" size="sm" (click)="printClearance()" class="text-xs gap-1.5">
              <ng-icon name="lucidePrinter" size="14" />
              <span>Print</span>
            </button>
            <button *ngIf="isModal" type="button" class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted" (click)="dismissModal()">
              <ng-icon name="lucideX" size="18" />
            </button>
          </div>
        </div>

        <!-- Section 1: Inquiry Form & Quick Presets -->
        <div class="space-y-4">
          <!-- Patient Selector -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div class="sm:col-span-2 space-y-1">
              <label class="font-medium text-foreground flex items-center gap-1">
                <ng-icon name="lucideUser" size="14" class="text-purple-600" /> Patient Directory Search
              </label>
              <select
                [(ngModel)]="patientId"
                (change)="onPatientSelectChange()"
                class="w-full p-2 rounded-lg border border-border bg-background text-xs text-foreground focus:ring-1 focus:ring-purple-500"
              >
                <option [ngValue]="null">-- Select Patient from Directory (Optional) --</option>
                <option *ngFor="let p of allPatients()" [value]="p.id">
                  #{{ p.id }} - {{ p.fullName }} | Ins: {{ p.insuranceProvider || 'N/A' }} ({{ p.insurancePolicyNumber || 'No Policy #' }})
                </option>
              </select>
            </div>

            <!-- Quick Payer Presets -->
            <div class="space-y-1">
              <label class="font-medium text-foreground flex items-center gap-1">
                <ng-icon name="lucideZap" size="14" class="text-amber-500" /> Quick Carrier Presets
              </label>
              <div class="flex flex-wrap gap-1">
                <button *ngFor="let preset of payerPresets" type="button" (click)="applyPreset(preset)" class="px-2 py-1 text-[11px] rounded bg-muted/60 hover:bg-purple-500/10 hover:text-purple-600 border border-border transition-colors">
                  {{ preset.name }}
                </button>
              </div>
            </div>
          </div>

          <!-- Policy Form -->
          <form (ngSubmit)="onRunRTE()" class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div class="space-y-1">
              <label class="font-medium text-foreground">Policy / Subscriber #</label>
              <input hlmInput type="text" [(ngModel)]="subscriberId" name="subscriberId" placeholder="POL-887102" class="w-full text-xs font-mono font-bold" required />
            </div>

            <div class="space-y-1">
              <label class="font-medium text-foreground">Payer / Insurance Provider</label>
              <input hlmInput type="text" [(ngModel)]="payerName" name="payerName" placeholder="Star Health / PM-JAY" class="w-full text-xs font-medium" required />
            </div>

            <div class="space-y-1">
              <label class="font-medium text-foreground">Group / TPA Number</label>
              <input hlmInput type="text" [(ngModel)]="groupNumber" name="groupNumber" placeholder="GRP-9910" class="w-full text-xs font-mono" />
            </div>

            <div class="sm:col-span-3 flex justify-end pt-1">
              <button hlmBtn variant="default" type="submit" [disabled]="loading()" class="text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2">
                <ng-icon *ngIf="!loading()" name="lucideSend" size="14" />
                <ng-icon *ngIf="loading()" name="lucideRefreshCw" size="14" class="animate-spin" />
                <span>{{ loading() ? 'Verifying Coverage...' : 'Check Insurance Eligibility' }}</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Section 2: Coverage Response & Financial Clearance -->
        <div *ngIf="rteResult()" class="space-y-4 pt-4 border-t border-border">
          <!-- Status Banner -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span hlmBadge variant="default" class="text-xs bg-emerald-600 text-white font-bold gap-1">
                  <ng-icon name="lucideCheckCircle2" size="13" /> Coverage Active
                </span>
                <h2 class="text-base font-bold text-foreground">{{ rteResult()?.payerName }}</h2>
              </div>
              <p class="text-xs text-muted-foreground font-mono">
                Control #: {{ rteResult()?.transactionControlNumber }} | Subscriber: {{ subscriberId }}
              </p>
            </div>

            <button hlmBtn variant="default" size="sm" (click)="openCopayModal()" class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-sm">
              <ng-icon name="lucideCreditCard" size="14" />
              <span>Collect Copay (₹{{ copayAmount | number:'1.2-2' }})</span>
            </button>
          </div>

          <!-- Financial Summary Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <!-- Visit Copays -->
            <div class="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2">
              <h3 class="font-bold text-purple-600 flex items-center gap-1">
                <ng-icon name="lucideIndianRupee" size="14" /> Copayment Schedule
              </h3>
              <div class="space-y-1 font-mono text-[11px]">
                <div class="flex justify-between"><span>Primary Care (PCP):</span> <strong>₹500.00</strong></div>
                <div class="flex justify-between"><span>Specialist Visit:</span> <strong>₹1,000.00</strong></div>
                <div class="flex justify-between"><span>Urgent Care:</span> <strong>₹1,500.00</strong></div>
                <div class="flex justify-between"><span>Emergency Room:</span> <strong>₹3,000.00</strong></div>
              </div>
            </div>

            <!-- Annual Deductible -->
            <div class="p-3.5 rounded-xl bg-sky-500/5 border border-sky-500/20 space-y-2">
              <h3 class="font-bold text-sky-600 flex items-center gap-1">
                <ng-icon name="lucideActivity" size="14" /> Annual Deductible Status
              </h3>
              <div class="space-y-1 font-mono text-[11px]">
                <div class="flex justify-between"><span>Total Deductible:</span> <strong>₹15,000.00</strong></div>
                <div class="flex justify-between"><span>Deductible Met:</span> <strong class="text-emerald-600">₹5,000.00</strong></div>
                <div class="flex justify-between"><span>Remaining:</span> <strong class="text-amber-600">₹10,000.00</strong></div>
                <div class="w-full bg-muted rounded-full h-1.5 mt-1 overflow-hidden">
                  <div class="bg-emerald-500 h-1.5 rounded-full" style="width: 33%"></div>
                </div>
              </div>
            </div>

            <!-- Co-insurance -->
            <div class="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
              <h3 class="font-bold text-emerald-600 flex items-center gap-1">
                <ng-icon name="lucideShieldCheck" size="14" /> Co-insurance & Limits
              </h3>
              <div class="space-y-1 font-mono text-[11px]">
                <div class="flex justify-between"><span>Coverage Ratio:</span> <strong>80% / 20%</strong></div>
                <div class="flex justify-between"><span>OOP Max Total:</span> <strong>₹50,000.00</strong></div>
                <div class="flex justify-between"><span>OOP Met YTD:</span> <strong class="text-emerald-600">₹21,000.00</strong></div>
              </div>
            </div>
          </div>

          <!-- Coverage Alerts -->
          <div *ngIf="rteResult()?.coverageAlerts?.length" class="space-y-1.5">
            <h3 class="text-xs font-bold text-foreground">Clearinghouse & Payer Directives</h3>
            <div class="space-y-1 text-xs">
              <div *ngFor="let alert of rteResult()?.coverageAlerts" class="p-2 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 flex items-center gap-2">
                <ng-icon name="lucideCheckCircle2" size="14" class="text-purple-600 shrink-0" />
                <span>{{ alert }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: Copay Collection Modal -->
        <div *ngIf="showCopayModal()" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div hlmCard class="w-full max-w-md p-5 space-y-4 border border-border shadow-lg">
            <div class="flex items-center justify-between pb-2 border-b border-border">
              <h3 class="text-base font-bold text-foreground flex items-center gap-2">
                <ng-icon name="lucideCreditCard" size="18" class="text-emerald-600" />
                Collect Front-Desk Copay
              </h3>
              <button class="text-muted-foreground hover:text-foreground text-xs font-bold" (click)="showCopayModal.set(false)">&times;</button>
            </div>

            <div *ngIf="!receiptResult()" class="space-y-3 text-xs">
              <div class="space-y-1">
                <label class="font-medium text-foreground">Copay Amount (₹)</label>
                <input hlmInput type="number" [(ngModel)]="copayAmount" class="w-full font-bold text-emerald-600 text-sm" />
              </div>

              <div class="space-y-1">
                <label class="font-medium text-foreground">Payment Method</label>
                <select [(ngModel)]="paymentMethod" class="w-full p-2 rounded-lg border border-border bg-background text-xs text-foreground">
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="CREDIT_CARD">Credit / Debit Card</option>
                  <option value="CASH">Cash</option>
                  <option value="NET_BANKING">NetBanking</option>
                </select>
              </div>

              <div class="flex justify-end gap-2 pt-2">
                <button hlmBtn variant="ghost" size="sm" (click)="showCopayModal.set(false)" class="text-xs">Cancel</button>
                <button hlmBtn variant="default" size="sm" (click)="submitCopay()" [disabled]="collecting()" class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  {{ collecting() ? 'Processing...' : 'Collect & Generate Receipt' }}
                </button>
              </div>
            </div>

            <div *ngIf="receiptResult()" class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
              <div class="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <ng-icon name="lucideCheckCircle2" size="18" /> Copay Collected Successfully
              </div>
              <div class="font-mono space-y-1 text-foreground">
                <div>Receipt #: <strong>{{ receiptResult()?.receiptNumber }}</strong></div>
                <div>Amount Paid: <strong>₹{{ receiptResult()?.amountCollected | number:'1.2-2' }}</strong></div>
                <div>Payment Method: <strong>{{ receiptResult()?.paymentMethod }}</strong></div>
                <div>Collected By: <strong>{{ receiptResult()?.collectedBy }}</strong></div>
              </div>
              <div class="flex justify-between items-center pt-2 border-t border-emerald-500/20">
                <button type="button" hlmBtn variant="outline" size="sm" (click)="printClearance()" class="text-xs gap-1">
                  <ng-icon name="lucidePrinter" size="12" /> Print Receipt
                </button>
                <button type="button" hlmBtn variant="default" size="sm" (click)="showCopayModal.set(false); receiptResult.set(null)" class="text-xs bg-purple-600">
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class ReceptionistEligibilityComponent implements OnInit, OnChanges {
  @Input() isModal: boolean = false;
  @Input() patientIdInput: number | null = null;
  @Output() close = new EventEmitter<void>();

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

  allPatients = signal<Patient[]>([]);
  selectedPatient = signal<Patient | null>(null);

  payerPresets = [
    { name: 'Star Health', group: 'GRP-STAR-01' },
    { name: 'Care Health', group: 'GRP-CARE-99' },
    { name: 'PM-JAY Ayushman', group: 'GRP-AB-PMJAY' },
    { name: 'BCBS PPO', group: 'GRP-BCBS-99' },
  ];

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadPatientDirectory();

    if (this.patientIdInput) {
      this.patientId = Number(this.patientIdInput);
      this.loadPatientAndRun();
    } else {
      this.route.queryParams.subscribe((params) => {
        if (params['patientId']) {
          this.patientId = Number(params['patientId']);
          this.loadPatientAndRun();
        } else {
          this.onRunRTE();
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patientIdInput'] && changes['patientIdInput'].currentValue) {
      this.patientId = Number(changes['patientIdInput'].currentValue);
      this.loadPatientAndRun();
    }
  }

  dismissModal(): void {
    this.close.emit();
  }

  loadPatientDirectory(): void {
    this.apiService.getPatients().subscribe({
      next: (list) => {
        this.allPatients.set(list || []);
        if (this.patientId) {
          const match = list.find((p) => p.id === Number(this.patientId));
          if (match) this.selectedPatient.set(match);
        }
      },
      error: () => {},
    });
  }

  onPatientSelectChange(): void {
    const pId = Number(this.patientId);
    if (!pId) {
      this.selectedPatient.set(null);
      return;
    }
    const match = this.allPatients().find((p) => p.id === pId);
    if (match) {
      this.selectedPatient.set(match);
      if (match.insurancePolicyNumber) this.subscriberId = match.insurancePolicyNumber;
      if (match.insuranceProvider) this.payerName = match.insuranceProvider;
      if (match.insuranceGroupNumber) this.groupNumber = match.insuranceGroupNumber;
    }
  }

  applyPreset(preset: any): void {
    this.payerName = preset.name;
    this.groupNumber = preset.group;
  }

  loadPatientAndRun(): void {
    if (!this.patientId) {
      this.onRunRTE();
      return;
    }
    this.apiService.getPatientById(this.patientId).subscribe({
      next: (patient) => {
        this.selectedPatient.set(patient);
        if (patient.insurancePolicyNumber) this.subscriberId = patient.insurancePolicyNumber;
        if (patient.insuranceProvider) this.payerName = patient.insuranceProvider;
        if (patient.insuranceGroupNumber) this.groupNumber = patient.insuranceGroupNumber;
        this.onRunRTE();
      },
      error: () => this.onRunRTE(),
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

  printClearance(): void {
    window.print();
  }
}
