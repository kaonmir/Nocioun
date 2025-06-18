# @nocioun/core

Google Contacts와 Notion 통합을 위한 핵심 유틸리티 라이브러리입니다.

## 설치

```bash
npm install @nocioun/core
```

## 주요 기능

### Google Contacts

- `PeopleFetcher`: Google People API를 통한 연락처 동기화
- 전체/증분 동기화 지원
- Sync token 관리

### Notion 통합

- `NotionConvertor`: 연락처 데이터를 Notion 페이지로 변환
- 다양한 Notion 속성 타입 지원
- 페이지 생성/수정/삭제 기능

## 사용 예시

```typescript
import { PeopleFetcher, NotionConvertor } from "@nocioun/core";

// Google Contacts 동기화
const fetcher = new PeopleFetcher(peopleClient, repository);
const result = await fetcher.sync();

// Notion 연동
const convertor = new NotionConvertor(notionClient, databaseId);
await convertor.createPage(contactProperties);
```

## 라이센스

MIT
