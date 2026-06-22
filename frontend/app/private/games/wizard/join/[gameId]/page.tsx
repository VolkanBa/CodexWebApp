import { WizardGameClient } from "../../WizardGameClient";

export default async function WizardJoinPage({
  params
}: {
  params: Promise<{
    gameId: string;
  }>;
}) {
  const { gameId } = await params;

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <WizardGameClient initialJoinGameId={gameId} />
      </div>
    </main>
  );
}
