"use client";

import { useState } from "react";
import { NotionDatabase } from "@/types/notion";

interface AddToNotionProps {
  database: NotionDatabase;
  url: string;
  placeInfo: any; // @result.json 참고
  onPlaceAdded: () => void;
  onBack: () => void;
  onAddMore: () => void;
}

export function AddToNotion({
  database,
  url,
  placeInfo,
  onPlaceAdded,
  onBack,
  onAddMore,
}: AddToNotionProps) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const handleAddToNotion = async () => {
    try {
      setAdding(true);
      setError("");

      const response = await fetch("/api/add-place", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          placeInfo,
          databaseId: database.id,
          url,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "장소 추가에 실패했습니다.");
      }

      setSuccess(true);
      // 자동으로 다음 단계로 이동하지 않음
      // setTimeout(() => {
      //   onPlaceAdded();
      // }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setAdding(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-green-500 text-6xl mb-4">🎉</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          성공적으로 추가되었습니다!
        </h3>
        <p className="text-gray-600 mb-6">
          <span className="font-semibold">{placeInfo.summary.name}</span>
          이(가) Notion 데이터베이스에 저장되었습니다.
        </p>

        <div className="flex justify-center space-x-4">
          <button
            onClick={onAddMore}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            더 추가하기
          </button>
          <a
            href={`https://notion.so/${database.id.replace(/-/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition duration-200"
          >
            Notion에서 보기 →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Notion에 추가하기
        </h2>
        <p className="text-gray-600">
          장소 정보를 확인하고 Notion 데이터베이스에 저장하세요
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* 장소 정보 미리보기 */}
      <div className="mb-6 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          장소 정보 미리보기
        </h3>

        <div className="space-y-4">
          <div className="flex">
            <div className="w-20 text-sm font-medium text-gray-600">
              장소명:
            </div>
            <div className="flex-1 text-sm text-gray-900">
              {placeInfo.summary.name}
            </div>
          </div>

          <div className="flex">
            <div className="w-20 text-sm font-medium text-gray-600">주소:</div>
            <div className="flex-1 text-sm text-gray-900">
              {placeInfo.summary.address.disp}
            </div>
          </div>

          <div className="flex">
            <div className="w-20 text-sm font-medium text-gray-600">링크:</div>
            <div className="flex-1 text-sm text-blue-600 font-mono break-all">
              {url}
            </div>
          </div>
        </div>
      </div>

      {/* 데이터베이스 정보 */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">저장될 데이터베이스</h4>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mr-3">
            <span className="text-sm">📊</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{database.title}</p>
            <p className="text-sm text-gray-500">
              {Object.keys(database.properties).length}개의 컬럼
            </p>
          </div>
        </div>
      </div>

      {/* 추가될 정보 설명 */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">📝 추가될 정보</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 장소명: {placeInfo.summary.name} (기존 Title 컬럼에 저장)</li>
          <li>• 주소: {placeInfo.summary.address.disp}</li>
          <li>• 카카오맵 링크: {url}</li>
          <li>• 기타 정보: 전화번호, 홈페이지 등 (있는 경우)</li>
        </ul>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex space-x-3">
        <button
          onClick={handleAddToNotion}
          disabled={adding}
          className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
        >
          {adding ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Notion에 추가 중...
            </span>
          ) : (
            "✅ Notion에 추가하기"
          )}
        </button>

        <button
          onClick={onBack}
          disabled={adding}
          className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition duration-200"
        >
          ← 뒤로가기
        </button>
      </div>

      {/* 참고 사항 */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>
          데이터가 추가되면 Notion 데이터베이스에서 바로 확인할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
