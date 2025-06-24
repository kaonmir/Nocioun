"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  PersonIcon,
  CalendarIcon,
  FileTextIcon,
  BookmarkIcon,
  GearIcon,
  ArrowRightIcon,
  TargetIcon,
} from "@radix-ui/react-icons";

const features = [
  {
    title: "지도 연동",
    description: "원하는 카카오맵 장소를 Notion에 생성",
    icon: TargetIcon,
    color: "bg-green-50 text-green-600",
  },
  {
    title: "연락처 관리",
    description: "주소록을 체계적으로 Notion에서 통합 관리",
    icon: PersonIcon,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "일정 동기화",
    description: "캘린더와 Notion을 실시간으로 연결",
    icon: CalendarIcon,
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "문서 변환",
    description: "모든 문서를 Notion 형식으로 자동 변환",
    icon: FileTextIcon,
    color: "bg-orange-50 text-orange-600",
  },
  {
    title: "북마크 정리",
    description: "웹 북마크를 Notion 데이터베이스로 정리",
    icon: BookmarkIcon,
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    title: "자동화 설정",
    description: "반복 작업을 스마트하게 자동화",
    icon: GearIcon,
    color: "bg-gray-50 text-gray-600",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Logo/Brand */}
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-gray-900 mb-4">
                <span className="text-blue-600">No</span>cioun
              </h1>
              <p className="text-xl text-gray-600">
                Notion Integration Platform
              </p>
            </div>

            {/* Main Headline */}
            <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              모든 걸 Notion과
              <br />
              <span className="text-blue-600">연결하세요</span>
            </h2>

            {/* Subtitle */}
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              웹사이트, 앱, 서비스들을 Notion과 seamlessly 연결하여
              <br />
              하나의 통합된 워크스페이스에서 모든 정보를 관리하세요
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/actions" scroll={true}>
                <Button size="lg" className="text-lg px-8 py-4">
                  Get Started
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Integrations
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              다양한 플랫폼과 서비스를 Notion과 연결하여 생산성을 극대화하세요
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 bg-white"
                >
                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-gray-600 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">6+</div>
              <div className="text-xl opacity-90">Integrations</div>
              <div className="text-sm opacity-75 mt-2">Available Services</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">∞</div>
              <div className="text-xl opacity-90">Possibilities</div>
              <div className="text-sm opacity-75 mt-2">Endless Connections</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">1</div>
              <div className="text-xl opacity-90">Workspace</div>
              <div className="text-sm opacity-75 mt-2">Unified Experience</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold text-gray-900 mb-6">
            지금 시작하세요
          </h3>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            몇 분 안에 설정을 완료하고 Notion의 강력한 통합 기능을 경험해보세요
          </p>
          <Link href="/actions" scroll={true}>
            <Button size="lg" className="text-lg px-12 py-4">
              Get Started Free
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-2xl font-bold mb-4">Nocioun</h4>
            <p className="text-gray-400 mb-6">
              Notion과 세상을 연결하는 플랫폼
            </p>
            <div className="text-sm text-gray-500">
              © 2025 Nocioun. 모든 연결을 하나로.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
