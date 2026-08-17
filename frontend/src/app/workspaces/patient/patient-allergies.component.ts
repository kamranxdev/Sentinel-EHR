import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-allergies',
  standalone: true,
  template: `
    <div class="p-8 text-center text-xs text-muted-foreground">
      Redirecting to unified clinical chart allergies...
    </div>
  `,
})
export class PatientAllergiesComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.navigate(['/patient/chart'], {
      queryParams: { tab: 'allergies' },
      replaceUrl: true,
    });
  }
}
