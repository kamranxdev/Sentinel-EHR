export interface ImagingOrder {
  id: number | string;
  patientId: string;
  encounterId?: string;
  orderingProviderEmail?: string;
  modality: 'XR' | 'CT' | 'MRI' | 'US' | 'NM' | 'PET' | string;
  procedureName: string;
  cptCode?: string;
  status: 'ORDERED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dicomStudyInstanceUid?: string;
  radiologistReport?: string;
  radiologistEmail?: string;
  orderedAt?: string;
  scheduledAt?: string;
  performedAt?: string;
  reportGeneratedAt?: string;
  reviewedAt?: string;
  priority?: 'ROUTINE' | 'URGENT' | 'STAT';
  bodySite?: string;
  clinicalIndication?: string;
}

export interface ImagingStudy {
  id: number | string;
  imagingOrderId: number | string;
  studyInstanceUid: string;
  modality: string;
  studyDescription: string;
  numberOfSeries?: number;
  numberOfInstances?: number;
  studyDate?: string;
  accessionNumber?: string;
  series?: ImagingSeries[];
}

export interface ImagingSeries {
  id: number | string;
  imagingStudyId: number | string;
  seriesInstanceUid: string;
  seriesNumber?: number;
  modality: string;
  seriesDescription?: string;
  bodyPartExamined?: string;
  numberOfInstances?: number;
}

export interface ImagingReport {
  id: number | string;
  imagingStudyId: number | string;
  radiologistEmail: string;
  reportText: string;
  impressionText?: string;
  status: 'DRAFT' | 'FINAL' | 'AMENDED' | 'CORRECTED';
  findings?: string;
  signedAt?: string;
  createdAt?: string;
}

export interface CreateImagingOrderRequest {
  modality: string;
  procedureName: string;
  cptCode?: string;
  clinicalIndication?: string;
  bodySite?: string;
  priority?: string;
  scheduledAt?: string;
}

export interface CreateImagingReportRequest {
  reportText: string;
  impressionText?: string;
  status?: string;
  findings?: string;
}
