import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <section className="hero min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            {/* Avatar */}
            <div className="avatar mb-8">
              <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-6xl text-white">
                  🌟
                </div>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl font-bold text-base-content mb-4">
              환영합니다!
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-base-content/70 mb-8 leading-relaxed">
              아름다운 DaisyUI 컴포넌트로 만든 웰컴 페이지입니다.
              <br />
              시작할 준비가 되었습니다!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a href="/actions" className="btn btn-primary btn-lg">
                시작하기
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>
              <button className="btn btn-outline btn-lg">더 알아보기</button>
            </div>

            {/* Stats */}
            <div className="stats stats-vertical lg:stats-horizontal shadow-lg bg-base-200/50 backdrop-blur-sm">
              <div className="stat">
                <div className="stat-figure text-primary">
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="stat-title">프로젝트</div>
                <div className="stat-value text-primary">100+</div>
                <div className="stat-desc">완성된 프로젝트</div>
              </div>

              <div className="stat">
                <div className="stat-figure text-secondary">
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="stat-title">사용자</div>
                <div className="stat-value text-secondary">50K+</div>
                <div className="stat-desc">만족한 사용자</div>
              </div>

              <div className="stat">
                <div className="stat-figure text-accent">
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="stat-title">성능</div>
                <div className="stat-value text-accent">99%</div>
                <div className="stat-desc">가동시간</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-base-content mb-4">
              주요 기능
            </h2>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              DaisyUI의 강력한 컴포넌트들로 구성된 현대적인 웹 애플리케이션
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <figure className="px-10 pt-10">
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-3xl text-white">
                  🚀
                </div>
              </figure>
              <div className="card-body items-center text-center">
                <h3 className="card-title text-2xl mb-2">빠른 시작</h3>
                <p className="text-base-content/70 mb-4">
                  몇 분 안에 프로젝트를 시작하고 실행할 수 있습니다.
                </p>
                <div className="card-actions">
                  <button className="btn btn-primary btn-sm">
                    자세히 보기
                  </button>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <figure className="px-10 pt-10">
                <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center text-3xl text-white">
                  🎨
                </div>
              </figure>
              <div className="card-body items-center text-center">
                <h3 className="card-title text-2xl mb-2">아름다운 디자인</h3>
                <p className="text-base-content/70 mb-4">
                  DaisyUI로 만든 현대적이고 반응형 디자인
                </p>
                <div className="card-actions">
                  <button className="btn btn-secondary btn-sm">
                    자세히 보기
                  </button>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <figure className="px-10 pt-10">
                <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center text-3xl text-white">
                  ⚡
                </div>
              </figure>
              <div className="card-body items-center text-center">
                <h3 className="card-title text-2xl mb-2">최적화된 성능</h3>
                <p className="text-base-content/70 mb-4">
                  Next.js와 Tailwind CSS의 최적화된 성능
                </p>
                <div className="card-actions">
                  <button className="btn btn-accent btn-sm">자세히 보기</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            지금 바로 시작하세요!
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            더 이상 기다리지 마세요. 지금 바로 프로젝트를 시작하고 놀라운 결과를
            만들어보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn btn-lg bg-white text-primary hover:bg-gray-100 border-none">
              무료로 시작하기
            </button>
            <button className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-primary">
              문의하기
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-200 text-base-content">
        <aside>
          <div className="text-2xl font-bold mb-2">🌟 Nocioun</div>
          <p className="text-base-content/70">
            DaisyUI로 만든 아름다운 웹 애플리케이션
          </p>
          <p className="text-sm text-base-content/50">
            © 2024. All rights reserved.
          </p>
        </aside>
        <nav>
          <div className="grid grid-flow-col gap-4">
            <button className="btn btn-ghost btn-circle">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </button>
            <button className="btn btn-ghost btn-circle">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.887 2.748.097.118.112.22.083.402-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-12.014C24.007 5.367 18.641.001.012.001z" />
              </svg>
            </button>
            <button className="btn btn-ghost btn-circle">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
              </svg>
            </button>
          </div>
        </nav>
      </footer>
    </div>
  );
}
