import { IsEmail, IsString } from "class-validator";

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class LogInDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class TokensEntity {
  access_token: string;

  constructor(data: TokensEntity) {
    Object.assign(this, data);
  }
}
