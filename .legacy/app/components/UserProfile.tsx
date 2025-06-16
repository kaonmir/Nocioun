import { useRouter } from "next/navigation";
import { supabase } from "../../supabase/supabase";

interface UserProfileProps {
  user: any;
}

export function UserProfile({ user }: UserProfileProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        {user?.user_metadata?.avatar_url && (
          <img
            src={user.user_metadata.avatar_url}
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
        )}
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {user?.user_metadata?.full_name || user?.email}
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors"
      >
        로그아웃
      </button>
    </div>
  );
}
