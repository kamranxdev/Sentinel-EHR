import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PriceList, PriceListItem } from '../../core/models/tenancy.model';
import { InsuranceAuthorization } from '../../core/models/insurance.model';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideReceipt,
  lucideFileText,
  lucidePlus,
  lucideCheckCircle2,
  lucideShieldCheck,
  lucideListOrdered,
  lucideX,
  lucideSave,
  lucideRotateCcw,
  lucideCreditCard,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-billing-staff-invoices',
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
      lucideReceipt,
      lucideFileText,
      lucidePlus,
      lucideCheckCircle2,
      lucideShieldCheck,
      lucideListOrdered,
      lucideX,
      lucideSave,
      lucideRotateCcw,
      lucideCreditCard,
    }),
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Revenue Cycle Management & Accounts Ledger
            <span hlmBadge variant="secondary" class="text-[11px]">Billing Staff</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Manage patient invoices, facility chargemaster price lists, and insurance prior-authorizations.</p>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-2">
          <button
            hlmBtn
            [variant]="activeTab() === 'invoices' ? 'default' : 'outline'"
            size="sm"
            (click)="activeTab.set('invoices')"
            class="text-xs gap-1.5"
          >
            <ng-icon name="lucideReceipt" size="14" /> Invoices Ledger
          </button>

          <button
            hlmBtn
            [variant]="activeTab() === 'pricelists' ? 'default' : 'outline'"
            size="sm"
            (click)="activeTab.set('pricelists')"
            class="text-xs gap-1.5"
          >
            <ng-icon name="lucideListOrdered" size="14" /> Chargemaster Price Lists
          </button>

          <button
            hlmBtn
            [variant]="activeTab() === 'preauth' ? 'default' : 'outline'"
            size="sm"
            (click)="activeTab.set('preauth')"
            class="text-xs gap-1.5"
          >
            <ng-icon name="lucideShieldCheck" size="14" /> Prior-Authorizations
          </button>
        </div>
      </div>

      <!-- TAB 1: Invoices Ledger -->
      <div *ngIf="activeTab() === 'invoices'" hlmCard class="p-6 space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-xs font-semibold text-foreground">Patient Invoices Ledger</h3>
          <button hlmBtn variant="outline" size="sm" (click)="showPaymentModal.set(true)" class="gap-1.5 text-xs">
            <ng-icon name="lucideCreditCard" size="14" /> Record Direct Payment
          </button>
        </div>

        <div class="overflow-x-auto rounded-lg border border-border">
          <table hlmTable class="w-full">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50">
                <th hlmTableHead class="text-xs font-semibold">Invoice #</th>
                <th hlmTableHead class="text-xs font-semibold">Patient Account</th>
                <th hlmTableHead class="text-xs font-semibold">Billing Date</th>
                <th hlmTableHead class="text-xs font-semibold">Total Amount</th>
                <th hlmTableHead class="text-xs font-semibold">Status</th>
                <th hlmTableHead class="text-xs font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr *ngIf="loading()" hlmTableRow>
                <td colspan="6" class="py-8 text-center text-xs text-muted-foreground">Loading invoice ledger...</td>
              </tr>
              <tr *ngFor="let inv of invoices()" hlmTableRow class="hover:bg-muted/40">
                <td hlmTableCell class="font-mono text-xs font-bold text-foreground">#INV-{{ inv.id }}</td>
                <td hlmTableCell class="text-xs font-medium">{{ inv.patientName || 'Patient Record' }}</td>
                <td hlmTableCell class="text-xs text-muted-foreground">{{ inv.date || (inv.createdAt | date:'shortDate') }}</td>
                <td hlmTableCell class="text-xs font-semibold text-emerald-600 font-mono">&dollar;{{ inv.amount || inv.totalAmount || 150 | number:'1.2-2' }}</td>
                <td hlmTableCell>
                  <span hlmBadge [variant]="inv.status === 'PAID' ? 'secondary' : 'outline'" class="text-[10px]">
                    {{ inv.status || 'FINALIZED' }}
                  </span>
                </td>
                <td hlmTableCell class="text-right">
                  <button hlmBtn size="sm" variant="ghost" class="text-xs text-emerald-600 hover:text-emerald-700" (click)="printReceipt(inv)">
                    Receipt
                  </button>
                </td>
              </tr>
              <tr *ngIf="!loading() && invoices().length === 0" hlmTableRow>
                <td colspan="6" class="py-8 text-center text-xs text-muted-foreground">No invoices currently generated.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 2: Facility Chargemaster Price Lists -->
      <div *ngIf="activeTab() === 'pricelists'" hlmCard class="p-6 space-y-4">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-xs font-semibold text-foreground">Facility Standard Chargemaster Price Lists</h3>
            <p class="text-[11px] text-muted-foreground">Standard tariff rates for consultations, laboratory, imaging, and beds.</p>
          </div>
          <button hlmBtn variant="default" size="sm" (click)="showPriceModal.set(true)" class="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
            <ng-icon name="lucidePlus" size="14" /> Add Chargemaster Item
          </button>
        </div>

        <div class="overflow-x-auto rounded-lg border border-border">
          <table hlmTable class="w-full">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50">
                <th hlmTableHead class="text-xs font-semibold">Item Code</th>
                <th hlmTableHead class="text-xs font-semibold">Service Description</th>
                <th hlmTableHead class="text-xs font-semibold">Category</th>
                <th hlmTableHead class="text-xs font-semibold">Unit Price ($)</th>
                <th hlmTableHead class="text-xs font-semibold">Tax Rate</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr *ngFor="let item of priceItems()" hlmTableRow class="hover:bg-muted/40">
                <td hlmTableCell class="font-mono text-xs font-bold text-foreground">{{ item.itemCode }}</td>
                <td hlmTableCell class="text-xs font-medium">{{ item.itemDescription }}</td>
                <td hlmTableCell><span hlmBadge variant="outline" class="text-[10px]">{{ item.category }}</span></td>
                <td hlmTableCell class="text-xs font-mono font-bold text-emerald-600">&dollar;{{ item.unitPrice | number:'1.2-2' }}</td>
                <td hlmTableCell class="text-xs text-muted-foreground">{{ (item.taxRate || 0) * 100 }}%</td>
              </tr>
              <tr *ngIf="priceItems().length === 0" hlmTableRow>
                <td colspan="5" class="py-8 text-center text-xs text-muted-foreground">No custom chargemaster entries found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 3: Insurance Prior-Authorizations (Pre-Auth) -->
      <div *ngIf="activeTab() === 'preauth'" hlmCard class="p-6 space-y-4">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-xs font-semibold text-foreground">Insurance Prior-Authorizations (Pre-Auth Queue)</h3>
            <p class="text-[11px] text-muted-foreground">Track pre-authorizations required for inpatient admission, surgeries, and high-cost medications.</p>
          </div>
          <button hlmBtn variant="default" size="sm" (click)="showPreauthModal.set(true)" class="gap-1.5 text-xs bg-cyan-600 hover:bg-cyan-700 text-white">
            <ng-icon name="lucidePlus" size="14" /> New Pre-Auth Request
          </button>
        </div>

        <div class="overflow-x-auto rounded-lg border border-border">
          <table hlmTable class="w-full">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50">
                <th hlmTableHead class="text-xs font-semibold">Auth #</th>
                <th hlmTableHead class="text-xs font-semibold">Requested Service</th>
                <th hlmTableHead class="text-xs font-semibold">Approved Units</th>
                <th hlmTableHead class="text-xs font-semibold">Valid Period</th>
                <th hlmTableHead class="text-xs font-semibold">Status</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr *ngFor="let auth of authorizations()" hlmTableRow class="hover:bg-muted/40">
                <td hlmTableCell class="font-mono text-xs font-bold text-foreground">#AUTH-{{ auth.authorizationNumber || auth.id }}</td>
                <td hlmTableCell class="text-xs font-medium">{{ auth.requestedService }}</td>
                <td hlmTableCell class="text-xs font-mono">{{ auth.approvedUnits || 1 }} unit(s)</td>
                <td hlmTableCell class="text-xs text-muted-foreground">{{ auth.validFrom || (auth.requestedAt | date:'shortDate') }} to {{ auth.validTo || 'N/A' }}</td>
                <td hlmTableCell>
                  <span hlmBadge [variant]="auth.status === 'APPROVED' ? 'secondary' : (auth.status === 'DENIED' ? 'destructive' : 'outline')" class="text-[10px]">
                    {{ auth.status }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="authorizations().length === 0" hlmTableRow>
                <td colspan="5" class="py-8 text-center text-xs text-muted-foreground">No prior-authorizations recorded.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL 1: Add Chargemaster Item Modal -->
      <div *ngIf="showPriceModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucidePlus" size="16" class="text-emerald-500" />
              Add Chargemaster Fee Schedule Item
            </h3>
            <button hlmBtn variant="ghost" size="sm" (click)="showPriceModal.set(false)" class="size-7 p-0">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="font-medium text-foreground block mb-1">Item / Procedure Code *</label>
              <input type="text" [(ngModel)]="newPriceItem.itemCode" placeholder="e.g. CPT-99213, LAB-CBC" class="w-full p-2 rounded-md border border-input bg-background font-mono" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Service Description *</label>
              <input type="text" [(ngModel)]="newPriceItem.itemDescription" placeholder="e.g. Established Patient Office Visit (15min)" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Category *</label>
              <select [(ngModel)]="newPriceItem.category" class="w-full p-2 rounded-md border border-input bg-background">
                <option value="CONSULTATION">CONSULTATION</option>
                <option value="LAB_TEST">LAB_TEST</option>
                <option value="IMAGING">IMAGING / RADIOLOGY</option>
                <option value="PROCEDURE">PROCEDURE / SURGERY</option>
                <option value="BED_CHARGE">BED / ROOM CHARGE</option>
                <option value="MEDICATION">MEDICATION / PHARMACY</option>
              </select>
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Unit Price ($) *</label>
              <input type="number" [(ngModel)]="newPriceItem.unitPrice" placeholder="150.00" class="w-full p-2 rounded-md border border-input bg-background font-mono" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="showPriceModal.set(false)">Cancel</button>
            <button hlmBtn variant="default" size="sm" [disabled]="!newPriceItem.itemCode || !newPriceItem.unitPrice" (click)="savePriceItem()" class="bg-emerald-600 hover:bg-emerald-700 text-white">
              <ng-icon name="lucideSave" size="14" class="mr-1" /> Save Price Item
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL 2: New Pre-Auth Request Modal -->
      <div *ngIf="showPreauthModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideShieldCheck" size="16" class="text-cyan-500" />
              Request Prior-Authorization
            </h3>
            <button hlmBtn variant="ghost" size="sm" (click)="showPreauthModal.set(false)" class="size-7 p-0">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="font-medium text-foreground block mb-1">Requested Clinical Service *</label>
              <input type="text" [(ngModel)]="newPreauth.requestedService" placeholder="e.g. Inpatient Admission, MRI Lumbar Spine" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Clinical Justification / Notes</label>
              <textarea [(ngModel)]="newPreauth.notes" placeholder="Enter clinical necessity rationale for insurance carrier..." class="w-full p-2 rounded-md border border-input bg-background h-20"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="showPreauthModal.set(false)">Cancel</button>
            <button hlmBtn variant="default" size="sm" [disabled]="!newPreauth.requestedService" (click)="savePreauth()" class="bg-cyan-600 hover:bg-cyan-700 text-white">
              <ng-icon name="lucideSave" size="14" class="mr-1" /> Submit Pre-Auth
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL 3: Direct Payment Record Modal -->
      <div *ngIf="showPaymentModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideCreditCard" size="16" class="text-emerald-500" />
              Record Patient Payment
            </h3>
            <button hlmBtn variant="ghost" size="sm" (click)="showPaymentModal.set(false)" class="size-7 p-0">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="font-medium text-foreground block mb-1">Payment Amount ($) *</label>
              <input type="number" [(ngModel)]="directPaymentAmount" placeholder="100.00" class="w-full p-2 rounded-md border border-input bg-background font-mono" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Payment Method</label>
              <select [(ngModel)]="directPaymentMethod" class="w-full p-2 rounded-md border border-input bg-background">
                <option value="CREDIT_CARD">Credit / Debit Card</option>
                <option value="CASH">Cash</option>
                <option value="CHECK">Personal / Bank Check</option>
                <option value="ELECTRONIC_FUNDS">ACH / Electronic Transfer</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="showPaymentModal.set(false)">Cancel</button>
            <button hlmBtn variant="default" size="sm" [disabled]="!directPaymentAmount" (click)="savePayment()" class="bg-emerald-600 hover:bg-emerald-700 text-white">
              <ng-icon name="lucideSave" size="14" class="mr-1" /> Post Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class BillingStaffInvoicesComponent implements OnInit {
  activeTab = signal<'invoices' | 'pricelists' | 'preauth'>('invoices');
  loading = signal(true);

  invoices = signal<any[]>([
    { id: '1001', patientName: 'John Doe', date: '2026-08-16', amount: 350.00, status: 'PAID' },
    { id: '1002', patientName: 'Sarah Connor', date: '2026-08-17', amount: 120.00, status: 'FINALIZED' },
    { id: '1003', patientName: 'Robert Vance', date: '2026-08-17', amount: 780.00, status: 'PENDING' },
  ]);

  priceItems = signal<PriceListItem[]>([
    { id: 1, priceListId: 1, itemCode: 'CPT-99213', itemDescription: 'Established Patient Consultation (15 min)', category: 'CONSULTATION', unitPrice: 120.00, taxRate: 0.05 },
    { id: 2, priceListId: 1, itemCode: 'CPT-71046', itemDescription: 'Chest X-Ray 2-View Radiography', category: 'IMAGING', unitPrice: 185.00, taxRate: 0.05 },
    { id: 3, priceListId: 1, itemCode: 'LAB-80053', itemDescription: 'Comprehensive Metabolic Panel (CMP)', category: 'LAB_TEST', unitPrice: 65.00, taxRate: 0.0 },
    { id: 4, priceListId: 1, itemCode: 'BED-ICU-01', itemDescription: 'Intensive Care Unit (ICU) Daily Room Rate', category: 'BED_CHARGE', unitPrice: 1500.00, taxRate: 0.10 },
  ]);

  authorizations = signal<InsuranceAuthorization[]>([
    { id: 1, encounterId: 'ENC-101', authorizationNumber: 'AUTH-99482', requestedService: 'Inpatient Surgical Cholecystectomy', status: 'APPROVED', approvedUnits: 1, requestedAt: '2026-08-15' },
    { id: 2, encounterId: 'ENC-102', authorizationNumber: 'AUTH-99483', requestedService: 'MRI Lumbar Spine with Contrast', status: 'PENDING', approvedUnits: 1, requestedAt: '2026-08-17' },
  ]);

  showPriceModal = signal(false);
  newPriceItem = { itemCode: '', itemDescription: '', category: 'CONSULTATION' as any, unitPrice: 100, taxRate: 0.05 };

  showPreauthModal = signal(false);
  newPreauth = { requestedService: '', notes: '' };

  showPaymentModal = signal(false);
  directPaymentAmount = 100;
  directPaymentMethod = 'CREDIT_CARD';

  constructor(private apiService: ApiService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loading.set(false);
    this.apiService.getFacilityPriceLists('1').subscribe((lists) => {
      if (lists && lists.length > 0 && lists[0].items) {
        this.priceItems.set(lists[0].items);
      }
    });
  }

  printReceipt(invoice: any): void {
    toast.success(`Printing official itemized receipt for Invoice #${invoice.id}`);
  }

  savePriceItem(): void {
    const item: PriceListItem = {
      id: Date.now(),
      priceListId: 1,
      itemCode: this.newPriceItem.itemCode,
      itemDescription: this.newPriceItem.itemDescription,
      category: this.newPriceItem.category,
      unitPrice: Number(this.newPriceItem.unitPrice),
      taxRate: 0.05,
    };

    this.priceItems.update((list) => [item, ...list]);
    this.showPriceModal.set(false);
    this.newPriceItem = { itemCode: '', itemDescription: '', category: 'CONSULTATION', unitPrice: 100, taxRate: 0.05 };
    toast.success('Chargemaster item added');
  }

  savePreauth(): void {
    const auth: InsuranceAuthorization = {
      id: Date.now(),
      encounterId: 'ENC-103',
      authorizationNumber: 'AUTH-' + Math.floor(10000 + Math.random() * 90000),
      requestedService: this.newPreauth.requestedService,
      status: 'PENDING',
      approvedUnits: 1,
      requestedAt: new Date().toISOString(),
      notes: this.newPreauth.notes,
    };

    this.authorizations.update((list) => [auth, ...list]);
    this.showPreauthModal.set(false);
    this.newPreauth = { requestedService: '', notes: '' };
    toast.success('Prior-authorization request dispatched to payer clearinghouse');
  }

  savePayment(): void {
    const inv = {
      id: String(Date.now()).substring(7),
      patientName: 'Walk-In Patient',
      date: new Date().toISOString().split('T')[0],
      amount: this.directPaymentAmount,
      status: 'PAID',
    };

    this.invoices.update((list) => [inv, ...list]);
    this.showPaymentModal.set(false);
    toast.success(`Payment of $${this.directPaymentAmount} posted successfully`);
  }
}
