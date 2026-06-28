import { WizardGameClient } from "./WizardGameClient";

export default function WizardPage() {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-[100rem]">
        <WizardGameClient />
      </div>
    </main>
  );
}
