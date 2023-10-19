import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator";

export class RetrieveTokenDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}