import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PatientContextService } from '../../core/services/patient-context.service';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideLogIn,
  lucideLoader2,
  lucideAlertCircle,
  lucideHeartPulse,
  lucideShieldCheck,
  lucideHome,
  lucideKeyRound,
  lucideArrowRight,
  lucideUserPlus,
  lucideSearch,
  lucideStethoscope,
  lucideActivity,
  lucidePill,
  lucideFlaskConical,
  lucideBuilding2,
  lucideReceipt,
  lucideUser,
  lucideSparkles,
  lucideCheck,
  lucideChevronDown,
  lucideChevronUp,
  lucideZap,
  lucideX,
  lucideSlidersHorizontal,
  lucideUsers,
  lucideHospital,
  lucideFileText,
} from '@ng-icons/lucide';

export interface Persona {
  name: string;
  email: string;
  role: string;
  roleDisplay: string;
  org: string;
  orgCode: 'SYSTEM' | 'AIIMS' | 'APOLLO' | 'MAX' | 'MULTI';
  category: 'ADMIN' | 'PHYSICIAN' | 'NURSE' | 'OPS_PHARM' | 'PATIENT';
  details: string;
  icon: string;
  badgeClass: string;
  pinned?: boolean;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HlmButtonImports,
    HlmInputImports,
    HlmCardImports,
    HlmBadgeImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideLogIn,
      lucideLoader2,
      lucideAlertCircle,
      lucideHeartPulse,
      lucideShieldCheck,
      lucideHome,
      lucideKeyRound,
      lucideArrowRight,
      lucideUserPlus,
      lucideSearch,
      lucideStethoscope,
      lucideActivity,
      lucidePill,
      lucideFlaskConical,
      lucideBuilding2,
      lucideReceipt,
      lucideUser,
      lucideSparkles,
      lucideCheck,
      lucideChevronDown,
      lucideChevronUp,
      lucideZap,
      lucideX,
      lucideSlidersHorizontal,
      lucideUsers,
      lucideHospital,
      lucideFileText,
    }),
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  loading = signal(false);
  signingInEmail = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  // Persona Explorer State
  selectedCategory = signal<string>('ALL');
  selectedOrg = signal<string>('ALL');
  searchQuery = signal<string>('');
  expandedView = signal<boolean>(false);

  readonly personas: Persona[] = [
    // 1. SYSTEM & ADMINS
    {
      name: 'System Administrator',
      email: 'admin@sentinel.local',
      role: 'SUPER_ADMIN',
      roleDisplay: 'Super Admin',
      org: 'Sentinel Global',
      orgCode: 'SYSTEM',
      category: 'ADMIN',
      details: 'Global platform superuser, ABAC policies & WORM audit log management',
      icon: 'lucideShieldCheck',
      badgeClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
      pinned: true,
    },
    {
      name: 'Vikram Singh',
      email: 'vikram.singh@apollo.com',
      role: 'ORGANIZATION_ADMIN',
      roleDisplay: 'Hospital Admin',
      org: 'Apollo Mumbai',
      orgCode: 'APOLLO',
      category: 'ADMIN',
      details: 'Facility executive, staff credentials, wards & department controls',
      icon: 'lucideBuilding2',
      badgeClass: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
      pinned: true,
    },
    {
      name: 'Neha Singhal',
      email: 'neha.singhal@maxhealthcare.com',
      role: 'ORGANIZATION_ADMIN',
      roleDisplay: 'Hospital Admin',
      org: 'Max Healthcare',
      orgCode: 'MAX',
      category: 'ADMIN',
      details: 'Max Saket unit administrator, clinician access & tenant compliance',
      icon: 'lucideBuilding2',
      badgeClass: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
    },

    // 2. PHYSICIANS & SPECIALISTS
    {
      name: 'Dr. Arjun Sharma',
      email: 'arjun.sharma@aiims.edu',
      role: 'PHYSICIAN',
      roleDisplay: 'Cardiologist',
      org: 'Multi-Org (AIIMS+Apollo+Max)',
      orgCode: 'MULTI',
      category: 'PHYSICIAN',
      details: 'Interventional Cardiology: Full-Time AIIMS, Consultant Apollo, Visiting Max',
      icon: 'lucideStethoscope',
      badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      pinned: true,
    },
    {
      name: 'Dr. Priya Kapoor',
      email: 'priya.kapoor@aiims.edu',
      role: 'PHYSICIAN',
      roleDisplay: 'Neurologist',
      org: 'Multi-Org (AIIMS+Max)',
      orgCode: 'MULTI',
      category: 'PHYSICIAN',
      details: 'Stroke & Clinical Neurology: AIIMS Full-Time, Consultant Max Saket',
      icon: 'lucideStethoscope',
      badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    },
    {
      name: 'Dr. Rajesh Patel',
      email: 'rajesh.patel@aiims.edu',
      role: 'PHYSICIAN',
      roleDisplay: 'Emergency Medicine',
      org: 'Multi-Org (AIIMS+Apollo)',
      orgCode: 'MULTI',
      category: 'PHYSICIAN',
      details: 'Emergency & Internal Medicine: AIIMS Full-Time, Visiting Apollo',
      icon: 'lucideStethoscope',
      badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    },
    {
      name: 'Dr. Siddharth Mukherjee',
      email: 'siddharth.m@apollo.com',
      role: 'PHYSICIAN',
      roleDisplay: 'Medical Oncologist',
      org: 'Apollo Mumbai',
      orgCode: 'APOLLO',
      category: 'PHYSICIAN',
      details: 'Clinical Oncology & Hematology, Chemotherapy regimen orders',
      icon: 'lucideStethoscope',
      badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    },
    {
      name: 'Dr. Kabir Anand',
      email: 'kabir.anand@maxhealthcare.com',
      role: 'PHYSICIAN',
      roleDisplay: 'Cardiologist',
      org: 'Max Healthcare',
      orgCode: 'MAX',
      category: 'PHYSICIAN',
      details: 'Max Cardiology Institute, Cath Lab & Percutaneous Coronary Intervention',
      icon: 'lucideStethoscope',
      badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    },
    {
      name: 'Dr. Vikram Sethi',
      email: 'vikram.sethi@aiims.edu',
      role: 'RADIOLOGIST',
      roleDisplay: 'Neuroradiologist',
      org: 'AIIMS New Delhi',
      orgCode: 'AIIMS',
      category: 'PHYSICIAN',
      details: 'Diagnostic Radiodiagnosis & Imaging, DICOM series & radiology reports',
      icon: 'lucideStethoscope',
      badgeClass: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
    },

    // 3. NURSING & INPATIENT CARE
    {
      name: 'Sunita Verma',
      email: 'sunita.verma@aiims.edu',
      role: 'NURSE',
      roleDisplay: 'CCU Senior Nurse',
      org: 'AIIMS New Delhi',
      orgCode: 'AIIMS',
      category: 'NURSE',
      details: 'Coronary Intensive Care Unit (CCU), Bedside Vitals Flowsheets & eMAR',
      icon: 'lucideActivity',
      badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
      pinned: true,
    },
    {
      name: 'Rahul Nair',
      email: 'rahul.nair@aiims.edu',
      role: 'NURSE',
      roleDisplay: 'Emergency Nurse',
      org: 'AIIMS New Delhi',
      orgCode: 'AIIMS',
      category: 'NURSE',
      details: 'Emergency Resuscitation & Triage Bay, Early Warning Scoring (EWS)',
      icon: 'lucideActivity',
      badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    },
    {
      name: 'Meera Nair',
      email: 'meera.nair@apollo.com',
      role: 'NURSE',
      roleDisplay: 'Oncology Nurse',
      org: 'Apollo Mumbai',
      orgCode: 'APOLLO',
      category: 'NURSE',
      details: 'Oncology & Critical Care Nurse, Chemotherapy eMAR administration',
      icon: 'lucideActivity',
      badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    },
    {
      name: 'Kavita Joshi',
      email: 'kavita.joshi@maxhealthcare.com',
      role: 'NURSE',
      roleDisplay: 'Emergency Nurse',
      org: 'Max Healthcare',
      orgCode: 'MAX',
      category: 'NURSE',
      details: '24x7 Emergency Care Unit & Acute Inpatient Floor Care',
      icon: 'lucideActivity',
      badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    },

    // 4. PHARMACY, LAB, RECEPTION & BILLING
    {
      name: 'Anita Deshmukh',
      email: 'anita.deshmukh@aiims.edu',
      role: 'PHARMACIST',
      roleDisplay: 'Chief Pharmacist',
      org: 'AIIMS New Delhi',
      orgCode: 'AIIMS',
      category: 'OPS_PHARM',
      details: 'Cardiology & Inpatient Pharmacy, Drug Dispense & Rx verification',
      icon: 'lucidePill',
      badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    },
    {
      name: 'Pooja Iyer',
      email: 'pooja.iyer@apollo.com',
      role: 'PHARMACIST',
      roleDisplay: 'Clinical Pharmacist',
      org: 'Apollo Mumbai',
      orgCode: 'APOLLO',
      category: 'OPS_PHARM',
      details: 'Oncology Pharmacy, Chemotherapy compounding & prescription checks',
      icon: 'lucidePill',
      badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    },
    {
      name: 'Deepak Bhatia',
      email: 'deepak.bhatia@maxhealthcare.com',
      role: 'PHARMACIST',
      roleDisplay: 'Inpatient Pharmacist',
      org: 'Max Healthcare',
      orgCode: 'MAX',
      category: 'OPS_PHARM',
      details: 'Cardiology & Emergency Pharmacy, RxNorm formulary management',
      icon: 'lucidePill',
      badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    },
    {
      name: 'Amit Roy',
      email: 'amit.roy@aiims.edu',
      role: 'LAB_TECHNICIAN',
      roleDisplay: 'Lab Technologist',
      org: 'AIIMS New Delhi',
      orgCode: 'AIIMS',
      category: 'OPS_PHARM',
      details: 'Pathology & Clinical Biochemistry, LOINC Blood Panels & Troponin-I',
      icon: 'lucideFlaskConical',
      badgeClass: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    },
    {
      name: 'Kunal Shah',
      email: 'kunal.shah@apollo.com',
      role: 'LAB_TECHNICIAN',
      roleDisplay: 'Lab Technologist',
      org: 'Apollo Mumbai',
      orgCode: 'APOLLO',
      category: 'OPS_PHARM',
      details: 'Central Diagnostic Lab, Specimen Barcode Tracking & Lab Results',
      icon: 'lucideFlaskConical',
      badgeClass: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    },
    {
      name: 'Sarita Gupta',
      email: 'sarita.gupta@aiims.edu',
      role: 'RECEPTIONIST',
      roleDisplay: 'Receptionist',
      org: 'AIIMS New Delhi',
      orgCode: 'AIIMS',
      category: 'OPS_PHARM',
      details: 'Front Desk OPD Desk, Master Patient Index (MPI) & Intake Registration',
      icon: 'lucideUsers',
      badgeClass: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
    },
    {
      name: 'Rohan Kapur',
      email: 'rohan.kapur@apollo.com',
      role: 'RECEPTIONIST',
      roleDisplay: 'Receptionist',
      org: 'Apollo Mumbai',
      orgCode: 'APOLLO',
      category: 'OPS_PHARM',
      details: 'Cardiology Front Desk, Patient Registration & Outpatient Scheduling',
      icon: 'lucideUsers',
      badgeClass: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
    },
    {
      name: 'Manish Verma',
      email: 'manish.verma@maxhealthcare.com',
      role: 'RECEPTIONIST',
      roleDisplay: 'Receptionist',
      org: 'Max Healthcare',
      orgCode: 'MAX',
      category: 'OPS_PHARM',
      details: 'Internal Medicine & OPD Check-In, Patient Intake Flow',
      icon: 'lucideUsers',
      badgeClass: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
    },
    {
      name: 'Vikas Mehta',
      email: 'vikas.mehta@aiims.edu',
      role: 'BILLING_STAFF',
      roleDisplay: 'Billing Officer',
      org: 'AIIMS New Delhi',
      orgCode: 'AIIMS',
      category: 'OPS_PHARM',
      details: 'Charge Items, Invoices, Payment Allocation & Insurance Claims',
      icon: 'lucideReceipt',
      badgeClass: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    },
    {
      name: 'Ananya Desai',
      email: 'ananya.desai@apollo.com',
      role: 'BILLING_STAFF',
      roleDisplay: 'Billing Officer',
      org: 'Apollo Mumbai',
      orgCode: 'APOLLO',
      category: 'OPS_PHARM',
      details: 'Oncology Invoicing, Prior Authorizations & Cashless Settlement',
      icon: 'lucideReceipt',
      badgeClass: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    },
    {
      name: 'Priya Nambiar',
      email: 'priya.nambiar@maxhealthcare.com',
      role: 'BILLING_STAFF',
      roleDisplay: 'Billing Officer',
      org: 'Max Healthcare',
      orgCode: 'MAX',
      category: 'OPS_PHARM',
      details: 'Outpatient Billing, Third-Party Claim Items & Payment Processing',
      icon: 'lucideReceipt',
      badgeClass: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    },

    // 5. PATIENT PORTAL ACCOUNTS
    {
      name: 'Ramesh Kumar',
      email: 'ramesh.kumar@gmail.com',
      role: 'PATIENT',
      roleDisplay: 'Patient (AIIMS)',
      org: 'AIIMS New Delhi',
      orgCode: 'AIIMS',
      category: 'PATIENT',
      details: 'MRN: AIIMS-2024-001001 • Essential Hypertension, Prior TIA, B+ blood',
      icon: 'lucideUser',
      badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
      pinned: true,
    },
    {
      name: 'Anita Sharma',
      email: 'anita.sharma@gmail.com',
      role: 'PATIENT',
      roleDisplay: 'Patient (AIIMS)',
      org: 'AIIMS New Delhi',
      orgCode: 'AIIMS',
      category: 'PATIENT',
      details: 'MRN: AIIMS-2024-001002 • Chronic Tension Headaches, Peanut Allergy, O+ blood',
      icon: 'lucideUser',
      badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    },
    {
      name: 'Mohammed Azhar',
      email: 'mohammed.azhar.dev@gmail.com',
      role: 'PATIENT',
      roleDisplay: 'Patient (AIIMS)',
      org: 'AIIMS New Delhi',
      orgCode: 'AIIMS',
      category: 'PATIENT',
      details: 'MRN: AIIMS-2024-001003 • Type 2 Diabetes, Dyslipidemia, A+ blood',
      icon: 'lucideUser',
      badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    },
    {
      name: 'Lakshmi Iyer',
      email: 'lakshmi.iyer1950@gmail.com',
      role: 'PATIENT',
      roleDisplay: 'Patient (AIIMS)',
      org: 'AIIMS New Delhi',
      orgCode: 'AIIMS',
      category: 'PATIENT',
      details: 'MRN: AIIMS-2024-001004 • Bilateral Knee Osteoarthritis, Bronchial Asthma, AB-',
      icon: 'lucideUser',
      badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    },
    {
      name: 'Arun Gupta',
      email: 'arun.gupta@gmail.com',
      role: 'PATIENT',
      roleDisplay: 'Patient (AIIMS)',
      org: 'AIIMS New Delhi',
      orgCode: 'AIIMS',
      category: 'PATIENT',
      details: 'MRN: AIIMS-2024-001005 • Coronary Artery Disease, Aspirin Allergy, O+ blood',
      icon: 'lucideUser',
      badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    },
    {
      name: 'Suresh Naidu',
      email: 'suresh.naidu95@gmail.com',
      role: 'PATIENT',
      roleDisplay: 'Patient (Apollo)',
      org: 'Apollo Mumbai',
      orgCode: 'APOLLO',
      category: 'PATIENT',
      details: 'MRN: APL-2024-005001 • Seasonal Allergic Rhinitis, O- blood group',
      icon: 'lucideUser',
      badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    },
    {
      name: 'Priyanka Sen',
      email: 'priyanka.sen@gmail.com',
      role: 'PATIENT',
      roleDisplay: 'Patient (Apollo)',
      org: 'Apollo Mumbai',
      orgCode: 'APOLLO',
      category: 'PATIENT',
      details: 'MRN: APL-2024-005002 • Migraine with Aura, Iron Deficiency Anemia, A+ blood',
      icon: 'lucideUser',
      badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    },
    {
      name: 'Rohan Verma',
      email: 'rohan.verma@gmail.com',
      role: 'PATIENT',
      roleDisplay: 'Patient (Apollo)',
      org: 'Apollo Mumbai',
      orgCode: 'APOLLO',
      category: 'PATIENT',
      details: 'MRN: APL-2024-005003 • Stage 1 Hypertension, Fatty Liver Grade 1, B+ blood',
      icon: 'lucideUser',
      badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    },
    {
      name: 'Sunil Chawla',
      email: 'sunil.chawla@gmail.com',
      role: 'PATIENT',
      roleDisplay: 'Patient (Max)',
      org: 'Max Healthcare',
      orgCode: 'MAX',
      category: 'PATIENT',
      details: 'MRN: MAX-2024-009001 • Type 2 Diabetes, Diabetic Nephropathy, AB+ blood',
      icon: 'lucideUser',
      badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    },
    {
      name: 'Deepika Padukone',
      email: 'deepika.p@gmail.com',
      role: 'PATIENT',
      roleDisplay: 'Patient (Max)',
      org: 'Max Healthcare',
      orgCode: 'MAX',
      category: 'PATIENT',
      details: 'MRN: MAX-2024-009002 • Cervical Neck Strain, Vitamin D Deficiency, O+ blood',
      icon: 'lucideUser',
      badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    },
  ];

  // Filtered Personas Computed Signal
  filteredPersonas = computed(() => {
    const cat = this.selectedCategory();
    const org = this.selectedOrg();
    const query = this.searchQuery().toLowerCase().trim();

    return this.personas.filter((p) => {
      const matchCat = cat === 'ALL' || p.category === cat;
      const matchOrg = org === 'ALL' || p.orgCode === org || (org === 'MULTI' && p.orgCode === 'MULTI');
      const matchQuery =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        p.roleDisplay.toLowerCase().includes(query) ||
        p.org.toLowerCase().includes(query) ||
        p.details.toLowerCase().includes(query) ||
        p.role.toLowerCase().includes(query);

      return matchCat && matchOrg && matchQuery;
    });
  });

  // Pinned Personas for Quick Bar
  pinnedPersonas = computed(() => this.personas.filter((p) => p.pinned));

  // Category counts
  categoryCounts = computed(() => {
    return {
      ALL: this.personas.length,
      PHYSICIAN: this.personas.filter((p) => p.category === 'PHYSICIAN').length,
      NURSE: this.personas.filter((p) => p.category === 'NURSE').length,
      OPS_PHARM: this.personas.filter((p) => p.category === 'OPS_PHARM').length,
      ADMIN: this.personas.filter((p) => p.category === 'ADMIN').length,
      PATIENT: this.personas.filter((p) => p.category === 'PATIENT').length,
    };
  });

  constructor(
    private authService: AuthService,
    private patientContext: PatientContextService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/select-context']);
    }
  }

  setCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  setOrg(org: string): void {
    this.selectedOrg.set(org);
  }

  toggleExpandedView(): void {
    this.expandedView.update((v) => !v);
  }

  fillDemoCredentials(e: string, p: string = 'Sentinel@123'): void {
    this.email = e;
    this.password = p;
    this.errorMessage.set(null);
    toast.info('Credentials Applied', {
      description: `Filled email for ${e}. Click 'Sign In' or submit.`,
    });
  }

  instantSignIn(persona: Persona): void {
    this.email = persona.email;
    this.password = 'Sentinel@123';
    this.signingInEmail.set(persona.email);
    this.onLogin();
  }

  onLogin(): void {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.signingInEmail.set(null);
        this.patientContext.loadContext();
        toast.success('Authenticated Successfully', {
          description: 'Please select your workspace context.',
        });
        this.router.navigate(['/select-context']);
      },
      error: (err) => {
        this.loading.set(false);
        this.signingInEmail.set(null);
        const msg =
          err.status === 0
            ? 'Cannot connect to backend server. Please verify Spring Boot server is running on http://localhost:8080.'
            : typeof err.error === 'string'
              ? err.error
              : err.error?.message || 'Invalid email or password.';
        this.errorMessage.set(msg);
        toast.error('Authentication Failed', { description: msg });
      },
    });
  }
}

