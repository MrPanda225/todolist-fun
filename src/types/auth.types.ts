export interface User {
  id:        string;
  username:  string;
  email:     string;
  firstName: string;
  lastName:  string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface LoginPayload {
  email:    string;
  password: string;
}

export interface RegisterPayload {
  username:  string;
  email:     string;
  password:  string;
  firstName: string;
  lastName:  string;
}