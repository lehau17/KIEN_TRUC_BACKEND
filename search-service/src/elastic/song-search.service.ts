import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SongDto } from './song.dto';
import { PagingDto } from './paging.dto';
import { TransportRequestOptionsWithOutMeta } from '@elastic/elasticsearch';

@Injectable()
export default class SongSearchService implements OnModuleInit {
  private index = 'song-index';

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
  ): Promise<SongDto[]> {
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
                fields: ['song_name', 'description'],
                operator: 'or',
                type: 'best_fields',
              },
            },
          }
        : undefined,
    };
    const body = await this.elasticsearchService.search<SongDto>(options);
    const hits = body.hits.hits;
    return hits.map((item) => item._source);
  }
}
