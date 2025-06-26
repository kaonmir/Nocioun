"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PersonIcon,
  ExitIcon,
  GearIcon,
  HomeIcon,
} from "@radix-ui/react-icons";
import { createClient } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";

export const Header = () => {
  const { user, loading } = useUser();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="ml-3 w-20 h-6 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div className="flex items-center">
            <Link
              href="/actions"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-900">
                Nocioun
              </span>
            </Link>
          </div>

          {/* 네비게이션 및 사용자 메뉴 */}
          <div className="flex items-center space-x-4">
            {/* 홈 버튼 */}
            <Link href="/actions">
              <Button variant="ghost" size="sm">
                <HomeIcon className="w-4 h-4 mr-2" />홈
              </Button>
            </Link>

            {/* 사용자 메뉴 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 h-auto p-2"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {user?.user_metadata?.name?.charAt(0) ||
                        user?.email?.charAt(0)?.toUpperCase() ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {user?.user_metadata?.name || "사용자"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="flex items-center cursor-pointer"
                  >
                    <PersonIcon className="w-4 h-4 mr-2" />
                    마이페이지
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings"
                    className="flex items-center cursor-pointer"
                  >
                    <GearIcon className="w-4 h-4 mr-2" />
                    설정
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <ExitIcon className="w-4 h-4 mr-2" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
