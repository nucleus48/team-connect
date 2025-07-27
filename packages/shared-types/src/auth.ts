export class TokensEntity {
  accessToken: string;
  refreshToken: string;

  constructor(data: TokensEntity) {
    Object.assign(this, data);
  }
}

/**
 * Access Token Duration in Seconds
 */
export const ACCESS_TOKEN_DURATION = 30 * 60;

/**
 * Refresh Token Duration in Seconds
 */
export const REFRESH_TOKEN_DURATION = 30 * 24 * 60 * 60;

export enum COOKIE {
  ACCESS_TOKEN = "accessToken",
  REFRESH_TOKEN = "refreshToken",
}

export type TokenPayload = {
  email: string;
  sub: string;
};

export type CurrentUser = {
  email: string;
  userId: string;
  roles: string[];
};
