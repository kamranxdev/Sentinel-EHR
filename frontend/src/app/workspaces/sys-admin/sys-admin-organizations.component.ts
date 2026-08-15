import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrganizationService } from '../../core/services/organization.service';
import { Organization } from '../../core/models/organization.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2,
  lucideCheckCircle2,
  lucideAlertCircle,
  lucideClock,
  lucideRefreshCw,
  lucideSearch,
  lucideShieldCheck,
  lucideBan,
  lucideCheck,
  lucideMapPin,
  lucideFileText,
  lucideMail
} from '@ng-icons/lucide';

@Component({
  selector: 'app-sys-admin-organizations',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgIcon],
  providers: [
    provideIcons({
      lucideBuilding2,
      lucideCheckCircle2,
      lucideAlertCircle,
      lucideClock,
      lucideRefreshCw,
      lucideSearch,
      lucideShieldCheck,
      lucideBan,
      lucideCheck,
      lucideMapPin,
      lucideFileText,
      lucideMail
    })
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-border">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              System Admin Desk
            </span>
            <span class="text-xs text-muted-foreground font-mono">Multi-Tenant Governance</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground mt-1">
            Healthcare Facility Hierarchy & Onboarding
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Review registration applications, verify hospital licensing, and approve facility access across tenants.
          </p>
        </div>

        <button
          (click)="loadOrganizations()"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground transition-all">
          <ng-icon name="lucideRefreshCw" size="14" [class.animate-spin]="isLoading()" />
          Refresh Facilities
        </button>
      </div>

      <!-- Toast Alert Banner -->
      <div *ngIf="alertMessage()" class="p-4 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-xs bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
        <div class="flex items-center gap-2">
          <ng-icon name="lucideCheckCircle2" size="16" />
          <span>{{ alertMessage() }}</span>
        </div>
        <button (click)="alertMessage.set(null)" class="text-xs font-mono opacity-70 hover:opacity-100">Dismiss</button>
      </div>

      <!-- Search & Filters -->
      <div class="flex flex-col sm:flex-row justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <ng-icon name="lucideSearch" size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search facility name, org code, license #..."
            class="w-full pl-10 pr-4 py-2 rounded-xl border border-input bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div class="flex items-center gap-2">
          <button
            (click)="selectedStatus.set('ALL')"
            [ngClass]="selectedStatus() === 'ALL' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'"
            class="px-3 py-1.5 rounded-lg text-xs font-medium border border-border transition-all">
            All Facilities ({{ organizations().length }})
          </button>
          <button
            (click)="selectedStatus.set('PENDING_VERIFICATION')"
            [ngClass]="selectedStatus() === 'PENDING_VERIFICATION' ? 'bg-amber-500 text-white' : 'bg-card text-amber-600 hover:bg-amber-500/10'"
            class="px-3 py-1.5 rounded-lg text-xs font-medium border border-amber-500/30 transition-all">
            Pending ({{ pendingCount() }})
          </button>
          <button
            (click)="selectedStatus.set('VERIFIED')"
            [ngClass]="selectedStatus() === 'VERIFIED' ? 'bg-emerald-600 text-white' : 'bg-card text-emerald-600 hover:bg-emerald-500/10'"
            class="px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-500/30 transition-all">
            Verified ({{ verifiedCount() }})
          </button>
        </div>
      </div>

      <!-- Facilities Table -->
      <div class="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th class="py-3 px-4">Facility Code & Name</th>
                <th class="py-3 px-4">Medical License #</th>
                <th class="py-3 px-4">Contact Info</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Registered Date</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr *ngFor="let org of filteredOrganizations()" class="hover:bg-muted/30 transition-colors">
                <td class="py-3.5 px-4">
                  <div class="font-semibold text-foreground flex items-center gap-2">
                    <ng-icon name="lucideBuilding2" size="16" class="text-primary shrink-0" />
                    <span>{{ org.name }}</span>
                  </div>
                  <div class="text-[11px] font-mono text-muted-foreground mt-0.5">Code: {{ org.orgCode }}</div>
                </td>
                <td class="py-3.5 px-4 font-mono text-foreground font-medium">
                  {{ org.licenseNumber }}
                </td>
                <td class="py-3.5 px-4 text-muted-foreground">
                  <div>{{ org.email || 'N/A' }}</div>
                  <div class="text-[11px]">{{ org.phone || 'N/A' }}</div>
                </td>
                <td class="py-3.5 px-4">
                  <span
                    [ngClass]="{
                      'bg-amber-500/15 text-amber-600 border-amber-500/30': org.status === 'PENDING_VERIFICATION',
                      'bg-emerald-500/15 text-emerald-600 border-emerald-500/30': org.status === 'VERIFIED',
                      'bg-destructive/15 text-destructive border-destructive/30': org.status === 'SUSPENDED'
                    }"
                    class="px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1.5">
                    <span class="size-1.5 rounded-full" [ngClass]="{
                      'bg-amber-500': org.status === 'PENDING_VERIFICATION',
                      'bg-emerald-500': org.status === 'VERIFIED',
                      'bg-destructive': org.status === 'SUSPENDED'
                    }"></span>
                    {{ org.status }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                  {{ org.createdAt | date:'mediumDate' }}
                </td>
                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      *ngIf="org.status !== 'VERIFIED'"
                      (click)="updateStatus(org, 'VERIFIED')"
                      class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center gap-1">
                      <ng-icon name="lucideCheck" size="13" />
                      Approve & Verify
                    </button>

                    <button
                      *ngIf="org.status !== 'SUSPENDED'"
                      (click)="updateStatus(org, 'SUSPENDED')"
                      class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30 transition-all flex items-center gap-1">
                      <ng-icon name="lucideBan" size="13" />
                      Suspend
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="filteredOrganizations().length === 0">
                <td colspan="6" class="py-8 text-center text-muted-foreground text-xs">
                  No medical facilities match the current search filter.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class SysAdminOrganizationsComponent implements OnInit {
  organizations = signal<Organization[]>([]);
  isLoading = signal(false);
  alertMessage = signal<string | null>(null);
  searchQuery = signal('');
  selectedStatus = signal<'ALL' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'SUSPENDED'>('ALL');

  pendingCount = computed(() => this.organizations().filter(o => o.status === 'PENDING_VERIFICATION').length);
  verifiedCount = computed(() => this.organizations().filter(o => o.status === 'VERIFIED').length);

  filteredOrganizations = computed(() => {
    let list = this.organizations();
    const status = this.selectedStatus();
    const query = this.searchQuery().toLowerCase().trim();

    if (status !== 'ALL') {
      list = list.filter(o => o.status === status);
    }

    if (query) {
      list = list.filter(o =>
        o.name.toLowerCase().includes(query) ||
        o.orgCode.toLowerCase().includes(query) ||
        o.licenseNumber.toLowerCase().includes(query)
      );
    }

    return list;
  });

  constructor(private orgService: OrganizationService) {}

  ngOnInit(): void {
    this.loadOrganizations();
  }

  loadOrganizations(): void {
    this.isLoading.set(true);
    this.orgService.getAllOrganizations().subscribe({
      next: (data) => {
        this.organizations.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  updateStatus(org: Organization, newStatus: 'VERIFIED' | 'SUSPENDED'): void {
    this.orgService.updateOrganizationStatus(org.id, { status: newStatus }).subscribe({
      next: (updated) => {
        this.alertMessage.set(`Facility '${updated.name}' status has been updated to ${newStatus}.`);
        this.loadOrganizations();
      }
    });
  }
}
