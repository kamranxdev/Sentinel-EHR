import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/services/api.service';
import { toast } from '@spartan-ng/brain/sonner';

import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideShieldAlert, lucideZap, lucideX, lucideAlertTriangle, lucideLock } from '@ng-icons/lucide';

@Component({
  selector: 'app-break-glass-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmCardImports,
    HlmButtonImports,
    HlmDialogImports,
    HlmInputImports,
    HlmTextareaImports,
    HlmBadgeImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideShieldAlert,
      lucideZap,
      lucideX,
      lucideAlertTriangle,
      lucideLock,
    }),
  ],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-card border border-destructive/40 shadow-2xl rounded-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <!-- Header -->
        <div class="bg-destructive/10 border-b border-destructive/20 p-5 flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2.5 rounded-xl bg-destructive/20 text-destructive font-bold">
              <ng-icon name="lucideShieldAlert" class="text-xl"></ng-icon>
            </div>
            <div>
              <h2 class="text-lg font-bold text-destructive tracking-tight flex items-center gap-2">
                Emergency Break-Glass Access
                <span hlmBadge variant="destructive" class="text-[10px]">Restricted Override</span>
              </h2>
              <p class="text-xs text-muted-foreground mt-0.5">Override Attribute-Based Access Controls for emergency clinical treatment</p>
            </div>
          </div>
          <button (click)="closeModal()" class="text-muted-foreground hover:text-foreground p-1 rounded-lg">
            <ng-icon name="lucideX" class="text-lg"></ng-icon>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4 text-xs">
          <div class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3 text-amber-600 dark:text-amber-400">
            <ng-icon name="lucideAlertTriangle" class="text-lg shrink-0 mt-0.5"></ng-icon>
            <div class="leading-relaxed">
              <span class="font-semibold block text-amber-700 dark:text-amber-300">WORM Audit Warning (ABDM / DISHA Compliance)</span>
              Executing Break-Glass overrides role/ward restrictions and grants a temporary 4-hour lease. All actions taken will be recorded in immutable security logs and flagged for mandatory compliance auditing.
            </div>
          </div>

          <div *ngIf="patientName" class="p-3 bg-muted/40 rounded-lg flex items-center justify-between border border-border">
            <span class="text-muted-foreground">Target Patient:</span>
            <span class="font-semibold text-foreground">{{ patientName }} (ID: {{ patientId }})</span>
          </div>

          <div>
            <label class="block font-semibold text-foreground mb-1">Emergency Category *</label>
            <select
              [(ngModel)]="category"
              class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
            >
              <option value="CARDIAC_ARREST">Cardiac Arrest / Code Blue</option>
              <option value="TRAUMA_RESUSCITATION">Trauma Resuscitation / STAT ED</option>
              <option value="RAPID_RESPONSE">Rapid Response Team Call</option>
              <option value="CROSS_COVERAGE_EMERGENCY">Cross-Coverage Clinical Emergency</option>
              <option value="SYSTEM_FAILURE_FALLBACK">EMR System Down Fallback</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-foreground mb-1">Detailed Clinical Justification * (Min 10 chars)</label>
            <textarea
              [(ngModel)]="justification"
              rows="3"
              hlmInput
              placeholder="Describe the urgent clinical condition requiring emergency record access..."
              class="w-full text-xs"
            ></textarea>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-muted/30 border-t border-border p-4 flex items-center justify-between">
          <button hlmBtn variant="outline" (click)="closeModal()" class="text-xs">Cancel</button>
          <button
            hlmBtn
            variant="destructive"
            [disabled]="isSubmitting() || justification.trim().length < 10"
            (click)="submitBreakGlass()"
            class="text-xs gap-2 font-semibold shadow-md"
          >
            <ng-icon name="lucideZap" class="text-sm"></ng-icon>
            {{ isSubmitting() ? 'Granting Override...' : 'Confirm Break-Glass Override' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class BreakGlassModalComponent {
  @Input() isOpen = false;
  @Input() patientId: number | null = null;
  @Input() patientName: string = '';
  @Output() closed = new EventEmitter<void>();
  @Output() granted = new EventEmitter<any>();

  category = 'CROSS_COVERAGE_EMERGENCY';
  justification = '';
  isSubmitting = signal(false);

  constructor(private apiService: ApiService) {}

  closeModal() {
    this.isOpen = false;
    this.closed.emit();
  }

  submitBreakGlass() {
    if (!this.patientId || this.justification.trim().length < 10) {
      toast.error('Clinical justification must be at least 10 characters.');
      return;
    }

    this.isSubmitting.set(true);
    const body = {
      patientId: this.patientId,
      category: this.category,
      justification: this.justification,
    };

    this.apiService.requestBreakGlass(body).subscribe({
      next: (res: any) => {
        this.isSubmitting.set(false);
        toast.success(`Emergency Break-Glass Override Activated (4-Hour Lease).`);
        this.granted.emit(res);
        this.closeModal();
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        toast.error(err.error?.message || 'Failed to execute Break-Glass override.');
      },
    });
  }
}

