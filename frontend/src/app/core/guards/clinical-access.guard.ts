import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Functional Route Guard for Clinical Access.
 * Evaluates both RBAC permission codes and ABAC patient care team relationship.
 */
export const clinicalAccessGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const requiredPermission = route.data?.['permission'] as string;
  const patientIdParam = route.paramMap.get('id') || route.paramMap.get('patientId');
  const patientId = patientIdParam || null;

  const hasPerm = requiredPermission ? authService.hasPermission(requiredPermission) : true;
  const hasRel = patientId ? authService.hasActiveRelationship(patientId) : true;

  if (hasPerm && hasRel) {
    return true;
  }

  router.navigate(['/unauthorized'], { queryParams: { reason: 'clinical_access_denied' } });
  return false;
};
