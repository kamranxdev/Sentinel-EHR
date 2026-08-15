import { Encounter } from './clinical.model';

export interface Bed {
  id?: number;
  bedCode?: string;
  bedNumber: string;
  wardName?: string;
  departmentName?: string;
  roomNumber?: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLEANING' | string;
  features?: string;
  currentEncounter?: Encounter;
  lastCleanedAt?: string;
}

export interface BedRequestDTO {
  bedNumber: string;
  ward?: string;
  department?: string;
  roomNumber?: string;
  bedType?: string;
}

export interface BedStatusUpdateDTO {
  status: string;
}

export interface LocationHistory {
  id?: number;
  encounter?: Encounter;
  bed?: Bed;
  assignedAt?: string;
  releasedAt?: string;
  transferReason?: string;
  transferredBy?: string;
}
