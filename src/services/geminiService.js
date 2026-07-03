import { GoogleGenerativeAI } from '@google/generative-ai';

// ⚠️ GIỮ NGUYÊN API_KEY CỦA BẠN
const API_KEY = ''.trim();
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * 🧠 SMART FALLBACK: Thuật toán gợi ý cục bộ khi AI bị lỗi / hết quota
 */
const fallbackRecommendation = (query, products) => {
  let filtered = [...products];
  let reasons = [];
  const q = query.toLowerCase();

  // 1. Lọc theo Category (Dựa trên từ khóa)
  if (q.includes('laptop') || q.includes('computer') || q.includes('macbook')) {
    filtered = filtered.filter(p => p.category?.toLowerCase().includes('laptop'));
    reasons.push("laptops");
  } else if (q.includes('phone') || q.includes('iphone') || q.includes('samsung') || q.includes('mobile')) {
    filtered = filtered.filter(p => p.category?.toLowerCase().includes('smartphone'));
    reasons.push("smartphones");
  } else if (q.includes('perfume') || q.includes('fragrance') || q.includes('scent')) {
    filtered = filtered.filter(p => p.category?.toLowerCase().includes('fragrance'));
    reasons.push("fragrances");
  } else if (q.includes('cream') || q.includes('skincare') || q.includes('beauty') || q.includes('lotion')) {
    filtered = filtered.filter(p => p.category?.toLowerCase().includes('skincare'));
    reasons.push("skincare products");
  } else if (q.includes('shirt') || q.includes('dress') || q.includes('clothes')) {
    filtered = filtered.filter(p => p.category?.toLowerCase().includes('dress') || p.category?.toLowerCase().includes('shirt'));
    reasons.push("clothing");
  }

  // 2. Lọc theo Giá (Ví dụ: "under 50", "below 100", "< 20")
  const priceMatch = q.match(/(under|below|less than|<|budget)\s*\$?(\d+)/);
  if (priceMatch) {
    const maxPrice = parseInt(priceMatch[2]);
    filtered = filtered.filter(p => p.price <= maxPrice);
    reasons.push(`price under $${maxPrice}`);
  }

  // 3. Nếu không có filter cụ thể hoặc filter ra 0 kết quả -> Lấy Top Rated
  if (filtered.length === 0 || filtered.length === products.length) {
    filtered = products.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
    reasons.push("top-rated items across all categories");
  } else {
    // Sắp xếp theo Rating và lấy tối đa 10
    filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
  }

  const explanation = `[Local Smart Search] The AI service is currently over its free limit. I used our smart local algorithm to find the best ${reasons.join(' and ')} matching your request.`;

  return {
    success: true,
    recommendedIds: filtered.map(p => p.id),
    explanation: explanation,
    isFallback: true, // Đánh dấu để UI biết đang dùng Fallback
  };
};

export const geminiService = {
  recommendProducts: async (userQuery, availableProducts) => {
    try {
      // 🔄 Thử dùng model gemini-1.5, vì gemini-1.5-flash-8b không được hỗ trợ cho generateContent trên phiên bản v1beta
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const productsSummary = availableProducts.map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        category: p.category,
        brand: p.brand,
        rating: p.rating,
      }));

      const prompt = `You are a helpful e-commerce product recommendation assistant.
USER QUERY: "${userQuery}"
AVAILABLE PRODUCTS (${availableProducts.length} items):
${JSON.stringify(productsSummary, null, 2)}

TASK: Recommend the most suitable products based on the user's query.
RESPONSE FORMAT (JSON ONLY):
{
  "recommendedIds": [array of product IDs, max 10],
  "explanation": "brief explanation"
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let jsonText = text;
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) jsonText = jsonMatch[1] || jsonMatch[0];

      const parsed = JSON.parse(jsonText);

      return {
        success: true,
        recommendedIds: parsed.recommendedIds || [],
        explanation: parsed.explanation || 'Here are the best matches for you.',
        isFallback: false,
      };
    } catch (error) {
      // 🚨 BẮT LỖI API VÀ KÍCH HOẠT FALLBACK
      console.warn('⚠️ Gemini API failed, switching to Smart Local Fallback:', error.message);
      return fallbackRecommendation(userQuery, availableProducts);
    }
  },
};