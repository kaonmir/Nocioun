import { Mapper, CreateFieldMap } from "../mapper";
import { KakaoMapService } from "./place.service";
import result from "../data/result.json";

// 카카오맵 액션의 필드 정의
export const MAP_MAPPING_FIELDS = [
  {
    key: "name",
    name: "장소명",
    description: "카카오맵에서 가져온 장소의 이름",
    propertyType: "title",
    defaultPropertyName: "장소명",
  },
  {
    key: "address",
    name: "주소",
    description: "장소의 전체 주소 정보",
    propertyType: "rich_text",
    defaultPropertyName: "주소",
  },
  {
    key: "phone",
    name: "전화번호",
    description: "장소의 연락처 정보",
    propertyType: "phone_number",
    defaultPropertyName: "전화번호",
  },
  {
    key: "category",
    name: "카테고리",
    description: "장소의 업종/카테고리",
    propertyType: "select",
    defaultPropertyName: "카테고리",
  },
  {
    key: "url",
    name: "카카오맵 URL",
    description: "카카오맵에서의 장소 링크",
    propertyType: "url",
    defaultPropertyName: "카카오맵 URL",
  },
  {
    key: "rating",
    name: "평점",
    description: "장소의 평점 정보",
    propertyType: "number",
    defaultPropertyName: "평점",
  },
] as const;

type Place = typeof result;

type PlaceDataKey = (typeof MAP_MAPPING_FIELDS)[number]["key"];
export type PlaceData = Record<
  PlaceDataKey,
  string | number | null | undefined
>;

export class PlaceMapper extends Mapper {
  private constructor(private readonly place: Place) {
    super([...MAP_MAPPING_FIELDS]);
  }

  static async create(
    url: string,
    fetchFn: (url: string, init?: RequestInit) => Promise<Response> = fetch
  ) {
    const kakaoMapService = new KakaoMapService(fetchFn);
    const place = await kakaoMapService.getPlaceInfo(url);
    return new PlaceMapper(place);
  }

  public async getData() {
    return {
      name: this.place.summary?.name || null,
      address: this.place.summary?.address?.disp || null,
      phone: this.place.summary?.phone_numbers?.[0]?.tel || null,
      category: this.place.summary?.category?.name || null,
      url: this.place.summary?.homepages?.[0] || null,
      rating: this.place.kakaomap_review?.score_set?.average_score || null,
    };
  }
}
