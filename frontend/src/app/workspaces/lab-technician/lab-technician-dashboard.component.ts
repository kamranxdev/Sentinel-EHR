import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { StatCardComponent } from '../../shared/ui/stat-card.component';
import { LabOrder } from '../../core/models/lab.model';
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
  lucideFileSpreadsheet,
  lucideCheckCheck,
  lucideCheckCircle2,
  lucideFlaskConical,
  lucideMicroscope,
  lucideBarcode,
  lucideRefreshCw,
  lucideClock,
  lucideAlertTriangle,
  lucidePhoneCall,
  lucideSearch,
  lucideChevronRight,
  lucideArrowRight,
  lucideCpu,
  lucideActivity,
  lucideShieldCheck,
  lucideUserRound,
} from '@ng-icons/lucide';

interface AnalyzerStatus {
  id: string;
  name: string;
  discipline: string;
  status: 'ONLINE' | 'RUNNING' | 'CALIBRATING' | 'STANDBY';
  reagentLevel: number;
  queuedSamples: number;
  lastQc: string;
}

@Component({
  selector: 'app-lab-technician-dashboard',
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
      lucideFileSpreadsheet,
      lucideCheckCheck,
      lucideCheckCircle2,
      lucideFlaskConical,
      lucideMicroscope,
      lucideBarcode,
      lucideRefreshCw,
      lucideClock,
      lucideAlertTriangle,
      lucidePhoneCall,
      lucideSearch,
      lucideChevronRight,
      lucideArrowRight,
      lucideCpu,
      lucideActivity,
      lucideShieldCheck,
      lucideUserRound,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Lab Technician Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
            <ng-icon name="lucideMicroscope" size="26" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Laboratory Information System (LIS) Command Center
              <span hlmBadge variant="secondary" class="text-[11px] bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                Pathology & Clinical Lab
              </span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">
              Specimen accessioning, analyzer instrumentation, LOINC diagnostic result entry, and pathologist verification.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button hlmBtn variant="outline" size="sm" (click)="loadOrders()" class="gap-2 text-xs">
            <ng-icon name="lucideRefreshCw" [class.animate-spin]="loading()" size="14" />
            <span>Refresh LIS</span>
          </button>
          <a routerLink="/lab-technician/worklist" hlmBtn size="sm" class="gap-2 text-xs bg-teal-600 hover:bg-teal-700 text-white">
            <ng-icon name="lucideTestTube" size="14" />
            <span>Open Worklist Board</span>
          </a>
        </div>
      </div>

      <!-- Critical STAT Alert Banner (if any STAT / Panic orders) -->
      <div *ngIf="statOrders().length > 0" class="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs">
        <div class="flex items-center gap-3">
          <div class="size-9 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 animate-pulse">
            <ng-icon name="lucideAlertTriangle" size="20" />
          </div>
          <div>
            <h4 class="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <span>{{ statOrders().length }} High-Priority STAT / Panic Order(s) Awaiting Immediate Action</span>
              <span class="inline-block size-2 rounded-full bg-rose-500 animate-ping"></span>
            </h4>
            <p class="text-[11px] text-muted-foreground">
              Critical turn-around time target: &lt; 30 minutes. Direct telephone escalation required for panic values.
            </p>
          </div>
        </div>
        <a routerLink="/lab-technician/worklist" [queryParams]="{ priority: 'STAT' }" hlmBtn variant="destructive" size="xs" class="gap-1 text-xs">
          <span>View STAT Queue</span>
          <ng-icon name="lucideArrowRight" size="14" />
        </a>
      </div>

      <!-- 5-Stage Clinical Laboratory Funnel Metrics -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xs font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
            <ng-icon name="lucideActivity" size="14" class="text-teal-600" />
            <span>Clinical Laboratory Lifecycle Pipeline</span>
          </h2>
          <span class="text-[11px] text-muted-foreground font-mono">Total Active: {{ labOrders().length }}</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <!-- Step 1: Received Orders -->
          <div
            (click)="filterByStage('ORDERED')"
            class="p-3.5 rounded-xl border border-border bg-card hover:bg-muted/50 cursor-pointer transition-all space-y-2 group shadow-2xs"
            [class.ring-2]="selectedFilter() === 'ORDERED'"
            [class.ring-sky-500]="selectedFilter() === 'ORDERED'"
          >
            <div class="flex items-center justify-between text-xs text-muted-foreground">
              <span class="font-semibold text-sky-600 dark:text-sky-400">1. Doctor Orders</span>
              <div class="size-6 rounded-md bg-sky-500/10 text-sky-600 flex items-center justify-center">
                <ng-icon name="lucideFileSpreadsheet" size="13" />
              </div>
            </div>
            <div class="text-xl font-extrabold text-foreground">{{ countByStage('ORDERED') }}</div>
            <div class="text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Awaiting Lab Receipt</span>
              <ng-icon name="lucideChevronRight" size="12" class="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <!-- Step 2: Specimen Collection -->
          <div
            (click)="filterByStage('SPECIMEN_COLLECTED')"
            class="p-3.5 rounded-xl border border-border bg-card hover:bg-muted/50 cursor-pointer transition-all space-y-2 group shadow-2xs"
            [class.ring-2]="selectedFilter() === 'SPECIMEN_COLLECTED'"
            [class.ring-amber-500]="selectedFilter() === 'SPECIMEN_COLLECTED'"
          >
            <div class="flex items-center justify-between text-xs text-muted-foreground">
              <span class="font-semibold text-amber-600 dark:text-amber-400">2. Collected Specimen</span>
              <div class="size-6 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <ng-icon name="lucideTestTube" size="13" />
              </div>
            </div>
            <div class="text-xl font-extrabold text-foreground">{{ countByStage('SPECIMEN_COLLECTED') }}</div>
            <div class="text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Phlebotomy Intake</span>
              <ng-icon name="lucideChevronRight" size="12" class="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <!-- Step 3: Accessioned & Barcoded -->
          <div
            (click)="filterByStage('ACCESSIONED')"
            class="p-3.5 rounded-xl border border-border bg-card hover:bg-muted/50 cursor-pointer transition-all space-y-2 group shadow-2xs"
            [class.ring-2]="selectedFilter() === 'ACCESSIONED'"
            [class.ring-indigo-500]="selectedFilter() === 'ACCESSIONED'"
          >
            <div class="flex items-center justify-between text-xs text-muted-foreground">
              <span class="font-semibold text-indigo-600 dark:text-indigo-400">3. Accessioned</span>
              <div class="size-6 rounded-md bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <ng-icon name="lucideBarcode" size="13" />
              </div>
            </div>
            <div class="text-xl font-extrabold text-foreground">{{ countByStage('ACCESSIONED') }}</div>
            <div class="text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Barcoded & Rack Log</span>
              <ng-icon name="lucideChevronRight" size="12" class="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <!-- Step 4: Process Test / Analyzer -->
          <div
            (click)="filterByStage('IN_PROCESS')"
            class="p-3.5 rounded-xl border border-border bg-card hover:bg-muted/50 cursor-pointer transition-all space-y-2 group shadow-2xs"
            [class.ring-2]="selectedFilter() === 'IN_PROCESS'"
            [class.ring-purple-500]="selectedFilter() === 'IN_PROCESS'"
          >
            <div class="flex items-center justify-between text-xs text-muted-foreground">
              <span class="font-semibold text-purple-600 dark:text-purple-400">4. Processing Test</span>
              <div class="size-6 rounded-md bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <ng-icon name="lucideFlaskConical" size="13" />
              </div>
            </div>
            <div class="text-xl font-extrabold text-foreground">{{ countByStage('IN_PROCESS') }}</div>
            <div class="text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Analyzer Worklist</span>
              <ng-icon name="lucideChevronRight" size="12" class="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <!-- Step 5: Resulted & Verified -->
          <div
            (click)="filterByStage('RESULTED')"
            class="p-3.5 rounded-xl border border-border bg-card hover:bg-muted/50 cursor-pointer transition-all space-y-2 group shadow-2xs"
            [class.ring-2]="selectedFilter() === 'RESULTED'"
            [class.ring-emerald-500]="selectedFilter() === 'RESULTED'"
          >
            <div class="flex items-center justify-between text-xs text-muted-foreground">
              <span class="font-semibold text-emerald-600 dark:text-emerald-400">5. Resulted & Sign-Off</span>
              <div class="size-6 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <ng-icon name="lucideCheckCheck" size="13" />
              </div>
            </div>
            <div class="text-xl font-extrabold text-foreground">{{ countByStage('RESULTED') }}</div>
            <div class="text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Doctor Chart Released</span>
              <ng-icon name="lucideChevronRight" size="12" class="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Action Cards & Analyzer Instruments -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Automated Analyzer Status Station (Left 2 cols) -->
        <div hlmCard class="p-5 lg:col-span-2 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
                <ng-icon name="lucideCpu" size="16" class="text-teal-600" />
                <span>Automated Clinical Analyzers & Interfacing</span>
              </h2>
              <p class="text-xs text-muted-foreground">ASTM / HL7 v2 LIS connected instruments and quality control status.</p>
            </div>
            <span hlmBadge variant="outline" class="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono">
              4 / 4 ONLINE
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div *ngFor="let analyzer of analyzers" class="p-3.5 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors space-y-2">
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="text-xs font-bold text-foreground">{{ analyzer.name }}</h4>
                  <p class="text-[11px] text-muted-foreground">{{ analyzer.discipline }}</p>
                </div>
                <span
                  hlmBadge
                  [variant]="analyzer.status === 'ONLINE' ? 'secondary' : analyzer.status === 'RUNNING' ? 'default' : 'outline'"
                  class="text-[9px] font-mono px-1.5 py-0"
                >
                  {{ analyzer.status }}
                </span>
              </div>

              <!-- Reagent & Queue Progress -->
              <div class="space-y-1">
                <div class="flex justify-between text-[10px] text-muted-foreground">
                  <span>Reagent Fill Level</span>
                  <span class="font-bold text-foreground">{{ analyzer.reagentLevel }}%</span>
                </div>
                <div class="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    [class.bg-emerald-500]="analyzer.reagentLevel > 50"
                    [class.bg-amber-500]="analyzer.reagentLevel <= 50 && analyzer.reagentLevel > 20"
                    [class.bg-rose-500]="analyzer.reagentLevel <= 20"
                    [style.width.%]="analyzer.reagentLevel"
                  ></div>
                </div>
              </div>

              <div class="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                <span class="flex items-center gap-1 font-mono">
                  <ng-icon name="lucideTestTube" size="10" /> {{ analyzer.queuedSamples }} Queued
                </span>
                <span>QC: {{ analyzer.lastQc }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Workflow Navigator (Right 1 col) -->
        <div hlmCard class="p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h2 class="text-sm font-bold text-foreground flex items-center gap-2 pb-3 border-b border-border">
              <ng-icon name="lucideTestTubes" size="16" class="text-teal-600" />
              <span>Workflow Accelerators</span>
            </h2>
            <div class="divide-y divide-border text-xs mt-2">
              <a
                routerLink="/lab-technician/worklist"
                [queryParams]="{ stage: 'ORDERED' }"
                class="py-2.5 flex items-center justify-between group hover:text-teal-600 transition-colors"
              >
                <div class="flex items-center gap-2">
                  <div class="size-6 rounded bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold text-[10px]">1</div>
                  <span>Receive Doctor Orders</span>
                </div>
                <ng-icon name="lucideChevronRight" size="14" class="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </a>

              <a
                routerLink="/lab-technician/worklist"
                [queryParams]="{ stage: 'SPECIMEN_COLLECTED' }"
                class="py-2.5 flex items-center justify-between group hover:text-teal-600 transition-colors"
              >
                <div class="flex items-center gap-2">
                  <div class="size-6 rounded bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-[10px]">2</div>
                  <span>Specimen Collection & Intake</span>
                </div>
                <ng-icon name="lucideChevronRight" size="14" class="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </a>

              <a
                routerLink="/lab-technician/worklist"
                [queryParams]="{ stage: 'ACCESSIONED' }"
                class="py-2.5 flex items-center justify-between group hover:text-teal-600 transition-colors"
              >
                <div class="flex items-center gap-2">
                  <div class="size-6 rounded bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-[10px]">3</div>
                  <span>Accession & Barcode Print</span>
                </div>
                <ng-icon name="lucideChevronRight" size="14" class="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </a>

              <a
                routerLink="/lab-technician/worklist"
                [queryParams]="{ stage: 'IN_PROCESS' }"
                class="py-2.5 flex items-center justify-between group hover:text-teal-600 transition-colors"
              >
                <div class="flex items-center gap-2">
                  <div class="size-6 rounded bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-[10px]">4</div>
                  <span>Analyzer Test Run</span>
                </div>
                <ng-icon name="lucideChevronRight" size="14" class="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </a>

              <a
                routerLink="/lab-technician/results"
                class="py-2.5 flex items-center justify-between group hover:text-teal-600 transition-colors"
              >
                <div class="flex items-center gap-2">
                  <div class="size-6 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-[10px]">5</div>
                  <span>LOINC Result & Sign-Off</span>
                </div>
                <ng-icon name="lucideChevronRight" size="14" class="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>

          <div class="pt-3 border-t border-border">
            <div class="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 text-xs text-teal-800 dark:text-teal-300 flex items-center gap-2">
              <ng-icon name="lucideShieldCheck" size="18" class="shrink-0 text-teal-600" />
              <span>All results auto-hashed to WORM compliance ledger upon pathologist digital sign-off.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Laboratory Worklist Table with Search & Stage Filter -->
      <div hlmCard class="p-6 space-y-4">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h2 class="text-base font-semibold text-foreground flex items-center gap-2">
              <span>Active Laboratory Queue</span>
              <span *ngIf="selectedFilter() !== 'ALL'" hlmBadge variant="outline" class="text-[10px] font-mono">
                Filtered: {{ selectedFilter() }}
              </span>
            </h2>
            <p class="text-xs text-muted-foreground">Real-time status tracking for clinical orders, specimens, and diagnostic results.</p>
          </div>

          <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <!-- Search input -->
            <div class="relative min-w-[220px] flex-1 md:flex-none">
              <input
                hlmInput
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChange()"
                placeholder="Search patient, MRN, test, barcode..."
                class="w-full text-xs h-8 pl-8 pr-3"
              />
              <ng-icon name="lucideSearch" size="13" class="absolute left-2.5 top-2.5 text-muted-foreground" />
            </div>

            <!-- Filter Reset -->
            <button
              *ngIf="selectedFilter() !== 'ALL' || searchQuery"
              hlmBtn
              variant="ghost"
              size="xs"
              (click)="resetFilters()"
              class="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear Filter
            </button>
          </div>
        </div>

        <div class="overflow-x-auto rounded-lg border border-border">
          <table hlmTable class="w-full text-xs">
            <thead hlmTableHeader>
              <tr hlmTableRow class="bg-muted/50 border-b border-border">
                <th hlmTableHead class="text-xs font-semibold py-2.5 px-3">Order ID / Priority</th>
                <th hlmTableHead class="text-xs font-semibold py-2.5 px-3">Patient & MRN</th>
                <th hlmTableHead class="text-xs font-semibold py-2.5 px-3">Diagnostic Test (LOINC)</th>
                <th hlmTableHead class="text-xs font-semibold py-2.5 px-3">Specimen Barcode</th>
                <th hlmTableHead class="text-xs font-semibold py-2.5 px-3">Lifecycle Stage</th>
                <th hlmTableHead class="text-xs font-semibold py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody class="divide-y divide-border">
              <tr *ngIf="loading()" hlmTableRow>
                <td colspan="6" class="py-8 text-center text-xs text-muted-foreground">
                  <div class="flex items-center justify-center gap-2">
                    <ng-icon name="lucideFlaskConical" class="animate-spin text-teal-600" size="16" />
                    <span>Loading LIS orders from laboratory server...</span>
                  </div>
                </td>
              </tr>
              <tr *ngIf="!loading() && error()" hlmTableRow>
                <td colspan="6" class="py-6 text-center text-xs text-destructive">
                  <p>{{ error() }}</p>
                  <button (click)="loadOrders()" class="mt-2 text-xs text-teal-600 underline">Retry Connection</button>
                </td>
              </tr>
              <tr *ngIf="!loading() && !error() && filteredOrders().length === 0" hlmTableRow>
                <td colspan="6" class="py-8 text-center text-xs text-muted-foreground">
                  No laboratory orders matching the current filter criteria.
                </td>
              </tr>
              <tr *ngFor="let order of filteredOrders()" hlmTableRow class="hover:bg-muted/30 transition-colors">
                <!-- Order ID & Priority -->
                <td hlmTableCell class="py-3 px-3">
                  <div class="flex items-center gap-1.5">
                    <span class="font-mono font-bold text-foreground">#LAB-{{ order.id }}</span>
                    <span
                      hlmBadge
                      [variant]="order.priority === 'STAT' ? 'destructive' : order.priority === 'URGENT' ? 'secondary' : 'outline'"
                      class="text-[9px] px-1 py-0 font-bold"
                    >
                      {{ order.priority || 'ROUTINE' }}
                    </span>
                  </div>
                  <span class="text-[10px] text-muted-foreground block mt-0.5">
                    Dr. {{ order.orderingProviderEmail || 'Staff Physician' }}
                  </span>
                </td>

                <!-- Patient & MRN -->
                <td hlmTableCell class="py-3 px-3">
                  <div class="font-semibold text-foreground">
                    {{ order.patientFullName || order.patient?.fullName || 'Patient #' + order.patientId }}
                  </div>
                  <div class="text-[10px] font-mono text-muted-foreground">
                    {{ order.patientMrn || (order.patient?.id ? 'MRN-' + order.patient?.id?.substring(0, 6)?.toUpperCase() : 'MRN-EHR') }}
                    <span *ngIf="order.patientGender"> • {{ order.patientGender }}</span>
                  </div>
                </td>

                <!-- Diagnostic Test & LOINC -->
                <td hlmTableCell class="py-3 px-3">
                  <div class="font-medium text-foreground">{{ order.testName }}</div>
                  <div class="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                    <span>LOINC: {{ order.loincCode || '4548-4' }}</span>
                    <span *ngIf="order.category" class="text-muted-foreground/60">• {{ order.category }}</span>
                  </div>
                </td>

                <!-- Specimen Barcode -->
                <td hlmTableCell class="py-3 px-3">
                  <div *ngIf="order.specimenBarcode" class="flex items-center gap-1.5">
                    <ng-icon name="lucideBarcode" size="13" class="text-teal-600" />
                    <span class="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded border border-border">
                      {{ order.specimenBarcode }}
                    </span>
                  </div>
                  <span *ngIf="!order.specimenBarcode" class="text-muted-foreground/60 italic text-[11px]">
                    Pending Specimen
                  </span>
                </td>

                <!-- Stage Badge -->
                <td hlmTableCell class="py-3 px-3">
                  <span
                    hlmBadge
                    [variant]="getStageBadgeVariant(order.status)"
                    class="text-[10px] font-bold uppercase tracking-wider"
                  >
                    {{ formatStage(order.status) }}
                  </span>
                </td>

                <!-- Action Button -->
                <td hlmTableCell class="py-3 px-3 text-right">
                  <button
                    hlmBtn
                    size="xs"
                    [variant]="order.status === 'IN_PROCESS' || order.status === 'IN_ANALYSIS' ? 'default' : 'outline'"
                    class="text-xs gap-1"
                    [class.bg-teal-600]="order.status === 'IN_PROCESS' || order.status === 'IN_ANALYSIS'"
                    [class.text-white]="order.status === 'IN_PROCESS' || order.status === 'IN_ANALYSIS'"
                    (click)="handleAction(order)"
                  >
                    <span>{{ getActionLabel(order.status) }}</span>
                    <ng-icon name="lucideArrowRight" size="12" />
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
export class LabTechnicianDashboardComponent implements OnInit {
  labOrders = signal<LabOrder[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  selectedFilter = signal<string>('ALL');
  searchQuery = '';

  analyzers: AnalyzerStatus[] = [
    {
      id: 'HEM-01',
      name: 'Sysmex XN-1000',
      discipline: 'Automated Hematology Analyzer',
      status: 'ONLINE',
      reagentLevel: 88,
      queuedSamples: 6,
      lastQc: 'Passed 07:30',
    },
    {
      id: 'CHEM-02',
      name: 'Roche Cobas 6000',
      discipline: 'Clinical Chemistry & Electrolytes',
      status: 'RUNNING',
      reagentLevel: 94,
      queuedSamples: 8,
      lastQc: 'Passed 06:45',
    },
    {
      id: 'IMM-03',
      name: 'Abbott Architect i2000SR',
      discipline: 'High-Sensitivity Immunoassay',
      status: 'ONLINE',
      reagentLevel: 62,
      queuedSamples: 3,
      lastQc: 'Passed 08:15',
    },
    {
      id: 'HPLC-04',
      name: 'Bio-Rad D-10 HPLC',
      discipline: 'Glycated Hemoglobin HbA1c System',
      status: 'ONLINE',
      reagentLevel: 75,
      queuedSamples: 2,
      lastQc: 'Passed 08:00',
    },
  ];

  statOrders = computed(() =>
    this.labOrders().filter((o) => o.priority === 'STAT' || (o.testName && o.testName.toUpperCase().includes('STAT')))
  );

  filteredOrders = computed(() => {
    let list = this.labOrders();
    const filter = this.selectedFilter();
    const query = this.searchQuery.trim().toLowerCase();

    if (filter !== 'ALL') {
      if (filter === 'ORDERED') {
        list = list.filter((o) => o.status === 'ORDERED' || o.status === 'RECEIVED');
      } else if (filter === 'SPECIMEN_COLLECTED') {
        list = list.filter((o) => o.status === 'SPECIMEN_COLLECTED' || o.status === 'COLLECTED');
      } else if (filter === 'ACCESSIONED') {
        list = list.filter((o) => o.status === 'ACCESSIONED');
      } else if (filter === 'IN_PROCESS') {
        list = list.filter((o) => o.status === 'IN_PROCESS' || o.status === 'IN_ANALYSIS');
      } else if (filter === 'RESULTED') {
        list = list.filter((o) => o.status === 'RESULTED' || o.status === 'COMPLETED' || o.status === 'VERIFIED');
      }
    }

    if (query) {
      list = list.filter((o) => {
        const idMatch = String(o.id).includes(query);
        const testMatch = o.testName?.toLowerCase().includes(query);
        const loincMatch = o.loincCode?.toLowerCase().includes(query);
        const patientMatch = (o.patientFullName || o.patient?.fullName || '').toLowerCase().includes(query);
        const mrnMatch = (o.patientMrn || '').toLowerCase().includes(query);
        const barcodeMatch = (o.specimenBarcode || '').toLowerCase().includes(query);
        return idMatch || testMatch || loincMatch || patientMatch || mrnMatch || barcodeMatch;
      });
    }

    return list;
  });

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);
    this.apiService.getLabOrdersList().subscribe({
      next: (orders) => {
        this.labOrders.set(Array.isArray(orders) ? orders : []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load lab orders:', err);
        this.error.set('Failed to connect to LIS server. Please retry.');
        this.loading.set(false);
      },
    });
  }

  countByStage(stage: string): number {
    const list = this.labOrders();
    switch (stage) {
      case 'ORDERED':
        return list.filter((o) => o.status === 'ORDERED' || o.status === 'RECEIVED').length;
      case 'SPECIMEN_COLLECTED':
        return list.filter((o) => o.status === 'SPECIMEN_COLLECTED' || o.status === 'COLLECTED').length;
      case 'ACCESSIONED':
        return list.filter((o) => o.status === 'ACCESSIONED').length;
      case 'IN_PROCESS':
        return list.filter((o) => o.status === 'IN_PROCESS' || o.status === 'IN_ANALYSIS').length;
      case 'RESULTED':
        return list.filter((o) => o.status === 'RESULTED' || o.status === 'COMPLETED' || o.status === 'VERIFIED').length;
      default:
        return 0;
    }
  }

  filterByStage(stage: string): void {
    if (this.selectedFilter() === stage) {
      this.selectedFilter.set('ALL');
    } else {
      this.selectedFilter.set(stage);
    }
  }

  resetFilters(): void {
    this.selectedFilter.set('ALL');
    this.searchQuery = '';
  }

  onSearchChange(): void {
    // reactive signal computation triggers automatically
  }

  formatStage(status: string): string {
    switch (status) {
      case 'ORDERED': return '1. Ordered';
      case 'RECEIVED': return '1. Received Order';
      case 'SPECIMEN_COLLECTED':
      case 'COLLECTED': return '2. Specimen Collected';
      case 'ACCESSIONED': return '3. Accessioned';
      case 'IN_PROCESS':
      case 'IN_ANALYSIS': return '4. In Analysis';
      case 'RESULTED': return '5. Resulted';
      case 'COMPLETED':
      case 'VERIFIED': return '5. Verified & Released';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  }

  getStageBadgeVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (status) {
      case 'ORDERED':
      case 'RECEIVED': return 'outline';
      case 'SPECIMEN_COLLECTED':
      case 'COLLECTED': return 'secondary';
      case 'ACCESSIONED': return 'secondary';
      case 'IN_PROCESS':
      case 'IN_ANALYSIS': return 'default';
      case 'RESULTED':
      case 'COMPLETED':
      case 'VERIFIED': return 'secondary';
      case 'CANCELLED': return 'destructive';
      default: return 'outline';
    }
  }

  getActionLabel(status: string): string {
    switch (status) {
      case 'ORDERED': return 'Acknowledge';
      case 'RECEIVED': return 'Collect Specimen';
      case 'SPECIMEN_COLLECTED':
      case 'COLLECTED': return 'Accession Sample';
      case 'ACCESSIONED': return 'Run Analyzer';
      case 'IN_PROCESS':
      case 'IN_ANALYSIS': return 'Enter Results';
      case 'RESULTED': return 'Verify & Sign';
      case 'COMPLETED':
      case 'VERIFIED': return 'View Result';
      default: return 'Process';
    }
  }

  handleAction(order: LabOrder): void {
    if (order.status === 'IN_PROCESS' || order.status === 'IN_ANALYSIS' || order.status === 'RESULTED' || order.status === 'VERIFIED' || order.status === 'COMPLETED') {
      this.router.navigate(['/lab-technician/results'], {
        queryParams: { orderId: order.id, test: order.testName, loinc: order.loincCode },
      });
    } else {
      this.router.navigate(['/lab-technician/worklist'], {
        queryParams: { orderId: order.id, action: order.status },
      });
    }
  }
}
