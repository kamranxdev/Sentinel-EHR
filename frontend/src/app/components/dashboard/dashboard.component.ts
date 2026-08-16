import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader2 } from '@ng-icons/lucide';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIcon],
  providers: [provideIcons({ lucideLoader2 })],
  template: `
    <div class="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
      <ng-icon name="lucideLoader2" size="24" class="animate-spin text-primary" />
      <span class="text-xs font-medium tracking-wide">Navigating to your workspace...</span>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (this.authService.isSysAdmin()) {
      this.router.navigate(['/sys-admin/dashboard']);
    } else if (this.authService.isOrgAdmin()) {
      this.router.navigate(['/org-admin/dashboard']);
    } else if (this.authService.isDoctor()) {
      this.router.navigate(['/doctor/dashboard']);
    } else if (this.authService.isNurse()) {
      this.router.navigate(['/nurse/dashboard']);
    } else if (this.authService.isReceptionist()) {
      this.router.navigate(['/receptionist/dashboard']);
    } else if (this.authService.isLabTech()) {
      this.router.navigate(['/labtech/dashboard']);
    } else if (this.authService.isPharmacist()) {
      this.router.navigate(['/pharmacist/dashboard']);
    } else if (this.authService.isBilling()) {
      this.router.navigate(['/billing/dashboard']);
    } else if (this.authService.isAuditor()) {
      this.router.navigate(['/auditor/dashboard']);
    } else if (this.authService.isPatient()) {
      this.router.navigate(['/patient/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
