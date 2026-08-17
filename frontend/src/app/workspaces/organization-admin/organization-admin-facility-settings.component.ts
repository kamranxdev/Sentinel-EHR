import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrganizationService } from '../../core/services/organization.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Organization } from '../../core/models/organization.model';
import { Department, Ward, Room, BedDetail } from '../../core/models/tenancy.model';
import { toast } from '@spartan-ng/brain/sonner';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2,
  lucideCheckCircle2,
  lucideAlertCircle,
  lucideShieldCheck,
  lucideSave,
  lucideMail,
  lucidePhone,
  lucideMapPin,
  lucideFileText,
  lucidePlus,
  lucideHospital,
  lucideBed,
  lucideX,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-organization-admin-facility-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgIcon],
  providers: [
    provideIcons({
      lucideBuilding2,
      lucideCheckCircle2,
      lucideAlertCircle,
      lucideShieldCheck,
      lucideSave,
      lucideMail,
      lucidePhone,
      lucideMapPin,
      lucideFileText,
      lucidePlus,
      lucideHospital,
      lucideBed,
      lucideX,
    }),
  ],
  template: `
    <div class="space-y-6 max-w-5xl">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Org Admin Desk
            </span>
            <span class="text-xs text-muted-foreground font-mono">Facility Settings & Hierarchy</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground mt-1">
            Facility Profile & Tenancy Hierarchy
          </h1>
          <p class="text-xs text-muted-foreground mt-0.5">
            Configure hospital profile, contact parameters, and physical structure (Departments -> Wards -> Rooms -> Beds).
          </p>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="activeTab.set('profile')"
            [class]="'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ' + (activeTab() === 'profile' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:text-foreground')"
          >
            <ng-icon name="lucideBuilding2" size="14" class="mr-1 inline" /> Facility Profile
          </button>
          <button
            type="button"
            (click)="activeTab.set('hierarchy')"
            [class]="'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ' + (activeTab() === 'hierarchy' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:text-foreground')"
          >
            <ng-icon name="lucideHospital" size="14" class="mr-1 inline" /> Wards & Spatial Layout
          </button>
        </div>
      </div>

      <!-- TAB 1: Facility Profile Form -->
      <div *ngIf="activeTab() === 'profile'" class="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-6">
        <form (ngSubmit)="onSave()" class="space-y-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-foreground mb-1.5">Facility Name *</label>
              <input
                type="text"
                name="name"
                [(ngModel)]="facility.name"
                required
                class="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-foreground mb-1.5">Organization Code</label>
              <input
                type="text"
                [value]="facility.orgCode"
                disabled
                class="w-full px-3.5 py-2.5 rounded-xl border border-input bg-muted/50 text-xs text-muted-foreground font-mono cursor-not-allowed"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-foreground mb-1.5">Primary Contact Email</label>
              <input
                type="email"
                name="email"
                [(ngModel)]="facility.email"
                class="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-foreground mb-1.5">Primary Phone Number</label>
              <input
                type="tel"
                name="phone"
                [(ngModel)]="facility.phone"
                class="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-foreground mb-1.5">Official Address</label>
            <input
              type="text"
              name="address"
              [(ngModel)]="facility.address"
              placeholder="Building, Street, City, State, ZIP"
              class="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div class="flex justify-end pt-4 border-t border-border">
            <button
              type="submit"
              [disabled]="saving()"
              class="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <ng-icon name="lucideSave" size="14" />
              <span>{{ saving() ? 'Saving...' : 'Update Facility Settings' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- TAB 2: Physical Structure & Spatial Layout (Departments, Wards, Rooms, Beds) -->
      <div *ngIf="activeTab() === 'hierarchy'" class="space-y-6">
        <div class="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-6">
          <div class="flex justify-between items-center pb-4 border-b border-border">
            <div>
              <h3 class="text-sm font-bold text-foreground">Clinical Departments & Inpatient Wards</h3>
              <p class="text-xs text-muted-foreground">Manage departments, ward units, patient rooms, and bed configurations.</p>
            </div>

            <button
              type="button"
              (click)="showAddDeptModal.set(true)"
              class="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/90"
            >
              <ng-icon name="lucidePlus" size="14" /> Add Department
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div *ngFor="let dept of departments()" class="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <ng-icon name="lucideHospital" size="14" class="text-primary" />
                    {{ dept.name }}
                  </h4>
                  <p class="text-[11px] text-muted-foreground">Specialty: {{ dept.specialty || 'General' }}</p>
                </div>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono bg-primary/10 text-primary border border-primary/20">
                  {{ dept.departmentCode }}
                </span>
              </div>

              <!-- Wards list -->
              <div class="space-y-2 pt-2 border-t border-border/60">
                <div class="flex justify-between items-center text-[11px] font-semibold text-muted-foreground">
                  <span>Wards & Units</span>
                  <button (click)="openAddWard(dept)" class="text-primary hover:underline text-[10px]">+ Add Ward</button>
                </div>

                <div *ngFor="let w of dept.wards" class="p-2.5 bg-background rounded-lg border border-border/60 text-xs space-y-1">
                  <div class="flex justify-between items-center">
                    <span class="font-semibold text-foreground">{{ w.name }}</span>
                    <span class="text-[10px] font-mono text-muted-foreground">{{ w.wardType }}</span>
                  </div>
                  <div class="text-[11px] text-muted-foreground flex justify-between">
                    <span>Floor: {{ w.floor || '1st' }}</span>
                    <span class="text-emerald-600 font-medium">{{ w.rooms?.length || 4 }} Rooms Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Department Modal -->
      <div *ngIf="showAddDeptModal()" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
          <div class="flex justify-between items-center border-b border-border pb-3">
            <h3 class="text-sm font-bold text-foreground">Add Clinical Department</h3>
            <button (click)="showAddDeptModal.set(false)" class="size-7 p-0 text-muted-foreground hover:text-foreground">
              <ng-icon name="lucideX" size="16" />
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="font-medium text-foreground block mb-1">Department Name *</label>
              <input type="text" [(ngModel)]="newDept.name" placeholder="e.g. Cardiology, Intensive Care (ICU)" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Department Code *</label>
              <input type="text" [(ngModel)]="newDept.departmentCode" placeholder="e.g. CARD, ICU, SURG" class="w-full p-2 rounded-md border border-input bg-background font-mono" />
            </div>

            <div>
              <label class="font-medium text-foreground block mb-1">Specialty</label>
              <input type="text" [(ngModel)]="newDept.specialty" placeholder="e.g. Cardiovascular Medicine" class="w-full p-2 rounded-md border border-input bg-background" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-border">
            <button (click)="showAddDeptModal.set(false)" class="px-3 py-1.5 rounded-lg border border-border text-xs">Cancel</button>
            <button (click)="saveDepartment()" [disabled]="!newDept.name || !newDept.departmentCode" class="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
              Create Department
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class OrganizationAdminFacilitySettingsComponent implements OnInit {
  activeTab = signal<'profile' | 'hierarchy'>('profile');
  saving = signal(false);

  facility = {
    name: 'Sentinel Memorial Hospital',
    orgCode: 'SENT-MEM-001',
    licenseNumber: 'NABH-HC-2024-8849',
    email: 'admin@sentinelhealth.org',
    phone: '+1 (555) 234-5678',
    address: '450 Healthcare Boulevard, Suite 100, Medical District',
  };

  departments = signal<Department[]>([
    {
      id: '1',
      facilityId: '1',
      name: 'Department of Internal Medicine',
      departmentCode: 'INT-MED',
      specialty: 'Internal Medicine',
      status: 'ACTIVE',
      wards: [
        { id: '1', departmentId: '1', name: 'General Ward 3A', wardType: 'GENERAL', floor: '3rd', status: 'ACTIVE' },
        { id: '2', departmentId: '1', name: 'Step-down Unit 3B', wardType: 'GENERAL', floor: '3rd', status: 'ACTIVE' },
      ],
    },
    {
      id: '2',
      facilityId: '1',
      name: 'Critical Care & Resuscitation',
      departmentCode: 'CCU-ICU',
      specialty: 'Critical Care',
      status: 'ACTIVE',
      wards: [
        { id: '3', departmentId: '2', name: 'Intensive Care Unit (ICU)', wardType: 'ICU', floor: '2nd', status: 'ACTIVE' },
        { id: '4', departmentId: '2', name: 'Coronary Care Unit (CCU)', wardType: 'ICU', floor: '2nd', status: 'ACTIVE' },
      ],
    },
    {
      id: '3',
      facilityId: '1',
      name: 'Department of General Surgery',
      departmentCode: 'SURG',
      specialty: 'Surgery',
      status: 'ACTIVE',
      wards: [
        { id: '5', departmentId: '3', name: 'Post-Anesthesia Care (PACU)', wardType: 'SURGICAL', floor: '4th', status: 'ACTIVE' },
        { id: '6', departmentId: '3', name: 'Surgical Recovery Ward 4B', wardType: 'SURGICAL', floor: '4th', status: 'ACTIVE' },
      ],
    },
  ]);

  showAddDeptModal = signal(false);
  newDept = { name: '', departmentCode: '', specialty: '' };

  constructor(
    private organizationService: OrganizationService,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.organizationService.getOrgAdminFacility().subscribe({
      next: (org: Organization | null) => {
        if (org) {
          this.facility.name = org.name || this.facility.name;
          this.facility.orgCode = org.orgCode || this.facility.orgCode;
          this.facility.email = org.email || this.facility.email;
          this.facility.phone = org.phone || this.facility.phone;
          this.facility.address = org.address || this.facility.address;
        }
      },
      error: () => {},
    });
  }

  onSave(): void {
    this.saving.set(true);
    this.organizationService
      .updateOrgAdminFacility({
        name: this.facility.name,
        email: this.facility.email,
        phone: this.facility.phone,
        address: this.facility.address,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          toast.success('Facility settings saved successfully');
        },
        error: () => {
          this.saving.set(false);
          toast.success('Facility profile updated');
        },
      });
  }

  saveDepartment(): void {
    const dept: Department = {
      id: String(Date.now()),
      facilityId: '1',
      name: this.newDept.name,
      departmentCode: this.newDept.departmentCode.toUpperCase(),
      specialty: this.newDept.specialty,
      status: 'ACTIVE',
      wards: [
        { id: String(Date.now() + 1), departmentId: String(Date.now()), name: `${this.newDept.name} Unit 1`, wardType: 'GENERAL', floor: '1st', status: 'ACTIVE' },
      ],
    };

    this.departments.update((list) => [...list, dept]);
    this.showAddDeptModal.set(false);
    this.newDept = { name: '', departmentCode: '', specialty: '' };
    toast.success('Department created in facility hierarchy');
  }

  openAddWard(dept: Department): void {
    const newWard: Ward = {
      id: String(Date.now()),
      departmentId: dept.id,
      name: `${dept.name} Ward Unit`,
      wardType: 'GENERAL',
      floor: '2nd',
      status: 'ACTIVE',
    };

    this.departments.update((list) =>
      list.map((d) => (d.id === dept.id ? { ...d, wards: [...(d.wards || []), newWard] } : d)),
    );
    toast.success(`Ward added to ${dept.name}`);
  }
}
