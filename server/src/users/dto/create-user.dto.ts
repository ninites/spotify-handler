export class CreateUserDto {
  email: string;
  password: string;
  spotify: {
    spotify_id: string;
    email: string;
    access_token: string;
    refresh_token: string;
    access_token_expires_in: number;
    access_token_created: Date;
    releases?: { [key: string]: any }[];
  };
}

export class UserInfos {
  _id: string;
  email: string;
  password: string;
  spotify: UserSpotify;
}

export class UserSpotify {
  _id?: string;
  spotify_id: string;
  email: string;
  access_token: string;
  refresh_token: string;
  access_token_expires_in: number;
  access_token_created: Date;
  releases?: UserRelease[];
}

export class UserRelease {
  album_id: string;
  // album_type: string;
  // href: string;
  // name: string;
  // release_date: string;
  // release_date_precision: string;
  // total_tracks: number;
  // type: string;
  // uri: string;
}
