import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { MedicationOrder, InventoryItem, MedicationBatch } from '../../core/models/pharmacy.model';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucidePill,
  lucideListChecks,
  lucideShieldCheck,
  lucideAlertTriangle,
  lucideRefreshCw,
  lucideCheckCircle2,
  lucideXCircle,
  lucideClock,
  lucideArrowRight,
  lucideBoxes,
  lucideCalendar,
  lucideActivity,
  lucideDollarSign,
  lucideSparkles,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-pharmacist-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HlmCardImports, HlmBadgeImports, HlmButtonImports, NgIcon],
  providers: [
    provideIcons({
      lucidePill,
      lucideListChecks,
      lucideShieldCheck,
      lucideAlertTriangle,
      lucideRefreshCw,
      lucideCheckCircle2,
      lucideXCircle,
      lucideClock,
      lucideArrowRight,
      lucideBoxes,
      lucideCalendar,
      lucideActivity,
      lucideDollarSign,
      lucideSparkles,
    }),
  ],
  template: `
    <div class="space-y-6 font-sans">
      <!-- Header -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border"
      >
        <div class="flex items-center gap-4">
          <div
            class="size-12 rounded-xl bg-gradient-to-br from-indigo-500/20 via-indigo-500/10 to-indigo-500/5 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-500/20 shadow-xs"
          >
            <ng-icon name="lucidePill" size="26" />
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-xl font-bold tracking-tight text-foreground">
                Clinical Pharmacy Command Center
              </h1>
              <span
                hlmBadge
                variant="secondary"
                class="text-[10px] uppercase font-mono tracking-wider bg-indigo-500/10 text-indigo-600 border-indigo-500/30"
              >
                CLINICAL PHARMACIST
              </span>
            </div>
            <p class="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
              <span class="inline-flex items-center gap-1.5 text-emerald-500 font-semibold">
                <span class="relative flex size-2">
                  <span
                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                  ></span>
                  <span class="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                </span>
                eRx Dispensation Engine Active
              </span>
              <span>•</span>
              <span
                >Prescription safety verification, drug-drug interaction screening, batch
                dispensing, & inventory control</span
              >
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            (click)="loadData()"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground transition-all"
          >
            <ng-icon name="lucideRefreshCw" size="14" [class.animate-spin]="loading()" />
            <span>Refresh Queue</span>
          </button>
          <a
            routerLink="/pharmacist/erx"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xs"
          >
            <ng-icon name="lucideListChecks" size="14" />
            <span>Verification Queue ({{ pendingVerificationCount() }})</span>
          </a>
        </div>
      </div>

      <!-- Pharmacy KPI Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Pending Verification -->
        <a
          routerLink="/pharmacist/erx"
          class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-amber-500/40 transition-all group"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >Pending Review</span
            >
            <div
              class="size-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform"
            >
              <ng-icon name="lucideClock" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-amber-600 font-mono">
              {{ pendingVerificationCount() }}
            </div>
            <span class="text-[11px] font-medium text-amber-600 font-mono">Requires Sign-off</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Safety & allergy checks pending</p>
        </a>

        <!-- Ready to Dispense -->
        <a
          routerLink="/pharmacist/dispense"
          class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-indigo-500/40 transition-all group"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >Ready to Dispense</span
            >
            <div
              class="size-9 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform"
            >
              <ng-icon name="lucidePill" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-indigo-600 font-mono">
              {{ verifiedOrdersCount() }}
            </div>
            <span class="text-[11px] font-medium text-indigo-600 font-mono">Verified Orders</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Batch selection & MAR logging</p>
        </a>

        <!-- Low Stock Items -->
        <a
          routerLink="/pharmacist/inventory"
          class="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-destructive/40 transition-all group"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >Low Stock Alert</span
            >
            <div
              class="size-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center group-hover:scale-105 transition-transform"
            >
              <ng-icon name="lucideAlertTriangle" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-destructive font-mono">{{ lowStockCount() }}</div>
            <span class="text-[11px] font-medium text-destructive font-mono">Reorder Needed</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Below safety buffer threshold</p>
        </a>

        <!-- Dispensed Today -->
        <div class="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >Dispensed Today</span
            >
            <div
              class="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center"
            >
              <ng-icon name="lucideCheckCircle2" size="18" />
            </div>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <div class="text-2xl font-bold text-emerald-600 font-mono">{{ dispensedCount() }}</div>
            <span class="text-[11px] font-medium text-emerald-600 font-mono">Completed</span>
          </div>
          <p class="text-[10px] text-muted-foreground mt-1">Charges triggered automatically</p>
        </div>
      </div>

      <!-- Quick Action Workspaces -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <!-- Prescription Verification -->
        <a
          routerLink="/pharmacist/erx"
          class="p-5 rounded-xl border border-border bg-card hover:border-indigo-500/50 transition-all duration-300 space-y-4 flex flex-col justify-between group shadow-xs"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div
                class="size-10 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors"
              >
                <ng-icon name="lucideListChecks" size="20" />
              </div>
              <span
                class="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1"
              >
                Open Queue <ng-icon name="lucideArrowRight" size="14" />
              </span>
            </div>
            <div>
              <h3
                class="text-base font-semibold text-foreground group-hover:text-indigo-600 transition-colors"
              >
                Prescription Verification & Safety
              </h3>
              <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
                Review inpatient and outpatient medication orders with automated allergy checks,
                drug-drug interaction warnings, and 3-way decisioning (Approve, Clarify, Reject).
              </p>
            </div>
          </div>
          <div class="pt-3 border-t border-border flex items-center justify-between text-xs">
            <span class="text-muted-foreground font-mono"
              >Pending: {{ pendingVerificationCount() }}</span
            >
            <span class="font-semibold text-indigo-600">Verification Gate</span>
          </div>
        </a>

        <!-- Dispensing Station -->
        <a
          routerLink="/pharmacist/dispense"
          class="p-5 rounded-xl border border-border bg-card hover:border-emerald-500/50 transition-all duration-300 space-y-4 flex flex-col justify-between group shadow-xs"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div
                class="size-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors"
              >
                <ng-icon name="lucidePill" size="20" />
              </div>
              <span
                class="text-xs font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1"
              >
                Dispense Hub <ng-icon name="lucideArrowRight" size="14" />
              </span>
            </div>
            <div>
              <h3
                class="text-base font-semibold text-foreground group-hover:text-emerald-600 transition-colors"
              >
                Medication Dispensing & MAR
              </h3>
              <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
                Dispense verified prescriptions by selecting active medication batch (FEFO/FIFO),
                auto-deducting physical stock, and dispatching billable charges to Revenue Cycle.
              </p>
            </div>
          </div>
          <div class="pt-3 border-t border-border flex items-center justify-between text-xs">
            <span class="text-muted-foreground font-mono"
              >Verified: {{ verifiedOrdersCount() }}</span
            >
            <span class="font-semibold text-emerald-600">Batch Deduction Active</span>
          </div>
        </a>

        <!-- Inventory & Batches -->
        <a
          routerLink="/pharmacist/inventory"
          class="p-5 rounded-xl border border-border bg-card hover:border-purple-500/50 transition-all duration-300 space-y-4 flex flex-col justify-between group shadow-xs"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div
                class="size-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors"
              >
                <ng-icon name="lucideBoxes" size="20" />
              </div>
              <span
                class="text-xs font-semibold text-purple-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1"
              >
                View Stock <ng-icon name="lucideArrowRight" size="14" />
              </span>
            </div>
            <div>
              <h3
                class="text-base font-semibold text-foreground group-hover:text-purple-600 transition-colors"
              >
                Inventory, Batches & Expiry
              </h3>
              <p class="text-xs text-muted-foreground mt-1 leading-relaxed">
                Track pharmaceutical stock levels, batch numbers, manufacturer details, shelf
                storage locations, expiry dates, and receive/adjust stock shipments.
              </p>
            </div>
          </div>
          <div class="pt-3 border-t border-border flex items-center justify-between text-xs">
            <span class="text-muted-foreground font-mono"
              >Catalog: {{ inventory().length }} items</span
            >
            <span class="font-semibold text-purple-600">FEFO Tracking</span>
          </div>
        </a>
      </div>

      <!-- Active Pending Orders Quick View -->
      <div class="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        <div class="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideClock" size="16" class="text-amber-500" />
              Prescriptions Requiring Verification
            </h2>
            <p class="text-xs text-muted-foreground">
              Physician medication orders awaiting clinical pharmacist sign-off.
            </p>
          </div>
          <a
            routerLink="/pharmacist/erx"
            class="text-xs font-semibold text-indigo-600 hover:underline"
          >
            View All in Verification Queue &rarr;
          </a>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead
              class="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider"
            >
              <tr>
                <th class="py-3 px-4">Medication & Dosage</th>
                <th class="py-3 px-4">Patient / MRN</th>
                <th class="py-3 px-4">Route & Frequency</th>
                <th class="py-3 px-4">Ordered At</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr
                *ngFor="let order of pendingOrders().slice(0, 5)"
                class="hover:bg-muted/30 transition-colors"
              >
                <td class="py-3.5 px-4 font-semibold text-foreground">
                  <div class="flex items-center gap-2">
                    <ng-icon name="lucidePill" size="16" class="text-indigo-600 shrink-0" />
                    <div>
                      <div>{{ order.medicationName }}</div>
                      <div class="text-[11px] font-normal text-muted-foreground">
                        {{ order.dosage }} &bull; Qty: {{ order.quantity }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="py-3.5 px-4">
                  <div class="font-medium text-foreground">
                    {{ order.patient?.fullName || 'Patient' }}
                  </div>
                  <div class="text-[10px] font-mono text-muted-foreground">
                    {{ order.patient?.patientCode || order.patientId }}
                  </div>
                </td>
                <td class="py-3.5 px-4 text-muted-foreground">
                  <div>{{ order.route }} &bull; {{ order.frequency }}</div>
                  <div class="text-[10px]">
                    {{ order.instructions || 'Standard administration' }}
                  </div>
                </td>
                <td class="py-3.5 px-4 font-mono text-muted-foreground text-[11px]">
                  {{ order.orderedAt | date: 'short' }}
                </td>
                <td class="py-3.5 px-4">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 border border-amber-500/30"
                  >
                    PENDING VERIFICATION
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <a
                    routerLink="/pharmacist/erx"
                    class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all inline-flex items-center gap-1"
                  >
                    Review
                  </a>
                </td>
              </tr>

              <tr *ngIf="pendingOrders().length === 0">
                <td colspan="6" class="py-6 text-center text-muted-foreground text-xs">
                  No pending prescription orders. All queues clear!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class PharmacistDashboardComponent implements OnInit {
  orders = signal<MedicationOrder[]>([]);
  inventory = signal<InventoryItem[]>([]);
  loading = signal(false);

  pendingOrders = computed(() =>
    this.orders().filter(
      (o) =>
        o.status === 'PENDING_VERIFICATION' || o.status === 'PRESCRIBED' || o.status === 'ORDERED',
    ),
  );
  pendingVerificationCount = computed(() => this.pendingOrders().length);

  verifiedOrdersCount = computed(
    () =>
      this.orders().filter((o) => o.status === 'PHARMACY_VERIFIED' || o.status === 'VERIFIED')
        .length,
  );

  dispensedCount = computed(() => this.orders().filter((o) => o.status === 'DISPENSED').length);

  lowStockCount = computed(
    () => this.inventory().filter((i) => i.totalQuantityOnHand <= i.reorderLevel).length,
  );

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.apiService.getPharmacyMedicationOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.apiService.getPharmacyInventory().subscribe({
      next: (inv: InventoryItem[]) => this.inventory.set(inv),
      error: () => {},
    });
  }
}
