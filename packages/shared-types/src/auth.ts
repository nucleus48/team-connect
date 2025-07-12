export class TokensEntity {
  access_token: string;

  constructor(data: TokensEntity) {
    Object.assign(this, data);
  }
}
