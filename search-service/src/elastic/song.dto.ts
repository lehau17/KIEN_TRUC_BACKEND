export class SongDto {
  id: number;
  user_id: number;
  genre_id: number;
  song_name: string;
  viewer: number;
  duration: string;
  popular: boolean;
  description: string;
  song_image: string;
  public_date: Date;
  file_Path: string;
  discuss_quality: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}
