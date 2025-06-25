import { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";

export const metadata: Metadata = {
  title: "Hồ sơ của tôi",
  description: "Quản lý thông tin hồ sơ để bảo mật tài khoản",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container>
      <div className="mx-auto max-w-7xl py-10">
        <div className="flex flex-col gap-8 md:flex-row">
          <aside className="md:w-64">
            <ProfileSidebar />
          </aside>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </Container>
  );
}
