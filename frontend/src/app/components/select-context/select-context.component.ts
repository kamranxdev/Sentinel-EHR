import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { ThemeService } from '../../core/services/theme.service';
import {
  DepartmentContextDTO,
  FacilityContextDTO,
  OrganizationContextDTO,
  SelectedContext,
} from '../../core/models/auth-user.model';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBuilding2,
  lucideHospital,
  lucideShieldCheck,
  lucideStethoscope,
  lucideHeartPulse,
  lucideUserRound,
  lucideUserCheck,
  lucideArrowRight,
  lucideLogOut,
  lucideLayers,
  lucideSparkles,
  lucideChevronRight,
  lucideCheckCircle2,
  lucideBriefcase,
  lucideUser,
  lucideSettings,
  lucideFileText,
  lucideHome,
  lucideSun,
  lucideMoon,
  lucideActivity,
  lucideKey,
  lucideShieldAlert,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-select-context',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideBuilding2,
      lucideHospital,
      lucideShieldCheck,
      lucideStethoscope,
      lucideHeartPulse,
      lucideUserRound,
      lucideUserCheck,
      lucideArrowRight,
      lucideLogOut,
      lucideLayers,
      lucideSparkles,
      lucideChevronRight,
      lucideCheckCircle2,
      lucideBriefcase,
      lucideUser,
      lucideSettings,
      lucideFileText,
      lucideHome,
      lucideSun,
      lucideMoon,
      lucideActivity,
      lucideKey,
      lucideShieldAlert,
    }),
  ],
  templateUrl: './select-context.component.html',
  styleUrl: './select-context.component.css',
})
export class SelectContextComponent implements OnInit {
  user = computed(() => this.authService.currentUser());
  organizations = computed(() => this.user()?.organizations || []);
  isSuperAdmin = computed(() => this.authService.isSuperAdmin());
  isOrgAdmin = computed(() => this.authService.isOrganizationAdmin());
  isAuditor = computed(() => this.authService.isAuditor());
  isPatient = computed(() => this.authService.isPatient() || !!this.user()?.patientId);

  isStrictPatientOnly = computed(() => {
    return (
      this.isPatient() &&
      !this.isSuperAdmin() &&
      !this.isOrgAdmin() &&
      !this.authService.isPhysician() &&
      !this.authService.isNurse() &&
      !this.authService.isReceptionist() &&
      !this.authService.isPharmacist() &&
      !this.authService.isLabTechnician() &&
      !this.authService.isBillingStaff() &&
      !this.authService.isAuditor()
    );
  });

  hasGovernanceAccess = computed(() => {
    return this.isSuperAdmin() || this.isAuditor();
  });

  constructor(
    public authService: AuthService,
    public theme: ThemeService,
    private patientContext: PatientContextService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
  }

  handleSelectOrganization(org: OrganizationContextDTO, facility?: FacilityContextDTO): void {
    const context: SelectedContext = {
      organizationId: org.id,
      organizationName: org.name,
      organizationCode: org.code,
      facilityId: facility?.id,
      facilityName: facility?.name,
      departmentId: facility?.departments && facility.departments.length > 0 ? facility.departments[0].id : undefined,
      departmentName: facility?.departments && facility.departments.length > 0 ? facility.departments[0].name : undefined,
      roleName: this.authService.getPrimaryRole(),
    };

    this.authService.setContext(context);
    this.patientContext.loadContext();

    toast.success('Workspace Context Activated', {
      description: `Active organization: ${org.name}${facility ? ' • ' + facility.name : ''}`,
    });

    this.navigateToDashboard();
  }

  handleSelectGovernanceConsole(type: 'SUPER_ADMIN' | 'AUDITOR'): void {
    const orgs = this.organizations();
    const primaryOrg = orgs.length > 0 ? orgs[0] : null;

    if (type === 'SUPER_ADMIN') {
      this.authService.setContext({
        organizationId: primaryOrg ? primaryOrg.id : 'SYSTEM_WIDE',
        organizationName: primaryOrg ? primaryOrg.name : 'Sentinel Platform Infrastructure',
        roleName: 'SuperAdmin',
      });
      toast.success('Platform Governance Activated', {
        description: 'Global control plane and multi-tenant management active.',
      });
      this.router.navigate(['/super-admin/dashboard']);
    } else {
      this.authService.setContext({
        organizationId: primaryOrg ? primaryOrg.id : 'AUDIT_VAULT',
        organizationName: primaryOrg ? primaryOrg.name : 'Compliance & Audit Vault',
        roleName: 'Auditor',
      });
      toast.success('Compliance Audit Vault Activated', {
        description: 'Immutable forensic access logs enabled.',
      });
      this.router.navigate(['/auditor/dashboard']);
    }
  }

  handleSelectPatientPortal(): void {
    const orgs = this.organizations();
    const primaryOrg = orgs.length > 0 ? orgs[0] : null;

    this.authService.setContext({
      organizationId: primaryOrg ? primaryOrg.id : 'PATIENT_PORTAL',
      organizationName: primaryOrg ? primaryOrg.name : 'Unified Patient Health Record',
      roleName: 'Patient',
    });

    this.patientContext.loadContext();
    toast.success('Patient Health Portal Activated', {
      description: 'Accessing personal longitudinal electronic health records.',
    });
    this.router.navigate(['/patient/dashboard']);
  }

  navigateToDashboard(): void {
    const role = this.authService.getPrimaryRole();
    switch (role) {
      case 'SuperAdmin':
        this.router.navigate(['/super-admin/dashboard']);
        break;
      case 'OrganizationAdmin':
        this.router.navigate(['/organization-admin/dashboard']);
        break;
      case 'Physician':
        this.router.navigate(['/physician/dashboard']);
        break;
      case 'Nurse':
        this.router.navigate(['/nurse/dashboard']);
        break;
      case 'Receptionist':
        this.router.navigate(['/receptionist/dashboard']);
        break;
      case 'LabTechnician':
        this.router.navigate(['/lab-technician/dashboard']);
        break;
      case 'Pharmacist':
        this.router.navigate(['/pharmacist/dashboard']);
        break;
      case 'BillingStaff':
        this.router.navigate(['/billing-staff/dashboard']);
        break;
      case 'Auditor':
        this.router.navigate(['/auditor/dashboard']);
        break;
      case 'Patient':
        this.router.navigate(['/patient/dashboard']);
        break;
      default:
        this.router.navigate(['/dashboard']);
        break;
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
