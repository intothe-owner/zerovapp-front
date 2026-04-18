export type ImportListType = "SELECTED" | "WAITLIST";

export type CleanUpHouseholdImportRequest = {
  file: File;
  programYear: number;
  listType: ImportListType;
  overwrite: boolean;
};

export type CleanUpHouseholdImportResponse = {
  ok: boolean;
  message: string;
  fileName?: string;
  programYear?: number;
  listType?: ImportListType;
  totalRows?: number;
  savedRows?: number;
  errorCount?: number;
  errors?: string[];
};

export type SeniorCenterImportRequest = {
  file: File;
  programYear: number;
  overwrite: boolean;
  listType?: ImportListType;
};

export type SeniorCenterImportResponse = {
   ok: boolean;
  message: string;
  fileName?: string;
  programYear?: number;
  listType?: ImportListType;
  totalRows?: number;
  savedRows?: number;
  errorCount?: number;
  errors?: string[];
};