import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-prescriptions',
  standalone: true,
  template: `
    <div class="p-8 text-center text-xs text-muted-foreground">
      Redirecting to unified clinical chart medications...
    </div>
  `,
})
export class PatientPrescriptionsComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.navigate(['/patient/chart'], {
      queryParams: { tab: 'prescriptions' },
      replaceUrl: true,
    });
  }
}
