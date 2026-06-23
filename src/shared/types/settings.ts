export interface Driver {
  id: string;
  name: string;
  active: boolean;
}

export interface AppSettings {
  companyName: string;
  checkPayableTo: string;
  syncTime: string;
  quickbooksCompanyFile?: string;
}
