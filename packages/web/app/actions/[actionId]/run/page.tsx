import { ActionRunner } from "./_components/ActionRunner";

interface ActionPageProps {
  params: {
    actionId: string;
  };
}

export default function ActionPage({ params }: ActionPageProps) {
  return (
    <div className="container px-4 py-8">
      <ActionRunner actionId={params.actionId} />
    </div>
  );
}
