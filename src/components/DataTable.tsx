
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface Column {
  key: string;
  header: string;
  cell?: (item: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  actions?: (item: any) => React.ReactNode;
  isLoading?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({ data, columns, actions, isLoading = false }) => {
  const renderCell = (item: any, column: Column) => {
    if (column.cell) {
      return column.cell(item);
    }
    
    return item[column.key];
  };
  
  if (isLoading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.header}</TableHead>
              ))}
              {actions && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
  
  if (data.length === 0) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.header}</TableHead>
              ))}
              {actions && <TableHead />}
            </TableRow>
          </TableHeader>
        </Table>
        <div className="text-center p-8 text-gray-500">
          Aucune donnée disponible
        </div>
      </div>
    );
  }
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.header}</TableHead>
            ))}
            {actions && <TableHead />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {renderCell(item, column)}
                </TableCell>
              ))}
              {actions && (
                <TableCell className="text-right">{actions(item)}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;
