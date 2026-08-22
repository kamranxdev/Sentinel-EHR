import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideLayoutDashboard,
  lucideHeartPulse,
  lucideFileText,
  lucideHospital,
  lucidePill,
  lucideListChecks,
  lucideTriangleAlert,
  lucideActivity,
  lucideCalendarClock,
  lucideSettings,
  lucideShieldCheck,
  lucideUserRound,
  lucideLogOut,
  lucideMenu,
  lucidePanelLeftClose,
  lucidePanelLeftOpen,
  lucideSun,
  lucideMoon,
  lucideChevronRight,
  lucideMicroscope,
  lucideReceipt,
  lucideEye,
  lucideScissors,
  lucideUsers,
  lucideFileBadge,
  lucideStethoscope,
  lucideShieldAlert,
  lucideBed,
  lucideBuilding2,
  lucideBoxes,
  lucideServer,
  lucideLock,
  lucideDatabase,
} from '@ng-icons/lucide';

import { AuthService } from './core/services/auth.service';
import { PatientContextService } from './core/services/patient-context.service';
import { ThemeService } from './core/services/theme.service';

import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { HlmToasterImports } from '@spartan-ng/helm/sonner';

export interface BreadcrumbSegment {
  label: string;
  url?: string;
  icon?: string;
}

interface NavItem {
  icon: string;
  label: string;
  routerLink: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface PatientOption {
  id: string | number;
  fullName: string;
  patientCode: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgIcon,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmSelectImports,
    HlmSeparatorImports,
    HlmTooltipImports,
    HlmToasterImports,
  ],
  providers: [
    provideIcons({
      lucideLayoutDashboard,
      lucideHeartPulse,
      lucideFileText,
      lucideHospital,
      lucidePill,
      lucideListChecks,
      lucideTriangleAlert,
      lucideActivity,
      lucideCalendarClock,
      lucideSettings,
      lucideShieldCheck,
      lucideUserRound,
      lucideLogOut,
      lucideMenu,
      lucidePanelLeftClose,
      lucidePanelLeftOpen,
      lucideSun,
      lucideMoon,
      lucideChevronRight,
      lucideMicroscope,
      lucideReceipt,
      lucideEye,
      lucideScissors,
      lucideUsers,
      lucideFileBadge,
      lucideStethoscope,
      lucideShieldAlert,
      lucideBed,
      lucideBuilding2,
      lucideBoxes,
      lucideServer,
      lucideLock,
      lucideDatabase,
    }),
  ],
  templateUrl: './app.component.html',
})
export class App implements OnInit, OnDestroy {
  isMobile = signal(false);
  sidebarOpen = signal(true);
  isStandalonePage = signal(false);
  currentUrl = signal<string>('/dashboard');

  showDashboardLayout = computed(() => {
    return this.authService.isLoggedIn() && !this.isStandalonePage();
  });

