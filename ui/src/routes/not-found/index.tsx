import { NOT_FOUND_PAGE_HEADING, NOT_FOUND_PAGE_MESSAGE } from "@/lib/content-strings";

export default function NotFound() {
	return (
		<>
			<h1>{NOT_FOUND_PAGE_HEADING}</h1>
			<p>{NOT_FOUND_PAGE_MESSAGE}</p>
		</>
	);
}
