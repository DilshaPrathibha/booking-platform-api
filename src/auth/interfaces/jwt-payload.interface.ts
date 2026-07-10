/**
 * The data encoded inside every JWT issued by this application.
 *
 * Keep this minimal — JWTs are sent on every request and should not carry
 * unnecessary data. Never include sensitive fields (email, passwordHash, etc.).
 *
 * sub  — "subject" claim, standard JWT field, holds the user's ID.
 * name — included for convenience so controllers don't need a DB lookup
 *        just to display the user's name in a log or response.
 */
export interface JwtPayload {
  sub: string; // User ID (cuid)
  name: string;
}
