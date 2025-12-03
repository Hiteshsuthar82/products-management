export interface CountryConfig {
  _id: string;
  code: string;
  country: string;
  flag: string;
  currencySign: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateCountryConfigRequest {
  code: string;
  country: string;
  flag: string;
  currencySign: string;
}

export interface CountryConfigListResponse {
  success: boolean;
  message: string;
  data: CountryConfig[];
}

export interface CountryConfigResponse {
  success: boolean;
  message: string;
  data: CountryConfig;
}

export interface DeleteCountryConfigRequest {
  code: string;
}