import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  return handleProxyRequest(request);
};

export const POST = async (request: NextRequest) => {
  return handleProxyRequest(request);
};

export const PUT = async (request: NextRequest) => {
  return handleProxyRequest(request);
};

export const PATCH = async (request: NextRequest) => {
  return handleProxyRequest(request);
};

export const DELETE = async (request: NextRequest) => {
  return handleProxyRequest(request);
};

const handleProxyRequest = async (request: NextRequest) => {
  try {
    // URL 파라미터에서 원본 URL 추출
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");
    const asBrowser = searchParams.get("as") === "browser";
    const origin = searchParams.get("origin");
    const referer = searchParams.get("referer");

    if (!targetUrl) {
      return NextResponse.json(
        { error: "Target URL is required" },
        { status: 400 }
      );
    }

    // URL 유효성 검사
    let decodedUrl: string;
    try {
      decodedUrl = decodeURIComponent(targetUrl);
      new URL(decodedUrl); // URL 유효성 검사
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // 요청 body 가져오기
    let body: string | undefined;
    if (!["GET", "DELETE"].includes(request.method.toUpperCase())) {
      try {
        const requestBody = await request.text();
        body = requestBody || undefined;
      } catch {
        // body가 없는 경우 무시
      }
    }

    // 브라우저 모드와 일반 모드에 따라 헤더 필터링을 다르게 처리
    const filteredHeaders = new Headers();
    let skipHeaders: string[] = [];

    if (!asBrowser) {
      // 일반 모드: 브라우저 관련 헤더들을 모두 제거
      skipHeaders = [
        "host",
        "origin",
        "referer",
        "cookie",
        "connection",
        "x-forwarded-for",
        "x-forwarded-host",
        "x-forwarded-port",
        "x-forwarded-proto",
        "sec-ch-ua",
        "sec-ch-ua-mobile",
        "sec-ch-ua-platform",
        "sec-fetch-dest",
        "sec-fetch-mode",
        "sec-fetch-site",
        "content-length",
        "pf",
        "dnt",
        "priority",
      ];
    }

    request.headers.forEach((value, key) => {
      if (!skipHeaders.includes(key.toLowerCase())) {
        filteredHeaders.append(key, value);
      }
    });

    // 브라우저 모드일 때 추가 헤더 설정
    if (asBrowser) {
      if (origin) filteredHeaders.set("origin", origin);
      if (referer) filteredHeaders.set("referer", referer);
    }

    const response = await fetch(decodedUrl, {
      method: request.method,
      headers: filteredHeaders,
      body,
    });

    // 2xx 상태 코드가 아닌 경우 에러 로깅
    if (response.status < 200 || response.status >= 300) {
      const body = await response.clone().text();
      console.error(
        `Proxy error: ${response.status} ${response.statusText} ${targetUrl} ${request.method} ${body} ${response.headers}`
      );
    }

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: { ...response.headers },
    });
  } catch (error) {
    console.error("Proxy request failed:", error);
    return NextResponse.json(
      {
        error: "Proxy request failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
};

// OPTIONS 요청 처리 (CORS preflight)
export const OPTIONS = async () => {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
};
