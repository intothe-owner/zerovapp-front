export type SeniorCenterSortField = "seq" | "dong";
export type SortOrder = "ASC" | "DESC";

export interface SeniorCenterItem {
  id: number;
  programYear: number;
  seq: number;
  name: string;
  roadAddress: string;
  dong: string;
  managerName: string | null;
  managerPhone: string | null;
  centerPhone: string | null;
  facilityType: string | null;
  area: number | null;
  acCeilingCount: number;
  acStandCount: number;
  acWallCount: number;
  airPurifierCount: number;
  beforeImage: string | null;
  afterImage: string | null;
  workName: string | null;
  workDate: string | null;
  remark: string | null;
  isComplete: boolean;
  isArchive:boolean;
  isCancel:boolean;
  reports: any;
  latitude?:number|0;
  longitude?:number|0;
}

export interface SeniorCenterListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  sortField?: SeniorCenterSortField;
  sortOrder?: SortOrder;
  isComplete?: boolean;
  isArchive?:boolean;
}

export interface SeniorCenterListResponse {
  items: SeniorCenterItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}