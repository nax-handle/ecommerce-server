"use client";

import { Container } from "@/components/ui/container";
import { ProductList } from "@/components/product/product-list";
import { BannerSection } from "@/components/home/banner-section";
import { CategoriesBoard } from "@/components/home/categories-board";

export default function HomePage() {
  return (
    <>
      <CategoriesBoard />
      <BannerSection />
      <Container>
        <div className="space-y-10 pb-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold mt-14">Sản phẩm mới nhất</h1>
            <p className="text-muted-foreground">
              Khám phá những sản phẩm mới nhất của chúng tôi
            </p>
          </div>
          <ProductList />
        </div>
      </Container>
    </>
  );
}
