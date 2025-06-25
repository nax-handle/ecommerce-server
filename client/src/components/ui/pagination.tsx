"use client";

import ReactPaginate from "react-paginate";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  pageCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  pageCount,
  currentPage,
  onPageChange,
  className = "",
}: PaginationProps) {
  return (
    <ReactPaginate
      pageCount={pageCount}
      pageRangeDisplayed={5}
      marginPagesDisplayed={2}
      forcePage={currentPage - 1}
      onPageChange={(selectedItem) => onPageChange(selectedItem.selected + 1)}
      containerClassName={`flex items-center justify-center gap-2 ${className}`}
      pageClassName="px-3 py-1 rounded-md hover:bg-gray-100"
      activeClassName="bg-blue-600 text-white hover:bg-blue-700"
      previousClassName="px-3 py-1 rounded-md hover:bg-gray-100 flex items-center gap-1"
      nextClassName="px-3 py-1 rounded-md hover:bg-gray-100 flex items-center gap-1"
      disabledClassName="opacity-50 cursor-not-allowed"
      previousLabel={
        <>
          <ChevronLeft className="w-4 h-4" />
        </>
      }
      nextLabel={
        <>
          <ChevronRight className="w-4 h-4" />
        </>
      }
    />
  );
}
