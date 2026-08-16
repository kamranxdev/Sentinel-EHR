import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideHeartPulse,
  lucideLogIn,
  lucideShield,
  lucideArrowRight,
  lucideCompass,
  lucideActivity,
  lucideFileText,
  lucideHospital,
  lucidePill,
  lucideShieldCheck,
  lucideUserRound,
  lucideStethoscope,
  lucideSettings,
  lucideServer,
  lucideCheck,
  lucideChevronRight,
  lucideLock,
  lucideKey,
  lucideShieldAlert,
  lucideLayers,
  lucideCpu,
  lucideFileCode,
  lucideDatabase,
  lucideSun,
  lucideMoon,
  lucideUserPlus,
  lucideLayoutDashboard,
  lucideLogOut,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HlmButtonImports,
    HlmBadgeImports,
    HlmCardImports,
    HlmTooltipImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideHeartPulse,
      lucideLogIn,
      lucideShield,
      lucideArrowRight,
      lucideCompass,
      lucideActivity,
      lucideFileText,
      lucideHospital,
      lucidePill,
      lucideShieldCheck,
      lucideUserRound,
      lucideStethoscope,
      lucideSettings,
      lucideServer,
      lucideCheck,
      lucideChevronRight,
      lucideLock,
      lucideKey,
      lucideShieldAlert,
      lucideLayers,
      lucideCpu,
      lucideFileCode,
      lucideDatabase,
      lucideSun,
      lucideMoon,
      lucideUserPlus,
      lucideLayoutDashboard,
      lucideLogOut,
    }),
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  constructor(
    public theme: ThemeService,
    public authService: AuthService
  ) {}

  toggleTheme(): void {
    this.theme.toggle();
  }

  logout(): void {
    this.authService.logout();
  }
}
