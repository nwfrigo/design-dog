/**
 * Single source of truth for the Claude model used by every AI route
 * (parsers, stacker/copy generation).
 *
 * Why this exists: the model was once pinned as a dated snapshot id in 13
 * call sites; when Anthropic retired that snapshot the API began returning
 * 404 `not_found_error` and EVERY AI feature 500'd at once. Keep the model
 * here so the next migration is a one-line change, and prefer a current
 * non-snapshot alias over a dated id.
 */
export const AI_MODEL = 'claude-sonnet-5'
