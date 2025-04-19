"use client";

import { IconChevronRight } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  agruparPorGrado,
  Estudiante,
  obtenerCursosPorGrado,
  obtenerEstudiantesPorCurso,
} from "@/lib/firebase/estudiantesService";
import { DataTableEstudiantes } from "./data-table-estudiantes";

export function SectionCards() {
  const [grados, setGrados] = useState<string[]>([]);
  const [cursos, setCursos] = useState<string[]>([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState<string>("");
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string>("");
  const [mostrarGrados, setMostrarGrados] = useState(true);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);

  useEffect(() => {
    const cargarGrados = async () => {
      try {
        const gradosData = await agruparPorGrado();
        console.log("Grados obtenidos:", gradosData); // Para debug

        // Filtrar grados vacíos y undefined/null
        const gradosConCursos = gradosData.filter(
          (grado) => grado && typeof grado === "string" && grado.trim() !== ""
        );

        console.log("Grados filtrados:", gradosConCursos); // Para debug
        setGrados(gradosConCursos);
      } catch (error) {
        console.error("Error al cargar grados:", error);
      }
    };
    cargarGrados();
  }, []);

  const handleGradoClick = async (grado: string) => {
    setGradoSeleccionado(grado);
    const cursosData = await obtenerCursosPorGrado(grado);
    setCursos(cursosData);
    setMostrarGrados(false);
    setCursoSeleccionado("");
    setEstudiantes([]);
  };

  const handleCursoClick = async (curso: string) => {
    setCursoSeleccionado(curso);
    const estudiantesData = await obtenerEstudiantesPorCurso(
      gradoSeleccionado,
      curso
    );
    setEstudiantes(estudiantesData);
  };

  const volverAGrados = () => {
    setMostrarGrados(true);
    setGradoSeleccionado("");
    setCursoSeleccionado("");
    setCursos([]);
    setEstudiantes([]);
  };

  const volverAGrado = async () => {
    const cursosData = await obtenerCursosPorGrado(gradoSeleccionado);
    setCursos(cursosData);
    setCursoSeleccionado("");
    setEstudiantes([]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 px-4 text-sm text-muted-foreground">
        <span
          className="cursor-pointer hover:text-foreground"
          onClick={volverAGrados}
        >
          Grados
        </span>
        {gradoSeleccionado && (
          <>
            <IconChevronRight className="size-4" />
            <span
              className="cursor-pointer hover:text-foreground"
              onClick={volverAGrado}
            >
              Grado {gradoSeleccionado}
            </span>
          </>
        )}
        {cursoSeleccionado && (
          <>
            <IconChevronRight className="size-4" />
            <span>Curso {cursoSeleccionado}</span>
          </>
        )}
      </div>

      {mostrarGrados && (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          {grados.map((grado) => (
            <Card
              key={grado}
              className="@container/card cursor-pointer hover:bg-accent/50"
              onClick={() => handleGradoClick(grado)}
            >
              <CardHeader>
                <CardDescription>Grado</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {grado}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <IconChevronRight />
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="text-muted-foreground">
                  Haz clic para ver los cursos
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!mostrarGrados &&
        gradoSeleccionado &&
        cursos.length > 0 &&
        !cursoSeleccionado && (
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {cursos.map((curso) => (
              <Card
                key={curso}
                className="@container/card cursor-pointer hover:bg-accent/50"
                onClick={() => handleCursoClick(curso)}
              >
                <CardHeader>
                  <CardDescription>Curso</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {curso}
                  </CardTitle>
                  <CardAction>
                    <Badge variant="outline">
                      <IconChevronRight />
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                  <div className="text-muted-foreground">
                    Curso del grado {gradoSeleccionado}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

      {cursoSeleccionado && estudiantes.length > 0 && (
        <div className="px-4">
          <DataTableEstudiantes
            grado={gradoSeleccionado}
            curso={cursoSeleccionado}
          />
        </div>
      )}
    </div>
  );
}
