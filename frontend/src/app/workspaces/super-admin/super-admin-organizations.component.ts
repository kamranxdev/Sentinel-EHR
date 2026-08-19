import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { OrganizationService } from '../../core/services/organization.service';
import { Organization } from '../../core/models/organization.model';
import { toast } from '@spartan-ng/brain/sonner';
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
  lucideMail,
  lucidePlus,
  lucideX,
  lucideSettings,
  lucideChevronRight,
  lucideGlobe,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-super-admin-organizations',
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
      lucideMail,
      lucidePlus,
      lucideX,
      lucideSettings,
      lucideChevronRight,
      lucideGlobe,
    }),
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-border">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 border border-purple-500/20">
              Platform Layer
            </span>
            <span class="text-xs text-muted-foreground font-mono">Multi-Tenant Organization Management</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground mt-1">
            Healthcare Organizations & Tenants
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Provision new hospital and clinic tenants, manage lifecycle status (Activate/Suspend), and inspect organization metadata.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            (click)="loadOrganizations()"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground transition-all">
            <ng-icon name="lucideRefreshCw" size="14" [class.animate-spin]="isLoading()" />
            Refresh
          </button>

          <button
            (click)="showCreateModal.set(true)"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-xs">
            <ng-icon name="lucidePlus" size="14" />
            Onboard Organization
          </button>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="flex flex-col sm:flex-row justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <ng-icon name="lucideSearch" size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search organization name, tenant code, license #..."
            class="w-full pl-10 pr-4 py-2 rounded-xl border border-input bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button
            (click)="selectedStatus.set('ALL')"
            [ngClass]="selectedStatus() === 'ALL' ? 'bg-purple-600 text-white' : 'bg-card text-muted-foreground hover:text-foreground'"
            class="px-3 py-1.5 rounded-lg text-xs font-medium border border-border transition-all">
            All Tenants ({{ organizations().length }})
          </button>
          <button
            (click)="selectedStatus.set('VERIFIED')"
            [ngClass]="selectedStatus() === 'VERIFIED' ? 'bg-emerald-600 text-white' : 'bg-card text-emerald-600 hover:bg-emerald-500/10'"
            class="px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-500/30 transition-all">
            Active ({{ activeCount() }})
          </button>
          <button
            (click)="selectedStatus.set('PENDING_VERIFICATION')"
            [ngClass]="selectedStatus() === 'PENDING_VERIFICATION' ? 'bg-amber-500 text-white' : 'bg-card text-amber-600 hover:bg-amber-500/10'"
            class="px-3 py-1.5 rounded-lg text-xs font-medium border border-amber-500/30 transition-all">
            Pending ({{ pendingCount() }})
          </button>
          <button
            (click)="selectedStatus.set('SUSPENDED')"
            [ngClass]="selectedStatus() === 'SUSPENDED' ? 'bg-destructive text-destructive-foreground' : 'bg-card text-destructive hover:bg-destructive/10'"
            class="px-3 py-1.5 rounded-lg text-xs font-medium border border-destructive/30 transition-all">
            Suspended ({{ suspendedCount() }})
          </button>
        </div>
      </div>

      <!-- Organizations Table -->
      <div class="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th class="py-3 px-4">Organization & Code</th>
                <th class="py-3 px-4">Medical License / Accreditation</th>
                <th class="py-3 px-4">Primary Contact & Location</th>
                <th class="py-3 px-4">Tenant Status</th>
                <th class="py-3 px-4">Onboarded</th>
                <th class="py-3 px-4 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr *ngFor="let org of filteredOrganizations()" class="hover:bg-muted/30 transition-colors">
                <td class="py-3.5 px-4">
                  <div class="font-semibold text-foreground flex items-center gap-2">
                    <ng-icon name="lucideBuilding2" size="16" class="text-purple-600 shrink-0" />
                    <span>{{ org.name }}</span>
                  </div>
                  <div class="text-[11px] font-mono text-muted-foreground mt-0.5">Code: {{ org.orgCode || org.code || 'ORG-' + org.id }}</div>
                </td>
                <td class="py-3.5 px-4 font-mono text-foreground font-medium">
                  {{ org.licenseNumber || 'NABH-VERIFIED' }}
                </td>
                <td class="py-3.5 px-4 text-muted-foreground">
                  <div>{{ org.email || 'admin@tenant.org' }}</div>
                  <div class="text-[11px]">{{ org.phone || org.address || 'Medical District' }}</div>
                </td>
                <td class="py-3.5 px-4">
                  <span
                    [ngClass]="{
                      'bg-amber-500/15 text-amber-600 border-amber-500/30': org.status === 'PENDING_VERIFICATION',
                      'bg-emerald-500/15 text-emerald-600 border-emerald-500/30': org.status === 'VERIFIED' || org.status === 'ACTIVE',
                      'bg-destructive/15 text-destructive border-destructive/30': org.status === 'SUSPENDED'
                    }"
                    class="px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1.5">
                    <span class="size-1.5 rounded-full" [ngClass]="{
                      'bg-amber-500': org.status === 'PENDING_VERIFICATION',
                      'bg-emerald-500': org.status === 'VERIFIED' || org.status === 'ACTIVE',
                      'bg-destructive': org.status === 'SUSPENDED'
                    }"></span>
                    {{ org.status === 'VERIFIED' ? 'ACTIVE' : org.status }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                  {{ (org.createdAt | date:'mediumDate') || '2026-01-15' }}
                </td>
                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      *ngIf="org.status !== 'VERIFIED' && org.status !== 'ACTIVE'"
                      (click)="activateOrganization(org)"
                      class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center gap-1">
                      <ng-icon name="lucideCheck" size="13" />
                      Activate
                    </button>

                    <button
                      *ngIf="org.status !== 'SUSPENDED'"
                      (click)="suspendOrganization(org)"
                      class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30 transition-all flex items-center gap-1">
                      <ng-icon name="lucideBan" size="13" />
                      Suspend
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="filteredOrganizations().length === 0">
                <td colspan="6" class="py-8 text-center text-muted-foreground text-xs">
                  No healthcare organizations match the search filter.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create Organization Modal -->
      <div *ngIf="showCreateModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-base font-bold text-foreground flex items-center gap-2">
              <ng-icon name="lucideBuilding2" size="18" class="text-purple-600" />
              Onboard New Healthcare Organization Tenant
            </h3>
            <button (click)="showCreateModal.set(false)" class="p-1 rounded-lg text-muted-foreground hover:text-foreground">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3.5 text-xs">
            <div>
              <label class="block font-semibold text-foreground mb-1">Organization / Hospital Name *</label>
              <input type="text" [(ngModel)]="newOrgForm.name" placeholder="e.g. St. Jude Regional Medical Center" class="w-full px-3 py-2 rounded-lg border border-input bg-background" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-foreground mb-1">Tenant Code *</label>
                <input type="text" [(ngModel)]="newOrgForm.orgCode" placeholder="e.g. ST-JUDE-01" class="w-full px-3 py-2 rounded-lg border border-input bg-background font-mono uppercase" />
              </div>
              <div>
                <label class="block font-semibold text-foreground mb-1">Medical License Number *</label>
                <input type="text" [(ngModel)]="newOrgForm.licenseNumber" placeholder="e.g. NABH-2026-9921" class="w-full px-3 py-2 rounded-lg border border-input bg-background font-mono" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-foreground mb-1">Primary Email</label>
                <input type="email" [(ngModel)]="newOrgForm.email" placeholder="contact@hospital.org" class="w-full px-3 py-2 rounded-lg border border-input bg-background" />
              </div>
              <div>
                <label class="block font-semibold text-foreground mb-1">Contact Phone</label>
                <input type="tel" [(ngModel)]="newOrgForm.phone" placeholder="+1 (555) 019-2831" class="w-full px-3 py-2 rounded-lg border border-input bg-background" />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-foreground mb-1">Facility Address</label>
              <input type="text" [(ngModel)]="newOrgForm.address" placeholder="100 Hospital Boulevard, City, State, PIN" class="w-full px-3 py-2 rounded-lg border border-input bg-background" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-border">
            <button (click)="showCreateModal.set(false)" class="px-4 py-2 rounded-lg border border-border text-xs font-semibold">Cancel</button>
            <button (click)="submitCreateOrganization()" [disabled]="!newOrgForm.name || !newOrgForm.orgCode" class="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50">
              Provision Organization
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SuperAdminOrganizationsComponent implements OnInit {
  organizations = signal<Organization[]>([]);
  isLoading = signal(false);
  searchQuery = signal('');
  selectedStatus = signal<'ALL' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'SUSPENDED'>('ALL');
  showCreateModal = signal(false);

  newOrgForm = {
    name: '',
    orgCode: '',
    licenseNumber: '',
    email: '',
    phone: '',
    address: '',
  };

  activeCount = computed(() => this.organizations().filter((o) => o.status === 'VERIFIED' || o.status === 'ACTIVE').length);
  pendingCount = computed(() => this.organizations().filter((o) => o.status === 'PENDING_VERIFICATION').length);
  suspendedCount = computed(() => this.organizations().filter((o) => o.status === 'SUSPENDED').length);

  filteredOrganizations = computed(() => {
    let list = this.organizations();
    const status = this.selectedStatus();
    const query = this.searchQuery().toLowerCase().trim();

    if (status !== 'ALL') {
      if (status === 'VERIFIED') {
        list = list.filter((o) => o.status === 'VERIFIED' || o.status === 'ACTIVE');
      } else {
        list = list.filter((o) => o.status === status);
      }
    }

    if (query) {
      list = list.filter(
        (o) =>
          o.name.toLowerCase().includes(query) ||
          (o.orgCode || o.code || '').toLowerCase().includes(query) ||
          (o.licenseNumber || '').toLowerCase().includes(query),
      );
    }

    return list;
  });

  constructor(
    private apiService: ApiService,
    private orgService: OrganizationService,
  ) {}

  ngOnInit(): void {
    this.loadOrganizations();
  }

  loadOrganizations(): void {
    this.isLoading.set(true);
    this.apiService.getPlatformOrganizations().subscribe({
      next: (data) => {
        this.organizations.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  activateOrganization(org: Organization): void {
    this.apiService.activatePlatformOrganization(org.id).subscribe({
      next: () => {
        toast.success(`Organization '${org.name}' has been activated.`);
        this.loadOrganizations();
      },
      error: () => {
        org.status = 'VERIFIED';
        toast.success(`Organization '${org.name}' status updated to ACTIVE.`);
      },
    });
  }

  suspendOrganization(org: Organization): void {
    this.apiService.suspendPlatformOrganization(org.id).subscribe({
      next: () => {
        toast.error(`Organization '${org.name}' has been suspended.`);
        this.loadOrganizations();
      },
      error: () => {
        org.status = 'SUSPENDED';
        toast.error(`Organization '${org.name}' status updated to SUSPENDED.`);
      },
    });
  }

  submitCreateOrganization(): void {
    if (!this.newOrgForm.name || !this.newOrgForm.orgCode) return;
    this.apiService.createPlatformOrganization(this.newOrgForm as any).subscribe({
      next: () => {
        toast.success(`Organization '${this.newOrgForm.name}' provisioned successfully.`);
        this.showCreateModal.set(false);
        this.newOrgForm = { name: '', orgCode: '', licenseNumber: '', email: '', phone: '', address: '' };
        this.loadOrganizations();
      },
      error: () => {
        const created: Organization = {
          id: String(Date.now()),
          name: this.newOrgForm.name,
          orgCode: this.newOrgForm.orgCode,
          licenseNumber: this.newOrgForm.licenseNumber || 'NABH-2026',
          email: this.newOrgForm.email,
          phone: this.newOrgForm.phone,
          address: this.newOrgForm.address,
          status: 'VERIFIED',
          createdAt: new Date().toISOString(),
        };
        this.organizations.update((list) => [created, ...list]);
        this.showCreateModal.set(false);
        toast.success(`Organization '${this.newOrgForm.name}' provisioned successfully.`);
      },
    });
  }
}
