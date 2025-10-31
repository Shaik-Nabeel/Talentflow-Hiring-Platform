import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Support redirects from a static 404 page that encodes the original path
// into a `?redirect=` query param (see public/404.html). If present, restore
// the original pathname before mounting the SPA so the router picks it up.
try {
	const params = new URLSearchParams(location.search);
	const redirect = params.get('redirect');
	if (redirect) {
		const decoded = decodeURIComponent(redirect);
		// Replace the current history entry so the app mounts at the original path
		history.replaceState({}, '', decoded);
	}
} catch (e) {
	// ignore
}

createRoot(document.getElementById("root")!).render(<App />);
