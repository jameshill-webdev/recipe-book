export function createApiError(message: string, status: number): Error & { status?: number } {
	const error: Error & { status?: number } = new Error(message);
	error.status = status;
	return error;
}
