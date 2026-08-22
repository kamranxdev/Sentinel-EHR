import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import {
  InventoryItem,
  MedicationBatch,
  StockReceiptDTO,
  StockAdjustmentDTO,
} from '../../core/models/pharmacy.model';
import { toast } from '@spartan-ng/brain/sonner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBoxes,
  lucidePlus,
  lucideSearch,
  lucideRefreshCw,
  lucideAlertTriangle,
  lucideCheckCircle2,
  lucideCalendar,
  lucideMapPin,
  lucideIndianRupee,
  lucideX,
  lucidePill,
  lucideTag,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-pharmacist-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgIcon],
  providers: [
    provideIcons({
      lucideBoxes,
      lucidePlus,
      lucideSearch,
      lucideRefreshCw,
      lucideAlertTriangle,
      lucideCheckCircle2,
      lucideCalendar,
      lucideMapPin,
      lucideIndianRupee,
      lucideX,
      lucidePill,
      lucideTag,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div
        class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-border"
      >
        <div>
          <div class="flex items-center gap-2">
            <span
              class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 border border-purple-500/20"
            >
              Supply Chain & Logistics
            </span>
            <span class="text-xs text-muted-foreground font-mono"
              >Pharmaceutical Inventory & FEFO Batches</span
            >
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground mt-1">
            Medication Inventory & Batch Management
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Monitor inventory on hand, track physical batches and expiration dates, record
            shipments, and manage stock buffer thresholds.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            (click)="loadInventory()"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground transition-all"
          >
            <ng-icon name="lucideRefreshCw" size="14" [class.animate-spin]="loading()" />
            Refresh Inventory
          </button>

          <button
            (click)="showReceiveModal.set(true)"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-xs"
          >
            <ng-icon name="lucidePlus" size="14" />
            Receive Stock Batch
          </button>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="flex flex-col sm:flex-row justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <ng-icon
            name="lucideSearch"
            size="16"
            class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search medications by brand name, generic name, category..."
            class="w-full pl-10 pr-4 py-2 rounded-xl border border-input bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
        </div>

        <div class="flex items-center gap-2">
          <button
            (click)="selectedFilter.set('ALL')"
            [ngClass]="
              selectedFilter() === 'ALL'
                ? 'bg-purple-600 text-white'
                : 'bg-card text-muted-foreground hover:text-foreground'
            "
            class="px-3 py-1.5 rounded-lg text-xs font-medium border border-border transition-all"
          >
            All Items ({{ inventory().length }})
          </button>
          <button
            (click)="selectedFilter.set('LOW_STOCK')"
            [ngClass]="
              selectedFilter() === 'LOW_STOCK'
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-card text-destructive hover:bg-destructive/10'
            "
            class="px-3 py-1.5 rounded-lg text-xs font-medium border border-destructive/30 transition-all"
          >
            Low Stock Alerts ({{ lowStockCount() }})
          </button>
        </div>
      </div>

      <!-- Inventory Catalog Table -->
      <div class="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        
        <div *ngIf="loading()" class="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
          <ng-icon name="lucideRefreshCw" size="24" class="animate-spin text-indigo-500"></ng-icon>
          <p>Loading data...</p>
        </div>
        <div *ngIf="errorMessage()" class="p-4 m-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
          <ng-icon name="lucideAlertTriangle" size="16"></ng-icon>
          {{ errorMessage() }}
        </div>
        <div class="overflow-x-auto" *ngIf="!loading() && !errorMessage()">
          <table class="w-full text-left text-xs">
            <thead
              class="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider"
            >
              <tr>
                <th class="py-3 px-4">Medication & Strength</th>
                <th class="py-3 px-4">Dosage Form & Category</th>
                <th class="py-3 px-4">Stock on Hand</th>
                <th class="py-3 px-4">Reorder Level</th>
                <th class="py-3 px-4">Active Batches (FEFO Expiry)</th>
                <th class="py-3 px-4 text-right">Unit Price</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr
                *ngFor="let item of filteredInventory()"
                class="hover:bg-muted/30 transition-colors"
              >
                <td class="py-3.5 px-4 font-semibold text-foreground">
                  <div class="flex items-center gap-2">
                    <ng-icon name="lucidePill" size="16" class="text-purple-600 shrink-0" />
                    <div>
                      <div class="font-bold">{{ item.medicationName }}</div>
                      <div class="text-[11px] font-normal text-muted-foreground">
                        {{ item.genericName }} &bull; {{ item.strength }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="py-3.5 px-4 text-muted-foreground">
                  <div>{{ item.dosageForm }}</div>
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-semibold bg-secondary text-secondary-foreground"
                  >
                    {{ item.category }}
                  </span>
                </td>
                <td class="py-3.5 px-4">
                  <span
                    [ngClass]="
                      item.totalQuantityOnHand <= item.reorderLevel
                        ? 'text-destructive font-bold'
                        : 'text-foreground font-semibold'
                    "
                    class="font-mono text-sm"
                  >
                    {{ item.totalQuantityOnHand }} {{ item.unitOfMeasure }}
                  </span>
                </td>
                <td class="py-3.5 px-4 font-mono text-muted-foreground">
                  {{ item.reorderLevel }} units
                </td>
                <td class="py-3.5 px-4">
                  <div class="space-y-1">
                    <div
                      *ngFor="let b of item.batches"
                      class="text-[11px] font-mono flex items-center gap-2"
                    >
                      <span class="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground"
                        >#{{ b.batchNumber }}</span
                      >
                      <span class="text-muted-foreground">Exp: {{ b.expiryDate }}</span>
                      <span class="text-emerald-600 font-semibold"
                        >({{ b.quantityOnHand }} units)</span
                      >
                      <span class="text-[10px] text-muted-foreground">[{{ b.location }}]</span>
                    </div>
                    <div
                      *ngIf="!item.batches || item.batches.length === 0"
                      class="text-muted-foreground text-[11px] italic"
                    >
                      No active batches
                    </div>
                  </div>
                </td>
                <td class="py-3.5 px-4 text-right font-mono font-bold text-foreground">
                  ₹{{ item.unitPrice | number: '1.2-2' }}
                </td>
              </tr>

              <tr *ngIf="filteredInventory().length === 0 && !loading() && !errorMessage()">
                <td colspan="6" class="py-8 text-center text-muted-foreground text-xs">
                  No medications found matching search criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Receive Stock Batch Modal -->
      <div
        *ngIf="showReceiveModal()"
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div
          class="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
        >
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-base font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideBoxes" size="18" class="text-purple-600" />
              Receive New Medication Batch Shipment
            </h3>
            <button
              (click)="showReceiveModal.set(false)"
              class="p-1 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-foreground mb-1">Medication Name *</label>
              <input
                type="text"
                [(ngModel)]="receiveForm.medicationName"
                placeholder="e.g. Amoxicillin Trihydrate 500mg"
                class="w-full px-3 py-2 rounded-lg border border-input bg-background"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-foreground mb-1">Batch Number *</label>
                <input
                  type="text"
                  [(ngModel)]="receiveForm.batchNumber"
                  placeholder="e.g. BAT-2026-X9"
                  class="w-full px-3 py-2 rounded-lg border border-input bg-background font-mono uppercase"
                />
              </div>
              <div>
                <label class="block font-semibold text-foreground mb-1">Expiration Date *</label>
                <input
                  type="date"
                  [(ngModel)]="receiveForm.expiryDate"
                  class="w-full px-3 py-2 rounded-lg border border-input bg-background font-mono"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-foreground mb-1">Quantity Received *</label>
                <input
                  type="number"
                  [(ngModel)]="receiveForm.quantity"
                  class="w-full px-3 py-2 rounded-lg border border-input bg-background font-mono"
                />
              </div>
              <div>
                <label class="block font-semibold text-foreground mb-1">Unit Cost Price ($)</label>
                <input
                  type="number"
                  [(ngModel)]="receiveForm.unitPrice"
                  class="w-full px-3 py-2 rounded-lg border border-input bg-background font-mono"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-foreground mb-1">Manufacturer</label>
                <input
                  type="text"
                  [(ngModel)]="receiveForm.manufacturer"
                  placeholder="e.g. Sun Pharma"
                  class="w-full px-3 py-2 rounded-lg border border-input bg-background"
                />
              </div>
              <div>
                <label class="block font-semibold text-foreground mb-1"
                  >Storage Shelf Location</label
                >
                <input
                  type="text"
                  [(ngModel)]="receiveForm.location"
                  placeholder="e.g. Shelf A-2"
                  class="w-full px-3 py-2 rounded-lg border border-input bg-background font-mono"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              (click)="showReceiveModal.set(false)"
              class="px-4 py-2 rounded-lg border border-border text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              (click)="submitReceiveStock()"
              [disabled]="!receiveForm.medicationName || !receiveForm.batchNumber"
              class="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              Record Stock Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PharmacistInventoryComponent implements OnInit {
  inventory = signal<InventoryItem[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  searchQuery = signal('');
  selectedFilter = signal<'ALL' | 'LOW_STOCK'>('ALL');
  showReceiveModal = signal(false);

  receiveForm: StockReceiptDTO = {
    medicationName: '',
    batchNumber: '',
    manufacturer: '',
    expiryDate: '2027-12-31',
    quantity: 100,
    unitPrice: 15.0,
    location: 'Shelf A-1',
  };

  lowStockCount = computed(
    () => this.inventory().filter((i) => i.totalQuantityOnHand <= i.reorderLevel).length,
  );

  filteredInventory = computed(() => {
    let list = this.inventory();
    const filter = this.selectedFilter();
    const q = this.searchQuery().toLowerCase().trim();

    if (filter === 'LOW_STOCK') {
      list = list.filter((i) => i.totalQuantityOnHand <= i.reorderLevel);
    }

    if (q) {
      list = list.filter(
        (i) =>
          i.medicationName.toLowerCase().includes(q) ||
          (i.genericName || '').toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q),
      );
    }

    return list;
  });

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadInventory();
  }

  loadInventory(): void {
    this.loading.set(true);
    this.apiService.getPharmacyInventory().subscribe({
      next: (inv: InventoryItem[]) => {
        this.inventory.set(inv);
        this.loading.set(false);
      },
      error: (err) => { this.errorMessage.set(err.message || 'Failed'); this.loading.set(false); },
    });
  }

  submitReceiveStock(): void {
    this.apiService.receiveStockBatch(this.receiveForm).subscribe({
      next: () => {
        toast.success(
          `Received ${this.receiveForm.quantity} units of ${this.receiveForm.medicationName}.`,
        );
        this.showReceiveModal.set(false);
        this.loadInventory();
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Failed');
        this.loading.set(false);
      },
    });
  }
}
