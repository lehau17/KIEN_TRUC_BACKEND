import { Controller, OnModuleInit } from '@nestjs/common';
import SongSearchService from './song-search.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PagingDto } from './paging.dto';
import SingerSearchService from './singer-search.service';

@Controller()
export default class SearchController implements OnModuleInit {
  constructor(
    private readonly songSearchService: SongSearchService,
    private readonly singerSearchService: SingerSearchService,
  ) {}
  onModuleInit() {
    console.log('controller initialized');
  }
  @MessagePattern('search-song')
  searchSong(
    @Payload() { text, cursor, limit, page }: PagingDto & { text: string },
  ) {
    return this.songSearchService.search(text, { cursor, limit, page });
  }

  @MessagePattern('search-singer')
  searchSinger(
    @Payload() { text, cursor, limit, page }: PagingDto & { text: string },
  ) {
    return this.singerSearchService.search(text, { cursor, limit, page });
  }

  @MessagePattern('test')
  test() {
    return 'hello';
  }
}
