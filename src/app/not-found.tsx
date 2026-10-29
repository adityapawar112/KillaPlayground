import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9F6F0] text-[#2B1E16] p-4 text-center">
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-sm text-[#634E40] mb-4">
        The fort diorama or page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-[#4B382C] text-white rounded-lg text-sm font-semibold hover:bg-[#38281E] transition-colors"
      >
        Return to Diwali Killa Diorama
      </Link>
    </div>
  );
}

