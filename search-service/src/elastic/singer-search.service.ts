import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SongDto } from './song.dto';
import { PagingDto } from './paging.dto';
import { TransportRequestOptionsWithOutMeta } from '@elastic/elasticsearch';
import { SingerDto } from './singer.dto';

@Injectable()
export default class SingerSearchService implements OnModuleInit {
  private index = 'singer-index';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}
  async onModuleInit() {
    try {
      const ping = await this.elasticsearchService.ping();
      console.log('Elasticsearch is up:', ping);
    } catch (error) {
      console.error('Elasticsearch connection failed:', error.message);
    }
  }

  async search(
    text: string,
    { cursor, limit = 60, page = 1 }: PagingDto,
  ): Promise<SingerDto[]> {
    const from = (page - 1) * limit;
    const options = {
      index: this.index,
      from,
      size: limit,
      body: text
        ? {
            query: {
              multi_match: {
                query: text,
                fields: ['name', 'description'],
                type: 'best_fields',
              },
            },
          }
        : undefined,
    };
    const body = await this.elasticsearchService.search<SingerDto>(options);
    const hits = body.hits.hits;
    return hits.map((item) => item._source);
  }
}
