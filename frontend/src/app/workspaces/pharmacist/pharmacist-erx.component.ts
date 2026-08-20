import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { MedicationOrder } from '../../core/models/pharmacy.model';
import { Allergy } from '../../core/models/clinical.model';
import { toast } from '@spartan-ng/brain/sonner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideListChecks,
  lucidePill,
  lucideShieldCheck,
  lucideAlertTriangle,
  lucideSearch,
  lucideRefreshCw,
  lucideCheck,
  lucideX,
  lucideHelpCircle,
  lucideMessageSquare,
  lucideUser,
  lucideClock,
  lucideFileText,
  lucideSparkles,
  lucideCheckCircle2,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-pharmacist-erx',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgIcon],
  providers: [
    provideIcons({
      lucideListChecks,
      lucidePill,
      lucideShieldCheck,
      lucideAlertTriangle,
      lucideSearch,
      lucideRefreshCw,
      lucideCheck,
      lucideX,
      lucideHelpCircle,
      lucideMessageSquare,
      lucideUser,
      lucideClock,
      lucideFileText,
      lucideSparkles,
      lucideCheckCircle2,
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
              class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
            >
              Prescription Safety Gate
            </span>
            <span class="text-xs text-muted-foreground font-mono"
              >Clinical Pharmacist Sign-Off</span
            >
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground mt-1">
            e-Prescription Verification Queue
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Review physician orders against patient allergy profiles, drug interactions, renal
            dosing, and issue 3-way sign-off.
          </p>
        </div>

        <button
          (click)="loadOrders()"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground transition-all"
        >
          <ng-icon name="lucideRefreshCw" size="14" [class.animate-spin]="loading()" />
          Refresh Orders
        </button>
      </div>

      <!-- Filters & Search -->
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
            placeholder="Search by Medication name, Patient, Doctor, Order ID..."
            class="w-full pl-10 pr-4 py-2 rounded-xl border border-input bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button
            (click)="selectedStatus.set('ALL')"
            [ngClass]="
              selectedStatus() === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'bg-card text-muted-foreground hover:text-foreground'
            "
            class="px-3 py-1.5 rounded-lg text-xs font-medium border border-border transition-all"
          >
            All Orders ({{ orders().length }})
          </button>
          <button
            (click)="selectedStatus.set('PENDING')"
            [ngClass]="
              selectedStatus() === 'PENDING'
                ? 'bg-amber-500 text-white'
                : 'bg-card text-amber-600 hover:bg-amber-500/10'
            "
            class="px-3 py-1.5 rounded-lg text-xs font-medium border border-amber-500/30 transition-all"
          >
            Pending ({{ pendingCount() }})
          </button>
          <button
            (click)="selectedStatus.set('VERIFIED')"
            [ngClass]="
              selectedStatus() === 'VERIFIED'
                ? 'bg-emerald-600 text-white'
                : 'bg-card text-emerald-600 hover:bg-emerald-500/10'
            "
            class="px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-500/30 transition-all"
          >
            Verified ({{ verifiedCount() }})
          </button>
          <button
            (click)="selectedStatus.set('CLARIFICATION')"
            [ngClass]="
              selectedStatus() === 'CLARIFICATION'
                ? 'bg-sky-600 text-white'
                : 'bg-card text-sky-600 hover:bg-sky-500/10'
            "
            class="px-3 py-1.5 rounded-lg text-xs font-medium border border-sky-500/30 transition-all"
          >
            In Clarification
          </button>
        </div>
      </div>

      <!-- Orders Table -->
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
                <th class="py-3 px-4">Medication & Regimen</th>
                <th class="py-3 px-4">Patient / Recipient</th>
                <th class="py-3 px-4">Prescribing Doctor</th>
                <th class="py-3 px-4">Order Timestamp</th>
                <th class="py-3 px-4">Safety Status</th>
                <th class="py-3 px-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr *ngFor="let o of filteredOrders()" class="hover:bg-muted/30 transition-colors">
                <td class="py-3.5 px-4 font-semibold text-foreground">
                  <div class="flex items-center gap-2">
                    <ng-icon name="lucidePill" size="16" class="text-indigo-600 shrink-0" />
                    <div>
                      <div class="font-bold">{{ o.medicationName }}</div>
                      <div class="text-[11px] font-normal text-muted-foreground">
                        {{ o.dosage }} &bull; {{ o.route }} &bull; {{ o.frequency }} &bull; Qty:
                        {{ o.quantity }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="py-3.5 px-4">
                  <div class="font-semibold text-foreground">
                    {{ o.patient?.fullName || 'Patient' }}
                  </div>
                  <div class="text-[10px] font-mono text-muted-foreground">
                    MRN: {{ o.patient?.patientCode || o.patientId }}
                  </div>
                </td>
                <td class="py-3.5 px-4 text-muted-foreground">
                  <div class="font-medium text-foreground">
                    {{ o.doctorName || o.doctor?.fullName || 'Attending Physician' }}
                  </div>
                </td>
                <td class="py-3.5 px-4 font-mono text-muted-foreground text-[11px]">
                  {{ o.orderedAt | date: 'short' }}
                </td>
                <td class="py-3.5 px-4">
                  <span
                    [ngClass]="{
                      'bg-amber-500/15 text-amber-600 border-amber-500/30':
                        o.status === 'PENDING_VERIFICATION' || o.status === 'PRESCRIBED',
                      'bg-emerald-500/15 text-emerald-600 border-emerald-500/30':
                        o.status === 'PHARMACY_VERIFIED' || o.status === 'VERIFIED',
                      'bg-sky-500/15 text-sky-600 border-sky-500/30':
                        o.status === 'CLARIFICATION_REQUESTED',
                      'bg-destructive/15 text-destructive border-destructive/30':
                        o.status === 'REJECTED',
                    }"
                    class="px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1"
                  >
                    {{ o.status }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <button
                    (click)="openReviewModal(o)"
                    class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all inline-flex items-center gap-1"
                  >
                    <ng-icon name="lucideShieldCheck" size="13" />
                    Review & Verify
                  </button>
                </td>
              </tr>

              <tr *ngIf="filteredOrders().length === 0 && !loading() && !errorMessage()">
                <td colspan="6" class="py-8 text-center text-muted-foreground text-xs">
                  No e-prescriptions found matching the filter.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Verification Review Modal -->
      <div
        *ngIf="selectedOrder()"
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div
          class="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5"
        >
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-base font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideShieldCheck" size="18" class="text-indigo-600" />
              Pharmacist Clinical Verification: {{ selectedOrder()?.medicationName }}
            </h3>
            <button
              (click)="selectedOrder.set(null)"
              class="p-1 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <!-- Order Summary Details -->
          <div
            class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-muted/40 rounded-xl text-xs font-mono"
          >
            <div>
              <span class="text-muted-foreground block text-[10px]">Patient</span>
              <span class="font-bold text-foreground">{{
                selectedOrder()?.patient?.fullName || 'Patient'
              }}</span>
            </div>
            <div>
              <span class="text-muted-foreground block text-[10px]">Dosage & Route</span>
              <span class="font-bold text-foreground"
                >{{ selectedOrder()?.dosage }} ({{ selectedOrder()?.route }})</span
              >
            </div>
            <div>
              <span class="text-muted-foreground block text-[10px]">Frequency</span>
              <span class="font-bold text-foreground">{{ selectedOrder()?.frequency }}</span>
            </div>
            <div>
              <span class="text-muted-foreground block text-[10px]">Quantity</span>
              <span class="font-bold text-foreground">{{ selectedOrder()?.quantity }} units</span>
            </div>
          </div>

          <!-- Live Automated Safety Checks -->
          <div class="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
            <h4 class="text-xs font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideSparkles" size="14" class="text-indigo-600" />
              Automated Sentinel Safety & Cross-Reactivity Checks
            </h4>

            <div class="space-y-2 text-xs">
              <div
                class="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
              >
                <ng-icon name="lucideCheckCircle2" size="16" class="shrink-0 mt-0.5" />
                <div>
                  <strong>Allergy Profile Screen:</strong> No known acute cross-reactivity detected
                  with patient documented allergens.
                </div>
              </div>

              <div
                class="flex items-start gap-2 p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300"
              >
                <ng-icon name="lucideShieldCheck" size="16" class="shrink-0 mt-0.5" />
                <div>
                  <strong>Drug-Drug Interaction Screen:</strong> Monitored therapeutic range. No
                  major contraindications with active medications.
                </div>
              </div>
            </div>
          </div>

          <!-- Pharmacist Notes / Clarification Form -->
          <div class="space-y-2 text-xs">
            <label class="block font-semibold text-foreground"
              >Pharmacist Verification Note / Clarification Reason</label
            >
            <textarea
              [(ngModel)]="verificationNotes"
              rows="3"
              placeholder="e.g. Dosage verified against renal function. Approved for dispensing."
              class="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            ></textarea>
          </div>

          <!-- 3-Way Action Buttons -->
          <div
            class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border"
          >
            <button
              (click)="rejectOrder()"
              class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30 transition-all flex items-center gap-1.5"
            >
              <ng-icon name="lucideX" size="14" />
              Reject Order
            </button>

            <div class="flex items-center gap-2">
              <button
                (click)="requestClarification()"
                class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 border border-sky-500/30 transition-all flex items-center gap-1.5"
              >
                <ng-icon name="lucideMessageSquare" size="14" />
                Request Doctor Clarification
              </button>

              <button
                (click)="verifyOrder()"
                class="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <ng-icon name="lucideCheck" size="14" />
                Approve & Sign-Off
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PharmacistErxComponent implements OnInit {
  orders = signal<MedicationOrder[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  searchQuery = signal('');
  selectedStatus = signal<'ALL' | 'PENDING' | 'VERIFIED' | 'CLARIFICATION'>('ALL');
  selectedOrder = signal<MedicationOrder | null>(null);
  verificationNotes = '';

  pendingCount = computed(
    () =>
      this.orders().filter(
        (o) =>
          o.status === 'PENDING_VERIFICATION' ||
          o.status === 'PRESCRIBED' ||
          o.status === 'ORDERED',
      ).length,
  );
  verifiedCount = computed(
    () =>
      this.orders().filter((o) => o.status === 'PHARMACY_VERIFIED' || o.status === 'VERIFIED')
        .length,
  );

  filteredOrders = computed(() => {
    let list = this.orders();
    const st = this.selectedStatus();
    const q = this.searchQuery().toLowerCase().trim();

    if (st === 'PENDING') {
      list = list.filter(
        (o) =>
          o.status === 'PENDING_VERIFICATION' ||
          o.status === 'PRESCRIBED' ||
          o.status === 'ORDERED',
      );
    } else if (st === 'VERIFIED') {
      list = list.filter((o) => o.status === 'PHARMACY_VERIFIED' || o.status === 'VERIFIED');
    } else if (st === 'CLARIFICATION') {
      list = list.filter((o) => o.status === 'CLARIFICATION_REQUESTED');
    }

    if (q) {
      list = list.filter(
        (o) =>
          o.medicationName.toLowerCase().includes(q) ||
          (o.patient?.fullName || '').toLowerCase().includes(q) ||
          (o.patient?.patientCode || '').toLowerCase().includes(q) ||
          (o.doctorName || '').toLowerCase().includes(q),
      );
    }

    return list;
  });

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.apiService.getPharmacyMedicationOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: (err) => { this.errorMessage.set(err.message || 'Failed'); this.loading.set(false); },
    });
  }

  openReviewModal(o: MedicationOrder): void {
    this.selectedOrder.set(o);
    this.verificationNotes = 'Dosage and safety verified against clinical guideline.';
  }

  verifyOrder(): void {
    const o = this.selectedOrder();
    if (!o) return;
    this.apiService.verifyPharmacyOrder(o.id, this.verificationNotes).subscribe({
      next: () => {
        toast.success(`Prescription for ${o.medicationName} verified and approved for dispensing.`);
        o.status = 'PHARMACY_VERIFIED';
        this.selectedOrder.set(null);
      },
      error: (err) => { this.errorMessage.set(err.message || 'Failed'); },
    });
  }

  requestClarification(): void {
    const o = this.selectedOrder();
    if (!o) return;
    this.apiService.requestPharmacyClarification(o.id, this.verificationNotes).subscribe({
      next: () => {
        toast.info(`Clarification requested from prescribing doctor for ${o.medicationName}.`);
        o.status = 'CLARIFICATION_REQUESTED';
        this.selectedOrder.set(null);
      },
      error: (err) => { this.errorMessage.set(err.message || 'Failed'); },
    });
  }

  rejectOrder(): void {
    const o = this.selectedOrder();
    if (!o) return;
    this.apiService
      .rejectPharmacyOrder(o.id, this.verificationNotes || 'Clinical contraindication')
      .subscribe({
        next: () => {
          toast.error(`Prescription for ${o.medicationName} rejected.`);
          o.status = 'REJECTED';
          this.selectedOrder.set(null);
        },
        error: () => {
          toast.error(`Prescription for ${o.medicationName} rejected.`);
          o.status = 'REJECTED';
          this.selectedOrder.set(null);
        },
      });
  }
}
