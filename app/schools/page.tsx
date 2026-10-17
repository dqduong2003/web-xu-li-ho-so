import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listReferenceSchools } from "@/lib/schools";

export default async function SchoolsPage() {
  const schools = await listReferenceSchools();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <h1 className="text-2xl font-medium tracking-tight">Điểm chuẩn các trường</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Điểm học tập và IELTS tối thiểu để đủ điều kiện xét hồ sơ tại từng trường. Nộp giấy tờ ở{" "}
          <Link href="/portal" className="underline">
            cổng hồ sơ
          </Link>{" "}
          để tự động đối chiếu với điểm của bạn.
        </p>

        <Card className="mt-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên trường</TableHead>
                <TableHead>Quốc gia</TableHead>
                <TableHead>Điểm học tập tối thiểu</TableHead>
                <TableHead>IELTS tối thiểu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Chưa có dữ liệu trường tham chiếu.
                  </TableCell>
                </TableRow>
              )}
              {schools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium">{school.name}</TableCell>
                  <TableCell>{school.country}</TableCell>
                  <TableCell>{school.minGpa.toFixed(1)}</TableCell>
                  <TableCell>{school.minIelts.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
