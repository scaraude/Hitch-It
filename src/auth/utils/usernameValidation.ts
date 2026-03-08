const USERNAME_FORMAT_REGEX = /^[a-zA-Z0-9._-]+$/;

export function hasValidUsernameFormat(username: string): boolean {
	return USERNAME_FORMAT_REGEX.test(username);
}
