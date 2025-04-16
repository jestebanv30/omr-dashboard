"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  Table as TableType,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  eliminarEstudiante,
  marcarEstudianteComoListo,
  obtenerEstudiantesPorCurso,
} from "@/lib/firebase/estudiantesService";
import {
  IconChevronDown,
  IconDotsVertical,
  IconEdit,
  IconLayoutColumns,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AgregarEstudianteForm } from "./agregar-estudiante";
import { EditEstudianteForm } from "./edit-estudiante";

interface TableMeta {
  updateData: (data: Estudiante[]) => void;
}

export const estudianteSchema = z.object({
  secuencialId: z.number(),
  archivo: z.string(),
  nombre: z.string(),
  identificacion: z.string(),
  institucion: z.string(),
  grado: z.string(),
  curso: z.string(),
  respuestas: z.record(z.string()),
  listo: z.boolean().optional(),
});

type Estudiante = z.infer<typeof estudianteSchema>;

const ActionCell = ({
  row,
  table,
}: {
  row: Row<Estudiante>;
  table: TableType<Estudiante>;
}) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const estudiante = row.original;

  const handleDelete = async () => {
    try {
      const success = await eliminarEstudiante(estudiante.secuencialId);
      if (success) {
        toast.success("Estudiante eliminado correctamente");
        const datos = await obtenerEstudiantesPorCurso(
          estudiante.grado,
          estudiante.curso
        );
        (table.options.meta as TableMeta)?.updateData(datos);
      } else {
        toast.error("Error al eliminar estudiante");
      }
    } catch (error) {
      console.error("Error al eliminar estudiante:", error);
      toast.error("Error al eliminar estudiante");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditForm(true)}>
            <IconEdit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
            <IconTrash className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showEditForm && (
        <EditEstudianteForm
          estudiante={estudiante}
          onClose={() => {
            setShowEditForm(false);
            obtenerEstudiantesPorCurso(estudiante.grado, estudiante.curso).then(
              (datos) => {
                (table.options.meta as TableMeta)?.updateData(datos);
              }
            );
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        />
      )}
    </>
  );
};

const columns: ColumnDef<Estudiante>[] = [
  {
    id: "select",
    header: "Listo",
    cell: ({ row, table }) => {
      const estudiante = row.original;
      return (
        <Checkbox
          checked={estudiante.listo || false}
          onCheckedChange={async (value) => {
            await marcarEstudianteComoListo(estudiante.secuencialId, !!value);
            const datos = await obtenerEstudiantesPorCurso(
              estudiante.grado,
              estudiante.curso
            );
            (table.options.meta as TableMeta)?.updateData(datos);
          }}
          aria-label="Marcar como listo"
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "secuencialId",
    header: "ID",
  },
  {
    accessorKey: "archivo",
    header: "Archivo",
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "identificacion",
    header: "Identificación",
  },
  {
    accessorKey: "institucion",
    header: "Institución",
  },
  {
    accessorKey: "grado",
    header: "Grado",
  },
  {
    accessorKey: "curso",
    header: "Curso",
  },
  {
    id: "actions",
    cell: ActionCell,
  },
];

export function DataTableEstudiantes({
  grado,
  curso,
}: {
  grado: string;
  curso: string;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [showAgregarForm, setShowAgregarForm] = useState(false);

  useEffect(() => {
    const cargarEstudiantes = async () => {
      const datos = await obtenerEstudiantesPorCurso(grado, curso);
      setEstudiantes([...datos]);
    };
    cargarEstudiantes();
  }, [grado, curso]);

  const table = useReactTable({
    data: estudiantes,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      updateData: (data: Estudiante[]) => {
        setEstudiantes([...data]);
      },
    },
  });

  const totalListos = estudiantes.filter((e) => e.listo).length;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filtrar estudiantes..."
          value={(table.getColumn("nombre")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("nombre")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="text-muted-foreground text-sm flex flex-col items-end space-y-1 mx-4">
          <p>Total de estudiantes: {estudiantes.length}</p>
          <p>Listos: {totalListos}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAgregarForm(true)}>
            <IconPlus className="mr-2 h-4 w-4" />
            Agregar Estudiante
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <IconLayoutColumns className="mr-2 h-4 w-4" />
                Columnas
                <IconChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
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
                  className={row.original.listo ? "bg-green-900/40" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>

      {showAgregarForm && (
        <AgregarEstudianteForm
          grado={grado}
          curso={curso}
          onClose={() => {
            setShowAgregarForm(false);
            obtenerEstudiantesPorCurso(grado, curso).then((datos) => {
              setEstudiantes([...datos]);
            });
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        />
      )}
    </div>
  );
}
