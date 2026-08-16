import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrganizationService } from '../../core/services/organization.service';
import { AuthService } from '../../core/services/auth.service';
import { Organization } from '../../core/models/organization.model';
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
  lucideFileText
} from '@ng-icons/lucide';

@Component({
  selector: 'app-org-admin-facility-settings',
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
      lucideFileText
    })
  ],
  template: `
    <div class="space-y-6 max-w-4xl">
      <!-- Header -->
      <div class="pb-4 border-b border-border">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            Org Admin Desk
          </span>
          <span class="text-xs text-muted-foreground font-mono">Facility Settings</span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-foreground mt-1">
          Hospital & Clinic Profile Configuration
        </h1>
        <p class="text-xs text-muted-foreground mt-0.5">
          Manage local facility demographics, official contact communications, and licensing parameters.
        </p>
      </div>

      <!-- Toast Alert Banner -->
      <div *ngIf="alertMessage()" class="p-4 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-xs bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
        <div class="flex items-center gap-2">
          <ng-icon name="lucideCheckCircle2" size="16" />
          <span>{{ alertMessage() }}</span>
        </div>
        <button (click)="alertMessage.set(null)" class="text-xs font-mono opacity-70 hover:opacity-100">Dismiss</button>
      </div>

      <!-- Facility Profile Form -->
      <div class="bg-card rounded-2xl border border-border shadow-xs p-6 space-y-6">
        <form (ngSubmit)="onSave()" #facilityForm="ngForm" class="space-y-5">
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
              <label class="block text-xs font-semibold text-foreground mb-1.5">Medical License / Registration #</label>
              <input
                type="text"
                [value]="facility.licenseNumber"
                disabled
                class="w-full px-3.5 py-2.5 rounded-xl border border-input bg-muted/50 text-xs text-muted-foreground font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-foreground mb-1.5">Verification Status</label>
              <div class="pt-1">
                <span
                  [ngClass]="{
                    'bg-amber-500/15 text-amber-600 border-amber-500/30': facility.status === 'PENDING_VERIFICATION',
                    'bg-emerald-500/15 text-emerald-600 border-emerald-500/30': facility.status === 'VERIFIED',
                    'bg-destructive/15 text-destructive border-destructive/30': facility.status === 'SUSPENDED'
                  }"
                  class="px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5">
                  {{ facility.status }}
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-foreground mb-1.5">Facility Contact Email</label>
              <input
                type="email"
                name="email"
                [(ngModel)]="facility.email"
                class="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-foreground mb-1.5">Facility Phone Number</label>
              <input
                type="text"
                name="phone"
                [(ngModel)]="facility.phone"
                class="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-foreground mb-1.5">Facility Street Address</label>
            <input
              type="text"
              name="address"
              [(ngModel)]="facility.address"
              class="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div class="pt-4 border-t border-border flex justify-end">
            <button
              type="submit"
              [disabled]="isSaving() || !facilityForm.form.valid"
              class="px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm">
              <ng-icon name="lucideSave" size="14" />
              <span>Save Facility Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class OrgAdminFacilitySettingsComponent implements OnInit {
  facility: Organization = {
    id: 'org-1001',
    orgCode: 'ORG-1001',
    name: 'Sentinel General Hospital Network',
    licenseNumber: 'LIC-MH-450912',
    email: 'admin@sentinel.org',
    phone: '+91 22 2490 1000',
    address: '742 Marine Drive, Mumbai, MH 400001',
    status: 'VERIFIED',
    createdAt: new Date().toISOString()
  };

  isSaving = signal(false);
  alertMessage = signal<string | null>(null);

  constructor(private orgService: OrganizationService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadFacility();
  }

  loadFacility(): void {
    this.orgService.getOrgAdminFacility().subscribe({
      next: (data) => {
        if (data) this.facility = data;
      },
      error: () => {}
    });
  }

  onSave(): void {
    this.isSaving.set(true);
    this.orgService.updateOrganization(this.facility.id, this.facility).subscribe({
      next: (updated) => {
        this.facility = updated;
        this.isSaving.set(false);
        this.alertMessage.set('Facility profile settings saved successfully.');
      },
      error: () => {
        this.isSaving.set(false);
      }
    });
  }
}
