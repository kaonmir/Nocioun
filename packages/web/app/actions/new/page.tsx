"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PersonIcon,
  CalendarIcon,
  FileTextIcon,
  BookmarkIcon,
  GearIcon,
  TargetIcon,
} from "@radix-ui/react-icons";

const actions = [
  {
    title: "지도 연동",
    description: "카카오맵 장소 정보를 Notion 데이터베이스에 저장하세요",
    icon: TargetIcon,
    href: "/actions/new/map",
    color: "bg-green-50 text-green-600",
    available: true,
  },
  {
    title: "연락처 연동",
    description: "주소록 정보를 체계적으로 Notion에서 관리하세요",
    icon: PersonIcon,
    href: "/actions/contacts",
    color: "bg-blue-50 text-blue-600",
    available: false,
  },
  {
    title: "일정 동기화",
    description: "캘린더 일정을 Notion과 실시간으로 동기화하세요",
    icon: CalendarIcon,
    href: "/actions/calendar",
    color: "bg-purple-50 text-purple-600",
    available: false,
  },
  {
    title: "문서 가져오기",
    description: "다양한 형식의 문서를 Notion으로 자동 변환하세요",
    icon: FileTextIcon,
    href: "/actions/documents",
    color: "bg-orange-50 text-orange-600",
    available: false,
  },
  {
    title: "북마크 정리",
    description: "웹 북마크를 Notion 데이터베이스로 정리하세요",
    icon: BookmarkIcon,
    href: "/actions/bookmarks",
    color: "bg-yellow-50 text-yellow-600",
    available: false,
  },
  {
    title: "자동화 설정",
    description: "반복 작업을 자동화하여 생산성을 높이세요",
    icon: GearIcon,
    href: "/actions/automation",
    color: "bg-gray-50 text-gray-600",
    available: false,
  },
];

export default function ActionsNewPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Actions 선택하기
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Notion과 연결할 기능을 선택하세요. 더 많은 기능이 곧 추가될
            예정입니다.
          </p>
        </div>

        {/* Actions 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actions.map((action) => {
            const Icon = action.icon;

            if (action.available) {
              return (
                <Link key={action.title} href={action.href}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader>
                      <div
                        className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-xl">{action.title}</CardTitle>
                      <CardDescription className="text-gray-600">
                        {action.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">시작하기</Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            }

            return (
              <Card key={action.title} className="h-full opacity-60">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">{action.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button disabled className="w-full">
                    곧 출시 예정
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 뒤로 가기 */}
        <div className="text-center">
          <Link href="/actions">
            <Button variant="outline" size="lg">
              ← 뒤로 가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
