import { Card, CardContent } from "@/components/ui/card";
import { ReloadIcon } from "@radix-ui/react-icons";

interface LoadingProps {
  message: string;
}

export function LoadingCard({ message }: LoadingProps) {
  return (
    <Card className="border-none shadow-none">
      <CardContent className="text-center py-8">
        <ReloadIcon className="animate-spin h-8 w-8 mx-auto text-blue-500" />
        <p className="text-gray-600 mt-2">{message}</p>
      </CardContent>
    </Card>
  );
}
