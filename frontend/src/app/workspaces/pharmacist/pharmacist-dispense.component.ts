import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import {
  MedicationOrder,
  MedicationBatch,
  DispensationRecord,
} from '../../core/models/pharmacy.model';
import { toast } from '@spartan-ng/brain/sonner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucidePill,
  lucideShieldCheck,
  lucideBoxes,
  lucideSearch,
  lucideRefreshCw,
  lucideCheckCircle2,
  lucideClock,
  lucideX,
  lucideDollarSign,
  lucideFileText,
  lucideUser,
  lucideTag,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-pharmacist-dispense',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgIcon],
  providers: [
    provideIcons({
      lucidePill,
      lucideShieldCheck,
      lucideBoxes,
      lucideSearch,
      lucideRefreshCw,
      lucideCheckCircle2,
      lucideClock,
      lucideX,
      lucideDollarSign,
      lucideFileText,
      lucideUser,
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
              class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
            >
              Fulfillment & MAR
            </span>
            <span class="text-xs text-muted-foreground font-mono"
              >Medication Dispensing & Stock Allocation</span
            >
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground mt-1">
            Medication Dispensation Station
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Select physical medication batch (FEFO), deduct pharmaceutical inventory, and dispatch
            billable medication charges.
          </p>
        </div>

        <button
          (click)="loadData()"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground transition-all"
        >
          <ng-icon name="lucideRefreshCw" size="14" [class.animate-spin]="loading()" />
          Refresh Dispense Queue
        </button>
      </div>

      <!-- Ready to Dispense Orders List -->
      <div class="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        <div
          class="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
        >
          <div>
            <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideShieldCheck" size="16" class="text-emerald-600" />
              Verified Prescriptions Ready for Dispensing
            </h2>
            <p class="text-xs text-muted-foreground">
              Orders verified by clinical pharmacist awaiting physical batch fulfillment.
            </p>
          </div>

          <div class="relative w-full sm:w-72">
            <ng-icon
              name="lucideSearch"
              size="14"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search verified orders..."
              class="w-full pl-9 pr-3 py-1.5 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
        </div>

        
        <div *ngIf="loading()" class="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
          <ng-icon name="lucideRefreshCw" size="24" class="animate-spin text-indigo-500"></ng-icon>
          <p>Loading data...</p>
        </div>
        <div *ngIf="errorMessage()" class="p-4 m-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
          <ng-icon name="lucideAlertTriangle" size="16"></ng-icon>
          {{ errorMessage() }}
        </div>
        <div class="overflow-x-auto" *ngIf="!loading() && !errorMessage()">
          <table class="w-full text-xs text-left">
            <thead
              class="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider"
            >
              <tr>
                <th class="py-3 px-4">Medication & Dosage</th>
                <th class="py-3 px-4">Patient / MRN</th>
                <th class="py-3 px-4">Quantity to Dispense</th>
                <th class="py-3 px-4">Route / Frequency</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Fulfillment</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr
                *ngFor="let o of filteredVerifiedOrders()"
                class="hover:bg-muted/30 transition-colors"
              >
                <td class="py-3.5 px-4 font-semibold text-foreground">
                  <div class="flex items-center gap-2">
                    <ng-icon name="lucidePill" size="16" class="text-emerald-600 shrink-0" />
                    <div>
                      <div>{{ o.medicationName }}</div>
                      <div class="text-[11px] font-normal text-muted-foreground">
                        {{ o.dosage }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="py-3.5 px-4">
                  <div class="font-medium text-foreground">
                    {{ o.patient?.fullName || 'Patient' }}
                  </div>
                  <div class="text-[10px] font-mono text-muted-foreground">
                    MRN: {{ o.patient?.patientCode || o.patientId }}
                  </div>
                </td>
                <td class="py-3.5 px-4 font-bold text-foreground font-mono">
                  {{ o.quantity }} units
                </td>
                <td class="py-3.5 px-4 text-muted-foreground">
                  {{ o.route }} &bull; {{ o.frequency }}
                </td>
                <td class="py-3.5 px-4">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                  >
                    VERIFIED & APPROVED
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <button
                    (click)="openDispenseModal(o)"
                    class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all inline-flex items-center gap-1 shadow-xs"
                  >
                    <ng-icon name="lucidePill" size="13" />
                    Dispense & Charge
                  </button>
                </td>
              </tr>

              <tr *ngIf="filteredVerifiedOrders().length === 0 && !loading() && !errorMessage()">
                <td colspan="6" class="py-8 text-center text-muted-foreground text-xs">
                  No verified prescriptions currently waiting for dispensing.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Dispense Modal -->
      <div
        *ngIf="selectedOrder()"
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div
          class="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
        >
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-base font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucidePill" size="18" class="text-emerald-600" />
              Dispense Medication: {{ selectedOrder()?.medicationName }}
            </h3>
            <button
              (click)="selectedOrder.set(null)"
              class="p-1 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3.5 text-xs">
            <div class="p-3 bg-muted/40 rounded-xl space-y-1 text-[11px] font-mono">
              <div>
                <strong>Patient:</strong> {{ selectedOrder()?.patient?.fullName }} (MRN:
                {{ selectedOrder()?.patient?.patientCode }})
              </div>
              <div>
                <strong>Dosage & Frequency:</strong> {{ selectedOrder()?.dosage }} &bull;
                {{ selectedOrder()?.frequency }}
              </div>
              <div><strong>Prescribed Quantity:</strong> {{ selectedOrder()?.quantity }} units</div>
            </div>

            <!-- Batch Selection -->
            <div>
              <label class="block font-semibold text-foreground mb-1"
                >Select Physical Stock Batch (FEFO First-Expiring) *</label
              >
              <select
                [(ngModel)]="dispenseForm.batchId"
                class="w-full px-3 py-2 rounded-lg border border-input bg-background font-mono text-xs"
              >
                <option *ngFor="let b of batches()" [value]="b.id">
                  Batch #{{ b.batchNumber }} - Exp: {{ b.expiryDate }} (Avail:
                  {{ b.quantityOnHand }} units) [{{ b.location }}]
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-foreground mb-1">Quantity Dispensed *</label>
                <input
                  type="number"
                  [(ngModel)]="dispenseForm.quantity"
                  class="w-full px-3 py-2 rounded-lg border border-input bg-background font-mono"
                />
              </div>
              <div>
                <label class="block font-semibold text-foreground mb-1"
                  >Automated Charge Trigger</label
                >
                <div
                  class="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-semibold font-mono text-[11px] flex items-center gap-1"
                >
                  <ng-icon name="lucideDollarSign" size="13" />
                  Auto-Bill Account
                </div>
              </div>
            </div>

            <div>
              <label class="block font-semibold text-foreground mb-1"
                >Dispensation Instructions / Note</label
              >
              <input
                type="text"
                [(ngModel)]="dispenseForm.notes"
                placeholder="e.g. Take with meals. Patient instructed on adverse symptoms."
                class="w-full px-3 py-2 rounded-lg border border-input bg-background"
              />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              (click)="selectedOrder.set(null)"
              class="px-4 py-2 rounded-lg border border-border text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              (click)="submitDispense()"
              class="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Confirm Dispensation
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PharmacistDispenseComponent implements OnInit {
  orders = signal<MedicationOrder[]>([]);
  batches = signal<MedicationBatch[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  searchQuery = signal('');
  selectedOrder = signal<MedicationOrder | null>(null);

  dispenseForm = {
    batchId: '',
    quantity: 30,
    notes: 'Dispensed as prescribed. Patient counselled.',
  };

  filteredVerifiedOrders = computed(() => {
    let list = this.orders().filter(
      (o) => o.status === 'PHARMACY_VERIFIED' || o.status === 'VERIFIED',
    );
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(
        (o) =>
          o.medicationName.toLowerCase().includes(q) ||
          (o.patient?.fullName || '').toLowerCase().includes(q) ||
          (o.patient?.patientCode || '').toLowerCase().includes(q),
      );
    }
    return list;
  });

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.apiService.getPharmacyMedicationOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: (err) => { this.errorMessage.set(err.message || 'Failed'); this.loading.set(false); },
    });

    this.apiService.getMedicationBatches().subscribe({
      next: (b: MedicationBatch[]) => this.batches.set(b),
      error: (err) => { this.errorMessage.set(err.message || 'Failed'); },
    });
  }

  openDispenseModal(o: MedicationOrder): void {
    this.selectedOrder.set(o);
    this.dispenseForm.quantity = o.quantity || 30;
    const availBatches = this.batches();
    if (availBatches.length > 0) {
      this.dispenseForm.batchId = availBatches[0].id;
    }
  }

  submitDispense(): void {
    const o = this.selectedOrder();
    if (!o) return;
    this.apiService.dispensePharmacyOrder(o.id, this.dispenseForm).subscribe({
      next: () => {
        toast.success(
          `Medication ${o.medicationName} dispensed successfully. Stock deducted & billable charge created.`,
        );
        o.status = 'DISPENSED';
        this.selectedOrder.set(null);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Failed');
      },
    });
  }
}
