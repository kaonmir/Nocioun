import Link from "next/link";

export function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
      {/* Hero Section */}
      <div className="hero min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            {/* Logo/Brand */}
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-white mb-4">
                <span className="text-accent">No</span>cioun
              </h1>
              <div className="badge badge-outline badge-lg text-white">
                Google Contacts ↔ Notion 연동
              </div>
            </div>

            {/* Main Content */}
            <div className="card bg-base-100 shadow-2xl mx-auto max-w-3xl">
              <div className="card-body">
                <h2 className="card-title text-3xl justify-center mb-6">
                  연락처 관리를 혁신하세요
                </h2>

                <p className="text-lg text-base-content/70 mb-8">
                  Google Contacts의 연락처를 Notion 데이터베이스와 쉽게
                  동기화하세요. 간단한 설정으로 자동 연동이 가능합니다.
                </p>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">빠른 동기화</h3>
                    <p className="text-sm text-base-content/60">
                      실시간으로 연락처 정보를 동기화합니다
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-secondary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">안전한 연동</h3>
                    <p className="text-sm text-base-content/60">
                      OAuth 인증으로 안전하게 데이터를 보호합니다
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-accent"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">간편한 설정</h3>
                    <p className="text-sm text-base-content/60">
                      몇 번의 클릭만으로 설정을 완료할 수 있습니다
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="card-actions justify-center gap-4">
                  <Link href="/login" className="btn btn-primary btn-lg">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google로 시작하기
                  </Link>
                  <button className="btn btn-outline btn-lg">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    사용법 알아보기
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Info */}
            <div className="mt-12 text-center">
              <div className="stats stats-horizontal shadow-lg bg-base-100/10 backdrop-blur-sm">
                <div className="stat">
                  <div className="stat-title text-white/70">연동된 연락처</div>
                  <div className="stat-value text-white">1,200+</div>
                </div>
                <div className="stat">
                  <div className="stat-title text-white/70">활성 사용자</div>
                  <div className="stat-value text-white">350+</div>
                </div>
                <div className="stat">
                  <div className="stat-title text-white/70">동기화 성공률</div>
                  <div className="stat-value text-white">99.9%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
