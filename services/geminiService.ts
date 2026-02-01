
import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Bạn là Chuyên gia Thẩm định Văn bản Hành chính Nhà nước am hiểu tường tận Nghị định 30/2020/NĐ-CP.
Nhiệm vụ của bạn là nhận văn bản đầu vào, rà soát lỗi thể thức và tạo ra một bản thảo hoàn chỉnh chuẩn xác.

BẠN PHẢI TRẢ VỀ KẾT QUẢ DƯỚI DẠNG JSON với 2 trường sau:
1. "auditReport": Một báo cáo chi tiết về các lỗi phát hiện được. Sử dụng Markdown để trình bày đẹp mắt. Liệt kê rõ: Tên lỗi, Vị trí, Hiện trạng, và Quy định đúng của NĐ 30.
2. "correctedDocument": Nội dung văn bản hoàn chỉnh sau khi đã sửa hết các lỗi thể thức. Giữ nguyên nội dung chuyên môn, chỉ sửa kỹ thuật trình bày (Quốc hiệu, Tiêu ngữ, Số hiệu, Địa danh, Ngày tháng, Chữ ký, Nơi nhận...).

TIÊU CHUẨN CỨ TÀI LIỆU NĐ 30:
- Quốc hiệu in hoa đậm, Tiêu ngữ in thường đậm có đường kẻ ngang bằng độ dài dòng chữ.
- Ngày tháng: Ngày < 10 và tháng 1, 2 phải có số 0 phía trước.
- Địa danh: Viết thường, nghiêng.
- Tên loại văn bản: In hoa đậm, cỡ 14.
- Trích yếu: In thường đậm.
- Nơi nhận: "Nơi nhận:" in đậm nghiêng, cỡ 12. Các đơn vị nhận cỡ 11.
- Chức vụ/Họ tên người ký: In hoa đậm.

LƯU Ý: Nếu người dùng gửi file PDF, hãy đọc nội dung bên trong file để thẩm định.
`;

export async function auditDocument(documentText: string, fileData?: { data: string; mimeType: string }) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';

  const parts: any[] = [{ text: documentText || "Thẩm định văn bản đính kèm" }];
  if (fileData) {
    parts.push({
      inlineData: fileData
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            auditReport: { type: Type.STRING, description: "Báo cáo thẩm định lỗi" },
            correctedDocument: { type: Type.STRING, description: "Văn bản đã sửa hoàn chỉnh" }
          },
          required: ["auditReport", "correctedDocument"]
        }
      },
    });

    const json = JSON.parse(response.text || "{}");
    return json;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
