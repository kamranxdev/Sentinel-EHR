import { Component, OnInit, signal } from '@angular/core';
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
} from '@ng-icons/lucide';

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
    }),
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  loading = signal(false);
  errorMessage = signal<string | null>(null);

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

  fillDemoCredentials(e: string, p: string): void {
    this.email = e;
    this.password = p;
    this.onLogin();
  }

  onLogin(): void {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.patientContext.loadContext();
        toast.success('Authenticated Successfully', {
          description: 'Please select your workspace context.',
        });
        this.router.navigate(['/select-context']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.status === 0
          ? 'Cannot connect to backend server. Please verify Spring Boot server is running on http://localhost:8080.'
          : (typeof err.error === 'string' ? err.error : (err.error?.message || 'Invalid email or password.'));
        this.errorMessage.set(msg);
        toast.error('Authentication Failed', { description: msg });
      },
    });
  }
}
