import { DatabaseIcon } from "./DatabaseIcon";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";

interface DatabaseHeaderProps {
  database?: DatabaseObjectResponse;
  className?: string;
  iconClassName?: string;
}

export const DatabaseHeader = ({
  database,
  className = "",
}: DatabaseHeaderProps) => {
  return (
    <span className={`flex items-center ${className}`}>
      <DatabaseIcon
        className="w-5 h-5 mr-2 bg-white"
        icon={database?.icon ?? null}
      />
      {database?.title?.[0]?.plain_text}
    </span>
  );
};
