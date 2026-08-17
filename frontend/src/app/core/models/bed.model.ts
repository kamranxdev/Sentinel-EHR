import { Encounter } from './clinical.model';

export interface Bed {
  id?: string;
  organizationId?: string;
  facilityId?: string;
  wardId?: string;
  wardName?: string;
  roomId?: string;
  roomNumber?: string;
  bedNumber: string;
  bedType?: string;
  bedCode?: string;
  departmentName?: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLEANING' | 'RESERVED' | string;
  features?: string;
  currentEncounter?: Encounter;
  lastCleanedAt?: string;
  createdAt?: string;
}

export interface BedRequestDTO {
  id?: string;
  roomId?: string;
  bedNumber: string;
  bedType?: string;
  bedCode?: string;
  ward?: string;
  department?: string;
  roomNumber?: string;
}

export interface BedStatusUpdateDTO {
  status: string;
}

export interface LocationHistory {
  id?: string;
  encounter?: Encounter;
  encounterId?: string;
  bed?: Bed;
  bedId?: string;
  assignedAt?: string;
  releasedAt?: string;
  transferReason?: string;
  transferredBy?: string;
}
