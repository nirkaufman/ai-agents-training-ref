import Link from "next/link";

export default function Home() {
  return (
      <div
          className="flex flex-col items-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <div className="flex-grow flex flex-col items-center justify-center">
          <h1 className="text-5xl mb-1"><span className='font-bold'>AI Agents</span> Training :: <span
              className="text-orange-400">Reference</span></h1>

          <div className='mt-4 flex align-middle'>
            <Link href="/langchain" className="display-inline-block me-4">LangChain</Link>
            <Link href="/vercel" className="display-inline-block">Vercel</Link>
          </div>
        </div>
      </div>
  );
}
