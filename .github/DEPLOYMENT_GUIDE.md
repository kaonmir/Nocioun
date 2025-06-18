# 배포 설정 가이드

이 문서는 `google-contacts-cli` (nocioun) 프로젝트의 자동 배포를 설정하는 방법을 설명합니다.

## 필수 설정

### 1. NPM 토큰 생성

1. [npmjs.com](https://www.npmjs.com)에 로그인
2. 프로필 → Access Tokens → Generate New Token
3. Token Type: "Automation" 선택
4. 생성된 토큰 복사

### 2. GitHub Secrets 설정

GitHub 저장소 설정에서 다음 secrets를 추가:

1. 저장소 → Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. 다음 secret 추가:
   - **Name**: `NPM_TOKEN`
   - **Value**: 위에서 생성한 npm 토큰

## 배포 방법

### 자동 배포 (태그 기반)

```bash
# 새 버전 태그 생성 및 푸시
git tag v1.0.1
git push origin v1.0.1
```

태그를 푸시하면 자동으로:

1. 테스트 실행
2. 빌드 수행
3. npm에 패키지 배포
4. GitHub Release 생성

### 수동 배포

1. GitHub 저장소의 "Actions" 탭으로 이동
2. "Manual Release" 워크플로우 선택
3. "Run workflow" 버튼 클릭
4. 옵션 선택:
   - **Version**: 구체적인 버전 번호 (예: 1.0.1)
   - **Release Type**: patch/minor/major
5. "Run workflow" 실행

## 워크플로우 설명

### CI 워크플로우 (`ci.yml`)

- **트리거**: 모든 push 및 PR
- **작업**: 테스트, 빌드, CLI 실행 테스트
- **Node.js 버전**: 18.x, 20.x

### 릴리스 워크플로우 (`release.yml`)

- **트리거**: `v*` 태그 푸시
- **작업**: 테스트, 빌드, npm 배포, GitHub Release 생성

### 수동 릴리스 워크플로우 (`manual-release.yml`)

- **트리거**: 수동 실행
- **작업**: 버전 업데이트, 태그 생성, npm 배포, GitHub Release 생성

## 배포 후 확인

배포가 완료되면 다음과 같이 확인할 수 있습니다:

```bash
# 최신 버전으로 실행
npx google-contacts-cli@latest --help
npx nocioun@latest --help

# 특정 버전으로 실행
npx google-contacts-cli@1.0.1 --help
npx nocioun@1.0.1 --help
```

## 문제 해결

### 배포 실패 시

1. GitHub Actions 로그 확인
2. NPM_TOKEN이 올바르게 설정되었는지 확인
3. package.json의 버전이 이미 존재하는지 확인

### 권한 오류

- NPM_TOKEN이 "Automation" 타입인지 확인
- 토큰이 패키지 배포 권한을 가지고 있는지 확인

## 버전 관리 전략

이 프로젝트는 [Semantic Versioning](https://semver.org/)을 따릅니다:

- **MAJOR**: 호환되지 않는 API 변경
- **MINOR**: 기능 추가 (하위 호환)
- **PATCH**: 버그 수정 (하위 호환)

예시:

- `1.0.0` → `1.0.1` (패치)
- `1.0.1` → `1.1.0` (마이너)
- `1.1.0` → `2.0.0` (메이저)
