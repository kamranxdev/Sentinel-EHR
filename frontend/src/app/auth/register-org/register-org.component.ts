import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrganizationService } from '../../core/services/organization.service';
import { OrganizationRegistrationRequest } from '../../core/models/organization.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2,
  lucideShieldCheck,
  lucideUserCheck,
  lucideCheckCircle2,
  lucideAlertCircle,
  lucideArrowRight,
  lucideLock,
  lucideMail,
  lucideFileText,
  lucidePhone,
  lucideMapPin
} from '@ng-icons/lucide';

@Component({
  selector: 'app-register-org',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgIcon],
  providers: [
    provideIcons({
      lucideBuilding2,
      lucideShieldCheck,
      lucideUserCheck,
      lucideCheckCircle2,
      lucideAlertCircle,
      lucideArrowRight,
      lucideLock,
      lucideMail,
      lucideFileText,
      lucidePhone,
      lucideMapPin
    })
  ],
  template: `
    <div class="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div class="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3 shadow-xs border border-primary/20">
          <ng-icon name="lucideBuilding2" size="30" />
        </div>
        <h2 class="text-3xl font-extrabold tracking-tight text-foreground">
          Register Hospital / Clinic
        </h2>
        <p class="mt-2 text-sm text-muted-foreground">
          Onboard your medical facility to Sentinel EHR & provision primary Org Admin access.
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div class="bg-card py-8 px-6 shadow-xl border border-border/80 sm:rounded-2xl sm:px-10">
          <!-- Alert Banner -->
          <div *ngIf="errorMessage()" class="mb-6 p-4 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-xs font-medium flex items-start gap-3">
            <ng-icon name="lucideAlertCircle" size="18" class="shrink-0 mt-0.5" />
            <span>{{ errorMessage() }}</span>
          </div>

          <div *ngIf="successMessage()" class="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-start gap-3">
            <ng-icon name="lucideCheckCircle2" size="18" class="shrink-0 mt-0.5 text-emerald-500" />
            <div>
              <p class="font-bold text-sm">Registration Submitted Successfully!</p>
              <p class="mt-1">{{ successMessage() }}</p>
              <a routerLink="/login" class="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-primary hover:underline">
                Proceed to Staff Login <ng-icon name="lucideArrowRight" size="14" />
              </a>
            </div>
          </div>

          <form *ngIf="!successMessage()" (ngSubmit)="onSubmit()" #regForm="ngForm" class="space-y-6">
            <!-- Facility Details Section -->
            <div class="space-y-4">
              <div class="flex items-center gap-2 pb-2 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <ng-icon name="lucideBuilding2" size="14" />
                <span>1. Healthcare Facility Information</span>
              </div>

              <div>
                <label class="block text-xs font-semibold text-foreground mb-1.5">Facility Name *</label>
                <input
                  type="text"
                  name="orgName"
                  [(ngModel)]="formData.orgName"
                  required
                  placeholder="e.g. Apollo Health Clinic - Mumbai"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-foreground mb-1.5">Medical License / Registration # *</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    [(ngModel)]="formData.licenseNumber"
                    required
                    placeholder="e.g. LIC-MH-98401"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-foreground mb-1.5">Facility Contact Email</label>
                  <input
                    type="email"
                    name="email"
                    [(ngModel)]="formData.email"
                    placeholder="contact@facility.org"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-foreground mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    [(ngModel)]="formData.phone"
                    placeholder="+91 22 2490 1000"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-foreground mb-1.5">Full Address</label>
                  <input
                    type="text"
                    name="address"
                    [(ngModel)]="formData.address"
                    placeholder="City, State, Zip"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
            </div>

            <!-- Primary Admin User Section -->
            <div class="space-y-4 pt-2">
              <div class="flex items-center gap-2 pb-2 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <ng-icon name="lucideUserCheck" size="14" />
                <span>2. Primary Organization Admin Account</span>
              </div>

              <div>
                <label class="block text-xs font-semibold text-foreground mb-1.5">Admin Full Name *</label>
                <input
                  type="text"
                  name="adminFullName"
                  [(ngModel)]="formData.adminFullName"
                  required
                  placeholder="e.g. Dr. Mahtab Patel"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-foreground mb-1.5">Admin Username *</label>
                  <input
                    type="text"
                    name="adminUsername"
                    [(ngModel)]="formData.adminUsername"
                    required
                    placeholder="e.g. orgadmin_mahtab"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-foreground mb-1.5">Admin Email *</label>
                  <input
                    type="email"
                    name="adminEmail"
                    [(ngModel)]="formData.adminEmail"
                    required
                    placeholder="mahtab@facility.org"
                    class="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-foreground mb-1.5">Password *</label>
                <input
                  type="password"
                  name="adminPassword"
                  [(ngModel)]="formData.adminPassword"
                  required
                  placeholder="••••••••••••"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <button
              type="submit"
              [disabled]="isLoading() || !regForm.form.valid"
              class="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl border border-transparent text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all shadow-md">
              <span *ngIf="!isLoading()">Register Facility & Submit for Verification</span>
              <span *ngIf="isLoading()" class="flex items-center gap-2">
                <span class="animate-spin size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"></span>
                Submitting...
              </span>
            </button>
          </form>

          <div class="mt-6 text-center border-t border-border pt-4">
            <a routerLink="/login" class="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Already registered? Return to <span class="font-semibold text-primary">Login</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterOrgComponent {
  formData: OrganizationRegistrationRequest = {
    orgName: '',
    licenseNumber: '',
    email: '',
    phone: '',
    address: '',
    adminUsername: '',
    adminPassword: '',
    adminEmail: '',
    adminFullName: ''
  };

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor(private orgService: OrganizationService, private router: Router) {}

  onSubmit(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.orgService.registerOrganization(this.formData).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(
          `Your facility '${res.name}' (Code: ${res.orgCode}) has been submitted in PENDING_VERIFICATION status. A System Administrator will verify your license before full access is activated.`
        );
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to register facility. Please check fields and try again.');
      }
    });
  }
}
