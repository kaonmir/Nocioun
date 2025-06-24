import { ActionRunSinglePage } from "./_components/ActionRunSinglePage";

interface RunPageProps {
  params: {
    actionId: string;
  };
}

export default function RunPage({ params }: RunPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <ActionRunSinglePage actionId={params.actionId} />
      </div>
    </div>
  );
}
