export class CreateUserDto {
    email: string
    password: string
    releases: { [key: string]: any }
}
