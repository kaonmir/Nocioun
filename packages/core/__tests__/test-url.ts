const { getPlaceInfo } = require("../map/map.ts");

async function testUrl() {
  const url = "https://kko.kakao.com/AjJAlfhjTp";
  console.log("🔍 Analyzing URL:", url);
  console.log("");

  try {
    const result = await getPlaceInfo(url);

    console.log("✅ SUCCESS!");
    console.log("📍 장소명:", result.summary?.name || "Unknown");
    console.log("🏠 주소:", result.summary?.address?.disp || "Unknown");
    console.log(
      "📞 전화번호:",
      result.summary?.phone_numbers?.[0]?.tel || "Unknown"
    );
    console.log("🏷️ 카테고리:", result.summary?.category?.name || "Unknown");
    console.log("🌐 홈페이지:", result.summary?.homepages?.[0] || "Unknown");
    console.log("");
    console.log(
      "🕒 운영시간 상태:",
      result.business_hours?.real_time_info?.business_hours_status
        ?.display_text || "Unknown"
    );
    console.log(
      "⭐ 리뷰 수:",
      result.kakaomap_review?.score_set?.review_count || 0
    );
    console.log(
      "📊 평점:",
      result.kakaomap_review?.score_set?.average_score || "N/A"
    );
    console.log("");
    console.log(
      "🗺️ 좌표:",
      `${result.summary?.point?.lat || "N/A"}, ${
        result.summary?.point?.lon || "N/A"
      }`
    );
  } catch (error) {
    console.log("❌ ERROR:", error.message);
  }
}

testUrl();
