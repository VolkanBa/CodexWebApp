import { PrivateContent } from "./PrivateContent";

export default function PrivatePage() {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-4xl place-items-center text-center">
        <PrivateContent />
      </div>
    </main>
  );
}
