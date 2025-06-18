# nocioun CLI

Google Contacts와 Notion 데이터베이스를 동기화하는 CLI 도구입니다.

## 설치

```bash
# npx로 바로 사용
npx nocioun --help

# 전역 설치
npm install -g nocioun
```

## 사용법

```bash
# Google 인증
nocioun auth google

# Notion 인증
nocioun auth notion

# 연락처 목록 조회
nocioun contacts list

# Google 연락처를 Notion과 동기화
nocioun contacts sync
```

## 설정

CLI는 다음 경로에서 설정 파일을 찾습니다:

- `~/.config/nocioun/config.yaml`
- `~/.config/nocioun/.env`

## 라이센스

MIT
