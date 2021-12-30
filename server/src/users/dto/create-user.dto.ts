export class CreateUserDto {
    email: string
    password: string
    spotify: {
        spotify_id: string,
        email: string,
        access_token: string,
        refresh_token: string,
        access_token_timeleft: number,
        releases?: { [key: string]: any }[]
    }
}
