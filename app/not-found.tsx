import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
      <h2 className="text-3xl font-black text-foreground">404 - पृष्ठ नहीं मिला (Page Not Found)</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        यह पृष्ठ उपलब्ध नहीं है या पता बदल गया है। (The requested page could not be found.)
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
      >
        मुख्य पृष्ठ पर वापस जाएं (Back to Home)
      </Link>
    </div>
  );
}
