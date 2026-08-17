import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideReceipt, lucideIndianRupee, lucideFileText } from '@ng-icons/lucide';

@Component({
  selector: 'app-billing-staff-invoices',
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
      lucideReceipt,
      lucideIndianRupee,
      lucideFileText,
    }),
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Patient Invoices & Accounts Ledger
            <span hlmBadge variant="secondary" class="text-[11px]">Billing Staff</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Manage generated patient bills, co-pay statements, and payment tracking.</p>
        </div>
      </div>

      <div hlmCard class="p-6 space-y-4">
        <div class="overflow-x-auto rounded-lg border border-border">
          <table hlmTable class="w-full">
            <thead hlmTableHeader>
              <tr hlmTableRow>
                <th hlmTableHead class="text-xs font-semibold">Invoice Number</th>
                <th hlmTableHead class="text-xs font-semibold">Patient Name</th>
                <th hlmTableHead class="text-xs font-semibold">Billing Date</th>
                <th hlmTableHead class="text-xs font-semibold">Total Amount</th>
                <th hlmTableHead class="text-xs font-semibold">Status</th>
                <th hlmTableHead class="text-xs font-semibold text-right">Invoice Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr *ngIf="loading()" hlmTableRow>
                <td colspan="6" class="py-8 text-center text-xs text-muted-foreground">
                  <div class="flex items-center justify-center gap-2">
                    <ng-icon name="lucideReceipt" class="animate-spin text-emerald-600" size="16" />
                    <span>Loading patient invoice ledger...</span>
                  </div>
                </td>
              </tr>
              <tr *ngIf="!loading() && error()" hlmTableRow>
                <td colspan="6" class="py-6 text-center text-xs text-destructive">
                  <p>{{ error() }}</p>
                  <button (click)="loadInvoices()" class="mt-2 text-xs text-emerald-600 underline">Retry</button>
                </td>
              </tr>
              <tr *ngIf="!loading() && !error() && invoices().length === 0" hlmTableRow>
                <td colspan="6" class="py-8 text-center text-xs text-muted-foreground">
                  No patient invoices generated in the ledger.
                </td>
              </tr>
              <tr *ngFor="let invoice of invoices()" hlmTableRow>
                <td hlmTableCell class="font-mono text-xs text-foreground">{{ invoice.id }}</td>
                <td hlmTableCell class="font-medium text-foreground text-xs">{{ invoice.patientName }}</td>
                <td hlmTableCell class="text-xs text-muted-foreground">{{ invoice.date }}</td>
                <td hlmTableCell class="text-xs font-semibold text-emerald-600">₹{{ invoice.amount | number:'1.2-2' }}</td>
                <td hlmTableCell>
                  <span hlmBadge [variant]="invoice.status === 'PAID' ? 'default' : 'outline'" class="text-[10px]">
                    {{ invoice.status }}
                  </span>
                </td>
                <td hlmTableCell class="text-right">
                  <button hlmBtn size="sm" variant="ghost" class="text-xs text-emerald-600 hover:text-emerald-700" (click)="printInvoice(invoice)">
                    Print Receipt
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class BillingStaffInvoicesComponent implements OnInit {
  invoices = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor(
    public authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading.set(true);
    this.error.set(null);
    this.apiService.getAppointments().subscribe({
      next: (apts) => {
        const list = (Array.isArray(apts) ? apts : []).map((apt, idx) => ({
          id: `INV-${apt.id ? String(apt.id).substring(0, 6).toUpperCase() : (1000 + idx)}`,
          patientName: apt.patientName || apt.patient?.fullName || 'Patient',
          date: apt.appointmentDate ? apt.appointmentDate.split('T')[0] : new Date().toISOString().split('T')[0],
          amount: 1500.0,
          status: apt.status === 'COMPLETED' ? 'PAID' : 'PENDING',
        }));
        this.invoices.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load appointments for invoices:', err);
        this.error.set('Failed to load patient invoices from server.');
        this.loading.set(false);
      },
    });
  }

  printInvoice(invoice: any): void {
    window.print();
  }
}
