export interface UserContext {
  id: string;
  email: string;
  roles: string[];
}

export interface RequestWithUser extends Request {
  user: UserContext;
}
