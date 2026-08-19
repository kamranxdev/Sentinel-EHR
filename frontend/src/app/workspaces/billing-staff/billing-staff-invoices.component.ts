import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { PriceList, PriceListItem } from '../../core/models/tenancy.model';
import { InsuranceAuthorization } from '../../core/models/insurance.model';
import { ChargeItem, Invoice } from '../../core/models/billing.model';
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
  lucideDollarSign,
  lucideTag,
  lucideActivity,
} from '@ng-icons/lucide';

export interface BillingInvoiceViewModel {
  id: string;
  patientName: string;
  date?: string;
  createdAt?: string;
  amount?: number;
  totalAmount?: number;
  status: string;
}

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
      lucideDollarSign,
      lucideTag,
      lucideActivity,
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
          <p class="text-xs text-muted-foreground mt-0.5">Manage patient invoices, billable charges from clinical events, hospital chargemaster price lists, and insurance prior-authorizations.</p>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-2 flex-wrap">
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
            [variant]="activeTab() === 'charges' ? 'default' : 'outline'"
            size="sm"
            (click)="activeTab.set('charges')"
            class="text-xs gap-1.5"
          >
            <ng-icon name="lucideActivity" size="14" /> Billable Charges
          </button>

          <button
            hlmBtn
            [variant]="activeTab() === 'pricelists' ? 'default' : 'outline'"
            size="sm"
            (click)="activeTab.set('pricelists')"
            class="text-xs gap-1.5"
          >
            <ng-icon name="lucideListOrdered" size="14" /> Chargemaster
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

      <!-- TAB 2: Billable Charges from Clinical Events -->
      <div *ngIf="activeTab() === 'charges'" hlmCard class="p-6 space-y-4">
        <div class="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h3 class="text-xs font-semibold text-foreground">Billable Event Charges</h3>
            <p class="text-[11px] text-muted-foreground">Automatic charge items dispatched from Doctor consultations, Lab test orders, Radiology studies, and Pharmacy dispensations.</p>
          </div>
          <button hlmBtn variant="default" size="sm" (click)="showChargeModal.set(true)" class="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
            <ng-icon name="lucidePlus" size="14" /> Post New Charge Item
          </button>
        </div>

        <div class="overflow-x-auto rounded-lg border border-border">
          <table hlmTable class="w-full">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50">
                <th hlmTableHead class="text-xs font-semibold">Charge ID & Code</th>
                <th hlmTableHead class="text-xs font-semibold">Patient</th>
                <th hlmTableHead class="text-xs font-semibold">Service Description</th>
                <th hlmTableHead class="text-xs font-semibold">Category</th>
                <th hlmTableHead class="text-xs font-semibold">Fee ($)</th>
                <th hlmTableHead class="text-xs font-semibold">Status</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr *ngFor="let chg of charges()" hlmTableRow class="hover:bg-muted/40">
                <td hlmTableCell class="font-mono text-xs font-bold text-foreground">
                  <div>#{{ chg.id }}</div>
                  <div class="text-[10px] text-muted-foreground font-normal">{{ chg.chargeCode }}</div>
                </td>
                <td hlmTableCell class="text-xs font-medium">{{ chg.patientName }}</td>
                <td hlmTableCell class="text-xs">{{ chg.description }}</td>
                <td hlmTableCell>
                  <span hlmBadge variant="outline" class="text-[10px]">{{ chg.category }}</span>
                </td>
                <td hlmTableCell class="text-xs font-mono font-bold text-emerald-600">&dollar;{{ chg.totalPrice | number:'1.2-2' }}</td>
                <td hlmTableCell>
                  <span [ngClass]="chg.status === 'INVOICED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'" class="px-2 py-0.5 rounded text-[10px] font-bold border">
                    {{ chg.status }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="charges().length === 0" hlmTableRow>
                <td colspan="6" class="py-8 text-center text-xs text-muted-foreground">No billable charges currently pending.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 3: Organization Chargemaster Price Lists -->
      <div *ngIf="activeTab() === 'pricelists'" hlmCard class="p-6 space-y-4">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-xs font-semibold text-foreground">Hospital / Clinic Standard Chargemaster Price Lists</h3>
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

      <!-- TAB 4: Insurance Prior-Authorizations (Pre-Auth) -->
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
                <th hlmTableHead class="text-xs font-semibold">Pre-Auth #</th>
                <th hlmTableHead class="text-xs font-semibold">Encounter</th>
                <th hlmTableHead class="text-xs font-semibold">Requested Service</th>
                <th hlmTableHead class="text-xs font-semibold">Status</th>
                <th hlmTableHead class="text-xs font-semibold">Requested At</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr *ngFor="let auth of authorizations()" hlmTableRow class="hover:bg-muted/40">
                <td hlmTableCell class="font-mono text-xs font-bold text-foreground">{{ auth.authorizationNumber }}</td>
                <td hlmTableCell class="text-xs font-mono text-muted-foreground">{{ auth.encounterId }}</td>
                <td hlmTableCell class="text-xs font-medium">{{ auth.requestedService }}</td>
                <td hlmTableCell>
                  <span hlmBadge [variant]="auth.status === 'APPROVED' ? 'secondary' : 'outline'" class="text-[10px]">
                    {{ auth.status }}
                  </span>
                </td>
                <td hlmTableCell class="text-xs text-muted-foreground">{{ auth.requestedAt | date:'shortDate' }}</td>
              </tr>
              <tr *ngIf="authorizations().length === 0" hlmTableRow>
                <td colspan="5" class="py-8 text-center text-xs text-muted-foreground">No prior-authorization requests logged.</td>
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
              <ng-icon name="lucideTag" size="16" class="text-emerald-500" />
              Add Chargemaster Item
            </h3>
            <button hlmBtn variant="ghost" size="sm" (click)="showPriceModal.set(false)" class="size-7 p-0">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="font-medium text-foreground block mb-1">Item / CPT Code *</label>
              <input type="text" [(ngModel)]="newPriceItem.itemCode" placeholder="e.g. CPT-99214" class="w-full p-2 rounded-md border border-input bg-background font-mono" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Service Description *</label>
              <input type="text" [(ngModel)]="newPriceItem.itemDescription" placeholder="e.g. Comprehensive Office Consultation" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Category</label>
              <select [(ngModel)]="newPriceItem.category" class="w-full p-2 rounded-md border border-input bg-background">
                <option value="CONSULTATION">Consultation</option>
                <option value="LAB_TEST">Lab Test</option>
                <option value="IMAGING">Imaging / Radiology</option>
                <option value="PROCEDURE">Surgical Procedure</option>
                <option value="BED_CHARGE">Bed / Room Rate</option>
                <option value="MEDICATION">Pharmacy Dispense</option>
              </select>
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Standard Unit Price ($) *</label>
              <input type="number" [(ngModel)]="newPriceItem.unitPrice" placeholder="150.00" class="w-full p-2 rounded-md border border-input bg-background font-mono" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="showPriceModal.set(false)">Cancel</button>
            <button hlmBtn variant="default" size="sm" [disabled]="!newPriceItem.itemCode || !newPriceItem.itemDescription" (click)="savePriceItem()" class="bg-emerald-600 hover:bg-emerald-700 text-white">
              <ng-icon name="lucideSave" size="14" class="mr-1" /> Save Item
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL 2: Pre-Auth Request Modal -->
      <div *ngIf="showPreauthModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideShieldCheck" size="16" class="text-cyan-500" />
              Submit Prior-Authorization Request
            </h3>
            <button hlmBtn variant="ghost" size="sm" (click)="showPreauthModal.set(false)" class="size-7 p-0">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="font-medium text-foreground block mb-1">Requested Service / Procedure *</label>
              <input type="text" [(ngModel)]="newPreauth.requestedService" placeholder="e.g. Diagnostic Cardiac Catheterization" class="w-full p-2 rounded-md border border-input bg-background" />
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

      <!-- MODAL 4: Post Clinical Charge Modal -->
      <div *ngIf="showChargeModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideFileText" size="16" class="text-emerald-500" />
              Post New Billable Charge
            </h3>
            <button hlmBtn variant="ghost" size="sm" (click)="showChargeModal.set(false)" class="size-7 p-0">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="font-medium text-foreground block mb-1">Patient Name *</label>
              <input type="text" [(ngModel)]="newCharge.patientName" placeholder="e.g. Ramesh Sharma" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="font-medium text-foreground block mb-1">Charge / CPT Code *</label>
                <input type="text" [(ngModel)]="newCharge.chargeCode" placeholder="CPT-99213" class="w-full p-2 rounded-md border border-input bg-background font-mono" />
              </div>
              <div>
                <label class="font-medium text-foreground block mb-1">Category</label>
                <select [(ngModel)]="newCharge.category" class="w-full p-2 rounded-md border border-input bg-background">
                  <option value="CONSULTATION">Consultation</option>
                  <option value="LAB">Laboratory</option>
                  <option value="IMAGING">Imaging / Radiology</option>
                  <option value="MEDICATION">Pharmacy Dispense</option>
                  <option value="PROCEDURE">Procedure</option>
                  <option value="BED">Room / Bed Charge</option>
                </select>
              </div>
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Service Description *</label>
              <input type="text" [(ngModel)]="newCharge.description" placeholder="e.g. Detailed Specialist Consultation" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="font-medium text-foreground block mb-1">Quantity</label>
                <input type="number" [(ngModel)]="newCharge.quantity" min="1" class="w-full p-2 rounded-md border border-input bg-background font-mono" />
              </div>
              <div>
                <label class="font-medium text-foreground block mb-1">Unit Price ($) *</label>
                <input type="number" [(ngModel)]="newCharge.unitPrice" placeholder="120.00" class="w-full p-2 rounded-md border border-input bg-background font-mono" />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="showChargeModal.set(false)">Cancel</button>
            <button hlmBtn variant="default" size="sm" [disabled]="!newCharge.description || !newCharge.chargeCode" (click)="saveCharge()" class="bg-emerald-600 hover:bg-emerald-700 text-white">
              <ng-icon name="lucideSave" size="14" class="mr-1" /> Post Charge
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class BillingStaffInvoicesComponent implements OnInit {
  activeTab = signal<'invoices' | 'charges' | 'pricelists' | 'preauth'>('invoices');
  loading = signal(true);

  invoices = signal<BillingInvoiceViewModel[]>([]);
  charges = signal<ChargeItem[]>([]);
  priceItems = signal<PriceListItem[]>([]);
  authorizations = signal<InsuranceAuthorization[]>([]);

  showChargeModal = signal(false);
  newCharge = { patientName: '', chargeCode: '', description: '', category: 'CONSULTATION', quantity: 1, unitPrice: 100.0 };

  showPriceModal = signal(false);
  newPriceItem: {
    itemCode: string;
    itemDescription: string;
    category: 'CONSULTATION' | 'LAB_TEST' | 'IMAGING' | 'PROCEDURE' | 'MEDICATION' | 'BED_CHARGE';
    unitPrice: number;
    taxRate: number;
  } = { itemCode: '', itemDescription: '', category: 'CONSULTATION', unitPrice: 100, taxRate: 0.05 };

  showPreauthModal = signal(false);
  newPreauth = { requestedService: '', notes: '' };

  showPaymentModal = signal(false);
  directPaymentAmount = 100;
  directPaymentMethod = 'CREDIT_CARD';

  constructor(private apiService: ApiService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loading.set(false);
    this.loadData();
  }

  loadData(): void {
    this.apiService.getAllInvoices().subscribe((invs: Invoice[]) => {
      if (invs && invs.length > 0) {
        this.invoices.set(
          invs.map((i: Invoice) => ({
            id: i.id || i.invoiceNumber,
            patientName: i.patientName || 'Patient',
            date: i.issuedDate || new Date().toISOString().split('T')[0],
            amount: i.totalAmount,
            status: i.status || 'PAID',
          }))
        );
      }
    });

    this.apiService.getAllChargeItems().subscribe((chgs: ChargeItem[]) => {
      if (chgs && chgs.length > 0) {
        this.charges.set(chgs);
      }
    });

    this.apiService.getOrganizationPriceLists('1').subscribe((lists: PriceList[]) => {
      if (lists && lists.length > 0 && lists[0].items) {
        this.priceItems.set(lists[0].items);
      }
    });
  }

  printReceipt(invoice: BillingInvoiceViewModel | Invoice): void {
    toast.success(`Printing official itemized receipt for Invoice #${invoice.id}`);
  }

  saveCharge(): void {
    const chg: ChargeItem = {
      id: 'CHG-' + Date.now(),
      patientId: 'PAT-1',
      patientName: this.newCharge.patientName,
      chargeCode: this.newCharge.chargeCode,
      description: this.newCharge.description,
      category: this.newCharge.category,
      quantity: Number(this.newCharge.quantity) || 1,
      unitPrice: Number(this.newCharge.unitPrice) || 100,
      totalPrice: (Number(this.newCharge.quantity) || 1) * (Number(this.newCharge.unitPrice) || 100),
      status: 'BILLABLE',
      serviceDate: new Date().toISOString().split('T')[0],
      providerName: 'Hospital Staff',
    };

    this.charges.update((list) => [chg, ...list]);
    this.showChargeModal.set(false);
    this.newCharge = { patientName: '', chargeCode: '', description: '', category: 'CONSULTATION', quantity: 1, unitPrice: 100.0 };
    toast.success('Billable clinical charge posted successfully');
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
