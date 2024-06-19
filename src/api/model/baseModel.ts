export interface BasicPageParams {
  page: number;
  pageSize: number;
}

export interface BasicFetchResult<T> {
  items: T[];
  total: number;
}

export interface BasicPageResult<T> {
  page: number;
  pageSize: number;
  items: T[];
  total: number;
}
