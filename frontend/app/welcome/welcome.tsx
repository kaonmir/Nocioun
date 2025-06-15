import { Link } from "react-router";

export function Welcome() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="w-full px-4 py-6 mx-auto max-w-7xl">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Nocioun
            </span>
          </div>
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-gray-700 transition-colors"
          >
            로그인
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-16 mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Google Contacts와
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Notion을 연결하세요
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            복잡한 설정 없이 Google Contacts의 연락처를 Notion 데이터베이스와
            자동으로 동기화하세요. 몇 번의 클릭만으로 연락처 관리를 한 단계
            업그레이드할 수 있습니다.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/workspace"
              className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:from-blue-500 hover:to-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
            >
              시작하기
            </Link>
            <a
              href="#features"
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              자세히 보기 <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-16 mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            간단하고 강력한 기능들
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            복잡한 연동 과정을 단순화하여 누구나 쉽게 사용할 수 있습니다
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="px-4 py-16 mx-auto max-w-7xl bg-white dark:bg-gray-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            3단계로 완성하는 연동
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            복잡한 설정 없이 간단한 3단계면 충분합니다
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mx-auto mb-4">
                <span className="text-2xl font-bold text-white">
                  {index + 1}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 mx-auto max-w-7xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl px-8 py-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            지금 바로 시작해보세요
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            무료로 Google Contacts와 Notion을 연결하고 연락처 관리를
            자동화하세요
          </p>
          <div className="mt-8">
            <Link
              to="/workspace"
              className="rounded-lg bg-white px-8 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
            >
              무료로 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 mx-auto max-w-7xl border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            &copy; 2024 Nocioun. Made with ❤️ for better contact management.
          </p>
        </div>
      </footer>
    </main>
  );
}

const features = [
  {
    title: "간편한 OAuth 인증",
    description:
      "Google과 Notion 계정에 안전하고 간편하게 로그인하세요. 복잡한 API 키 설정이 필요하지 않습니다.",
    icon: (
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    title: "자동 동기화",
    description:
      "설정 완료 후 Google Contacts의 변경사항이 자동으로 Notion 데이터베이스에 반영됩니다.",
    icon: (
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    ),
  },
  {
    title: "실시간 모니터링",
    description:
      "동기화 상태와 실행 로그를 실시간으로 확인하여 언제나 안심하고 사용하세요.",
    icon: (
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
];

const steps = [
  {
    title: "계정 연결",
    description:
      "Google과 Notion 계정에 OAuth로 안전하게 로그인하세요. 몇 번의 클릭만으로 완료됩니다.",
  },
  {
    title: "동기화 설정",
    description:
      "어떤 연락처 정보를 Notion의 어느 데이터베이스와 연결할지 선택하세요.",
  },
  {
    title: "자동 실행",
    description:
      "설정 완료! 이제 연락처 변경사항이 자동으로 Notion에 동기화됩니다.",
  },
];
