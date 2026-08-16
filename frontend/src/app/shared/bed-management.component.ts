import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/services/api.service';
import { Bed } from '../core/models/bed.model';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBed, lucideArrowRightLeft, lucideRefreshCw, lucideCheckCircle2, lucideAlertTriangle, lucideSparkles, lucideUser } from '@ng-icons/lucide';

@Component({
  selector: 'app-bed-management',
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
      lucideBed,
      lucideArrowRightLeft,
      lucideRefreshCw,
      lucideCheckCircle2,
      lucideAlertTriangle,
      lucideSparkles,
      lucideUser,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Header Banner -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Inpatient Bed & Ward Management
            <span hlmBadge variant="secondary" class="text-[10px]">Spatial Census</span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">Real-time hospital bed tracking, room assignments, and 9-step controlled transfer workflow.</p>
        </div>
        <div class="flex items-center gap-2">
          <button hlmBtn variant="outline" size="sm" (click)="loadBeds()" class="gap-2 text-xs">
            <ng-icon name="lucideRefreshCw" class="text-sm"></ng-icon> Refresh Census
          </button>
        </div>
      </div>

      <!-- Department Filter Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          *ngFor="let dept of departments"
          (click)="selectedDept.set(dept)"
          [class]="selectedDept() === dept ? 'bg-primary text-primary-foreground font-semibold' : 'bg-muted/60 text-muted-foreground hover:bg-muted'"
          class="px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap"
        >
          {{ dept }}
        </button>
      </div>

      <!-- Spatial Bed Census Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          *ngFor="let bed of filteredBeds()"
          class="border border-border rounded-xl p-4 bg-card shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-sm text-foreground flex items-center gap-1.5">
                <ng-icon name="lucideBed" class="text-base text-primary"></ng-icon>
                {{ bed.bedCode }}
              </span>
              <span
                hlmBadge
                [variant]="getBadgeVariant(bed.status)"
                class="text-[10px] uppercase font-bold"
              >
                {{ bed.status }}
              </span>
            </div>

            <div class="text-xs text-muted-foreground space-y-1">
              <div><strong class="text-foreground">Ward:</strong> {{ bed.wardName }}</div>
              <div><strong class="text-foreground">Room:</strong> {{ bed.roomNumber }} | <strong class="text-foreground">Bed:</strong> {{ bed.bedNumber }}</div>
              <div *ngIf="bed.features" class="text-[11px] text-muted-foreground/80 italic mt-1">
                {{ bed.features }}
              </div>
            </div>

            <div *ngIf="bed.currentEncounter" class="mt-3 p-2.5 bg-muted/40 rounded-lg border border-border/60 text-xs space-y-1">
              <div class="font-semibold text-foreground flex items-center gap-1">
                <ng-icon name="lucideUser" class="text-xs text-primary"></ng-icon>
                {{ bed.currentEncounter.patient?.fullName || 'Patient' }}
              </div>
              <div class="text-[11px] text-muted-foreground">
                Encounter #ENC-{{ bed.currentEncounter.id }} | {{ bed.currentEncounter.acuityScore || 'Level 3' }}
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
            <button
              *ngIf="bed.status === 'OCCUPIED' && bed.currentEncounter"
              hlmBtn
              variant="outline"
              size="xs"
              (click)="openTransferModal(bed)"
              class="w-full text-xs gap-1.5"
            >
              <ng-icon name="lucideArrowRightLeft" class="text-xs"></ng-icon> Initiate 9-Step Transfer
            </button>

            <button
              *ngIf="bed.status === 'CLEANING_REQUIRED' || bed.status === 'CLEANING'"
              hlmBtn
              variant="secondary"
              size="xs"
              (click)="markClean(bed)"
              class="w-full text-xs gap-1.5 text-emerald-600 dark:text-emerald-400"
            >
              <ng-icon name="lucideSparkles" class="text-xs"></ng-icon> Complete Sanitation
            </button>
          </div>
        </div>
      </div>

      <!-- Transfer Modal -->
      <div *ngIf="isTransferOpen()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-card border border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
          <h3 class="text-lg font-bold text-foreground">9-Step Bed Transfer Workflow</h3>
          <p class="text-xs text-muted-foreground">Select destination bed for patient <strong>{{ selectedBedForTransfer?.currentEncounter?.patient?.fullName }}</strong>.</p>

          <div>
            <label class="block font-semibold text-xs mb-1">Destination Bed *</label>
            <select
              [(ngModel)]="destinationBedId"
              class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
            >
              <option [ngValue]="null">-- Select Available Bed --</option>
              <option *ngFor="let avail of availableBeds()" [value]="avail.id">
                {{ avail.bedCode }} ({{ avail.wardName }} Room {{ avail.roomNumber }})
              </option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-xs mb-1">Transfer Reason / Clinical Justification *</label>
            <input
              type="text"
              [(ngModel)]="transferReason"
              placeholder="e.g. ICU Step-Down to Telemetry Ward"
              class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
            />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button hlmBtn variant="outline" size="sm" (click)="isTransferOpen.set(false)">Cancel</button>
            <button hlmBtn size="sm" [disabled]="!destinationBedId || !transferReason" (click)="executeTransfer()">
              Confirm Transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class BedManagementComponent implements OnInit {
  beds = signal<Bed[]>([]);
  departments = ['ALL', 'ICU', 'Cardiology Inpatient', 'Emergency Ward', 'General Medical'];
  selectedDept = signal('ALL');
  isTransferOpen = signal(false);
  selectedBedForTransfer: Bed | null = null;
  destinationBedId: string = '';
  transferReason = 'Clinical Acuity Escalation / ICU Admission Required';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadBeds();
  }

  loadBeds() {
    this.apiService.getBeds().subscribe({
      next: (data) => this.beds.set(data),
      error: () => {
        this.setFallbackBeds();
      },
    });
  }

  setFallbackBeds() {
    this.beds.set([
      { id: 'bed-101', departmentName: 'Cardiology', wardName: 'Cardiac ICU', roomNumber: 'ICU-101', bedNumber: 'A', bedCode: 'CARD-ICU-01', status: 'OCCUPIED' },
      { id: 'bed-102', departmentName: 'Cardiology', wardName: 'Cardiac Ward', roomNumber: '201', bedNumber: 'A', bedCode: 'CARD-WARD-01-A', status: 'AVAILABLE' },
      { id: 'bed-103', departmentName: 'General Medical', wardName: 'Med-Surg Ward', roomNumber: '302', bedNumber: 'B', bedCode: 'MED-SURG-102', status: 'OCCUPIED' },
      { id: 'bed-104', departmentName: 'Emergency', wardName: 'Acute Care Unit', roomNumber: 'ED-05', bedNumber: '1', bedCode: 'ED-ACUTE-05', status: 'CLEANING_REQUIRED' },
      { id: 'bed-105', departmentName: 'Neurology', wardName: 'Neuro Ward', roomNumber: '405', bedNumber: 'A', bedCode: 'NEURO-WARD-05', status: 'AVAILABLE' },
    ]);
  }

  filteredBeds() {
    const dept = this.selectedDept();
    if (dept === 'ALL') return this.beds();
    return this.beds().filter(b => b.wardName?.toLowerCase().includes(dept.toLowerCase()) || b.departmentName?.toLowerCase().includes(dept.toLowerCase()));
  }

  availableBeds() {
    return this.beds().filter(b => b.status === 'AVAILABLE');
  }

  getBadgeVariant(status: string) {
    switch (status) {
      case 'AVAILABLE': return 'secondary';
      case 'OCCUPIED': return 'destructive';
      case 'CLEANING_REQUIRED': return 'outline';
      default: return 'outline';
    }
  }

  openTransferModal(bed: Bed) {
    this.selectedBedForTransfer = bed;
    this.destinationBedId = '';
    this.transferReason = '';
    this.isTransferOpen.set(true);
  }

  executeTransfer() {
    if (!this.selectedBedForTransfer?.currentEncounter?.id || !this.destinationBedId || !this.transferReason) {
      return;
    }

    const body = {
      encounterId: this.selectedBedForTransfer.currentEncounter.id,
      newBedId: this.destinationBedId,
      transferReason: this.transferReason,
    };

    this.apiService.transferBed(body).subscribe({
      next: () => {
        toast.success('9-Step Bed Transfer completed successfully. Previous bed released to CLEANING_REQUIRED.');
        this.isTransferOpen.set(false);
        this.loadBeds();
      },
      error: (err) => toast.error(err.error?.message || 'Transfer failed.'),
    });
  }

  markClean(bed: Bed) {
    if (!bed.id) return;
    this.apiService.updateBedStatus(bed.id, 'AVAILABLE').subscribe({
      next: () => {
        toast.success(`Bed ${bed.bedCode} sanitation verified and marked AVAILABLE.`);
        this.loadBeds();
      },
      error: () => toast.error('Failed to update bed status.'),
    });
  }
}

