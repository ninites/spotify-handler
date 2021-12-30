export class CreateUserDto {
    email: string
    password: string
    spotify: {
        spotify_id: string,
        email: string,
        access_token: string,
        refresh_token: string,
        access_token_timeleft: number,
        access_token_expires_in: number,
        access_token_created: Date,
        releases?: { [key: string]: any }[]
    }
}

export class UserInfos {
    email: string
    password: string
    spotify: UserSpotify
}

export class UserSpotify {
    spotify_id: string
    email: string
    access_token: string
    refresh_token: string
    access_token_timeleft: number
    access_token_expires_in: number
    access_token_created: Date
    releases?: { [key: string]: any }[]
}
