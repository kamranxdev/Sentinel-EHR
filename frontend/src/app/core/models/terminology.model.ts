export interface CodeSystem {
  id: number | string;
  systemUri: string;
  name: string;
  version?: string;
  description?: string;
}

export interface TerminologyCode {
  id: number | string;
  codeSystemId: number | string;
  code: string;
  display: string;
  definition?: string;
  isActive?: boolean;
}

export interface TerminologySearchResult {
  code: string;
  display: string;
  system: string;
  version?: string;
  definition?: string;
}
