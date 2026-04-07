export class QueryOptions {
  filter?: any = {};
  sort?: any = null;
  select?: any = null;

  page?: number = 1;
  limit?: number = 24;
  offset?: number = null;

  cursor?: boolean = false;

  cache_time?: number = null;
  cache_key?: string = null;
}
