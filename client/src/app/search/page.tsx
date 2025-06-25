"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/components/product/product-filters";
import { useSearchProducts } from "@/lib/services/product";
import type { Product } from "@/lib/services/product";
import { Pagination } from "@/components/ui/pagination";
import { Loader2 } from "lucide-react";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [sortOption, setSortOption] = useState<"price-asc" | "price-desc">(
    searchParams.get("sortByPrice") === "desc" ? "price-desc" : "price-asc"
  );
  const [filters, setFilters] = useState<{
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
  }>({
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    rating: searchParams.get("rating")
      ? Number(searchParams.get("rating"))
      : undefined,
  });

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (filters.minPrice !== undefined) {
      params.set("minPrice", filters.minPrice.toString());
    } else {
      params.delete("minPrice");
    }

    if (filters.maxPrice !== undefined) {
      params.set("maxPrice", filters.maxPrice.toString());
    } else {
      params.delete("maxPrice");
    }

    if (filters.rating !== undefined) {
      params.set("rating", filters.rating.toString());
    } else {
      params.delete("rating");
    }

    params.set("sortByPrice", sortOption === "price-asc" ? "asc" : "desc");
    params.set("page", currentPage.toString());

    const search = params.toString();
    const query = search ? `?${search}` : "";

    router.push(`/search${query}`, { scroll: false });
  }, [filters, sortOption, currentPage, router, searchParams]);

  const { data: searchResults, isLoading } = useSearchProducts({
    keyword: searchParams.get("keyword") || "",
    sortByPrice: sortOption === "price-asc" ? "asc" : "desc",
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    rating: filters.rating,
    page: currentPage,
  });

  const handleFilterChange = (newFilters: {
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
  }) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Container className="py-10">
      <div className="grid grid-cols-4 gap-6">
        <div className="space-y-4">
          <ProductFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        <div className="col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {searchResults?.data.total || 0} sản phẩm
            </p>
            <Select
              value={sortOption}
              onValueChange={(value: "price-asc" | "price-desc") =>
                setSortOption(value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-asc">Giá tăng dần</SelectItem>
                <SelectItem value="price-desc">Giá giảm dần</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults?.data.products.map((product: Product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {searchResults?.data.products.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500">
                    Không tìm thấy sản phẩm phù hợp với bộ lọc
                  </p>
                </div>
              )}

              {searchResults && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    currentPage={currentPage}
                    pageCount={searchResults.data.totalPage}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Container>
  );
}
