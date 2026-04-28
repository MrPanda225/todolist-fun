export interface ApiError {
  statusCode:   number;
  message?:     string;
  formErrors?:  string[];
  fieldErrors?: Record<string, string[]>;
}