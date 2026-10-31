import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9F6F0] text-[#2B1E16] p-4 text-center select-none">
      <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-4 flex items-center justify-center">
        <Image
          src="/killaplayground-tranparent.png"
          alt="The Killa Playground Logo"
          width={144}
          height={144}
          className="w-full h-full object-contain drop-shadow-md animate-pulse"
          priority
        />
      </div>
      <h2 className="font-yatra text-2xl sm:text-3xl font-bold mb-2 text-[#4B382C]">
        किल्ला सापडला नाही • Page Not Found
      </h2>
      <p className="text-xs sm:text-sm text-[#634E40] max-w-md mb-6 leading-relaxed">
        The fort diorama or secret tunnel you are looking for has been moved or does not exist in this courtyard.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-[#E85D04] hover:bg-[#FF7722] text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-[#E85D04]/30 transition-all cursor-pointer"
      >
        Return to Diwali Killa Playground
      </Link>
    </div>
  );
}
