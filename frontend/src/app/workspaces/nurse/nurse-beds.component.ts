import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BedManagementComponent } from '../../shared/bed-management.component';

@Component({
  selector: 'app-nurse-beds',
  standalone: true,
  imports: [CommonModule, BedManagementComponent],
  template: `
    <div class="p-2">
      <app-bed-management></app-bed-management>
    </div>
  `,
})
export class NurseBedsComponent {}
