"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Search } from "lucide-react"

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[],
  searchKey: string,
  title: string // Add this new prop
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  title
}: DataTableProps<TData, TValue>) {

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    }
  })

  return (

    <Card className="overflow-hidden bg-[#EAEAEB] dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60">

      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center py-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search..."
                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                onChange={event => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
                className="pl-10 pr-4 py-2 w-full border-2 border-[#C9121F] dark:border-[#C9121F] rounded-full focus:outline-none focus:border-red-700 dark:focus:border-red-600 transition-all duration-300"
              />
            </div>
          </div>
          <div className="rounded-lg overflow-hidden border border-[#C9121F] dark:border-[#C9121F]">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-[#EAEAEB] dark:bg-[#1A1617]">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="text-[#C9121F] dark:text-[#C9121F] font-semibold">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="text-black dark:text-white">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500 dark:text-gray-400">
                      No results found 😢
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end py-4 space-x-2">
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="bg-[#EAEAEB] text-[#C9121F] hover:bg-gray-200 dark:bg-[#1A1617] dark:text-[#C9121F] dark:hover:bg-gray-800 transition-colors duration-200"
            >
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="bg-[#EAEAEB] text-[#C9121F] hover:bg-gray-200 dark:bg-[#1A1617] dark:text-[#C9121F] dark:hover:bg-gray-800 transition-colors duration-200"
            >
              Next
            </Button>
          </div>
        </motion.div>
      </CardContent>
    </Card>

  )
}