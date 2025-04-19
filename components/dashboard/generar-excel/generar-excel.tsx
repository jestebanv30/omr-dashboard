"use client";

import {
  Estudiante,
  obtenerEstudiantesPorGrado,
} from "@/lib/firebase/estudiantesService";
import {
  obtenerRespuestasCorrectas,
  obtenerTodasLasRespuestasCorrectas,
} from "@/lib/firebase/respuestasService";
import { IconFileSpreadsheet } from "@tabler/icons-react";
import * as React from "react";
import * as XLSX from "xlsx";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function GenerarExcel() {
  const [grados, setGrados] = React.useState<string[]>([]);
  const [seleccionado, setSeleccionado] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [mensaje, setMensaje] = React.useState("");
  const [error, setError] = React.useState("");
  const [cantidadPreguntas, setCantidadPreguntas] = React.useState<
    Record<string, number>
  >({});

  React.useEffect(() => {
    const obtener = async () => {
      try {
        // Cargar cantidad_preguntas.json
        const respCantidad = await fetch("/cantidad_preguntas.json");
        const cantidadPorGrado = await respCantidad.json();
        setCantidadPreguntas(cantidadPorGrado);

        // Obtener respuestas correctas
        const respuestas = await obtenerTodasLasRespuestasCorrectas();

        // Filtrar grados que coincidan con la cantidad de preguntas
        const gradosDisponibles = respuestas
          .filter((r) => {
            const numRespuestas = Object.keys(
              r.respuestas_correctas || {}
            ).length;
            const cantidadEsperada = cantidadPorGrado[r.id!];
            return numRespuestas === cantidadEsperada;
          })
          .map((r) => r.id!)
          .sort();

        setGrados(gradosDisponibles);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los grados disponibles");
      }
    };
    obtener();
  }, []);

  const manejarGeneracion = async () => {
    if (!seleccionado) return;
    setLoading(true);
    setMensaje("Generando archivo Excel...");
    setError("");

    try {
      const respuestasData = await obtenerRespuestasCorrectas(seleccionado);
      if (!respuestasData) {
        throw new Error("No se encontraron respuestas para este grado");
      }

      const respuestasCorrectas = respuestasData.respuestas_correctas;
      const materias = respuestasData.materias;

      const estudiantes: Estudiante[] = await obtenerEstudiantesPorGrado(
        seleccionado
      );
      const cursos = [
        ...new Set(estudiantes.map((e) => e.curso || "SinCurso")),
      ];

      const workbook = XLSX.utils.book_new();

      for (const curso of cursos) {
        const filtrados = estudiantes.filter((e) => e.curso === curso);
        const hojaData: Record<string, string | number>[] = [];

        filtrados.forEach((est) => {
          const fila: Record<string, string | number> = {
            ARCHIVO: est.archivo,
            NOMBRE: est.nombre,
            IDENTIFICACION: est.identificacion,
            INSTITUCION: est.institucion,
            GRADO: est.grado,
            CURSO: est.curso,
          };

          let totalMaterias = 0;
          let sumaPorcentajes = 0;

          Object.entries(materias).forEach(([materia, rango]) => {
            const [inicio, fin] = rango;
            let correctas = 0;
            let total = 0;

            for (let i = inicio; i <= fin; i++) {
              const res = est.respuestas?.[i.toString()];
              const resCorr = respuestasCorrectas[i.toString()];
              if (resCorr && resCorr !== "Anulada") {
                total++;
                if (res === resCorr) correctas++;
              }
            }

            const porcentaje =
              total > 0 ? Math.max((correctas / total) * 100, 30) : 0;
            fila[materia] = Math.round(porcentaje * 100) / 100;

            if (total > 0) {
              totalMaterias++;
              sumaPorcentajes += porcentaje;
            }
          });

          fila["PUNTAJE GLOBAL"] =
            totalMaterias > 0
              ? Math.round((sumaPorcentajes / totalMaterias) * 100) / 100
              : 0;

          hojaData.push(fila);
        });

        const worksheet = XLSX.utils.json_to_sheet(hojaData);

        const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
        for (let R = range.s.r; R <= range.e.r; ++R) {
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
            if (!worksheet[cellRef]) continue;

            worksheet[cellRef].s = {
              border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } },
              },
              font: R === 0 ? { bold: true } : undefined,
            };
          }
        }

        worksheet["!cols"] = hojaData.length
          ? Object.keys(hojaData[0]).map(() => ({ wch: 20 }))
          : [];

        XLSX.utils.book_append_sheet(workbook, worksheet, `CURSO_${curso}`);
      }

      XLSX.writeFile(workbook, `RESULTADOS_GRADO_${seleccionado}.xlsx`);
      setMensaje("Archivo Excel generado exitosamente");
    } catch (err) {
      console.error(err);
      setError("Error al generar el archivo Excel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-foreground">
          Generar Excel por Grado
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Selecciona un grado para generar el archivo Excel con los resultados
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div className="w-full rounded-lg border-2 border-dashed p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <IconFileSpreadsheet className="h-16 w-16 text-muted-foreground" />
            <div className="flex flex-col gap-4">
              <select
                className="w-64 rounded-md border p-2 text-foreground bg-background"
                value={seleccionado}
                onChange={(e) => setSeleccionado(e.target.value)}
              >
                <option value="">Seleccione un grado</option>
                {grados.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <button
                disabled={!seleccionado || loading}
                onClick={manejarGeneracion}
                className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Generando..." : "Generar Excel"}
              </button>
            </div>
          </div>
        </div>

        {mensaje && (
          <div className="w-full rounded-lg border border-green-500 bg-green-500/10 p-4">
            <p className="text-center text-green-500">{mensaje}</p>
          </div>
        )}

        {error && (
          <div className="w-full rounded-lg border border-destructive bg-destructive/10 p-4">
            <p className="text-center text-destructive">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
