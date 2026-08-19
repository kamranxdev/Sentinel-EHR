import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { LabOrder, Specimen } from '../../core/models/lab.model';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideTestTube,
  lucideTestTubes,
  lucideFlaskConical,
  lucideFileText,
  lucideBarcode,
  lucideCheckCircle2,
  lucideRefreshCw,
  lucideAlertTriangle,
  lucideSearch,
  lucideFilter,
  lucideClock,
  lucideChevronRight,
  lucideArrowRight,
  lucidePrinter,
  lucidePlay,
  lucideCpu,
  lucideShieldCheck,
  lucideFileSpreadsheet,
  lucideX,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-lab-technician-worklist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
    HlmInputImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideTestTube,
      lucideTestTubes,
      lucideFlaskConical,
      lucideFileText,
      lucideBarcode,
      lucideCheckCircle2,
      lucideRefreshCw,
      lucideAlertTriangle,
      lucideSearch,
      lucideFilter,
      lucideClock,
      lucideChevronRight,
      lucideArrowRight,
      lucidePrinter,
      lucidePlay,
      lucideCpu,
      lucideShieldCheck,
      lucideFileSpreadsheet,
      lucideX,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Worklist Header -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border"
      >
        <div>
          <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Laboratory Specimen Queue & Multi-Stage Lifecycle Board
            <span
              hlmBadge
              variant="secondary"
              class="text-[11px] bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
            >
              LIS Worklist
            </span>
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            5-stage chain of custody: Receive Order ➔ Collect Specimen ➔ Accession & Barcode ➔
            Process on Analyzer ➔ Enter & Validate LOINC Result.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button hlmBtn variant="outline" size="sm" (click)="loadOrders()" class="gap-2 text-xs">
            <ng-icon name="lucideRefreshCw" [class.animate-spin]="loading()" size="14" />
            <span>Refresh Board</span>
          </button>
          <a
            routerLink="/lab-technician/results"
            hlmBtn
            size="sm"
            class="gap-2 text-xs bg-teal-600 hover:bg-teal-700 text-white"
          >
            <ng-icon name="lucideCheckCircle2" size="14" />
            <span>Result Entry Desk</span>
          </a>
        </div>
      </div>

      <!-- Stage Selection Tabs -->
      <div class="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          *ngFor="let tab of stageTabs"
          (click)="selectTab(tab.key)"
          class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 border"
          [class.bg-teal-600]="activeTab() === tab.key"
          [class.text-white]="activeTab() === tab.key"
          [class.border-teal-600]="activeTab() === tab.key"
          [class.bg-card]="activeTab() !== tab.key"
          [class.text-muted-foreground]="activeTab() !== tab.key"
          [class.border-border]="activeTab() !== tab.key"
          [class.hover:text-foreground]="activeTab() !== tab.key"
        >
          <ng-icon [name]="tab.icon" size="13" />
          <span>{{ tab.label }}</span>
          <span
            class="px-1.5 py-0.2 rounded-full text-[10px] font-mono"
            [class.bg-white/20]="activeTab() === tab.key"
            [class.bg-muted]="activeTab() !== tab.key"
          >
            {{ getTabCount(tab.key) }}
          </span>
        </button>
      </div>

      <!-- Filters & Search Toolbar -->
      <div
        class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/20 p-3 rounded-xl border border-border"
      >
        <div class="relative flex-1 max-w-md">
          <input
            hlmInput
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search by Order ID, Patient Name, MRN, Test, Barcode..."
            class="w-full text-xs h-8 pl-8 pr-3 bg-background"
          />
          <ng-icon
            name="lucideSearch"
            size="13"
            class="absolute left-2.5 top-2.5 text-muted-foreground"
          />
        </div>

        <div class="flex items-center gap-2">
          <!-- Priority Filter -->
          <select
            [(ngModel)]="priorityFilter"
            class="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground"
          >
            <option value="ALL">All Priorities</option>
            <option value="STAT">STAT / Emergency</option>
            <option value="URGENT">Urgent</option>
            <option value="ROUTINE">Routine</option>
          </select>

          <!-- Category Filter -->
          <select
            [(ngModel)]="categoryFilter"
            class="h-8 rounded-md border border-input bg-background px-2.5 text-xs text-foreground"
          >
            <option value="ALL">All Disciplines</option>
            <option value="HEMATOLOGY">Hematology</option>
            <option value="CHEMISTRY">Biochemistry</option>
            <option value="IMMUNOLOGY">Immunology / Serology</option>
            <option value="MICROBIOLOGY">Microbiology</option>
            <option value="PATHOLOGY">Histopathology</option>
          </select>
        </div>
      </div>

      <!-- Worklist Queue Table -->
      <div class="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Order / Priority</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">Patient Demographics</th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">
                  Diagnostic Test (LOINC)
                </th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">
                  Specimen Accession Barcode
                </th>
                <th hlmTableHead class="py-3 px-4 text-left font-semibold">
                  Current Lifecycle Stage
                </th>
                <th hlmTableHead class="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngIf="loading()" hlmTableRow>
                <td colspan="6" class="py-12 text-center text-xs text-muted-foreground">
                  <div class="flex items-center justify-center gap-2">
                    <ng-icon
                      name="lucideFlaskConical"
                      class="animate-spin text-teal-600"
                      size="18"
                    />
                    <span>Loading LIS orders and chain of custody...</span>
                  </div>
                </td>
              </tr>

              <tr *ngIf="!loading() && filteredOrders().length === 0" hlmTableRow>
                <td colspan="6" class="py-12 text-center text-muted-foreground text-xs">
                  <div class="space-y-1">
                    <ng-icon
                      name="lucideCheckCircle2"
                      size="24"
                      class="text-muted-foreground/40 mx-auto"
                    />
                    <p class="font-medium">
                      No laboratory orders in this stage matching your criteria.
                    </p>
                    <p class="text-[11px]">
                      Select another stage tab or clear your search filters.
                    </p>
                  </div>
                </td>
              </tr>

              <tr
                *ngFor="let order of filteredOrders()"
                hlmTableRow
                class="hover:bg-muted/30 transition-colors"
              >
                <!-- Order ID & Priority -->
                <td hlmTableCell class="py-3.5 px-4">
                  <div class="flex items-center gap-1.5">
                    <span class="font-mono font-bold text-foreground">#LAB-{{ order.id }}</span>
                    <span
                      hlmBadge
                      [variant]="
                        order.priority === 'STAT'
                          ? 'destructive'
                          : order.priority === 'URGENT'
                            ? 'secondary'
                            : 'outline'
                      "
                      class="text-[9px] font-bold px-1.5 py-0"
                    >
                      {{ order.priority || 'ROUTINE' }}
                    </span>
                  </div>
                  <div class="text-[10px] text-muted-foreground mt-0.5">
                    Ordered: {{ order.orderedAt | date: 'shortTime' }} • Dr.
                    {{ order.orderingProviderEmail || 'Physician' }}
                  </div>
                </td>

                <!-- Patient & MRN -->
                <td hlmTableCell class="py-3.5 px-4">
                  <div class="font-bold text-foreground">
                    {{
                      order.patientFullName ||
                        order.patient?.fullName ||
                        'Patient #' + order.patientId
                    }}
                  </div>
                  <div class="text-[10px] font-mono text-muted-foreground">
                    {{
                      order.patientMrn ||
                        (order.patient?.id
                          ? 'MRN-' + order.patient?.id?.substring(0, 6)?.toUpperCase()
                          : 'MRN-EHR')
                    }}
                    <span *ngIf="order.patientGender"> • {{ order.patientGender }}</span>
                    <span *ngIf="order.patientBirthDate"> • {{ order.patientBirthDate }}</span>
                  </div>
                </td>

                <!-- Diagnostic Test & LOINC -->
                <td hlmTableCell class="py-3.5 px-4">
                  <div class="font-semibold text-foreground">{{ order.testName }}</div>
                  <div
                    class="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5"
                  >
                    <span class="bg-muted px-1 rounded"
                      >LOINC: {{ order.loincCode || '4548-4' }}</span
                    >
                    <span
                      *ngIf="order.category"
                      class="text-teal-600 dark:text-teal-400 font-sans font-medium"
                      >{{ order.category }}</span
                    >
                  </div>
                  <div
                    *ngIf="order.clinicalNotes"
                    class="text-[10px] text-muted-foreground italic truncate max-w-[200px] mt-0.5"
                  >
                    Notes: {{ order.clinicalNotes }}
                  </div>
                </td>

                <!-- Specimen Accession Barcode -->
                <td hlmTableCell class="py-3.5 px-4">
                  <div *ngIf="order.specimenBarcode" class="space-y-1">
                    <div class="flex items-center gap-1.5">
                      <ng-icon name="lucideBarcode" size="14" class="text-teal-600" />
                      <span
                        class="font-mono text-[11px] font-bold bg-muted px-1.5 py-0.5 rounded border border-border text-foreground"
                      >
                        {{ order.specimenBarcode }}
                      </span>
                    </div>
                    <span *ngIf="order.container" class="text-[10px] text-muted-foreground block">
                      Container: {{ order.container }}
                    </span>
                  </div>
                  <span
                    *ngIf="!order.specimenBarcode"
                    class="text-muted-foreground/60 italic text-[11px]"
                  >
                    Not yet accessioned
                  </span>
                </td>

                <!-- Stage Badge -->
                <td hlmTableCell class="py-3.5 px-4">
                  <span
                    hlmBadge
                    [variant]="getStageBadgeVariant(order.status)"
                    class="text-[10px] font-bold uppercase tracking-wider"
                  >
                    {{ formatStage(order.status) }}
                  </span>
                </td>

                <!-- Lifecycle Action Buttons -->
                <td hlmTableCell class="py-3.5 px-4 text-right">
                  <!-- Stage 1: Order Intake -->
                  <button
                    *ngIf="order.status === 'ORDERED'"
                    hlmBtn
                    variant="outline"
                    size="xs"
                    (click)="openReceiveModal(order)"
                    class="text-xs text-sky-600 dark:text-sky-400 border-sky-500/30 hover:bg-sky-500/10 gap-1"
                  >
                    <ng-icon name="lucideFileSpreadsheet" size="12" />
                    <span>Receive Order</span>
                  </button>

                  <!-- Stage 2: Specimen Collection -->
                  <button
                    *ngIf="order.status === 'RECEIVED'"
                    hlmBtn
                    variant="outline"
                    size="xs"
                    (click)="openCollectModal(order)"
                    class="text-xs text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 gap-1"
                  >
                    <ng-icon name="lucideTestTube" size="12" />
                    <span>Collect Specimen</span>
                  </button>

                  <!-- Stage 3: Accessioning -->
                  <button
                    *ngIf="order.status === 'SPECIMEN_COLLECTED' || order.status === 'COLLECTED'"
                    hlmBtn
                    variant="outline"
                    size="xs"
                    (click)="openAccessionModal(order)"
                    class="text-xs text-indigo-600 dark:text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10 gap-1"
                  >
                    <ng-icon name="lucideBarcode" size="12" />
                    <span>Accession Specimen</span>
                  </button>

                  <!-- Stage 4: Analyzer Run -->
                  <button
                    *ngIf="order.status === 'ACCESSIONED'"
                    hlmBtn
                    variant="outline"
                    size="xs"
                    (click)="openProcessModal(order)"
                    class="text-xs text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/10 gap-1"
                  >
                    <ng-icon name="lucidePlay" size="12" />
                    <span>Run Analyzer</span>
                  </button>

                  <!-- Stage 5: Enter / Verify Result -->
                  <button
                    *ngIf="order.status === 'IN_PROCESS' || order.status === 'IN_ANALYSIS'"
                    hlmBtn
                    variant="default"
                    size="xs"
                    (click)="navigateToResultEntry(order)"
                    class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                  >
                    <ng-icon name="lucideCheckCircle2" size="12" />
                    <span>Enter Results</span>
                  </button>

                  <!-- View Result -->
                  <button
                    *ngIf="
                      order.status === 'RESULTED' ||
                      order.status === 'COMPLETED' ||
                      order.status === 'VERIFIED'
                    "
                    hlmBtn
                    variant="ghost"
                    size="xs"
                    (click)="navigateToResultEntry(order)"
                    class="text-xs text-teal-600 dark:text-teal-400 gap-1"
                  >
                    <span>View / Sign Result</span>
                    <ng-icon name="lucideArrowRight" size="12" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- MODAL 1: RECEIVE / ACKNOWLEDGE ORDER                                      -->
      <!-- ========================================================================= -->
      <div
        *ngIf="isReceiveModalOpen()"
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div
          class="bg-card border border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl"
        >
          <div class="flex items-center justify-between pb-3 border-b border-border">
            <div class="flex items-center gap-2 text-sky-600">
              <ng-icon name="lucideFileSpreadsheet" size="20" />
              <h3 class="text-base font-bold text-foreground">Acknowledge Laboratory Order</h3>
            </div>
            <button
              (click)="isReceiveModalOpen.set(false)"
              class="text-muted-foreground hover:text-foreground"
            >
              <ng-icon name="lucideX" size="18" />
            </button>
          </div>

          <div class="p-3 bg-muted/40 rounded-xl space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Order ID:</span>
              <span class="font-mono font-bold text-foreground">#LAB-{{ activeOrder?.id }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Patient:</span>
              <span class="font-semibold text-foreground">{{
                activeOrder?.patientFullName || activeOrder?.patient?.fullName
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Diagnostic Test:</span>
              <span class="font-semibold text-foreground"
                >{{ activeOrder?.testName }} (LOINC {{ activeOrder?.loincCode || '4548-4' }})</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Ordering Doctor:</span>
              <span class="text-foreground"
                >Dr. {{ activeOrder?.orderingProviderEmail || 'Staff Physician' }}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Priority Acuity:</span>
              <span
                hlmBadge
                [variant]="activeOrder?.priority === 'STAT' ? 'destructive' : 'secondary'"
                class="text-[9px]"
              >
                {{ activeOrder?.priority || 'ROUTINE' }}
              </span>
            </div>
            <div *ngIf="activeOrder?.clinicalNotes" class="pt-1 text-muted-foreground">
              <strong>Physician Notes:</strong> {{ activeOrder?.clinicalNotes }}
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block font-semibold text-xs text-foreground"
              >Laboratory Intake Notes / Instructions</label
            >
            <input
              hlmInput
              type="text"
              [(ngModel)]="receiveNotes"
              placeholder="e.g. Fasting confirmed, routed to Phlebotomy Station 1"
              class="w-full text-xs"
            />
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="isReceiveModalOpen.set(false)">
              Cancel
            </button>
            <button
              hlmBtn
              size="sm"
              (click)="submitReceiveOrder()"
              class="bg-sky-600 hover:bg-sky-700 text-white"
            >
              Confirm Receipt & Queue for Collection
            </button>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- MODAL 2: COLLECT / RECEIVE SPECIMEN                                       -->
      <!-- ========================================================================= -->
      <div
        *ngIf="isCollectModalOpen()"
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div
          class="bg-card border border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl"
        >
          <div class="flex items-center justify-between pb-3 border-b border-border">
            <div class="flex items-center gap-2 text-amber-600">
              <ng-icon name="lucideTestTube" size="20" />
              <h3 class="text-base font-bold text-foreground">
                Specimen Collection & Phlebotomy Log
              </h3>
            </div>
            <button
              (click)="isCollectModalOpen.set(false)"
              class="text-muted-foreground hover:text-foreground"
            >
              <ng-icon name="lucideX" size="18" />
            </button>
          </div>

          <div class="p-3 bg-muted/40 rounded-xl space-y-1 text-xs">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Order & Test:</span>
              <span class="font-bold text-foreground"
                >#LAB-{{ activeOrder?.id }} • {{ activeOrder?.testName }}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Patient:</span>
              <span class="font-semibold text-foreground">{{
                activeOrder?.patientFullName || activeOrder?.patient?.fullName
              }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="space-y-1">
              <label class="font-semibold text-foreground">Specimen Type *</label>
              <select
                [(ngModel)]="specimenType"
                class="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
              >
                <option value="BLOOD">Whole Blood (Venous)</option>
                <option value="SERUM">Serum (Clotted)</option>
                <option value="PLASMA">Plasma (Anticoagulated)</option>
                <option value="URINE">Urine (Midstream Clean-Catch)</option>
                <option value="CSF">Cerebrospinal Fluid (CSF)</option>
                <option value="SWAB">Nasopharyngeal / Throat Swab</option>
                <option value="SPUTUM">Sputum / Respiratory</option>
                <option value="TISSUE">Biopsy Tissue Specimen</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="font-semibold text-foreground">Collection Anatomical Site</label>
              <input
                hlmInput
                type="text"
                [(ngModel)]="collectionSite"
                placeholder="e.g. Left Antecubital Fossa"
                class="w-full text-xs h-8"
              />
            </div>

            <div class="space-y-1">
              <label class="font-semibold text-foreground">Collection Method</label>
              <select
                [(ngModel)]="collectionMethod"
                class="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
              >
                <option value="VENIPUNCTURE">Venipuncture (Vacutainer)</option>
                <option value="CAPILLARY">Capillary Fingerstick</option>
                <option value="CLEAN_CATCH">Clean-Catch Void</option>
                <option value="CATHETER">Sterile Catheterization</option>
                <option value="SWAB">Sterile Dacron Swab</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="font-semibold text-foreground">Patient Fasting Status</label>
              <select
                [(ngModel)]="fastingStatus"
                class="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
              >
                <option value="FASTING_8H">Fasting 8-12 Hours (Verified)</option>
                <option value="NON_FASTING">Non-Fasting / Random</option>
                <option value="POST_PRANDIAL">2-Hour Post-Prandial</option>
              </select>
            </div>
          </div>

          <div class="space-y-1">
            <label class="font-semibold text-xs text-foreground"
              >Phlebotomist / Collector Name</label
            >
            <input hlmInput type="text" [(ngModel)]="phlebotomistName" class="w-full text-xs h-8" />
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="isCollectModalOpen.set(false)">
              Cancel
            </button>
            <button
              hlmBtn
              size="sm"
              (click)="submitCollectSpecimen()"
              class="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Log Specimen Collected
            </button>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- MODAL 3: ACCESSION SPECIMEN & BARCODE                                     -->
      <!-- ========================================================================= -->
      <div
        *ngIf="isAccessionModalOpen()"
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div
          class="bg-card border border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl"
        >
          <div class="flex items-center justify-between pb-3 border-b border-border">
            <div class="flex items-center gap-2 text-indigo-600">
              <ng-icon name="lucideBarcode" size="20" />
              <h3 class="text-base font-bold text-foreground">
                Specimen Accessioning & Chain of Custody
              </h3>
            </div>
            <button
              (click)="isAccessionModalOpen.set(false)"
              class="text-muted-foreground hover:text-foreground"
            >
              <ng-icon name="lucideX" size="18" />
            </button>
          </div>

          <!-- Barcode Visual Label Preview -->
          <div
            class="p-4 rounded-xl border border-dashed border-indigo-500/40 bg-indigo-500/5 space-y-2 text-center"
          >
            <div
              class="flex items-center justify-between text-[11px] text-muted-foreground font-mono"
            >
              <span>SENTINEL-LIS LAB ACCESSION</span>
              <span>{{ activeOrder?.priority || 'ROUTINE' }}</span>
            </div>
            <div class="font-mono font-extrabold text-base tracking-widest text-foreground">
              {{ barcodeInput }}
            </div>
            <!-- Visual Barcode lines simulation -->
            <div
              class="flex justify-center items-center gap-0.5 h-8 px-4 py-1 bg-white rounded dark:invert"
            >
              <div class="w-1 h-full bg-black"></div>
              <div class="w-0.5 h-full bg-black"></div>
              <div class="w-1.5 h-full bg-black"></div>
              <div class="w-0.5 h-full bg-black"></div>
              <div class="w-2 h-full bg-black"></div>
              <div class="w-1 h-full bg-black"></div>
              <div class="w-0.5 h-full bg-black"></div>
              <div class="w-1.5 h-full bg-black"></div>
              <div class="w-0.5 h-full bg-black"></div>
              <div class="w-2 h-full bg-black"></div>
              <div class="w-1 h-full bg-black"></div>
              <div class="w-0.5 h-full bg-black"></div>
            </div>
            <div class="text-[10px] font-mono text-muted-foreground">
              {{ activeOrder?.patientFullName || activeOrder?.patient?.fullName }} •
              {{ activeOrder?.testName }}
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="space-y-1">
              <label class="font-semibold text-foreground">Accession Identifier *</label>
              <input
                hlmInput
                type="text"
                [(ngModel)]="accessionNumberInput"
                class="w-full text-xs h-8 font-mono"
              />
            </div>

            <div class="space-y-1">
              <label class="font-semibold text-foreground">Container / Color Tube *</label>
              <select
                [(ngModel)]="containerType"
                class="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
              >
                <option value="LAVENDER_EDTA">Lavender Top (K2-EDTA - Hematology)</option>
                <option value="GOLD_SST">Gold Top (SST Gel Separator - Chemistry)</option>
                <option value="LIGHT_BLUE_CITRATE">
                  Light Blue Top (Sodium Citrate - Coagulation)
                </option>
                <option value="GREEN_HEPARIN">Green Top (Lithium Heparin - Stat Chem)</option>
                <option value="RED_PLAIN">Red Top (Plain Clot Activator - Serology)</option>
                <option value="STERILE_CUP">Sterile Cup (Urinalysis / Body Fluids)</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="font-semibold text-foreground">Sample Adequacy Check *</label>
              <select
                [(ngModel)]="sampleAdequacy"
                class="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
              >
                <option value="SATISFACTORY">Satisfactory / Adequate Volume</option>
                <option value="HEMOLYZED">Hemolyzed Sample</option>
                <option value="LIPEMIC">Lipemic Sample</option>
                <option value="CLOTTED">Clotted Micro-Specimen</option>
                <option value="QNS">QNS (Quantity Not Sufficient)</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="font-semibold text-foreground">Storage Location / Rack</label>
              <input
                hlmInput
                type="text"
                [(ngModel)]="storageRack"
                placeholder="e.g. Centrifuge Rack B-04"
                class="w-full text-xs h-8"
              />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="isAccessionModalOpen.set(false)">
              Cancel
            </button>
            <button
              hlmBtn
              size="sm"
              (click)="submitAccession()"
              class="bg-indigo-600 hover:bg-indigo-700 text-white gap-1"
            >
              <ng-icon name="lucideCheckCircle2" size="14" />
              <span>Confirm Accession & Generate Label</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- MODAL 4: PROCESS TEST ON ANALYZER                                         -->
      <!-- ========================================================================= -->
      <div
        *ngIf="isProcessModalOpen()"
        class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div
          class="bg-card border border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl"
        >
          <div class="flex items-center justify-between pb-3 border-b border-border">
            <div class="flex items-center gap-2 text-purple-600">
              <ng-icon name="lucideCpu" size="20" />
              <h3 class="text-base font-bold text-foreground">
                Automated Analyzer Test Processing
              </h3>
            </div>
            <button
              (click)="isProcessModalOpen.set(false)"
              class="text-muted-foreground hover:text-foreground"
            >
              <ng-icon name="lucideX" size="18" />
            </button>
          </div>

          <div class="p-3 bg-muted/40 rounded-xl space-y-1 text-xs">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Order & Test:</span>
              <span class="font-bold text-foreground"
                >#LAB-{{ activeOrder?.id }} • {{ activeOrder?.testName }}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Accession Barcode:</span>
              <span class="font-mono text-foreground">{{
                activeOrder?.specimenBarcode || barcodeInput
              }}</span>
            </div>
          </div>

          <div class="space-y-3 text-xs">
            <div class="space-y-1">
              <label class="font-semibold text-foreground"
                >Select Connected Analyzer Instrument *</label
              >
              <select
                [(ngModel)]="selectedAnalyzer"
                class="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
              >
                <option value="Sysmex XN-1000 (Hematology)">
                  Sysmex XN-1000 Automated Hematology Analyzer (Ready)
                </option>
                <option value="Roche Cobas 6000 (Chemistry)">
                  Roche Cobas 6000 Clinical Chemistry System (Ready)
                </option>
                <option value="Abbott Architect i2000SR (Immuno)">
                  Abbott Architect i2000SR Immunoassay Analyzer (Ready)
                </option>
                <option value="Bio-Rad D-10 (HPLC HbA1c)">
                  Bio-Rad D-10 HPLC Hemoglobin Testing System (Ready)
                </option>
                <option value="Manual Microscopy / Bench">
                  Manual Clinical Microscopy & Staining Bench
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="font-semibold text-foreground">Batch Run ID</label>
                <input
                  hlmInput
                  type="text"
                  [(ngModel)]="batchRunId"
                  class="w-full text-xs h-8 font-mono"
                />
              </div>
              <div class="space-y-1">
                <label class="font-semibold text-foreground">QC Status</label>
                <div
                  class="h-8 flex items-center gap-1.5 px-3 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold text-[11px]"
                >
                  <ng-icon name="lucideShieldCheck" size="14" />
                  <span>QC Passed & Calibrated</span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-border">
            <button hlmBtn variant="outline" size="sm" (click)="isProcessModalOpen.set(false)">
              Cancel
            </button>
            <button
              hlmBtn
              size="sm"
              (click)="submitProcessTest()"
              class="bg-purple-600 hover:bg-purple-700 text-white gap-1"
            >
              <ng-icon name="lucidePlay" size="14" />
              <span>Start Analysis Run</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LabTechnicianWorklistComponent implements OnInit {
  labOrders = signal<LabOrder[]>([]);
  loading = signal<boolean>(true);
  activeTab = signal<string>('ALL');

  searchQuery = '';
  priorityFilter = 'ALL';
  categoryFilter = 'ALL';

  // Modals state
  isReceiveModalOpen = signal(false);
  isCollectModalOpen = signal(false);
  isAccessionModalOpen = signal(false);
  isProcessModalOpen = signal(false);

  activeOrder: LabOrder | null = null;

  // Form Fields
  receiveNotes = '';
  specimenType = 'BLOOD';
  collectionSite = 'Left Antecubital Fossa';
  collectionMethod = 'VENIPUNCTURE';
  fastingStatus = 'FASTING_8H';
  phlebotomistName = 'Phlebotomy Desk';

  barcodeInput = '';
  accessionNumberInput = '';
  containerType = 'LAVENDER_EDTA';
  sampleAdequacy = 'SATISFACTORY';
  storageRack = 'Centrifuge Rack A-01';

  selectedAnalyzer = 'Sysmex XN-1000 (Hematology)';
  batchRunId = 'BATCH-' + new Date().toISOString().substring(0, 10);

  stageTabs = [
    { key: 'ALL', label: 'All Orders', icon: 'lucideTestTubes' },
    { key: 'RECEIVE', label: '1. Receive Order', icon: 'lucideFileSpreadsheet' },
    { key: 'COLLECT', label: '2. Collect Specimen', icon: 'lucideTestTube' },
    { key: 'ACCESSION', label: '3. Accession & Barcode', icon: 'lucideBarcode' },
    { key: 'PROCESS', label: '4. Run Analyzer', icon: 'lucideCpu' },
    { key: 'RESULT', label: '5. Result & Sign', icon: 'lucideCheckCircle2' },
  ];

  filteredOrders = computed(() => {
    let list = this.labOrders();
    const tab = this.activeTab();
    const query = this.searchQuery.trim().toLowerCase();
    const priority = this.priorityFilter;
    const category = this.categoryFilter;

    // Stage Tab Filter
    if (tab === 'RECEIVE') {
      list = list.filter((o) => o.status === 'ORDERED');
    } else if (tab === 'COLLECT') {
      list = list.filter((o) => o.status === 'RECEIVED');
    } else if (tab === 'ACCESSION') {
      list = list.filter((o) => o.status === 'SPECIMEN_COLLECTED' || o.status === 'COLLECTED');
    } else if (tab === 'PROCESS') {
      list = list.filter((o) => o.status === 'ACCESSIONED');
    } else if (tab === 'RESULT') {
      list = list.filter(
        (o) => o.status === 'IN_PROCESS' || o.status === 'IN_ANALYSIS' || o.status === 'RESULTED',
      );
    }

    // Priority Filter
    if (priority !== 'ALL') {
      list = list.filter((o) => o.priority === priority);
    }

    // Category Filter
    if (category !== 'ALL') {
      list = list.filter((o) => o.category?.toUpperCase() === category);
    }

    // Search Query
    if (query) {
      list = list.filter((o) => {
        const idMatch = String(o.id).includes(query);
        const testMatch = o.testName?.toLowerCase().includes(query);
        const loincMatch = o.loincCode?.toLowerCase().includes(query);
        const patientMatch = (o.patientFullName || o.patient?.fullName || '')
          .toLowerCase()
          .includes(query);
        const mrnMatch = (o.patientMrn || '').toLowerCase().includes(query);
        const barcodeMatch = (o.specimenBarcode || '').toLowerCase().includes(query);
        return idMatch || testMatch || loincMatch || patientMatch || mrnMatch || barcodeMatch;
      });
    }

    return list;
  });

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['stage']) {
        if (params['stage'] === 'ORDERED') this.activeTab.set('RECEIVE');
        else if (params['stage'] === 'SPECIMEN_COLLECTED') this.activeTab.set('ACCESSION');
        else if (params['stage'] === 'ACCESSIONED') this.activeTab.set('PROCESS');
        else if (params['stage'] === 'IN_PROCESS') this.activeTab.set('RESULT');
      }
      if (params['priority']) {
        this.priorityFilter = params['priority'];
      }
      this.loadOrders();
    });
  }

  loadOrders(): void {
    this.loading.set(true);
    this.apiService.getLabOrdersList().subscribe({
      next: (data) => {
        this.labOrders.set(Array.isArray(data) ? data : []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load lab orders:', err);
        this.labOrders.set([]);
        this.loading.set(false);
        toast.error('Failed to connect to LIS server.');
      },
    });
  }

  selectTab(tabKey: string): void {
    this.activeTab.set(tabKey);
  }

  getTabCount(tabKey: string): number {
    const list = this.labOrders();
    switch (tabKey) {
      case 'ALL':
        return list.length;
      case 'RECEIVE':
        return list.filter((o) => o.status === 'ORDERED').length;
      case 'COLLECT':
        return list.filter((o) => o.status === 'RECEIVED').length;
      case 'ACCESSION':
        return list.filter((o) => o.status === 'SPECIMEN_COLLECTED' || o.status === 'COLLECTED')
          .length;
      case 'PROCESS':
        return list.filter((o) => o.status === 'ACCESSIONED').length;
      case 'RESULT':
        return list.filter(
          (o) => o.status === 'IN_PROCESS' || o.status === 'IN_ANALYSIS' || o.status === 'RESULTED',
        ).length;
      default:
        return 0;
    }
  }

  formatStage(status: string): string {
    switch (status) {
      case 'ORDERED':
        return '1. Doctor Ordered';
      case 'RECEIVED':
        return '1. Order Received';
      case 'SPECIMEN_COLLECTED':
      case 'COLLECTED':
        return '2. Specimen Collected';
      case 'ACCESSIONED':
        return '3. Accessioned';
      case 'IN_PROCESS':
      case 'IN_ANALYSIS':
        return '4. In Analysis';
      case 'RESULTED':
        return '5. Resulted';
      case 'COMPLETED':
      case 'VERIFIED':
        return '5. Verified & Released';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  }

  getStageBadgeVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (status) {
      case 'ORDERED':
      case 'RECEIVED':
        return 'outline';
      case 'SPECIMEN_COLLECTED':
      case 'COLLECTED':
        return 'secondary';
      case 'ACCESSIONED':
        return 'secondary';
      case 'IN_PROCESS':
      case 'IN_ANALYSIS':
        return 'default';
      case 'RESULTED':
      case 'COMPLETED':
      case 'VERIFIED':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  // --- MODAL HANDLERS ---
  openReceiveModal(order: LabOrder): void {
    this.activeOrder = order;
    this.receiveNotes = '';
    this.isReceiveModalOpen.set(true);
  }

  submitReceiveOrder(): void {
    if (!this.activeOrder) return;
    const orderId = this.activeOrder.id!;
    this.apiService.updateLabOrderStatus(orderId, 'RECEIVED').subscribe({
      next: () => {
        toast.success(`Order #LAB-${orderId} received and queued for specimen collection.`);
        this.isReceiveModalOpen.set(false);
        this.loadOrders();
      },
      error: () => toast.error('Failed to acknowledge order.'),
    });
  }

  openCollectModal(order: LabOrder): void {
    this.activeOrder = order;
    this.specimenType =
      order.category === 'HEMATOLOGY'
        ? 'BLOOD'
        : order.category === 'CHEMISTRY'
          ? 'SERUM'
          : 'BLOOD';
    this.collectionSite = 'Left Antecubital Fossa';
    this.phlebotomistName = this.authService.currentUser()?.fullName || 'Phlebotomy Desk';
    this.isCollectModalOpen.set(true);
  }

  submitCollectSpecimen(): void {
    if (!this.activeOrder) return;
    const orderId = this.activeOrder.id!;
    const barcode = `BAR-LAB-${orderId}-${Math.floor(1000 + Math.random() * 9000)}`;

    this.apiService
      .createSpecimen(orderId, {
        specimenBarcode: barcode,
        specimenType: this.specimenType,
        collectionSite: this.collectionSite,
        fastingStatus: this.fastingStatus,
      })
      .subscribe({ error: () => {} });

    this.apiService.updateLabOrderStatus(orderId, 'SPECIMEN_COLLECTED', barcode).subscribe({
      next: () => {
        toast.success(`Specimen for Order #LAB-${orderId} collected. Barcode: ${barcode}`);
        this.isCollectModalOpen.set(false);
        this.loadOrders();
      },
      error: () => toast.error('Failed to log specimen collection.'),
    });
  }

  openAccessionModal(order: LabOrder): void {
    this.activeOrder = order;
    this.barcodeInput =
      order.specimenBarcode || `BAR-LAB-${order.id}-${Math.floor(1000 + Math.random() * 9000)}`;
    this.accessionNumberInput = `ACC-${new Date().getFullYear()}-${String(order.id).padStart(4, '0')}`;
    this.containerType = order.category === 'HEMATOLOGY' ? 'LAVENDER_EDTA' : 'GOLD_SST';
    this.sampleAdequacy = 'SATISFACTORY';
    this.isAccessionModalOpen.set(true);
  }

  submitAccession(): void {
    if (!this.activeOrder) return;
    const orderId = this.activeOrder.id!;

    this.apiService.updateLabOrderStatus(orderId, 'ACCESSIONED', this.barcodeInput).subscribe({
      next: () => {
        toast.success(
          `Specimen accessioned (#${this.accessionNumberInput}). Container: ${this.containerType}`,
        );
        this.isAccessionModalOpen.set(false);
        this.loadOrders();
      },
      error: () => toast.error('Failed to accession specimen.'),
    });
  }

  openProcessModal(order: LabOrder): void {
    this.activeOrder = order;
    this.batchRunId = `BATCH-${new Date().toISOString().substring(0, 10)}-${order.id}`;
    this.selectedAnalyzer =
      order.category === 'HEMATOLOGY'
        ? 'Sysmex XN-1000 (Hematology)'
        : 'Roche Cobas 6000 (Chemistry)';
    this.isProcessModalOpen.set(true);
  }

  submitProcessTest(): void {
    if (!this.activeOrder) return;
    const orderId = this.activeOrder.id!;

    this.apiService.updateLabOrderStatus(orderId, 'IN_PROCESS').subscribe({
      next: () => {
        toast.success(
          `Test analysis started on ${this.selectedAnalyzer} (Batch: ${this.batchRunId}).`,
        );
        this.isProcessModalOpen.set(false);
        this.loadOrders();
      },
      error: () => toast.error('Failed to initiate test processing.'),
    });
  }

  navigateToResultEntry(order: LabOrder): void {
    this.router.navigate(['/lab-technician/results'], {
      queryParams: {
        orderId: order.id,
        test: order.testName,
        loinc: order.loincCode,
        barcode: order.specimenBarcode,
      },
    });
  }
}
