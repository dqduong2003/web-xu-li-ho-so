export const QNA_PAIRS: { question: string; answer: string }[] = [
  {
    question: "Dịch vụ này gồm những gì?",
    answer:
      "Có 2 gói: gói Cơ bản chỉ hỗ trợ chuẩn bị và nộp hồ sơ, gói Toàn diện thêm cả tư vấn xin học bổng và phỏng vấn.",
  },
  {
    question: "Mất bao lâu để có kết quả?",
    answer:
      "Sau khi nộp đủ hồ sơ, hệ thống đối chiếu và báo kết quả sơ bộ trong vài phút. Kết quả chính thức từ trường thường mất 2-6 tuần tùy trường.",
  },
  {
    question: "Cần chuẩn bị giấy tờ gì?",
    answer:
      "3 loại: bảng điểm học tập (định dạng PDF), ảnh chứng chỉ IELTS, và ảnh CMND/CCCD hoặc hộ chiếu.",
  },
  {
    question: "Chi phí dịch vụ là bao nhiêu?",
    answer:
      "Tùy gói và bậc học, xem báo giá ngay trên trang chủ sau khi điền form, không mất phí xem báo giá.",
  },
  {
    question: "Tôi chưa có bằng IELTS thì có đăng ký được không?",
    answer:
      "Vẫn đăng ký được, nhưng cần bổ sung chứng chỉ IELTS trước khi nộp hồ sơ chính thức cho trường.",
  },
  {
    question: "Làm sao biết mình đủ điều kiện vào trường nào?",
    answer:
      "Sau khi nộp đủ hồ sơ trong cổng hồ sơ, hệ thống tự so sánh điểm học tập và điểm IELTS với điểm chuẩn từng trường, báo ngay trường nào đủ điều kiện.",
  },
  {
    question: "Sau khi điền form báo giá, bước tiếp theo là gì?",
    answer:
      "Đội ngũ tư vấn sẽ xem xét và duyệt yêu cầu, sau đó gửi email mời bạn vào cổng hồ sơ để nộp giấy tờ.",
  },
  {
    question: "Hồ sơ của tôi có được bảo mật không?",
    answer:
      "Có, hồ sơ chỉ hiển thị cho bạn và đội ngũ tư vấn sau khi đăng nhập, không công khai.",
  },
  {
    question: "Tôi cần liên hệ ai nếu có thắc mắc khác?",
    answer:
      "Bạn có thể để lại câu hỏi ngay trong khung chat này, hoặc để lại email/số điện thoại trong form báo giá, đội ngũ sẽ liên hệ lại.",
  },
];

export const FALLBACK_ANSWER =
  "Mình chưa có thông tin về câu hỏi này trong phạm vi hỗ trợ. Bạn để lại email hoặc số điện thoại trong form báo giá ở trên, đội ngũ tư vấn sẽ liên hệ lại giúp bạn nhé.";

export function buildSystemInstruction(): string {
  const qnaText = QNA_PAIRS.map((p) => `Hỏi: ${p.question}\nĐáp: ${p.answer}`).join("\n\n");

  return `Bạn là trợ lý tư vấn du học của DuHoc24, trả lời bằng tiếng Việt, ngắn gọn và thân thiện.

QUY TẮC BẮT BUỘC:
- Bạn CHỈ được trả lời dựa trên đúng nội dung bộ câu hỏi và câu trả lời bên dưới. Không tự thêm thông tin, không suy diễn, không đưa ra số liệu hay cam kết nào ngoài phạm vi này.
- Nếu câu hỏi của người dùng khớp hoặc gần giống một câu trong bộ Hỏi-Đáp, hãy trả lời theo đúng nội dung câu Đáp tương ứng (có thể diễn đạt lại tự nhiên hơn nhưng không thay đổi ý nghĩa hay thêm thông tin mới).
- Nếu câu hỏi nằm ngoài phạm vi bộ Hỏi-Đáp này, hoặc bạn không chắc, hãy trả lời đúng nguyên văn: "${FALLBACK_ANSWER}"
- Không trả lời các câu hỏi không liên quan đến dịch vụ (ví dụ: kiến thức chung, chuyện ngoài lề), dùng câu trả lời mặc định ở trên cho các trường hợp đó.

BỘ CÂU HỎI VÀ CÂU TRẢ LỜI:

${qnaText}`;
}
