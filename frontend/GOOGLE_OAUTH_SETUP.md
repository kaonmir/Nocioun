# Google OAuth 설정 가이드

Google Contacts API와 OAuth 인증을 설정하여 Nocioun 애플리케이션에서 Google 계정을 연결할 수 있습니다.

## 1. Google Cloud Console 설정

### 1.1 프로젝트 생성 또는 선택

1. [Google Cloud Console](https://console.cloud.google.com/)에 로그인
2. 새 프로젝트를 생성하거나 기존 프로젝트를 선택

### 1.2 Google People API 활성화

1. `API 및 서비스` > `라이브러리`로 이동
2. "Google People API" 검색 후 선택
3. `사용` 버튼 클릭하여 API 활성화

### 1.3 OAuth 2.0 클라이언트 ID 생성

1. `API 및 서비스` > `사용자 인증 정보`로 이동
2. `+ 사용자 인증 정보 만들기` > `OAuth 클라이언트 ID` 선택
3. 애플리케이션 유형: `웹 애플리케이션` 선택
4. 이름: `Nocioun Web Client` (또는 원하는 이름)
5. 승인된 자바스크립트 원본:
   - `http://localhost:3000` (개발환경)
   - `https://yourdomain.com` (프로덕션 환경)
6. 승인된 리디렉션 URI:
   - `http://localhost:3000/oauth/google/callback` (개발환경)
   - `https://yourdomain.com/oauth/google/callback` (프로덕션 환경)
7. `만들기` 버튼 클릭

### 1.4 OAuth 동의 화면 설정

1. `API 및 서비스` > `OAuth 동의 화면`으로 이동
2. 사용자 유형: `외부` 선택 (개인 계정의 경우)
3. 앱 정보 입력:
   - 앱 이름: `Nocioun`
   - 사용자 지원 이메일: 본인 이메일
   - 개발자 연락처 정보: 본인 이메일
4. 범위 추가:
   - `https://www.googleapis.com/auth/contacts.readonly`
5. 테스트 사용자 추가 (개발 중인 경우)

## 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth 설정
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 3. Supabase 데이터베이스 설정

Supabase 대시보드의 SQL 에디터에서 `sql/create_oauth_tokens_table.sql` 파일의 내용을 실행하여 `oauth_tokens` 테이블을 생성하세요.

## 4. 테스트

1. 애플리케이션을 실행: `npm run dev`
2. `/workspace` 페이지로 이동
3. "Google 연결하기" 버튼 클릭
4. Google 계정으로 로그인하고 권한 승인
5. 연결 완료 후 "연결됨" 상태로 변경되는지 확인

## 5. 문제 해결

### 일반적인 오류들:

1. **"redirect_uri_mismatch" 오류**

   - Google Cloud Console에서 설정한 리디렉션 URI와 실제 URL이 일치하는지 확인

2. **"invalid_client" 오류**

   - Client ID와 Client Secret이 올바른지 확인
   - 환경 변수가 제대로 설정되었는지 확인

3. **"access_denied" 오류**

   - OAuth 동의 화면에서 필수 정보가 모두 입력되었는지 확인
   - 앱이 확인되지 않은 경우 테스트 사용자로 추가되었는지 확인

4. **데이터베이스 오류**
   - `oauth_tokens` 테이블이 생성되었는지 확인
   - RLS 정책이 올바르게 설정되었는지 확인

## 6. 보안 고려사항

1. **환경 변수 보호**

   - `.env.local` 파일을 `.gitignore`에 추가
   - 프로덕션에서는 안전한 환경에서 환경 변수 관리

2. **HTTPS 사용**

   - 프로덕션 환경에서는 반드시 HTTPS 사용

3. **토큰 보안**
   - 액세스 토큰은 클라이언트에 노출되지 않도록 주의
   - 리프레시 토큰은 안전하게 저장

## 7. API 할당량

Google People API는 일일 할당량이 있습니다:

- 기본: 1일 10,000 요청
- 필요한 경우 Google Cloud Console에서 할당량 증가 요청 가능

더 자세한 정보는 [Google People API 문서](https://developers.google.com/people)를 참조하세요.
