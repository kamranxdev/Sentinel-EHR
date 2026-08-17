import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTestTube, lucideFlaskConical, lucideFileText, lucideBarcode, lucideCheckCircle2, lucideRefreshCw } from '@ng-icons/lucide';

@Component({
  selector: 'app-lab-technician-worklist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideTestTube,
      lucideFlaskConical,
      lucideFileText,
      lucideBarcode,
      lucideCheckCircle2,
      lucideRefreshCw,
    }),
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Laboratory Specimen Queue & Order Lifecycle
            <span hlmBadge variant="secondary" class="text-[11px]">Lab Technician</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Specimen collection, barcode logging, and multi-stage test processing lifecycle.</p>
        </div>
        <button hlmBtn variant="outline" size="sm" (click)="loadOrders()" class="gap-2 text-xs">
          <ng-icon name="lucideRefreshCw" class="text-sm"></ng-icon> Refresh Orders
        </button>
      </div>

      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Order ID</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Patient Name</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Diagnostic Test</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">LOINC Code</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Specimen Barcode</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Status Stage</th>
                <th hlmTableHead class="py-3 px-4 text-right font-semibold">Lifecycle Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngFor="let order of labOrders()" hlmTableRow class="hover:bg-muted/40 transition-colors">
                <td hlmTableCell class="py-3 px-4 font-mono font-bold text-foreground">#LAB-{{ order.id }}</td>
                <td hlmTableCell class="py-3 px-4 font-semibold text-foreground">{{ order.patient?.fullName || 'Patient #' + order.patientId }}</td>
                <td hlmTableCell class="py-3 px-4 font-medium text-foreground">{{ order.testName }}</td>
                <td hlmTableCell class="py-3 px-4 font-mono text-muted-foreground">{{ order.loincCode || '4548-4' }}</td>
                <td hlmTableCell class="py-3 px-4">
                  <span *ngIf="order.specimenBarcode" class="font-mono text-[11px] bg-muted px-2 py-0.5 rounded border border-border">
                    {{ order.specimenBarcode }}
                  </span>
                  <span *ngIf="!order.specimenBarcode" class="text-muted-foreground/60 italic">Uncollected</span>
                </td>
                <td hlmTableCell class="py-3 px-4">
                  <span hlmBadge [variant]="getBadgeVariant(order.status)" class="text-[10px] uppercase font-bold">
                    {{ order.status }}
                  </span>
                </td>
                <td hlmTableCell class="py-3 px-4 text-right">
                  <button
                    *ngIf="order.status === 'ORDERED'"
                    hlmBtn
                    variant="outline"
                    size="xs"
                    (click)="openCollectModal(order)"
                    class="text-xs text-sky-600 dark:text-sky-400 gap-1"
                  >
                    <ng-icon name="lucideBarcode" class="text-xs"></ng-icon> Collect Specimen
                  </button>
                  <button
                    *ngIf="order.status === 'SPECIMEN_COLLECTED'"
                    hlmBtn
                    variant="secondary"
                    size="xs"
                    (click)="updateStatus(order, 'IN_PROCESS')"
                    class="text-xs text-purple-600 dark:text-purple-400"
                  >
                    Start In-Process
                  </button>
                  <button
                    *ngIf="order.status === 'IN_PROCESS'"
                    hlmBtn
                    variant="default"
                    size="xs"
                    (click)="openResultModal(order)"
                    class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Publish Result
                  </button>
                </td>
              </tr>
              <tr *ngIf="labOrders().length === 0" hlmTableRow>
                <td colspan="7" hlmTableCell class="py-12 text-center text-muted-foreground text-xs">No active laboratory orders found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Specimen Collection Modal -->
      <div *ngIf="isCollectModalOpen()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
          <h3 class="text-lg font-bold text-foreground">Collect Diagnostic Specimen</h3>
          <p class="text-xs text-muted-foreground">Log specimen container barcode for <strong>{{ activeOrder?.testName }}</strong>.</p>
          <div>
            <label class="block font-semibold text-xs mb-1">Specimen Barcode ID *</label>
            <input
              type="text"
              [(ngModel)]="barcodeInput"
              placeholder="e.g. BARCODE-LAB-8801"
              class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
            />
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button hlmBtn variant="outline" size="sm" (click)="isCollectModalOpen.set(false)">Cancel</button>
            <button hlmBtn size="sm" [disabled]="!barcodeInput" (click)="submitCollect()">Confirm Collection</button>
          </div>
        </div>
      </div>

      <!-- Result Entry Modal -->
      <div *ngIf="isResultModalOpen()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
          <h3 class="text-lg font-bold text-foreground">Publish Lab Result</h3>
          <div>
            <label class="block font-semibold text-xs mb-1">Parameter Name *</label>
            <input type="text" [(ngModel)]="resultParam" class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs" />
          </div>
          <div>
            <label class="block font-semibold text-xs mb-1">Result Value *</label>
            <input type="text" [(ngModel)]="resultVal" class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs" />
          </div>
          <div>
            <label class="block font-semibold text-xs mb-1">Unit</label>
            <input type="text" [(ngModel)]="resultUnit" placeholder="e.g. mg/dL, %" class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs" />
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button hlmBtn variant="outline" size="sm" (click)="isResultModalOpen.set(false)">Cancel</button>
            <button hlmBtn size="sm" [disabled]="!resultParam || !resultVal" (click)="submitResult()">Publish Result</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LabTechnicianWorklistComponent implements OnInit {
  labOrders = signal<any[]>([]);
  isCollectModalOpen = signal(false);
  isResultModalOpen = signal(false);
  activeOrder: any = null;
  barcodeInput = '';
  resultParam = 'HbA1c';
  resultVal = '6.8';
  resultUnit = '%';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.apiService.getLabOrdersList().subscribe({
      next: (data) => this.labOrders.set(data),
      error: (err) => {
        console.error('Failed to load lab orders:', err);
        this.labOrders.set([]);
        toast.error('Failed to load lab orders from server.');
      },
    });
  }

  getBadgeVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (status) {
      case 'ORDERED': return 'outline';
      case 'SPECIMEN_COLLECTED': return 'secondary';
      case 'IN_ANALYSIS':
      case 'IN_PROCESS': return 'default';
      case 'COMPLETED':
      case 'RESULTED': return 'secondary';
      default: return 'outline';
    }
  }

  openCollectModal(order: any): void {
    this.activeOrder = order;
    this.barcodeInput = `BARCODE-${order.id}`;
    this.isCollectModalOpen.set(true);
  }

  submitCollect(): void {
    if (!this.activeOrder || !this.barcodeInput) return;
    this.apiService.createSpecimen(this.activeOrder.id, {
      specimenBarcode: this.barcodeInput,
      specimenType: 'BLOOD',
    }).subscribe({ error: () => {} });

    this.apiService.updateLabOrderStatus(this.activeOrder.id, 'SPECIMEN_COLLECTED', this.barcodeInput).subscribe({
      next: () => {
        toast.success(`Specimen barcode ${this.barcodeInput} recorded. Status updated to SPECIMEN_COLLECTED.`);
        this.isCollectModalOpen.set(false);
        this.loadOrders();
      },
      error: () => toast.error('Failed to update specimen status.'),
    });
  }

  updateStatus(order: any, status: string): void {
    this.apiService.updateLabOrderStatus(order.id, status).subscribe({
      next: () => {
        toast.success(`Order status updated to ${status}.`);
        this.loadOrders();
      },
      error: () => toast.error('Failed to update order status.'),
    });
  }

  openResultModal(order: any): void {
    this.activeOrder = order;
    this.resultParam = order.testName;
    this.resultVal = 'Normal';
    this.resultUnit = '';
    this.isResultModalOpen.set(true);
  }

  submitResult(): void {
    if (!this.activeOrder) return;
    const body = {
      testCode: this.activeOrder.testCode || this.activeOrder.loincCode || 'LOINC-4548-4',
      testName: this.resultParam,
      resultValue: this.resultVal,
      unit: this.resultUnit,
      abnormalFlag: 'NORMAL',
    };
    this.apiService.addLabResult(this.activeOrder.id, body).subscribe({
      next: () => {
        this.apiService.updateLabOrderStatus(this.activeOrder.id, 'COMPLETED').subscribe({ error: () => {} });
        toast.success(`Lab result published for Order #LAB-${this.activeOrder.id}.`);
        this.isResultModalOpen.set(false);
        this.loadOrders();
      },
      error: () => toast.error('Failed to publish lab result.'),
    });
  }
}
