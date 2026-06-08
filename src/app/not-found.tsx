import Link from "next/link";

function NotFound() {
  return (
    <div className="h-180 grid place-items-center">
      <div className="text-center space-y-10">
        <p className="text-lg font-semibold mb-4">Page Not Found</p>
        <Link href="/" className="underline">
          Go back to home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
