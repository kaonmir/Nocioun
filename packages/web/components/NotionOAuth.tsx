"use client";

interface NotionOAuthProps {
  onSuccess: () => void;
}

export function NotionOAuth({ onSuccess }: NotionOAuthProps) {
  const handleOAuthClick = () => {
    // Notion OAuth 시작
    window.location.href = "/api/auth/notion";
  };

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="mx-auto w-20 h-20 flex items-center justify-center mb-4">
          <img src="/icons/notion.svg" alt="Notion" className="w-16 h-16" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Notion과 연결하기
        </h2>
        <p className="text-gray-600">
          카카오맵 장소를 저장할 Notion 워크스페이스에 연결하세요
        </p>
      </div>

      <button
        onClick={handleOAuthClick}
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200"
      >
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
            clipRule="evenodd"
          />
        </svg>
        Notion으로 로그인
      </button>

      <div className="mt-6 text-sm text-gray-500">
        <p>연결 후 다음 권한이 필요합니다:</p>
        <ul className="mt-2 space-y-1">
          <li>• 데이터베이스 읽기 및 쓰기</li>
          <li>• 페이지 생성</li>
        </ul>
      </div>
    </div>
  );
}
