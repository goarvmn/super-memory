// shared/src/types/auth.ts

/**
 * Public User Interface
 */
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  user_role: number;
  user_type: number;
  is_permanent_delete: number;
}
