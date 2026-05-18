export type ValidationIssue = {
  path: string;
  message: string;
};

export type ValidationResult<T> =
  | { data: T; success: true }
  | { issues: ValidationIssue[]; success: false };
