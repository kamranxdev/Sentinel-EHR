import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { StatCardComponent } from '../../shared/ui/stat-card.component';
import { Patient } from '../../core/models/patient.model';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideTestTube,
  lucideFileSpreadsheet,
  lucideCheckCheck,
  lucideFlaskConical,
  lucideMicroscope,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-labtech-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatCardComponent,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideTestTube,
      lucideFileSpreadsheet,
      lucideCheckCheck,
      lucideFlaskConical,
      lucideMicroscope,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Lab Tech Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
            <ng-icon name="lucideMicroscope" size="24" />
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Clinical Laboratory & Pathology Center
              <span hlmBadge variant="secondary" class="text-[11px]">Lab Technician</span>
            </h1>
            <p class="text-xs text-muted-foreground mt-0.5">Specimen processing, diagnostic orders, and pathology report verification.</p>
          </div>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <app-stat-card
          title="Pending Specimen Queue"
          [value]="specimenQueueCount()"
          subtitle="Awaiting Processing"
          icon="lucideTestTube"
          iconBgClass="bg-teal-500/10 text-teal-600" />
        <app-stat-card
          title="Verified Reports"
          [value]="verifiedCount()"
          subtitle="LOINC Coded Diagnostic Data"
          icon="lucideCheckCheck"
          iconBgClass="bg-emerald-500/10 text-emerald-600" />
        <app-stat-card
          title="Lab Analyzer Status"
          value="ONLINE"
          subtitle="Pathology Station #2"
          icon="lucideFlaskConical"
          iconBgClass="bg-purple-500/10 text-purple-600" />
      </div>

      <!-- Lab Worklist Table -->
      <div hlmCard class="p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold text-foreground">Diagnostic Test Worklist</h2>
            <p class="text-xs text-muted-foreground">Process incoming lab orders and input diagnostic test results.</p>
          </div>
        </div>

        <div class="overflow-x-auto rounded-lg border border-border">
          <table hlmTable class="w-full">
            <thead hlmTableHeader>
              <tr hlmTableRow>
                <th hlmTableHead class="text-xs font-semibold">Patient Name</th>
                <th hlmTableHead class="text-xs font-semibold">Test Description</th>
                <th hlmTableHead class="text-xs font-semibold">LOINC Code</th>
                <th hlmTableHead class="text-xs font-semibold">Priority</th>
                <th hlmTableHead class="text-xs font-semibold text-right">Result Action</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              <tr *ngIf="loading()" hlmTableRow>
                <td colspan="5" class="py-8 text-center text-xs text-muted-foreground">
                  <div class="flex items-center justify-center gap-2">
                    <ng-icon name="lucideFlaskConical" class="animate-spin text-teal-600" size="16" />
                    <span>Loading diagnostic worklist from laboratory server...</span>
                  </div>
                </td>
              </tr>
              <tr *ngIf="!loading() && error()" hlmTableRow>
                <td colspan="5" class="py-6 text-center text-xs text-destructive">
                  <p>{{ error() }}</p>
                  <button (click)="loadOrders()" class="mt-2 text-xs text-teal-600 underline">Retry</button>
                </td>
              </tr>
              <tr *ngIf="!loading() && !error() && labSamples().length === 0" hlmTableRow>
                <td colspan="5" class="py-8 text-center text-xs text-muted-foreground">
                  No active diagnostic test orders in the laboratory worklist.
                </td>
              </tr>
              <tr *ngFor="let sample of labSamples()" hlmTableRow>
                <td hlmTableCell class="font-medium text-foreground text-xs">{{ sample.patientName }}</td>
                <td hlmTableCell class="text-xs text-muted-foreground">{{ sample.testName }}</td>
                <td hlmTableCell class="text-xs font-mono text-muted-foreground">{{ sample.loinc }}</td>
                <td hlmTableCell>
                  <span hlmBadge [variant]="sample.priority === 'STAT' ? 'destructive' : 'secondary'" class="text-[10px]">
                    {{ sample.priority }}
                  </span>
                </td>
                <td hlmTableCell class="text-right">
                  <button hlmBtn size="sm" variant="ghost" class="text-xs text-teal-600 hover:text-teal-700" (click)="enterResult(sample)">
                    Enter Result
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
export class LabTechDashboardComponent implements OnInit {
  labSamples = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  specimenQueueCount = computed(() => this.labSamples().filter((o) => o.status !== 'COMPLETED').length);
  verifiedCount = computed(() => this.labSamples().filter((o) => o.status === 'COMPLETED').length);

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
        const list = (Array.isArray(orders) ? orders : []).map((o) => ({
          id: o.id,
          patientName: o.patient?.fullName || (o as any).patientName || 'Patient',
          testName: o.testName,
          loinc: o.loincCode || '4548-4',
          priority: o.priority || 'ROUTINE',
          status: o.status,
        }));
        this.labSamples.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load lab orders:', err);
        this.error.set('Failed to load diagnostic worklist from laboratory server.');
        this.loading.set(false);
      },
    });
  }

  enterResult(sample: any): void {
    this.router.navigate(['/labtech/worklist']);
  }
}
