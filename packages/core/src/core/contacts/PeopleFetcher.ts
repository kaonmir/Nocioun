import { people_v1 } from "googleapis";
import { OAuth2Client } from "googleapis-common";

interface SyncResult {
  people: people_v1.Schema$Person[];
  nextPageToken?: string;
}

interface Repository {
  saveSyncToken(token: string): Promise<void>;
  getSyncToken(): Promise<string | null>;
}

const personFields =
  "addresses,biographies,birthdays,coverPhotos,emailAddresses,events,genders," +
  "memberships,names,nicknames,organizations,phoneNumbers,photos,urls";
// Do Not include : ageRanges,calendarUrls,interests,locations,metadata,occupations,clientData,externalIds,imClients,miscKeywords,relations,sipAddresses,skills,userDefined;

export class PeopleFetcher {
  constructor(
    private readonly peopleClient: people_v1.People,
    private readonly repository: Repository,
    private readonly allowDeleted: boolean = false
  ) {}

  // 전체 동기화 - 모든 페이지를 가져오고 sync token 저장
  async fullSync(pageSize: number = 20): Promise<people_v1.Schema$Person[]> {
    const allPeople: people_v1.Schema$Person[] = [];
    let nextPageToken: string | undefined;
    let syncToken: string | undefined;
    // 첫 번째 요청
    let response = await this.peopleClient.people.connections.list({
      resourceName: "people/me",
      personFields,
      pageSize: pageSize,
      requestSyncToken: true,
    });

    if (response.data.connections) {
      allPeople.push(...response.data.connections);
    }

    nextPageToken = response.data.nextPageToken || undefined;
    syncToken = response.data.nextSyncToken || undefined;

    // 모든 페이지 가져오기
    while (nextPageToken) {
      response = await this.peopleClient.people.connections.list({
        resourceName: "people/me",
        personFields,
        pageSize: pageSize,
        requestSyncToken: true,
        pageToken: nextPageToken,
      });

      if (response.data.connections) {
        allPeople.push(...response.data.connections);
      }

      nextPageToken = response.data.nextPageToken || undefined;
      // 마지막 응답의 sync token을 사용
      if (response.data.nextSyncToken) {
        syncToken = response.data.nextSyncToken;
      }
    }

    // sync token 저장
    if (syncToken) {
      await this.repository.saveSyncToken(syncToken);
    }

    return allPeople;
  }

  // 증분 동기화 - 변경된 연락처만 가져오기
  async incrementalSync(): Promise<{
    people: people_v1.Schema$Person[];
    deletedPeople: people_v1.Schema$Person[];
  }> {
    const savedSyncToken = await this.repository.getSyncToken();
    if (!savedSyncToken) {
      throw new Error(
        "저장된 sync token이 없습니다. 먼저 전체 동기화를 실행하세요."
      );
    }

    try {
      const allChangedPeople: people_v1.Schema$Person[] = [];
      const deletedPeople: people_v1.Schema$Person[] = [];
      let nextPageToken: string | undefined;
      let newSyncToken: string | undefined;

      // 첫 번째 증분 동기화 요청
      let response = await this.peopleClient.people.connections.list({
        resourceName: "people/me",
        personFields,
        syncToken: savedSyncToken,
      });

      this.handlePersons(
        response.data.connections || [],
        allChangedPeople,
        deletedPeople
      );

      nextPageToken = response.data.nextPageToken || undefined;
      newSyncToken = response.data.nextSyncToken || undefined;

      // 모든 페이지 가져오기
      while (nextPageToken) {
        response = await this.peopleClient.people.connections.list({
          resourceName: "people/me",
          personFields,
          syncToken: savedSyncToken,
          pageToken: nextPageToken,
        });

        this.handlePersons(
          response.data.connections || [],
          allChangedPeople,
          deletedPeople
        );

        nextPageToken = response.data.nextPageToken || undefined;
        if (response.data.nextSyncToken) {
          newSyncToken = response.data.nextSyncToken;
        }
      }

      // 새로운 sync token 저장
      if (newSyncToken) {
        await this.repository.saveSyncToken(newSyncToken);
      }

      return {
        people: allChangedPeople,
        deletedPeople: deletedPeople,
      };
    } catch (error: any) {
      // sync token 만료 확인 (HTTP 410 Gone)
      if (error?.status === 410 || this.isSyncTokenExpired(error)) {
        throw new Error("SYNC_TOKEN_EXPIRED");
      }
      throw error;
    }
  }

  // Person 객체들을 처리하여 변경/삭제 구분
  private handlePersons(
    persons: people_v1.Schema$Person[],
    allChangedPeople: people_v1.Schema$Person[],
    deletedPeople: people_v1.Schema$Person[]
  ): void {
    for (const person of persons) {
      if (person.metadata?.deleted && !this.allowDeleted) {
        deletedPeople.push(person);
      } else {
        allChangedPeople.push(person);
      }
    }
  }

  // sync token 만료 확인
  private isSyncTokenExpired(error: any): boolean {
    return (
      error?.message?.includes("EXPIRED_SYNC_TOKEN") ||
      (error?.code === 400 &&
        error?.details?.some(
          (detail: any) => detail.reason === "EXPIRED_SYNC_TOKEN"
        ))
    );
  }

  // 전체 동기화 또는 증분 동기화 자동 선택
  async sync(): Promise<{
    people: people_v1.Schema$Person[];
    deletedPeople: people_v1.Schema$Person[];
    isFullSync: boolean;
  }> {
    try {
      const result = await this.incrementalSync();
      return {
        ...result,
        isFullSync: false,
      };
    } catch (error: any) {
      if (
        error.message === "SYNC_TOKEN_EXPIRED" ||
        !(await this.repository.getSyncToken())
      ) {
        console.log(
          "Sync token이 만료되었거나 없습니다. 전체 동기화를 실행합니다."
        );
        const allPeople = await this.fullSync();
        return {
          people: allPeople,
          deletedPeople: [],
          isFullSync: true,
        };
      }
      throw error;
    }
  }
}
