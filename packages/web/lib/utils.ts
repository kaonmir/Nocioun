import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const proxyFetch = async (
  url: string,
  init?: RequestInit
): Promise<Response> => {
  const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
  return fetch(proxyUrl, init);
};

export const proxyFetchAsBrowser = async (
  url: string,
  init?: RequestInit
): Promise<Response> => {
  // URL 쿼리 파라미터 구성
  const queryParams = new URLSearchParams({
    url: url,
    as: "browser",
  });

  // headers에서 origin과 referer 추출
  if (init?.headers) {
    const headers = init.headers;
    let origin: string | undefined;
    let referer: string | undefined;

    // Headers 객체인 경우
    if (headers instanceof Headers) {
      origin = headers.get("origin") || undefined;
      referer = headers.get("referer") || headers.get("referrer") || undefined;
    }
    // 배열 형태인 경우
    else if (Array.isArray(headers)) {
      for (const [key, value] of headers) {
        const lowerKey = key.toLowerCase();
        if (lowerKey === "origin") origin = value;
        if (lowerKey === "referer" || lowerKey === "referrer") referer = value;
      }
    }
    // 객체 형태인 경우
    else {
      const headerEntries = Object.entries(headers);
      for (const [key, value] of headerEntries) {
        const lowerKey = key.toLowerCase();
        if (lowerKey === "origin") origin = value;
        if (lowerKey === "referer" || lowerKey === "referrer") referer = value;
      }
    }

    // 쿼리 파라미터에 추가
    if (origin) queryParams.set("origin", origin);
    if (referer) queryParams.set("referer", referer);
  }

  const proxyUrl = `/api/proxy?${queryParams.toString()}`;
  return fetch(proxyUrl, init);
};
