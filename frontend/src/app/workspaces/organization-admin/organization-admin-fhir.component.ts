import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { OrganizationService } from '../../core/services/organization.service';
import { AuthService } from '../../core/services/auth.service';
import { Organization } from '../../core/models/organization.model';
import { Patient } from '../../core/models/patient.model';
import { FhirCapabilityStatement } from '../../core/models/fhir.model';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideShieldCheck,
  lucideFileText,
  lucideActivity,
  lucideBuilding2,
  lucideUsers,
  lucideDownload,
  lucideCopy,
  lucideCheck,
  lucideRefreshCw,
  lucideSearch,
  lucidePlay,
  lucideUploadCloud,
  lucideDatabase,
  lucideChevronRight,
  lucideInfo,
  lucideLayers,
  lucideAlertCircle,
  lucideCode,
  lucideExternalLink,
  lucideSparkles,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-organization-admin-fhir',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideShieldCheck,
      lucideFileText,
      lucideActivity,
      lucideBuilding2,
      lucideUsers,
      lucideDownload,
      lucideCopy,
      lucideCheck,
      lucideRefreshCw,
      lucideSearch,
      lucidePlay,
      lucideUploadCloud,
      lucideDatabase,
      lucideChevronRight,
      lucideInfo,
      lucideLayers,
      lucideAlertCircle,
      lucideCode,
      lucideExternalLink,
      lucideSparkles,
    }),
  ],
  template: `
    <div class="space-y-6 font-sans">
      <!-- Organization Specific Header & Context Banner -->
      <div
        class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-border"
      >
        <div class="flex items-center gap-4">
          <div
            class="size-12 rounded-xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-emerald-500/5 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs"
          >
            <ng-icon name="lucideDatabase" size="26" />
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-xl font-bold tracking-tight text-foreground">
                HL7 FHIR R4 Interoperability Engine
              </h1>
              <span
                hlmBadge
                variant="secondary"
                class="text-[10px] uppercase font-mono tracking-wider bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
              >
                FHIR R4 v4.0.1
              </span>
              <span
                *ngIf="organization()"
                hlmBadge
                variant="outline"
                class="text-[10px] font-mono tracking-wider bg-blue-500/10 text-blue-600 border-blue-500/30"
              >
                {{ organization()?.name || 'Active Facility' }}
              </span>
            </div>
            <p class="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
              <span class="inline-flex items-center gap-1.5 text-emerald-500 font-semibold">
                <span class="relative flex size-2">
                  <span
                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                  ></span>
                  <span class="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                </span>
                FHIR R4 Gateway Active
              </span>
              <span>•</span>
              <span>
                Organization-scoped ABDM / DISHA data exchange, resource queries & clinical bundle exports
              </span>
            </p>
          </div>
        </div>

        <!-- Navigation Tabs Controls -->
        <div class="flex items-center gap-1.5 bg-muted/40 p-1.5 rounded-xl border border-border/40 shrink-0">
          <button
            (click)="setTab('query')"
            [class.bg-card]="activeTab() === 'query'"
            [class.shadow-xs]="activeTab() === 'query'"
            [class.text-foreground]="activeTab() === 'query'"
            class="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-1.5"
          >
            <ng-icon name="lucideSearch" size="14" />
            <span>Query REST API</span>
          </button>
          <button
            (click)="setTab('conformance')"
            [class.bg-card]="activeTab() === 'conformance'"
            [class.shadow-xs]="activeTab() === 'conformance'"
            [class.text-foreground]="activeTab() === 'conformance'"
            class="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-1.5"
          >
            <ng-icon name="lucideShieldCheck" size="14" />
            <span>CapabilityStatement</span>
          </button>
          <button
            (click)="setTab('ingest')"
            [class.bg-card]="activeTab() === 'ingest'"
            [class.shadow-xs]="activeTab() === 'ingest'"
            [class.text-foreground]="activeTab() === 'ingest'"
            class="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-1.5"
          >
            <ng-icon name="lucideUploadCloud" size="14" />
            <span>Ingest Resource</span>
          </button>
        </div>
      </div>

      <!-- Facility Specific Meta Summary Banner -->
      <div
        class="bg-gradient-to-r from-emerald-500/5 via-card to-blue-500/5 p-4 rounded-2xl border border-border/60 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div class="flex items-center gap-3">
          <div
            class="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20"
          >
            <ng-icon name="lucideBuilding2" size="20" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-foreground">
                {{ organization()?.name || activeOrgName() || 'Healthcare Facility' }}
              </span>
              <span
                class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-secondary text-secondary-foreground border border-border"
              >
                Code: {{ organization()?.code || 'FAC-MAIN' }}
              </span>
            </div>
            <p class="text-xs text-muted-foreground mt-0.5">
              Organization OID: <span class="font-mono text-foreground font-semibold">2.16.840.1.113883.4.{{ organization()?.id ? organization()?.id?.substring(0, 6) : '89012' }}</span>
              • Facility Census: <span class="font-semibold text-emerald-600 font-mono">{{ patients().length }} Registered Patients</span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs">
          <span class="font-mono text-[11px] bg-background/80 px-3 py-1.5 rounded-lg border border-border text-muted-foreground">
            Base URL: <strong class="text-foreground">/fhir</strong>
          </span>
          <button
            (click)="loadOrganizationData()"
            class="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-all border border-border cursor-pointer"
            title="Refresh Facility Context"
          >
            <ng-icon name="lucideRefreshCw" size="14" [class.animate-spin]="loadingOrg()" />
          </button>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- TAB 1: REST API QUERY EXPLORER (Organization-Scoped) -->
      <!-- ========================================================================= -->
      <div *ngIf="activeTab() === 'query'" class="space-y-6">
        <!-- Filter Controls & Patient Context Selector -->
        <div class="bg-card p-5 rounded-2xl border border-border shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-border pb-3">
            <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <ng-icon name="lucideSearch" size="14" class="text-emerald-600" />
              FHIR R4 Query Parameters & Organization Patient Selector
            </h3>
            <span class="text-[11px] text-muted-foreground">
              Select an active facility patient or execute type-wide search
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- 1. Resource Type Selector -->
            <div>
              <label class="block text-xs font-semibold text-foreground mb-1.5">
                Resource Type
              </label>
              <select
                [(ngModel)]="selectedResource"
                (change)="onResourceChange()"
                class="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                <option value="Patient">Patient (Demographics & Identity)</option>
                <option value="Encounter">Encounter (Visits & Class)</option>
                <option value="Condition">Condition (Problem List / ICD-10)</option>
                <option value="MedicationRequest">MedicationRequest (RxNorm eRx)</option>
                <option value="Observation">Observation (Vitals & Labs LOINC)</option>
                <option value="AllergyIntolerance">AllergyIntolerance (Substances)</option>
                <option value="Practitioner">Practitioner (Clinicians & Staff)</option>
                <option value="CareTeam">CareTeam (Clinical Teams)</option>
                <option value="Consent">Consent (ABDM Directives)</option>
                <option value="Organization">Organization (Facility Metadata)</option>
              </select>
            </div>

            <!-- 2. Facility Patient Selector (Scoped to Org) -->
            <div>
              <label class="block text-xs font-semibold text-foreground mb-1.5 flex items-center justify-between">
                <span>Facility Patient Census</span>
                <span class="text-[10px] text-emerald-600 font-mono">({{ patients().length }} in org)</span>
              </label>
              <select
                [(ngModel)]="selectedPatientMrn"
                (change)="onPatientSelect()"
                class="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                <option value="">-- All Organization Records --</option>
                <option *ngFor="let p of patients()" [value]="p.id">
                  {{ p.fullName }} (MRN: {{ p.patientCode }})
                </option>
              </select>
            </div>

            <!-- 3. Resource ID Filter -->
            <div>
              <label class="block text-xs font-semibold text-foreground mb-1.5">
                Resource ID (Optional)
              </label>
              <input
                type="text"
                [(ngModel)]="selectedResourceId"
                placeholder="UUID or resource identifier..."
                class="w-full bg-background border border-input rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-mono"
              />
            </div>

            <!-- 4. Execute Query Action Button -->
            <div class="flex items-end gap-2">
              <button
                (click)="executeQuery()"
                [disabled]="loadingQuery()"
                class="w-full bg-emerald-600 text-white font-semibold px-4 py-2 text-xs rounded-xl hover:bg-emerald-700 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ng-icon
                  *ngIf="!loadingQuery()"
                  name="lucidePlay"
                  size="14"
                />
                <span
                  *ngIf="loadingQuery()"
                  class="animate-spin inline-block size-3.5 border-2 border-current border-t-transparent rounded-full"
                ></span>
                <span>Execute FHIR Query</span>
              </button>
            </div>
          </div>

          <!-- Special Operations Bar -->
          <div
            class="pt-3 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground"
          >
            <div class="flex items-center gap-4 flex-wrap">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  [(ngModel)]="isEverythingQuery"
                  (change)="onEverythingToggle()"
                  class="rounded border-input text-emerald-600 focus:ring-emerald-500/40"
                />
                <span class="font-medium text-foreground">Run FHIR $everything Operation</span>
                <span class="text-xs text-muted-foreground hidden md:inline">
                  (Exports full clinical history bundle for selected patient)
                </span>
              </label>
            </div>

            <div class="flex items-center gap-2">
              <span class="font-mono text-[11px] bg-muted/60 px-2.5 py-1 rounded-md border border-border/50 text-foreground">
                GET {{ currentQueryUrl() }}
              </span>
            </div>
          </div>
        </div>

        <!-- Quick Patient Pick Pills (if organization has patients) -->
        <div *ngIf="patients().length > 0" class="flex items-center gap-2 flex-wrap">
          <span class="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Patient Filter:
          </span>
          <button
            *ngFor="let p of patients().slice(0, 6)"
            (click)="quickSelectPatient(p.id)"
            [class.bg-emerald-500\/10]="selectedPatientMrn === p.id"
            [class.border-emerald-500\/30]="selectedPatientMrn === p.id"
            [class.text-emerald-600]="selectedPatientMrn === p.id"
            class="px-2.5 py-1 rounded-lg text-xs font-medium border border-border bg-card hover:bg-muted/40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span class="font-semibold">{{ p.fullName }}</span>
            <span class="text-[10px] font-mono text-muted-foreground">({{ p.patientCode }})</span>
          </button>
          <button
            *ngIf="selectedPatientMrn"
            (click)="clearPatientFilter()"
            class="text-[11px] text-destructive hover:underline ml-1 cursor-pointer"
          >
            Clear Filter
          </button>
        </div>

        <!-- Response Viewer / Output Card -->
        <div class="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
          <!-- Toolbar -->
          <div
            class="px-5 py-3.5 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-muted/20"
          >
            <div class="flex items-center gap-3">
              <span
                [class.bg-emerald-500\/10]="httpStatus() === 200"
                [class.text-emerald-600]="httpStatus() === 200"
                [class.border-emerald-500\/30]="httpStatus() === 200"
                [class.bg-rose-500\/10]="httpStatus() >= 400"
                [class.text-rose-600]="httpStatus() >= 400"
                [class.border-rose-500\/30]="httpStatus() >= 400"
                class="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border"
              >
                HTTP {{ httpStatus() }}
              </span>
              <span class="text-xs font-semibold text-foreground">
                {{ rawResult()?.resourceType || 'Resource' }} Output
              </span>
              <span class="text-xs text-muted-foreground font-mono">
                ({{ totalEntries() }} {{ totalEntries() === 1 ? 'entry' : 'entries' }} returned)
              </span>
            </div>

            <div class="flex items-center gap-2">
              <button
                (click)="downloadBundleJson()"
                [disabled]="!jsonResult()"
                class="px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all flex items-center gap-1.5 border border-border disabled:opacity-50 cursor-pointer"
                title="Download FHIR Bundle as JSON"
              >
                <ng-icon name="lucideDownload" size="14" />
                <span>Export Bundle JSON</span>
              </button>

              <button
                (click)="copyJson()"
                [disabled]="!jsonResult()"
                class="px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all flex items-center gap-1.5 border border-border disabled:opacity-50 cursor-pointer"
              >
                <ng-icon *ngIf="!copied()" name="lucideCopy" size="14" />
                <ng-icon *ngIf="copied()" name="lucideCheck" size="14" class="text-emerald-500" />
                <span>{{ copied() ? 'Copied!' : 'Copy JSON' }}</span>
              </button>
            </div>
          </div>

          <!-- Error Alert if any -->
          <div *ngIf="errorMsg()" class="p-4 bg-destructive/10 border-b border-destructive/20 text-xs text-destructive flex items-center gap-2">
            <ng-icon name="lucideAlertCircle" size="16" />
            <span>{{ errorMsg() }}</span>
          </div>

          <!-- JSON Code Window -->
          <div
            class="p-5 bg-zinc-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[550px] leading-relaxed select-text"
          >
            <pre *ngIf="jsonResult() && !loadingQuery()">{{ jsonResult() }}</pre>
            <div *ngIf="loadingQuery()" class="py-16 text-center text-muted-foreground font-sans flex flex-col items-center justify-center gap-2">
              <div class="animate-spin size-6 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
              <span>Executing FHIR R4 query on Sentinel Core Engine...</span>
            </div>
            <div *ngIf="!jsonResult() && !loadingQuery()" class="py-12 text-center text-zinc-500 font-sans text-xs">
              Click "Execute FHIR Query" above to fetch resource payload.
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- TAB 2: CONFORMANCE & METADATA -->
      <!-- ========================================================================= -->
      <div *ngIf="activeTab() === 'conformance'" class="space-y-6">
        <div class="bg-card p-6 rounded-2xl border border-border shadow-xs space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-base font-bold text-foreground">
                  FHIR R4 CapabilityStatement Conformance
                </h2>
                <span class="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full text-[10px] font-semibold font-mono">
                  HL7 FHIR v4.0.1
                </span>
              </div>
              <p class="text-xs text-muted-foreground mt-0.5">
                Official statement of supported FHIR resources, search parameters, REST operations, and ABDM security protocols.
              </p>
            </div>

            <button
              (click)="loadConformance()"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground transition-all border border-border cursor-pointer"
            >
              <ng-icon name="lucideRefreshCw" size="14" [class.animate-spin]="loadingConformance()" />
              <span>Reload Metadata</span>
            </button>
          </div>

          <!-- Feature Breakdown Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div class="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1">
              <span class="text-[10px] font-semibold uppercase text-muted-foreground">Supported Resources</span>
              <div class="text-lg font-bold text-emerald-600 font-mono">10 Resources</div>
              <p class="text-[11px] text-muted-foreground">Patient, Encounter, Condition, MedicationRequest, Observation, AllergyIntolerance, Practitioner, CareTeam, Consent, Organization</p>
            </div>
            <div class="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1">
              <span class="text-[10px] font-semibold uppercase text-muted-foreground">Security & Authorization</span>
              <div class="text-lg font-bold text-blue-600 font-mono">SMART on FHIR + RBAC</div>
              <p class="text-[11px] text-muted-foreground">JWT OAuth2 Bearer Token, ABDM Care-Context ABAC, & WORM Audit Trail</p>
            </div>
            <div class="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1">
              <span class="text-[10px] font-semibold uppercase text-muted-foreground">Operations</span>
              <div class="text-lg font-bold text-purple-600 font-mono">REST + $everything</div>
              <p class="text-[11px] text-muted-foreground">Full CRUD, searchset filtering, and multi-resource clinical history bundling</p>
            </div>
          </div>

          <div
            class="bg-zinc-950 text-emerald-400 font-mono text-xs p-5 rounded-xl overflow-x-auto max-h-[500px] leading-relaxed border border-border/40 select-text"
          >
            <pre *ngIf="conformanceJson()">{{ conformanceJson() }}</pre>
            <div *ngIf="loadingConformance()" class="py-12 text-center text-zinc-500 font-sans">
              Loading FHIR CapabilityStatement metadata...
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- TAB 3: INGEST FHIR RESOURCE (Organization-Scoped) -->
      <!-- ========================================================================= -->
      <div *ngIf="activeTab() === 'ingest'" class="space-y-6">
        <div class="bg-card p-6 rounded-2xl border border-border shadow-xs space-y-4">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold text-foreground">
                Ingest FHIR R4 Patient Resource into Organization
              </h2>
              <span class="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-md text-[10px] font-semibold font-mono">
                Organization: {{ organization()?.name || activeOrgName() || 'Active Facility' }}
              </span>
            </div>
            <p class="text-xs text-muted-foreground mt-0.5">
              Submit standardized FHIR R4 JSON payloads to register patients directly into this organization's Master Patient Index (MPI).
            </p>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-semibold text-foreground uppercase tracking-wider">
                FHIR Patient JSON Payload
              </label>
              <button
                (click)="resetSamplePayload()"
                class="text-[11px] text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ng-icon name="lucideSparkles" size="12" />
                Reset Sample Payload
              </button>
            </div>
            <textarea
              [(ngModel)]="sampleIngestPayload"
              rows="14"
              class="w-full bg-zinc-950 text-emerald-400 font-mono text-xs p-4 rounded-xl border border-border/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 leading-relaxed select-text"
            ></textarea>
          </div>

          <div
            *ngIf="ingestStatus()"
            [class.bg-emerald-500\/10]="ingestStatus().startsWith('SUCCESS')"
            [class.text-emerald-600]="ingestStatus().startsWith('SUCCESS')"
            [class.border-emerald-500\/20]="ingestStatus().startsWith('SUCCESS')"
            [class.bg-rose-500\/10]="!ingestStatus().startsWith('SUCCESS')"
            [class.text-rose-600]="!ingestStatus().startsWith('SUCCESS')"
            [class.border-rose-500\/20]="!ingestStatus().startsWith('SUCCESS')"
            class="p-4 rounded-xl border text-xs font-semibold flex items-center gap-2"
          >
            <ng-icon
              [name]="ingestStatus().startsWith('SUCCESS') ? 'lucideCheck' : 'lucideAlertCircle'"
              size="16"
            />
            <span>{{ ingestStatus() }}</span>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button
              (click)="submitIngest()"
              [disabled]="ingestLoading()"
              class="bg-emerald-600 text-white font-semibold px-6 py-2.5 text-xs rounded-xl hover:bg-emerald-700 transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span
                *ngIf="ingestLoading()"
                class="animate-spin inline-block size-3.5 border-2 border-current border-t-transparent rounded-full"
              ></span>
              <ng-icon *ngIf="!ingestLoading()" name="lucideUploadCloud" size="14" />
              <span>Ingest into Facility MPI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class OrganizationAdminFhirComponent implements OnInit {
  activeTab = signal<'query' | 'conformance' | 'ingest'>('query');

  // Organization & Census State
  organization = signal<Organization | null>(null);
  patients = signal<Patient[]>([]);
  loadingOrg = signal(false);

  // Query Tab State
  selectedResource = 'Patient';
  selectedResourceId = '';
  selectedPatientMrn = '';
  isEverythingQuery = false;

  // Query Execution State
  jsonResult = signal<string>('');
  rawResult = signal<any>(null);
  loadingQuery = signal(false);
  errorMsg = signal<string>('');
  httpStatus = signal<number>(200);
  totalEntries = signal<number>(0);
  copied = signal(false);

  // Conformance Tab State
  conformanceJson = signal<string>('');
  loadingConformance = signal(false);

  // Ingest Tab State
  sampleIngestPayload = '';
  ingestStatus = signal<string>('');
  ingestLoading = signal(false);

  activeOrgName = computed(() => {
    return this.authService.activeContext()?.organizationName || '';
  });

  currentQueryUrl = computed(() => {
    const patientId = this.selectedPatientMrn?.trim();
    if (this.isEverythingQuery && patientId) {
      return `/fhir/Patient/${patientId}/$everything`;
    }
    if (this.selectedResourceId.trim()) {
      return `/fhir/${this.selectedResource}/${this.selectedResourceId.trim()}`;
    }
    if (patientId) {
      if (this.selectedResource === 'Patient') {
        return `/fhir/Patient/${patientId}`;
      }
      return `/fhir/${this.selectedResource}?patient=${patientId}`;
    }
    return `/fhir/${this.selectedResource}`;
  });

  constructor(
    private apiService: ApiService,
    private organizationService: OrganizationService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadOrganizationData();
    this.loadPatientCensus();
    this.initSamplePayload();
    this.executeQuery();
  }

  setTab(tab: 'query' | 'conformance' | 'ingest'): void {
    this.activeTab.set(tab);
    if (tab === 'conformance' && !this.conformanceJson()) {
      this.loadConformance();
    }
  }

  loadOrganizationData(): void {
    this.loadingOrg.set(true);
    this.organizationService.getOrgAdminFacility().subscribe({
      next: (org) => {
        this.organization.set(org);
        this.loadingOrg.set(false);
        this.initSamplePayload();
      },
      error: () => {
        this.loadingOrg.set(false);
      },
    });
  }

  loadPatientCensus(): void {
    this.apiService.getPatients().subscribe({
      next: (pts) => {
        this.patients.set(pts || []);
      },
      error: () => {
        this.patients.set([]);
      },
    });
  }

  onResourceChange(): void {
    if (this.selectedResource === 'Organization') {
      const orgId = this.organization()?.id || this.authService.getActiveOrganizationId();
      if (orgId) {
        this.selectedResourceId = orgId;
      }
    }
    this.executeQuery();
  }

  onPatientSelect(): void {
    if (this.selectedPatientMrn) {
      this.selectedResourceId = '';
    }
    this.executeQuery();
  }

  quickSelectPatient(patientId: string): void {
    this.selectedPatientMrn = patientId;
    this.selectedResourceId = '';
    this.executeQuery();
  }

  clearPatientFilter(): void {
    this.selectedPatientMrn = '';
    this.isEverythingQuery = false;
    this.executeQuery();
  }

  onEverythingToggle(): void {
    if (this.isEverythingQuery) {
      this.selectedResource = 'Patient';
      if (!this.selectedPatientMrn && this.patients().length > 0) {
        this.selectedPatientMrn = this.patients()[0].id;
      }
    }
    this.executeQuery();
  }

  executeQuery(): void {
    this.loadingQuery.set(true);
    this.errorMsg.set('');
    this.copied.set(false);

    const patientId = this.selectedPatientMrn ? this.selectedPatientMrn.trim() : undefined;

    // 1. Patient $everything
    if (this.isEverythingQuery && patientId) {
      this.apiService.getFhirPatientEverything(patientId).subscribe({
        next: (res) => this.handleSuccess(res),
        error: (err) => this.handleError(err),
      });
      return;
    }

    // 2. Specific Resource ID
    if (this.selectedResourceId.trim()) {
      if (this.selectedResource === 'Organization') {
        // Return Organization FHIR representation
        const org = this.organization();
        const fhirOrg = {
          resourceType: 'Organization',
          id: this.selectedResourceId.trim(),
          identifier: [
            {
              system: 'https://healthid.ndhm.gov.in/facility-id',
              value: org?.code || 'FAC-1001',
            },
            {
              system: 'urn:oid:2.16.840.1.113883.4.7',
              value: org?.id || this.selectedResourceId.trim(),
            },
          ],
          active: org?.status === 'ACTIVE',
          type: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/organization-type',
                  code: 'prov',
                  display: 'Healthcare Provider',
                },
              ],
              text: org?.organizationType || 'Hospital',
            },
          ],
          name: org?.name || 'Main Hospital Facility',
          telecom: [
            { system: 'phone', value: org?.phone || '+91 80 2345 6789', use: 'work' },
            { system: 'email', value: org?.email || 'admin@sentinel-health.org', use: 'work' },
          ],
          address: [
            {
              use: 'work',
              line: [org?.address || '100 Health City Boulevard'],
              city: org?.city || 'Bengaluru',
              state: org?.state || 'Karnataka',
              postalCode: org?.postalCode || '560001',
              country: org?.countryCode || 'India',
            },
          ],
        };
        this.handleSuccess(fhirOrg);
        return;
      }

      this.apiService
        .getFhirResourceById(this.selectedResource, this.selectedResourceId.trim())
        .subscribe({
          next: (res) => this.handleSuccess(res),
          error: (err) => this.handleError(err),
        });
      return;
    }

    // 3. Organization Resource without ID
    if (this.selectedResource === 'Organization') {
      const org = this.organization();
      const fhirOrgBundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        total: 1,
        entry: [
          {
            fullUrl: `urn:uuid:${org?.id || 'org-main'}`,
            resource: {
              resourceType: 'Organization',
              id: org?.id || 'org-main',
              identifier: [
                {
                  system: 'https://healthid.ndhm.gov.in/facility-id',
                  value: org?.code || 'FAC-1001',
                },
              ],
              active: org?.status === 'ACTIVE',
              name: org?.name || 'Main Hospital Facility',
              type: [
                {
                  coding: [
                    {
                      system: 'http://terminology.hl7.org/CodeSystem/organization-type',
                      code: 'prov',
                      display: 'Healthcare Provider',
                    },
                  ],
                  text: org?.organizationType || 'Hospital',
                },
              ],
            },
          },
        ],
      };
      this.handleSuccess(fhirOrgBundle);
      return;
    }

    // 4. Resource Collection Query (Patient-scoped or type-wide)
    this.apiService.getFhirResource(this.selectedResource, patientId).subscribe({
      next: (res) => this.handleSuccess(res),
      error: (err) => this.handleError(err),
    });
  }

  private handleSuccess(res: any): void {
    this.loadingQuery.set(false);
    this.httpStatus.set(200);
    this.rawResult.set(res);
    this.jsonResult.set(JSON.stringify(res, null, 2));
    if (res && res.resourceType === 'Bundle') {
      this.totalEntries.set(res.total ?? (res.entry ? res.entry.length : 0));
    } else {
      this.totalEntries.set(1);
    }
  }

  private handleError(err: any): void {
    this.loadingQuery.set(false);
    const status = err.status || 500;
    this.httpStatus.set(status);
    this.rawResult.set(err.error);
    this.jsonResult.set(JSON.stringify(err.error || { error: 'Unknown FHIR Error' }, null, 2));
    this.errorMsg.set(
      'FHIR Server Error (' +
        status +
        '): ' +
        (err.error?.issue?.[0]?.diagnostics || err.error?.message || err.message),
    );
    this.totalEntries.set(0);
  }

  loadConformance(): void {
    this.loadingConformance.set(true);
    this.apiService.getFhirMetadata().subscribe({
      next: (res: FhirCapabilityStatement) => {
        this.conformanceJson.set(JSON.stringify(res, null, 2));
        this.loadingConformance.set(false);
      },
      error: (err) => {
        this.conformanceJson.set(JSON.stringify(err.error || { error: 'Failed to load CapabilityStatement' }, null, 2));
        this.loadingConformance.set(false);
      },
    });
  }

  initSamplePayload(): void {
    const org = this.organization();
    const orgId = org?.id || 'org-current';
    const orgName = org?.name || 'Sentinel Hospital';

    this.sampleIngestPayload = JSON.stringify(
      {
        resourceType: 'Patient',
        identifier: [
          { use: 'official', system: 'urn:oid:2.16.840.1.113883.4.1', value: 'MRN-' + Math.floor(100000 + Math.random() * 900000) },
          { use: 'official', system: 'https://healthid.ndhm.gov.in', value: '91-4590-1284-9001' },
        ],
        managingOrganization: {
          reference: `Organization/${orgId}`,
          display: orgName,
        },
        name: [
          {
            use: 'official',
            text: 'Sunita Sharma',
            family: 'Sharma',
            given: ['Sunita'],
          },
        ],
        gender: 'female',
        birthDate: '1990-03-15',
        telecom: [
          { system: 'phone', value: '+91 98765 43210', use: 'mobile' },
          { system: 'email', value: 'sunita.sharma@example.com', use: 'home' },
        ],
        address: [
          {
            use: 'home',
            text: '402 Sunrise Apartments, MG Road, Bengaluru, Karnataka 560001',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560001',
            country: 'India',
          },
        ],
      },
      null,
      2,
    );
  }

  resetSamplePayload(): void {
    this.initSamplePayload();
    this.ingestStatus.set('');
  }

  submitIngest(): void {
    try {
      const payload = JSON.parse(this.sampleIngestPayload);
      this.ingestLoading.set(true);
      this.ingestStatus.set('');

      this.apiService.createFhirPatient(payload).subscribe({
        next: (res) => {
          this.ingestLoading.set(false);
          this.ingestStatus.set(
            `SUCCESS: Patient successfully ingested into ${this.organization()?.name || 'Organization'}! New FHIR ID: ${res.id}`,
          );
          this.selectedResource = 'Patient';
          this.selectedResourceId = res.id || '';
          this.activeTab.set('query');
          this.loadPatientCensus();
          this.executeQuery();
        },
        error: (err) => {
          this.ingestLoading.set(false);
          this.ingestStatus.set(
            'FAILED: ' + (err.error?.issue?.[0]?.diagnostics || err.error?.message || err.message),
          );
        },
      });
    } catch (e: any) {
      this.ingestStatus.set('INVALID JSON: ' + e.message);
    }
  }

  copyJson(): void {
    navigator.clipboard.writeText(this.jsonResult());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  downloadBundleJson(): void {
    const data = this.jsonResult();
    if (!data) return;
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const orgCode = this.organization()?.code || 'FAC';
    const filename = `fhir-${orgCode.toLowerCase()}-${this.selectedResource.toLowerCase()}-${Date.now()}.json`;
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
