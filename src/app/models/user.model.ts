export interface User {
  id: string;
  email: string;
  name: string;
  created_at?: string;
}

export interface AuthUser {
  id: string;
  email: string;
}
