import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <h1 className="text-2xl font-medium tracking-tight">Chính sách quyền riêng tư</h1>
        <p className="mt-2 text-sm text-muted-foreground">Cập nhật lần cuối: 31/10/2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-foreground">
          <section className="space-y-2">
            <p>
              DuHoc24 tôn trọng quyền riêng tư của bạn. Trang này giải thích ngắn gọn chúng tôi thu
              thập những thông tin gì, dùng để làm gì, lưu ở đâu, và cách bạn liên hệ nếu muốn xoá
              dữ liệu của mình.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Thông tin chúng tôi thu thập</h2>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <span className="text-foreground">Khi đăng nhập bằng Google:</span> email và họ tên
                lấy từ tài khoản Google của bạn.
              </li>
              <li>
                <span className="text-foreground">Khi điền form báo giá:</span> họ tên, email, số
                điện thoại, quốc gia muốn du học, bậc học và gói dịch vụ bạn quan tâm.
              </li>
              <li>
                <span className="text-foreground">Khi nộp hồ sơ tại Cổng hồ sơ:</span> các file giấy
                tờ bạn tải lên (bảng điểm, chứng chỉ IELTS, CMND/CCCD hoặc hộ chiếu) và thông tin
                được trích xuất từ các giấy tờ đó (họ tên, ngày sinh, điểm học tập, điểm IELTS, số
                giấy tờ).
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium">Chúng tôi dùng thông tin này để làm gì</h2>
            <p className="text-muted-foreground">
              Thông tin của bạn chỉ được dùng để xử lý hồ sơ du học: đối chiếu điểm học tập/IELTS
              với điểm chuẩn từng trường, tư vấn chọn trường và gói dịch vụ phù hợp, liên hệ gửi báo
              giá, và gợi ý học bổng phù hợp. Chúng tôi không dùng dữ liệu của bạn cho mục đích
              khác và không bán, cho thuê dữ liệu cho bên thứ ba.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium">Dữ liệu được lưu ở đâu</h2>
            <p className="text-muted-foreground">
              Toàn bộ dữ liệu (thông tin cá nhân, file giấy tờ đã tải lên) được lưu trên Supabase.
              Các bảng và kho lưu trữ chứa dữ liệu riêng tư của bạn được thiết lập quyền truy cập
              (Row Level Security) sao cho chỉ hệ thống máy chủ của DuHoc24 mới đọc và ghi được —
              trình duyệt của bạn hoặc bất kỳ ai khác không thể truy cập trực tiếp.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium">Quyền của bạn</h2>
            <p className="text-muted-foreground">
              Bạn có thể yêu cầu xem, chỉnh sửa hoặc xoá dữ liệu cá nhân của mình bất cứ lúc nào
              bằng cách liên hệ qua email{" "}
              <a href="mailto:hotro@duhoc24.vn" className="text-primary underline underline-offset-4">
                hotro@duhoc24.vn
              </a>
              . Chúng tôi sẽ phản hồi và xử lý yêu cầu trong thời gian sớm nhất.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
