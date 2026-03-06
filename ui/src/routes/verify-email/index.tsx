import { VERIFY_EMAIL_PAGE_HEADING, VERIFY_EMAIL_PAGE_MESSAGE } from "@/lib/content-strings";

export default function VerifyEmail() {
	return (
		<>
			<h1>{VERIFY_EMAIL_PAGE_HEADING}</h1>
			<p>{VERIFY_EMAIL_PAGE_MESSAGE}</p>
		</>
	);
}
