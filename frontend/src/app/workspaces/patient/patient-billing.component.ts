import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { AuthService } from '../../core/services/auth.service';
import { Invoice, Payment } from '../../core/models/billing.model';
import { Patient } from '../../core/models/patient.model';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideReceipt,
  lucideCreditCard,
  lucideShieldCheck,
  lucideShieldAlert,
  lucideCheckCircle2,
  lucideClock,
  lucideAlertTriangle,
  lucideDownload,
  lucideRefreshCw,
  lucideQrCode,
  lucideX,
  lucideIndianRupee,
  lucideBuilding2,
  lucideFileText,
} from '@ng-icons/lucide';

export interface InsuranceClaimPreview {
  claimNumber: string;
  payerName: string;
  policyNumber: string;
  status: 'APPROVED' | 'DENIED' | 'UNDER_REVIEW' | 'NOT_APPLICABLE';
  totalBilled: number;
  coveredAmount: number;
  patientResponsibility: number;
  denialReason?: string;
}

@Component({
  selector: 'app-patient-billing',
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
      lucideReceipt,
      lucideCreditCard,
      lucideShieldCheck,
      lucideShieldAlert,
      lucideCheckCircle2,
      lucideClock,
      lucideAlertTriangle,
      lucideDownload,
      lucideRefreshCw,
      lucideQrCode,
      lucideX,
      lucideIndianRupee,
      lucideBuilding2,
      lucideFileText,
    }),
  ],
  template: `
    <div class="w-full space-y-6">
      <!-- 1. Header & Summary Banner -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border"
      >
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <ng-icon name="lucideReceipt" class="text-primary" />
            <span>My Invoices & Direct Pay</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Review itemized charges, real-time insurance claim coverage determinations, and settle balances directly in INR (₹).
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            hlmBtn
            variant="outline"
            size="sm"
            (click)="loadInvoices()"
            class="text-xs gap-1.5"
          >
            <ng-icon name="lucideRefreshCw" size="13" [class.animate-spin]="isLoading()" />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      <!-- Error Banner -->
      <div *ngIf="errorMessage()" class="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-center justify-between">
        <div class="flex items-center gap-2">
          <ng-icon name="lucideAlertTriangle" size="16" />
          <span>{{ errorMessage() }}</span>
        </div>
        <button hlmBtn variant="outline" size="sm" (click)="loadInvoices()" class="h-7 text-xs">
          Retry
        </button>
      </div>

      <!-- 2. Financial & Insurance Status Overview Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Outstanding Balance -->
        <div class="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <div class="flex justify-between items-center text-xs text-muted-foreground">
            <span>Outstanding Balance Due</span>
            <ng-icon name="lucideIndianRupee" class="text-amber-500" size="16" />
          </div>
          <div class="text-2xl font-black text-foreground font-mono">
            ₹{{ totalBalanceDue().toFixed(2) }}
          </div>
          <p class="text-[11px] text-muted-foreground">
            {{ unpaidInvoicesCount() }} invoice(s) pending payment
          </p>
        </div>

        <!-- Total Paid to Date -->
        <div class="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <div class="flex justify-between items-center text-xs text-muted-foreground">
            <span>Total Paid to Date</span>
            <ng-icon name="lucideCheckCircle2" class="text-emerald-500" size="16" />
          </div>
          <div class="text-2xl font-black text-foreground font-mono">
            ₹{{ totalPaidAmount().toFixed(2) }}
          </div>
          <p class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            All receipts digitally recorded
          </p>
        </div>

        <!-- Insurance Claim Coverage Status -->
        <div class="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <div class="flex justify-between items-center text-xs text-muted-foreground">
            <span>Insurance Claim Reconciliation</span>
            <ng-icon name="lucideShieldCheck" class="text-primary" size="16" />
          </div>
          <div class="flex items-center gap-2">
            <span
              hlmBadge
              [variant]="
                insuranceClaim()?.status === 'APPROVED'
                  ? 'secondary'
                  : insuranceClaim()?.status === 'DENIED'
                    ? 'destructive'
                    : 'default'
              "
              class="text-xs font-bold"
            >
              {{ insuranceClaim() ? insuranceClaim()!.status : 'SELF_PAY' }}
            </span>
          </div>
          <p class="text-[11px] text-muted-foreground truncate">
            {{ insuranceClaim() ? 'Payer: ' + insuranceClaim()!.payerName : 'Direct Patient Self-Pay' }}
          </p>
        </div>
      </div>

      <!-- 3. Real-Time Insurance Claim Banner -->
      <div
        *ngIf="insuranceClaim()"
        class="rounded-xl p-4 border text-xs"
        [ngClass]="{
          'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200': insuranceClaim()?.status === 'APPROVED',
          'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200': insuranceClaim()?.status === 'DENIED',
          'bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-200': insuranceClaim()?.status === 'UNDER_REVIEW',
          'bg-muted/40 border-border text-foreground': insuranceClaim()?.status === 'NOT_APPLICABLE'
        }"
      >
        <div class="flex items-start gap-3">
          <ng-icon
            [name]="
              insuranceClaim()?.status === 'APPROVED'
                ? 'lucideShieldCheck'
                : insuranceClaim()?.status === 'DENIED'
                  ? 'lucideShieldAlert'
                  : 'lucideClock'
            "
            size="20"
            class="shrink-0 mt-0.5"
          />
          <div class="space-y-1">
            <div class="font-bold flex items-center gap-2">
              <span>Claim Determination: {{ insuranceClaim()?.payerName }}</span>
              <span class="font-mono text-[10px] opacity-80">(Policy #{{ insuranceClaim()?.policyNumber }})</span>
            </div>
            <div *ngIf="insuranceClaim()?.status === 'APPROVED'">
              Insurer covered <strong class="font-mono">₹{{ insuranceClaim()!.coveredAmount.toFixed(2) }}</strong> of billed charges. Your patient co-pay / deductible balance is <strong class="font-mono">₹{{ insuranceClaim()!.patientResponsibility.toFixed(2) }}</strong>.
            </div>
            <div *ngIf="insuranceClaim()?.status === 'DENIED'">
              Claim denied by insurer: <span class="italic font-semibold">"{{ insuranceClaim()!.denialReason || 'Out-of-network provider / Non-covered service' }}"</span>. The full billed invoice balance of <strong class="font-mono">₹{{ insuranceClaim()!.patientResponsibility.toFixed(2) }}</strong> is payable by the patient.
            </div>
            <div *ngIf="insuranceClaim()?.status === 'UNDER_REVIEW'">
              Claim has been submitted to {{ insuranceClaim()?.payerName }} and is currently under electronic adjudication.
            </div>
            <div *ngIf="insuranceClaim()?.status === 'NOT_APPLICABLE'">
              No active third-party insurance claim on file. Self-pay terms apply.
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Invoices Table -->
      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
          <h3 class="text-xs font-semibold text-foreground flex items-center gap-2">
            <ng-icon name="lucideReceipt" size="14" class="text-primary" />
            <span>Billing Invoices & Charge Records</span>
          </h3>
          <span class="text-[11px] text-muted-foreground">{{ invoices().length }} total invoice(s)</span>
        </div>

        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Invoice #</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Issued Date</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Line Items</th>
                <th hlmTableHead class="py-3 px-4 text-right font-semibold">Total Amount</th>
                <th hlmTableHead class="py-3 px-4 text-right font-semibold">Balance Due</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Status</th>
                <th hlmTableHead class="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr
                *ngFor="let inv of invoices()"
                hlmTableRow
                class="hover:bg-muted/40 transition-colors"
              >
                <td hlmTableCell class="py-3.5 px-4 font-mono font-bold text-foreground">
                  {{ inv.invoiceNumber || ('#INV-' + inv.id.substring(0, 8)) }}
                </td>
                <td hlmTableCell class="py-3.5 px-4 text-muted-foreground">
                  {{ inv.issuedDate | date: 'mediumDate' }}
                </td>
                <td hlmTableCell class="py-3.5 px-4 max-w-xs truncate">
                  <span *ngIf="inv.items && inv.items.length > 0">
                    {{ inv.items[0].description }}
                    <span *ngIf="inv.items.length > 1" class="text-muted-foreground text-[10px]">
                      (+{{ inv.items.length - 1 }} more)
                    </span>
                  </span>
                  <span *ngIf="!inv.items || inv.items.length === 0" class="text-muted-foreground italic">
                    Clinical Care & Consultation
                  </span>
                </td>
                <td hlmTableCell class="py-3.5 px-4 text-right font-mono font-bold text-foreground">
                  ₹{{ (inv.totalAmount || inv.subtotal || 0).toFixed(2) }}
                </td>
                <td hlmTableCell class="py-3.5 px-4 text-right font-mono font-bold" [ngClass]="(inv.balanceDue || 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'">
                  ₹{{ (inv.balanceDue !== undefined ? inv.balanceDue : (inv.totalAmount - (inv.amountPaid || 0))).toFixed(2) }}
                </td>
                <td hlmTableCell class="py-3.5 px-4">
                  <span
                    hlmBadge
                    [variant]="
                      inv.status === 'PAID'
                        ? 'secondary'
                        : inv.status === 'PARTIALLY_PAID'
                          ? 'outline'
                          : 'default'
                    "
                    class="text-[10px] font-bold"
                  >
                    {{ inv.status }}
                  </span>
                </td>
                <td hlmTableCell class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      *ngIf="inv.status !== 'PAID'"
                      hlmBtn
                      size="sm"
                      (click)="openPayModal(inv)"
                      class="h-7 text-[11px] bg-primary text-primary-foreground font-semibold gap-1"
                    >
                      <ng-icon name="lucideCreditCard" size="12" />
                      <span>Pay Online</span>
                    </button>
                    <button
                      hlmBtn
                      variant="outline"
                      size="sm"
                      (click)="downloadReceipt(inv)"
                      class="h-7 text-[11px] gap-1"
                    >
                      <ng-icon name="lucideDownload" size="12" />
                      <span>Receipt</span>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="invoices().length === 0 && !isLoading()" hlmTableRow>
                <td colspan="7" class="py-12 text-center text-xs text-muted-foreground">
                  No invoices found for this patient account.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 5. Direct Pay Online Modal -->
      <div
        *ngIf="showPayModal()"
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div
          class="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150"
        >
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideCreditCard" size="16" class="text-primary" />
              Direct Patient Payment Portal
            </h3>
            <button
              hlmBtn
              variant="ghost"
              size="sm"
              (click)="showPayModal.set(false)"
              class="size-7 p-0"
            >
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div class="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Invoice Reference:</span>
                <span class="font-mono font-bold">{{ selectedInvoice()?.invoiceNumber }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Amount to Settle:</span>
                <span class="font-mono font-extrabold text-primary text-sm">
                  ₹{{ (selectedInvoice()?.balanceDue || selectedInvoice()?.totalAmount || 0).toFixed(2) }}
                </span>
              </div>
            </div>

            <div>
              <label class="font-semibold text-foreground block mb-1">Select Payment Gateway</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  (click)="paymentMethod.set('CREDIT_CARD')"
                  class="p-2.5 rounded-lg border text-left flex items-center gap-2 font-semibold text-[11px]"
                  [ngClass]="paymentMethod() === 'CREDIT_CARD' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground'"
                >
                  <ng-icon name="lucideCreditCard" size="14" />
                  <span>Card (Debit/Credit)</span>
                </button>
                <button
                  type="button"
                  (click)="paymentMethod.set('ONLINE_TRANSFER')"
                  class="p-2.5 rounded-lg border text-left flex items-center gap-2 font-semibold text-[11px]"
                  [ngClass]="paymentMethod() === 'ONLINE_TRANSFER' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground'"
                >
                  <ng-icon name="lucideQrCode" size="14" />
                  <span>UPI / NetBanking</span>
                </button>
              </div>
            </div>

            <div *ngIf="paymentMethod() === 'CREDIT_CARD'" class="space-y-2">
              <div>
                <label class="font-medium text-foreground block mb-1">Card Number</label>
                <input
                  type="text"
                  [(ngModel)]="cardDetails.number"
                  placeholder="•••• •••• •••• 4242"
                  class="w-full h-8 px-2.5 rounded-md border border-input bg-background font-mono text-xs"
                />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="font-medium text-foreground block mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    [(ngModel)]="cardDetails.expiry"
                    placeholder="12/28"
                    class="w-full h-8 px-2.5 rounded-md border border-input bg-background font-mono text-xs"
                  />
                </div>
                <div>
                  <label class="font-medium text-foreground block mb-1">CVV / CVC</label>
                  <input
                    type="password"
                    [(ngModel)]="cardDetails.cvv"
                    placeholder="•••"
                    maxlength="4"
                    class="w-full h-8 px-2.5 rounded-md border border-input bg-background font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div *ngIf="paymentMethod() === 'ONLINE_TRANSFER'" class="p-3 rounded-lg border border-border bg-muted/20 text-center space-y-2">
              <p class="text-[11px] text-muted-foreground">Scan QR Code with any UPI / Banking App (GPay / PhonePe / Paytm / BHIM)</p>
              <div class="size-28 bg-white border border-border rounded-lg mx-auto flex items-center justify-center p-1 shadow-xs">
                <ng-icon name="lucideQrCode" size="90" class="text-black" />
              </div>
              <span class="text-[10px] font-mono text-muted-foreground">UPI ID: sentinel-ehr@hospital.bank</span>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="showPayModal.set(false)">
              Cancel
            </button>
            <button
              hlmBtn
              variant="default"
              size="sm"
              [disabled]="isPaying()"
              (click)="executePayment()"
              class="bg-primary text-primary-foreground font-semibold gap-1.5"
            >
              <ng-icon name="lucideCheckCircle2" size="14" />
              <span>{{ isPaying() ? 'Processing Payment...' : 'Authorize & Pay ₹' + (selectedInvoice()?.balanceDue || selectedInvoice()?.totalAmount || 0).toFixed(2) }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PatientBillingComponent implements OnInit {
  invoices = signal<Invoice[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showPayModal = signal(false);
  isPaying = signal(false);
  selectedInvoice = signal<Invoice | null>(null);
  paymentMethod = signal<'CREDIT_CARD' | 'ONLINE_TRANSFER'>('CREDIT_CARD');

  cardDetails = {
    number: '',
    expiry: '',
    cvv: '',
  };

  insuranceClaim = signal<InsuranceClaimPreview | null>(null);

  constructor(
    private apiService: ApiService,
    private patientContext: PatientContextService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const activePatient = this.patientContext.activePatient();

    if (!activePatient?.id) {
      this.apiService.getMyPatientProfile().subscribe({
        next: (p) => {
          this.patientContext.setActivePatient(p);
          this.fetchBillingData(p.id);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set('Unable to resolve active patient profile for billing.');
          toast.error('Failed to load patient profile.');
        },
      });
      return;
    }

    this.fetchBillingData(activePatient.id);
  }

  private fetchBillingData(patientId: string): void {
    this.apiService.getPatientInvoices(patientId).subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        this.invoices.set(list);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Failed to load invoices from server. Please verify network connectivity.');
        toast.error('Failed to load invoices ledger.');
      },
    });

    this.apiService.getPatientClaims(patientId).subscribe({
      next: (claims: any) => {
        const list = Array.isArray(claims) ? claims : claims?.data || [];
        if (list.length > 0) {
          const top = list[0];
          this.insuranceClaim.set({
            claimNumber: top.claimNumber || `CLM-${top.id?.substring(0, 6)}`,
            payerName: top.payerName || top.insurer || 'Primary Insurance Payer',
            policyNumber: top.policyNumber || 'POL-REF',
            status: top.status || 'UNDER_REVIEW',
            totalBilled: top.totalBilled || top.amount || 0,
            coveredAmount: top.approvedAmount || top.coveredAmount || 0,
            patientResponsibility: top.patientResponsibility || top.copayAmount || 0,
            denialReason: top.denialReason || top.rejectionReason,
          });
        } else {
          this.insuranceClaim.set(null);
        }
      },
      error: () => {
        this.insuranceClaim.set(null);
      },
    });
  }

  totalBalanceDue = computed(() => {
    return this.invoices().reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
  });

  totalPaidAmount = computed(() => {
    return this.invoices().reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  });

  unpaidInvoicesCount = computed(() => {
    return this.invoices().filter((inv) => (inv.balanceDue || 0) > 0).length;
  });

  openPayModal(invoice: Invoice): void {
    this.selectedInvoice.set(invoice);
    this.cardDetails = { number: '', expiry: '', cvv: '' };
    this.showPayModal.set(true);
  }

  executePayment(): void {
    const inv = this.selectedInvoice();
    if (!inv || this.isPaying()) return;

    this.isPaying.set(true);
    const amountToPay = inv.balanceDue !== undefined ? inv.balanceDue : inv.totalAmount;

    this.apiService
      .recordInvoicePayment(inv.id, {
        amount: amountToPay,
        paymentMethod: this.paymentMethod(),
        notes: `Patient Portal Online Direct Payment via ${this.paymentMethod()}`,
      })
      .subscribe({
        next: (payment) => {
          this.isPaying.set(false);
          this.showPayModal.set(false);
          toast.success(`Payment of ₹${amountToPay.toFixed(2)} processed successfully. Receipt generated.`);
          this.invoices.update((list) =>
            list.map((item) =>
              item.id === inv.id
                ? {
                    ...item,
                    status: 'PAID',
                    balanceDue: 0,
                    amountPaid: (item.amountPaid || 0) + amountToPay,
                  }
                : item,
            ),
          );
        },
        error: (err) => {
          this.isPaying.set(false);
          const errorMsg = err?.error?.message || err?.message || 'Payment gateway transaction was declined.';
          toast.error(`Payment Failed: ${errorMsg}`);
        },
      });
  }

  downloadReceipt(inv: Invoice): void {
    toast.success(`Receipt for ${inv.invoiceNumber || 'INV'} downloaded.`);
  }
}
