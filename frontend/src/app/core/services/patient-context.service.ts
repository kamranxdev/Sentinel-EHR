import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class PatientContextService {
  activePatient = signal<Patient | null>(null);
  loading = signal<boolean>(false);
  patientList = signal<Patient[]>([]);

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
  ) {}

  loadContext(): void {
    const user = this.authService.currentUser();
    if (!user) {
      this.activePatient.set(null);
      this.patientList.set([]);
      return;
    }

    this.loading.set(true);

    if (this.authService.hasRole('PATIENT')) {
      // Patient user: strictly bind to own record via RESTful getMyPatientProfile
      this.apiService.getMyPatientProfile().subscribe({
        next: (patient) => {
          this.activePatient.set(patient);
          this.patientList.set(patient ? [patient] : []);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load patient profile for user', err);
          this.activePatient.set(null);
          this.loading.set(false);
        },
      });
    } else {
      // Clinician / Staff user: load Master Patient Index
      this.apiService.getPatients().subscribe({
        next: (patients) => {
          const list = Array.isArray(patients) ? patients : [];
          this.patientList.set(list);
          const current = this.activePatient();
          // Retain currently selected patient if still in list
          if (current) {
            const found = list.find((p) => String(p.id) === String(current.id));
            this.activePatient.set(found || null);
          }
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load patient index', err);
          this.loading.set(false);
        },
      });
    }
  }

  setActivePatient(patient: Patient | null): void {
    this.activePatient.set(patient);
  }

  clearActivePatient(): void {
    this.activePatient.set(null);
  }

  selectPatientById(id: string | null): void {
    if (!id) {
      this.activePatient.set(null);
      return;
    }
    const found = this.patientList().find((p) => p.id === id);
    if (found) {
      this.activePatient.set(found);
    } else {
      this.apiService.getPatientById(id).subscribe((p) => this.activePatient.set(p));
    }
  }

  clear(): void {
    this.activePatient.set(null);
    this.patientList.set([]);
  }
}
