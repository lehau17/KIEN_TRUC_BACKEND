export class Paging<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  nextPage: number | null;
  previousPage: number | null;

  constructor(builder: PagingBuilder<T>) {
    this.data = builder.data;
    this.total = builder.total;
    this.page = builder.page;
    this.limit = builder.limit;
    this.nextPage = builder.nextPage;
    this.previousPage = builder.previousPage;
  }

  static builder<T>() {
    return new PagingBuilder<T>();
  }
}

export class PagingBuilder<T> {
  data: T[] = [];
  total: number = 0;
  page: number = 1;
  limit: number = 10;
  //   nextCursor?: number;
  //   previousCursor?: number;
  nextPage?: number = 1;
  previousPage: number | null;

  constructor() {}

  setData(data: T[]): this {
    this.data = data;
    return this;
  }

  setNextPage(nextPage: number): this {
    this.nextPage = nextPage;
    return this;
  }

  setPrevPage(prevPage: number): this {
    this.previousPage = prevPage;
    return this;
  }

  setTotal(total: number): this {
    this.total = total;
    return this;
  }

  setPage(page: number): this {
    this.page = page;
    return this;
  }

  setLimit(limit: number): this {
    this.limit = limit;
    return this;
  }

  build(): Paging<T> {
    return new Paging<T>(this);
  }
}
