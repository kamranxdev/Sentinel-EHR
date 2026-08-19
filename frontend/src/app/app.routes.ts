import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { clinicalAccessGuard } from './core/guards/clinical-access.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/landing/landing.component').then((m) => m.LandingComponent),
    data: { standalone: true },
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent),
    data: { standalone: true },
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then((m) => m.RegisterComponent),
    data: { standalone: true },
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./workspaces/patient/patient-profile.component').then((m) => m.PatientProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'patient/onboarding',
    loadComponent: () =>
      import('./workspaces/patient/patient-profile.component').then((m) => m.PatientProfileComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PATIENT'] },
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },

  // --- PHYSICIAN WORKSPACE ROUTES ---
  {
    path: 'physician/dashboard',
    loadComponent: () =>
      import('./workspaces/physician/physician-dashboard.component').then((m) => m.PhysicianDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PHYSICIAN'] },
  },
  {
    path: 'physician/chart',
    loadComponent: () =>
      import('./workspaces/physician/physician-chart.component').then((m) => m.PhysicianChartComponent),
    canActivate: [authGuard, roleGuard, clinicalAccessGuard],
    data: { roles: ['PHYSICIAN'] },
  },
  {
    path: 'physician/patients',
    redirectTo: 'physician/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'physician/appointments',
    loadComponent: () =>
      import('./workspaces/physician/physician-appointments.component').then((m) => m.PhysicianAppointmentsComponent),
    canActivate: [authGuard, roleGuard, clinicalAccessGuard],
    data: { roles: ['PHYSICIAN'], permission: 'APPOINTMENT_READ' },
  },
  {
    path: 'physician/inpatients',
    loadComponent: () =>
      import('./workspaces/physician/physician-inpatients.component').then((m) => m.PhysicianInpatientsComponent),
    canActivate: [authGuard, roleGuard, clinicalAccessGuard],
    data: { roles: ['PHYSICIAN'] },
  },
  {
    path: 'physician/break-glass',
    loadComponent: () =>
      import('./workspaces/physician/physician-break-glass.component').then((m) => m.PhysicianBreakGlassComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PHYSICIAN'] },
  },
  {
    path: 'physician/encounters',
    redirectTo: () => '/physician/chart?tab=encounters',
    pathMatch: 'full',
  },
  {
    path: 'physician/prescriptions',
    redirectTo: () => '/physician/chart?tab=erx',
    pathMatch: 'full',
  },
  {
    path: 'physician/diagnoses',
    redirectTo: () => '/physician/chart?tab=diagnoses',
    pathMatch: 'full',
  },
  {
    path: 'physician/orders',
    redirectTo: () => '/physician/chart?tab=diagnoses',
    pathMatch: 'full',
  },
  {
    path: 'physician/allergies',
    redirectTo: () => '/physician/chart?tab=allergies',
    pathMatch: 'full',
  },
  {
    path: 'physician/vitals',
    redirectTo: () => '/physician/chart?tab=vitals',
    pathMatch: 'full',
  },

  // --- NURSE WORKSPACE ROUTES ---
  {
    path: 'nurse/dashboard',
    loadComponent: () =>
      import('./workspaces/nurse/nurse-dashboard.component').then((m) => m.NurseDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['NURSE'] },
  },
  {
    path: 'nurse/chart',
    loadComponent: () =>
      import('./workspaces/nurse/nurse-chart.component').then((m) => m.NurseChartComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['NURSE'] },
  },
  {
    path: 'nurse/vitals',
    redirectTo: () => '/nurse/chart?tab=vitals',
    pathMatch: 'full',
  },
  {
    path: 'nurse/prescriptions',
    redirectTo: () => '/nurse/chart?tab=mar',
    pathMatch: 'full',
  },
  {
    path: 'nurse/mar',
    redirectTo: () => '/nurse/chart?tab=mar',
    pathMatch: 'full',
  },
  {
    path: 'nurse/patients',
    redirectTo: () => '/nurse/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'nurse/appointments',
    loadComponent: () =>
      import('./workspaces/nurse/nurse-appointments.component').then((m) => m.NurseAppointmentsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['NURSE'] },
  },
  {
    path: 'nurse/allergies',
    redirectTo: () => '/nurse/chart?tab=allergies',
    pathMatch: 'full',
  },
  {
    path: 'nurse/triage',
    redirectTo: () => '/nurse/chart?tab=triage',
    pathMatch: 'full',
  },
  {
    path: 'nurse/flowsheet',
    redirectTo: () => '/nurse/chart?tab=flowsheet',
    pathMatch: 'full',
  },
  {
    path: 'nurse/beds',
    loadComponent: () =>
      import('./workspaces/nurse/nurse-beds.component').then((m) => m.NurseBedsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['NURSE', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN'] },
  },

  {
    path: 'auth/register-org',
    loadComponent: () =>
      import('./auth/register-org/register-org.component').then((m) => m.RegisterOrgComponent),
    data: { standalone: true },
  },
  {
    path: 'register-org',
    loadComponent: () =>
      import('./auth/register-org/register-org.component').then((m) => m.RegisterOrgComponent),
    data: { standalone: true },
  },

  // --- SUPER ADMIN WORKSPACE ROUTES ---
  {
    path: 'super-admin/dashboard',
    loadComponent: () =>
      import('./workspaces/super-admin/super-admin-dashboard.component').then((m) => m.SuperAdminDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SUPER_ADMIN'] },
  },
  {
    path: 'super-admin/organizations',
    loadComponent: () =>
      import('./workspaces/super-admin/super-admin-organizations.component').then((m) => m.SuperAdminOrganizationsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SUPER_ADMIN'] },
  },
  {
    path: 'super-admin/users',
    loadComponent: () =>
      import('./workspaces/super-admin/super-admin-users.component').then((m) => m.SuperAdminUsersComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SUPER_ADMIN'] },
  },
  {
    path: 'super-admin/audit',
    loadComponent: () =>
      import('./workspaces/super-admin/super-admin-audit.component').then((m) => m.SuperAdminAuditComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SUPER_ADMIN'] },
  },
  {
    path: 'super-admin/system-health',
    loadComponent: () =>
      import('./workspaces/super-admin/super-admin-system-health.component').then((m) => m.SuperAdminSystemHealthComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['SUPER_ADMIN'] },
  },
  {
    path: 'super-admin/patients',
    redirectTo: () => '/super-admin/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'super-admin/schedule-analytics',
    redirectTo: () => '/super-admin/system-health',
    pathMatch: 'full',
  },

  // --- ORGANIZATION ADMIN WORKSPACE ROUTES ---
  {
    path: 'organization-admin/dashboard',
    loadComponent: () =>
      import('./workspaces/organization-admin/organization-admin-dashboard.component').then((m) => m.OrganizationAdminDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ORGANIZATION_ADMIN'] },
  },
  {
    path: 'organization-admin/facility-settings',
    loadComponent: () =>
      import('./workspaces/organization-admin/organization-admin-facility-settings.component').then((m) => m.OrganizationAdminFacilitySettingsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ORGANIZATION_ADMIN'] },
  },
  {
    path: 'organization-admin/users',
    loadComponent: () =>
      import('./workspaces/organization-admin/organization-admin-users.component').then((m) => m.OrganizationAdminUsersComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ORGANIZATION_ADMIN'] },
  },
  {
    path: 'organization-admin/patients',
    loadComponent: () =>
      import('./workspaces/organization-admin/organization-admin-patients.component').then((m) => m.OrganizationAdminPatientsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ORGANIZATION_ADMIN'] },
  },
  {
    path: 'organization-admin/schedule-analytics',
    loadComponent: () =>
      import('./workspaces/organization-admin/organization-admin-schedule-analytics.component').then((m) => m.OrganizationAdminScheduleAnalyticsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ORGANIZATION_ADMIN'] },
  },

  // --- PATIENT WORKSPACE ROUTES ---
  {
    path: 'patient/dashboard',
    loadComponent: () =>
      import('./workspaces/patient/patient-dashboard.component').then((m) => m.PatientDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PATIENT'] },
  },
  {
    path: 'patient/chart',
    loadComponent: () =>
      import('./workspaces/patient/patient-chart.component').then((m) => m.PatientChartComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PATIENT'] },
  },
  {
    path: 'patient/records',
    redirectTo: () => '/patient/chart',
    pathMatch: 'full',
  },
  {
    path: 'patient/labs',
    redirectTo: () => '/patient/chart?tab=labs',
    pathMatch: 'full',
  },
  {
    path: 'patient/imaging',
    redirectTo: () => '/patient/chart?tab=imaging',
    pathMatch: 'full',
  },
  {
    path: 'patient/encounters',
    redirectTo: () => '/patient/chart?tab=encounters',
    pathMatch: 'full',
  },
  {
    path: 'patient/diagnoses',
    redirectTo: () => '/patient/chart?tab=diagnoses',
    pathMatch: 'full',
  },
  {
    path: 'patient/procedures',
    redirectTo: () => '/patient/chart?tab=procedures',
    pathMatch: 'full',
  },
  {
    path: 'patient/documents',
    redirectTo: () => '/patient/chart?tab=documents',
    pathMatch: 'full',
  },
  {
    path: 'patient/care-team',
    redirectTo: () => '/patient/chart?tab=care-team',
    pathMatch: 'full',
  },
  {
    path: 'patient/consents',
    redirectTo: () => '/patient/chart?tab=consents',
    pathMatch: 'full',
  },
  {
    path: 'patient/prescriptions',
    redirectTo: () => '/patient/chart?tab=prescriptions',
    pathMatch: 'full',
  },
  {
    path: 'patient/allergies',
    redirectTo: () => '/patient/chart?tab=allergies',
    pathMatch: 'full',
  },
  {
    path: 'patient/profile',
    loadComponent: () =>
      import('./workspaces/patient/patient-profile.component').then((m) => m.PatientProfileComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PATIENT'] },
  },
  {
    path: 'patient/appointments',
    loadComponent: () =>
      import('./workspaces/patient/patient-appointments.component').then((m) => m.PatientAppointmentsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PATIENT'] },
  },
  {
    path: 'patient/vitals',
    loadComponent: () =>
      import('./workspaces/patient/patient-vitals.component').then((m) => m.PatientVitalsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PATIENT'] },
  },

  // --- RECEPTIONIST WORKSPACE ROUTES ---
  {
    path: 'receptionist/dashboard',
    loadComponent: () =>
      import('./workspaces/receptionist/receptionist-dashboard.component').then((m) => m.ReceptionistDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['RECEPTIONIST'] },
  },
  {
    path: 'receptionist/mpi',
    loadComponent: () =>
      import('./workspaces/receptionist/receptionist-mpi.component').then((m) => m.ReceptionistMPIComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['RECEPTIONIST'] },
  },
  {
    path: 'receptionist/appointments',
    loadComponent: () =>
      import('./workspaces/receptionist/receptionist-appointments.component').then((m) => m.ReceptionistAppointmentsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['RECEPTIONIST'] },
  },

  // --- LAB TECHNICIAN WORKSPACE ROUTES ---
  {
    path: 'lab-technician/dashboard',
    loadComponent: () =>
      import('./workspaces/lab-technician/lab-technician-dashboard.component').then((m) => m.LabTechnicianDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['LAB_TECHNICIAN'] },
  },
  {
    path: 'lab-technician/worklist',
    loadComponent: () =>
      import('./workspaces/lab-technician/lab-technician-worklist.component').then((m) => m.LabTechnicianWorklistComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['LAB_TECHNICIAN'] },
  },
  {
    path: 'lab-technician/results',
    loadComponent: () =>
      import('./workspaces/lab-technician/lab-technician-results.component').then((m) => m.LabTechnicianResultsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['LAB_TECHNICIAN'] },
  },

  // --- PHARMACIST WORKSPACE ROUTES ---
  {
    path: 'pharmacist/dashboard',
    loadComponent: () =>
      import('./workspaces/pharmacist/pharmacist-dashboard.component').then((m) => m.PharmacistDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PHARMACIST'] },
  },
  {
    path: 'pharmacist/erx',
    loadComponent: () =>
      import('./workspaces/pharmacist/pharmacist-erx.component').then((m) => m.PharmacistErxComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PHARMACIST'] },
  },
  {
    path: 'pharmacist/dispense',
    loadComponent: () =>
      import('./workspaces/pharmacist/pharmacist-dispense.component').then((m) => m.PharmacistDispenseComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PHARMACIST'] },
  },
  {
    path: 'pharmacist/inventory',
    loadComponent: () =>
      import('./workspaces/pharmacist/pharmacist-inventory.component').then((m) => m.PharmacistInventoryComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PHARMACIST'] },
  },

  // --- BILLING STAFF WORKSPACE ROUTES ---
  {
    path: 'billing-staff/dashboard',
    loadComponent: () =>
      import('./workspaces/billing-staff/billing-staff-dashboard.component').then((m) => m.BillingStaffDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['BILLING_STAFF'] },
  },
  {
    path: 'billing-staff/invoices',
    loadComponent: () =>
      import('./workspaces/billing-staff/billing-staff-invoices.component').then((m) => m.BillingStaffInvoicesComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['BILLING_STAFF'] },
  },
  {
    path: 'billing-staff/claims',
    loadComponent: () =>
      import('./workspaces/billing-staff/billing-staff-claims.component').then((m) => m.BillingStaffClaimsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['BILLING_STAFF'] },
  },

  // --- AUDITOR WORKSPACE ROUTES ---
  {
    path: 'auditor/dashboard',
    loadComponent: () =>
      import('./workspaces/auditor/auditor-dashboard.component').then((m) => m.AuditorDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['AUDITOR'] },
  },
  {
    path: 'auditor/ledger',
    loadComponent: () =>
      import('./workspaces/auditor/auditor-ledger.component').then((m) => m.AuditorLedgerComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['AUDITOR', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN'] },
  },

  // Public Static Routes
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./components/privacy-policy/privacy-policy.component').then((m) => m.PrivacyPolicyComponent),
    data: { standalone: true },
  },
  {
    path: 'terms-of-service',
    loadComponent: () =>
      import('./components/terms-of-service/terms-of-service.component').then((m) => m.TermsOfServiceComponent),
    data: { standalone: true },
  },
  { path: '**', redirectTo: 'dashboard' },
];