  breadcrumbs = computed<BreadcrumbSegment[]>(() => {
    const rawUrl = this.currentUrl().split('?')[0];
    const segments = rawUrl.split('/').filter((s) => s.length > 0);

    if (segments.length === 0) {
      return [{ label: 'Workspace', icon: 'lucideLayoutDashboard' }];
    }

    const roleMap: Record<string, { label: string; url: string; icon: string }> = {
      physician: {
        label: 'Physician Workspace',
        url: '/physician/dashboard',
        icon: 'lucideHeartPulse',
      },
      nurse: { label: 'Nurse Workspace', url: '/nurse/dashboard', icon: 'lucideActivity' },
      'super-admin': {
        label: 'Super Admin Desk',
        url: '/super-admin/dashboard',
        icon: 'lucideSettings',
      },
      'organization-admin': {
        label: 'Org Admin Center',
        url: '/organization-admin/dashboard',
        icon: 'lucideBuilding2',
      },
      patient: { label: 'Patient Portal', url: '/patient/dashboard', icon: 'lucideUserRound' },
      receptionist: {
        label: 'Front Desk',
        url: '/receptionist/dashboard',
        icon: 'lucideCalendarClock',
      },
      'lab-technician': {
        label: 'Pathology Lab',
        url: '/lab-technician/dashboard',
        icon: 'lucideMicroscope',
      },
      pharmacist: { label: 'Pharmacy Hub', url: '/pharmacist/dashboard', icon: 'lucidePill' },
      'billing-staff': {
        label: 'Billing & RCM',
        url: '/billing-staff/dashboard',
        icon: 'lucideReceipt',
      },
    };

    const pageMetaMap: Record<string, { label: string; icon: string }> = {
      dashboard: { label: 'Dashboard', icon: 'lucideLayoutDashboard' },
      patients: { label: 'Patient Roster', icon: 'lucideHeartPulse' },
      appointments: { label: 'Consultation Schedule', icon: 'lucideCalendarClock' },
      encounters: { label: 'Visits & Consultations', icon: 'lucideHospital' },
      prescriptions: { label: 'Pharmacy & eRx', icon: 'lucidePill' },
      diagnoses: { label: 'Problem List (ICD-10)', icon: 'lucideListChecks' },
      allergies: { label: 'Allergies & Risk Register', icon: 'lucideTriangleAlert' },
      vitals: { label: 'Bedside Vitals', icon: 'lucideActivity' },
      users: { label: 'User Directory', icon: 'lucideUserRound' },
      profile: { label: 'My Health Profile', icon: 'lucideUserRound' },
      onboarding: { label: 'Profile Setup', icon: 'lucideUserRound' },
      intake: { label: 'Patient Intake Hub', icon: 'lucideCalendarClock' },
      worklist: { label: 'Lab Orders Worklist', icon: 'lucideMicroscope' },
      results: { label: 'Test Results', icon: 'lucideMicroscope' },
      erx: { label: 'e-Prescription Queue', icon: 'lucidePill' },
      dispense: { label: 'Medication Dispensing', icon: 'lucidePill' },
      invoices: { label: 'Invoices & Billing', icon: 'lucideReceipt' },
      claims: { label: 'Insurance Claims', icon: 'lucideReceipt' },
      ledger: { label: 'Audit Ledger', icon: 'lucideShieldCheck' },
      records: { label: 'SOAP Progress Notes', icon: 'lucideFileText' },
      triage: { label: 'Clinical Triage & NEWS2', icon: 'lucideActivity' },
      chart: { label: 'Bedside Patient Chart', icon: 'lucideHeartPulse' },
      bcma: { label: 'BCMA 5-Rights Bedside', icon: 'lucidePill' },
      'care-plans': { label: 'NANDA-I Care Plans', icon: 'lucideListChecks' },
      handoff: { label: 'SBAR Shift Handoff', icon: 'lucideFileText' },
      mpi: { label: 'Master Patient Index (MPI)', icon: 'lucideHeartPulse' },
      eligibility: { label: 'Real-Time Eligibility (RTE)', icon: 'lucideShieldCheck' },
      'audit-ledger': { label: 'Compliance Audit Ledger', icon: 'lucideShieldCheck' },
      audit: { label: 'Compliance & Audit Log', icon: 'lucideShieldCheck' },
      'facility-settings': { label: 'Hospital Layout & Units', icon: 'lucideBuilding2' },
      'schedule-analytics': { label: 'Schedule & Capacity Analytics', icon: 'lucideCalendarClock' },
      fhir: { label: 'FHIR R4 Interoperability Explorer', icon: 'lucideDatabase' },
      'fhir-explorer': { label: 'FHIR R4 Interoperability Explorer', icon: 'lucideDatabase' },
      admin: { label: 'System Administration', icon: 'lucideSettings' },
    };

    const result: BreadcrumbSegment[] = [];
    const firstSegment = segments[0];

    if (roleMap[firstSegment]) {
      const roleMeta = roleMap[firstSegment];
      result.push({
        label: roleMeta.label,
        icon: roleMeta.icon,
        url: roleMeta.url,
      });

      let currentPath = `/${firstSegment}`;
      for (let i = 1; i < segments.length; i++) {
        const seg = segments[i];
        currentPath += `/${seg}`;
        const isLast = i === segments.length - 1;
        const meta = pageMetaMap[seg] || {
          label: this.formatSegmentName(seg),
          icon: 'lucideFileText',
        };

        result.push({
          label: meta.label,
          icon: meta.icon,
          url: isLast ? undefined : currentPath,
        });
      }
    } else {
      result.push({
        label: 'Workspace',
        icon: 'lucideLayoutDashboard',
        url: '/dashboard',
      });

      let currentPath = '';
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        if (seg === 'dashboard' && segments.length === 1) continue;
        currentPath += `/${seg}`;
        const isLast = i === segments.length - 1;
        const meta = pageMetaMap[seg] || {
          label: this.formatSegmentName(seg),
          icon: 'lucideFileText',
        };

        result.push({
          label: meta.label,
          icon: meta.icon,
          url: isLast ? undefined : currentPath,
        });
      }
    }

    return result;
  });

  private formatSegmentName(seg: string): string {
    return seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private mql?: MediaQueryList;
  private mqlListener?: (e: MediaQueryListEvent) => void;
  private routerSub?: any;

  constructor(
    public authService: AuthService,
    public patientContext: PatientContextService,
    public theme: ThemeService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.routerSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects || event.url);
        this.updateStandaloneStatus();
      });

    effect(() => {
      if (this.authService.isLoggedIn()) {
        this.patientContext.loadContext();
      } else {
        this.patientContext.clear();
      }
    });
  }

  ngOnInit(): void {
    if (typeof window === 'undefined') return;

    this.updateStandaloneStatus();

    this.mql = window.matchMedia('(max-width: 1023px)');
    this.isMobile.set(this.mql.matches);
    this.sidebarOpen.set(!this.mql.matches);
    this.mqlListener = (e: MediaQueryListEvent) => {
      this.isMobile.set(e.matches);
      this.sidebarOpen.set(!e.matches);
    };
    this.mql.addEventListener('change', this.mqlListener);
  }

  ngOnDestroy(): void {
    if (this.mql && this.mqlListener) {
      this.mql.removeEventListener('change', this.mqlListener);
    }
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  private updateStandaloneStatus(): void {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const isStandalone = !!route.snapshot.data['standalone'];
    this.isStandalonePage.set(isStandalone);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeMobileSidebar(): void {
    if (this.isMobile()) this.sidebarOpen.set(false);
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  onPatientContextChange(patientId: string | undefined): void {
    if (patientId) {
      this.patientContext.selectPatientById(patientId);
    }
  }

  patientItemToString = (id: string): string => {
    const patient = this.patientContext.patientList().find((p: PatientOption) => p.id === id);
    return patient ? `${patient.fullName} (MRN: ${patient.patientCode})` : '';
  };

  isPhysician(): boolean {
    return this.authService.isPhysician();
  }
  isNurse(): boolean {
    return this.authService.isNurse();
  }
  isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }
  isOrganizationAdmin(): boolean {
    return this.authService.isOrganizationAdmin();
  }
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
  isReceptionist(): boolean {
    return this.authService.isReceptionist();
  }
  isLabTechnician(): boolean {
    return this.authService.isLabTechnician();
  }
  isPharmacist(): boolean {
    return this.authService.isPharmacist();
  }
  isBillingStaff(): boolean {
    return this.authService.isBillingStaff();
  }

  isPatient(): boolean {
    return this.authService.isPatient();
  }

  primaryRole(): string {
    if (this.isSuperAdmin()) return 'Super Admin';
    if (this.isOrganizationAdmin()) return 'Organization Admin';
    if (this.isPhysician()) return 'Physician / Clinician';
    if (this.isNurse()) return 'Clinical Nurse';
    if (this.isReceptionist()) return 'Front Desk Receptionist';
    if (this.isLabTechnician()) return 'Laboratory Specialist';
    if (this.isPharmacist()) return 'Clinical Pharmacist';
    if (this.isBillingStaff()) return 'Billing Staff';
    return 'Patient Portal';
  }

  userInitials(): string {
    const name = this.authService.currentUser()?.fullName || 'User';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  navGroups = computed<NavGroup[]>(() => {
    if (this.isPhysician()) {
      return [
        {
          label: 'Clinical Practice & Rounds',
          items: [
            {
              icon: 'lucideLayoutDashboard',
              label: 'Physician Command Desk',
              routerLink: '/physician/dashboard',
            },
            {
              icon: 'lucideCalendarClock',
              label: 'Outpatient Appointments & Queue',
              routerLink: '/physician/appointments',
            },
            {
              icon: 'lucideBed',
              label: 'Inpatient Ward Census & Rounds',
              routerLink: '/physician/inpatients',
            },
          ],
        },
        {
          label: 'Safety & Overrides',
          items: [
            {
              icon: 'lucideShieldAlert',
              label: 'Emergency Break-Glass Access',
              routerLink: '/physician/break-glass',
            },
          ],
        },
      ];
    }
    if (this.isNurse()) {
      return [
        {
          label: 'Station Command & Triage',
          items: [
            {
              icon: 'lucideLayoutDashboard',
              label: 'Nursing Command Station',
              routerLink: '/nurse/dashboard',
            },
            {
              icon: 'lucideCalendarClock',
              label: 'Outpatient Appointments & Triage',
              routerLink: '/nurse/appointments',
            },
          ],
        },
        {
          label: 'Inpatient Ward & Bedside Care',
          items: [
            { icon: 'lucideUsers', label: 'My Inpatients & Care Team', routerLink: '/nurse/inpatients' },
            { icon: 'lucideBed', label: 'Spatial Bed & Ward Census', routerLink: '/nurse/beds' },
          ],
        },

      ];
    }
    if (this.isReceptionist()) {
      return [
        {
          label: 'Reception Desk Workspace',
          items: [
            {
              icon: 'lucideLayoutDashboard',
              label: 'Front-Desk Command Center',
              routerLink: '/receptionist/dashboard',
            },
            {
              icon: 'lucideCalendarClock',
              label: 'Appointments Roster',
              routerLink: '/receptionist/appointments',
            },
            { icon: 'lucideHeartPulse', label: 'MPI Search', routerLink: '/receptionist/mpi' },
          ],
        },
      ];
    }
    if (this.isLabTechnician()) {
      return [
        {
          label: 'Pathology & Lab Workspace',
          items: [
            {
              icon: 'lucideMicroscope',
              label: 'Lab Dashboard',
              routerLink: '/lab-technician/dashboard',
            },
            {
              icon: 'lucideListChecks',
              label: 'Specimen Worklist Queue',
              routerLink: '/lab-technician/worklist',
            },
            {
              icon: 'lucideFileText',
              label: 'LOINC Result Entry',
              routerLink: '/lab-technician/results',
            },
          ],
        },
      ];
    }
    if (this.isPharmacist()) {
      return [
        {
          label: 'Clinical Pharmacy Workspace',
          items: [
            {
              icon: 'lucideLayoutDashboard',
              label: 'Pharmacy Dashboard',
              routerLink: '/pharmacist/dashboard',
            },
            {
              icon: 'lucideListChecks',
              label: 'Prescription Verification',
              routerLink: '/pharmacist/erx',
            },
            {
              icon: 'lucidePill',
              label: 'Dispense Station & MAR',
              routerLink: '/pharmacist/dispense',
            },
            {
              icon: 'lucideBoxes',
              label: 'Inventory & FEFO Batches',
              routerLink: '/pharmacist/inventory',
            },
          ],
        },
      ];
    }
    if (this.isBillingStaff()) {
      return [
        {
          label: 'Revenue Cycle Workspace',
          items: [
            {
              icon: 'lucideLayoutDashboard',
              label: 'Revenue Dashboard',
              routerLink: '/billing-staff/dashboard',
            },
            {
              icon: 'lucideReceipt',
              label: 'Invoices & Charge Ledger',
              routerLink: '/billing-staff/invoices',
            },
            {
              icon: 'lucideFileText',
              label: 'Insurance & PM-JAY Claims',
              routerLink: '/billing-staff/claims',
            },
          ],
        },
      ];
    }
    if (this.isSuperAdmin()) {
      return [
        {
          label: 'Platform & Infrastructure',
          items: [
            {
              icon: 'lucideLayoutDashboard',
              label: 'Platform Command Desk',
              routerLink: '/super-admin/dashboard',
            },
            {
              icon: 'lucideServer',
              label: 'System Health & Terminology',
              routerLink: '/super-admin/system-health',
            },
          ],
        },
        {
          label: 'Tenant & User Management',
          items: [
            {
              icon: 'lucideBuilding2',
              label: 'Organizations & Tenants',
              routerLink: '/super-admin/organizations',
            },
            {
              icon: 'lucideUsers',
              label: 'Platform Users & RBAC',
              routerLink: '/super-admin/users',
            },
          ],
        },
        {
          label: 'Security & Compliance',
          items: [
            {
              icon: 'lucideShieldCheck',
              label: 'Platform Audit Vault',
              routerLink: '/super-admin/audit',
            },
          ],
        },
      ];
    }
    if (this.isOrganizationAdmin()) {
      return [
        {
          label: 'Hospital Administration',
          items: [
            {
              icon: 'lucideLayoutDashboard',
              label: 'Org Admin Command Center',
              routerLink: '/organization-admin/dashboard',
            },
            {
              icon: 'lucideBuilding2',
              label: 'Hospital Layout & Units',
              routerLink: '/organization-admin/facility-settings',
            },
          ],
        },
        {
          label: 'Staff & Patients',
          items: [
            {
              icon: 'lucideUsers',
              label: 'Staff Roster & Users',
              routerLink: '/organization-admin/users',
            },
            {
              icon: 'lucideActivity',
              label: 'Patient Census Policies',
              routerLink: '/organization-admin/patients',
            },
            {
              icon: 'lucideCalendarClock',
              label: 'Consultation Load Analytics',
              routerLink: '/organization-admin/schedule-analytics',
            },
          ],
        },
        {
          label: 'Security & Interoperability',
          items: [
            {
              icon: 'lucideDatabase',
              label: 'FHIR R4 Explorer',
              routerLink: '/organization-admin/fhir',
            },
            {
              icon: 'lucideShieldCheck',
              label: 'Organization Audit Log',
              routerLink: '/organization-admin/audit',
            },
          ],
        },
      ];
    }

    return [
      {
        label: 'My Clinical Records',
        items: [
          {
            icon: 'lucideLayoutDashboard',
            label: 'My Health Summary',
            routerLink: '/patient/dashboard',
          },
          {
            icon: 'lucideHeartPulse',
            label: 'My Health Chart & Reports',
            routerLink: '/patient/chart',
          },
          {
            icon: 'lucideHospital',
            label: 'Doctor Visits & Encounters',
            routerLink: '/patient/encounters',
          },
          { icon: 'lucideActivity', label: 'Vitals & Flowsheet', routerLink: '/patient/vitals' },
        ],
      },
      {
        label: 'Care & Billing',
        items: [
          {
            icon: 'lucideCalendarClock',
            label: 'Appointments & Schedule',
            routerLink: '/patient/appointments',
          },
          {
            icon: 'lucideReceipt',
            label: 'Invoices & Online Billing',
            routerLink: '/patient/billing',
          },
          { icon: 'lucideUserRound', label: 'My Health Profile', routerLink: '/patient/profile' },
        ],
      },
    ];
  });

  logout(): void {
    this.patientContext.clear();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
