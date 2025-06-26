import { Card, CardContent } from "@/components/ui/card";
import { ReloadIcon } from "@radix-ui/react-icons";

interface ErrorCardProps {
  message: string;
}

export function ErrorCard({ message }: ErrorCardProps) {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl">❌</div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              오류 발생
            </h2>
            <p className="text-red-600">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
