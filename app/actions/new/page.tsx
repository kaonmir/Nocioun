"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";

interface ActionTemplate {
  key: string;
  name: string;
  description: string;
  icon: string;
}

const templates: ActionTemplate[] = [
  {
    key: "sync-contacts",
    name: "Sync Contacts",
    description: "연락처를 동기화하여 최신 상태로 유지합니다.",
    icon: "👥",
  },
  {
    key: "sync-map",
    name: "Sync Naver Map",
    description: "네이버 지도 데이터를 동기화합니다.",
    icon: "🗺️",
  },
];

export default function NewActionPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [actionName, setActionName] = useState<string>("");
  const [actionDescription, setActionDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTemplateSelect = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    setCurrentStep(2);
  };

  const handleCreateAction = async () => {
    if (!actionName.trim()) {
      alert("액션 이름을 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const token = await getSession();
      const response = await fetch("/api/actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token?.access_token}`,
        },
        body: JSON.stringify({
          name: actionName,
          description: actionDescription,
          type: selectedTemplate,
          status: "draft",
        }),
      });

      if (!response.ok) {
        throw new Error("액션 생성에 실패했습니다.");
      }

      const data = await response.json();
      router.push(`/actions/${data.id}`);
    } catch (error) {
      console.error("Error creating action:", error);
      alert("액션 생성 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTemplateData = templates.find(
    (t) => t.key === selectedTemplate
  );

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-base-content mb-2">
            새 액션 만들기
          </h1>
          <p className="text-xl text-base-content/70">
            단계별로 액션을 설정해보세요
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <ul className="steps steps-horizontal w-full max-w-md">
            <li className={`step ${currentStep >= 1 ? "step-primary" : ""}`}>
              템플릿 선택
            </li>
            <li className={`step ${currentStep >= 2 ? "step-primary" : ""}`}>
              기본 정보
            </li>
          </ul>
        </div>

        {/* Step 1: Choose Action Template */}
        {currentStep === 1 && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6 justify-center">
                1단계: 액션 템플릿 선택
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.key}
                    className="card bg-base-200 hover:bg-base-300 cursor-pointer transition-colors duration-200 border-2 border-transparent hover:border-primary"
                    onClick={() => handleTemplateSelect(template.key)}
                  >
                    <div className="card-body text-center">
                      <div className="text-6xl mb-4">{template.icon}</div>
                      <h3 className="card-title justify-center text-xl mb-2">
                        {template.name}
                      </h3>
                      <p className="text-base-content/70">
                        {template.description}
                      </p>
                      <div className="card-actions justify-center mt-4">
                        <button className="btn btn-primary">선택하기</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Basic Info */}
        {currentStep === 2 && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6 justify-center">
                2단계: 기본 정보 입력
              </h2>

              {/* Selected Template Info */}
              {selectedTemplateData && (
                <div className="alert alert-info mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">
                      {selectedTemplateData.icon}
                    </span>
                    <div>
                      <h3 className="font-bold">{selectedTemplateData.name}</h3>
                      <p className="text-sm">
                        {selectedTemplateData.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Action Name */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-lg font-medium">
                      액션 이름 *
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="예: 내 연락처 동기화"
                    className="input input-bordered input-lg"
                    value={actionName}
                    onChange={(e) => setActionName(e.target.value)}
                  />
                  <label className="label">
                    <span className="label-text-alt">
                      액션을 식별할 수 있는 이름을 입력하세요
                    </span>
                  </label>
                </div>

                {/* Action Description */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-lg font-medium">
                      설명 (선택사항)
                    </span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered textarea-lg h-32"
                    placeholder="이 액션이 무엇을 하는지 간단히 설명해주세요..."
                    value={actionDescription}
                    onChange={(e) => setActionDescription(e.target.value)}
                  ></textarea>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                  <button
                    className="btn btn-outline btn-lg"
                    onClick={() => setCurrentStep(1)}
                    disabled={isLoading}
                  >
                    이전 단계
                  </button>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleCreateAction}
                    disabled={isLoading || !actionName.trim()}
                  >
                    {isLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        생성 중...
                      </>
                    ) : (
                      "액션 생성"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
