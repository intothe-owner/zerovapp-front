export type CleanUpHouseholdGroup = "senior" | "vulnerable" | "";

export type CleanUpHouseholdSortField = "localNo" | "dong" | "routerOrder";
export type SortOrder = "asc" | "desc";

export type CleanUpHouseholdItem = {
  id: number;
  no: number;
  dong: string;
  name: string;
  phone: string | null;
  proxyPhone: string | null;
  roadAddress: string;
  detailAddress: string | null;
  isArchived?:boolean | false;
  latitude?:number|0;
  longitude?:number|0;
};

export type CleanUpHouseholdListParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  group?: CleanUpHouseholdGroup;
  sort?: CleanUpHouseholdSortField;
  order?: SortOrder;
  isArchived?: boolean; // 추가
};

export type CleanUpHouseholdListResponse = {
  items: CleanUpHouseholdItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  sort: {
    field: CleanUpHouseholdSortField;
    order: "ASC" | "DESC";
  };
  query: string;
  group: CleanUpHouseholdGroup | string;
};
export type CleanUpHouseholdPhotoMap = {
  addressImage: string | null;
  beforeImage: string | null;
  duringImage: string | null;
  afterImage: string | null;
};

export interface CleanUpHouseholdDetail {
  id: number;
  programYear: number;
  listType: "SELECTED" | "WAITLIST";
  localNo: number;
  categoryCode: number;
  dong: string;
  benefitType: string;
  name: string;
  rrn: string | null;
  phone: string | null;
  proxyPhone: string | null;
  roadAddress: string;
  detailAddress: string | null;
  rank: number;
  totalScore: number;
  scoreHouseholdSize: number | null;
  scoreAge: number | null;
  scoreDisability: number | null;
  scoreResidencePeriod: number | null;
  scoreBenefitType: number | null;
  scoreOther: number | null;
  otherReason: string | null;
  remark: string | null;
  createdAt: string | null;
  updatedAt: string | null;

  // 추가
  photos: CleanUpHouseholdPhotoMap;
}

export interface CleanUpHouseholdDetailResponse {
  item: CleanUpHouseholdDetail;
}