import { ActionRunner } from "./_components/ActionRunner";

interface ActionPageProps {
  params: {
    actionId: string;
  };
}

export default function ActionPage({ params }: ActionPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <ActionRunner actionId={params.actionId} />
      </div>
    </div>
  );
}
