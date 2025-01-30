export interface DecodedToken {
  sub: string;
  email?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
  scope?: string;
  exp: number;
  iat: number;
  aud: string | string[];
  iss: string;
}
