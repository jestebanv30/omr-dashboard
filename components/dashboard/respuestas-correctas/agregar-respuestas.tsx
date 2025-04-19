"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  guardarRespuestasCorrectas,
  obtenerRespuestasCorrectas,
} from "@/lib/firebase/respuestasService";
import { cn } from "@/lib/utils";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

interface AgregarRespuestasFormProps extends React.ComponentProps<"div"> {
  onClose?: () => void;
  grado?: string;
}

interface Materia {
  nombre: string;
  inicio: number;
  fin: number;
}

export function AgregarRespuestasForm({
  className,
  onClose,
  grado,
  ...props
}: AgregarRespuestasFormProps) {
  const [formData, setFormData] = useState<{
    grado: string;
    respuestas_correctas: Record<string, string>;
    materias: Record<string, number[]>;
  }>({
    grado: grado || "",
    respuestas_correctas: {},
    materias: {},
  });

  const [materias, setMaterias] = useState<Materia[]>([
    { nombre: "", inicio: 0, fin: 0 },
  ]);
  const [showDialog, setShowDialog] = useState(false);
  const [totalPreguntas, setTotalPreguntas] = useState(0);
  const [respuestasExistentes, setRespuestasExistentes] = useState<
    Record<string, string>
  >({});
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cargarDatos = async () => {
        setCargando(true);
        try {
          // Cargar cantidad de preguntas
          const response = await fetch("/cantidad_preguntas.json");
          const data = await response.json();
          if (grado && data[grado]) {
            setTotalPreguntas(data[grado]);
          }

          // Cargar respuestas existentes
          if (grado) {
            const respuestasActuales = await obtenerRespuestasCorrectas(grado);
            if (respuestasActuales) {
              setRespuestasExistentes(
                respuestasActuales.respuestas_correctas || {}
              );
              setFormData((prev) => ({
                ...prev,
                respuestas_correctas:
                  respuestasActuales.respuestas_correctas || {},
                materias: respuestasActuales.materias || {},
              }));

              // Convertir materias a formato de edición
              const materiasArray = Object.entries(
                respuestasActuales.materias || {}
              ).map(([nombre, [inicio, fin]]) => ({
                nombre: nombre.replace(/_/g, " "),
                inicio,
                fin,
              }));
              setMaterias(
                materiasArray.length
                  ? materiasArray
                  : [{ nombre: "", inicio: 0, fin: 0 }]
              );
            }
          }
        } catch (error) {
          console.error("Error al cargar datos:", error);
          toast.error("Error al cargar datos existentes");
        } finally {
          setCargando(false);
        }
      };

      cargarDatos();
    }
  }, [grado]);

  // Crear array de preguntas basado en el total
  const respuestasArray = Array.from({ length: totalPreguntas }, (_, i) => {
    const pregunta = (i + 1).toString();
    return [pregunta, formData.respuestas_correctas?.[pregunta] || ""];
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowDialog(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      // Convertir materias al formato requerido
      const materiasFormateadas = materias.reduce((acc, materia) => {
        if (materia.nombre && materia.inicio && materia.fin) {
          // Convertir espacios a guiones bajos y poner en mayúsculas
          const nombreFormateado = materia.nombre
            .trim()
            .toUpperCase()
            .replace(/ /g, "_");
          acc[nombreFormateado] = [materia.inicio, materia.fin];
        }
        return acc;
      }, {} as Record<string, number[]>);

      await guardarRespuestasCorrectas(
        formData.grado,
        formData.respuestas_correctas,
        materiasFormateadas
      );
      toast.success("Respuestas guardadas correctamente");
      onClose?.();
    } catch (error) {
      console.error("Error al guardar respuestas:", error);
      toast.error("Error al guardar respuestas");
    }
  };

  const handleRespuestaChange = (pregunta: string, respuesta: string) => {
    setFormData((prev) => ({
      ...prev,
      respuestas_correctas: {
        ...prev.respuestas_correctas,
        [pregunta]: respuesta.toUpperCase(),
      },
    }));
  };

  const handleMateriaChange = (
    index: number,
    field: keyof Materia,
    value: string | number
  ) => {
    const nuevasMaterias = [...materias];
    nuevasMaterias[index] = {
      ...nuevasMaterias[index],
      [field]: field === "nombre" ? value : Number(value),
    };
    setMaterias(nuevasMaterias);
  };

  const agregarMateria = () => {
    setMaterias([...materias, { nombre: "", inicio: 0, fin: 0 }]);
  };

  const eliminarMateria = (index: number) => {
    if (materias.length > 1) {
      setMaterias(materias.filter((_, i) => i !== index));
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Cargando respuestas existentes...</p>
      </div>
    );
  }

  const respuestasCompletadas = Object.keys(respuestasExistentes).length;

  return (
    <div
      className={cn(
        "flex flex-col gap-6 overflow-y-auto h-full md:h-auto p-4 md:p-0",
        className
      )}
      {...props}
    >
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar registro?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas guardar estas respuestas correctas?
              Esta acción actualizará las respuestas existentes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="max-w-7xl mx-auto w-full">
        <CardHeader>
          <CardTitle>Agregar Respuestas Correctas</CardTitle>
          <CardDescription>
            Ingresa las respuestas correctas para el grado {grado}
            {respuestasCompletadas > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                Ya hay {respuestasCompletadas} respuestas guardadas de un total
                de {totalPreguntas} preguntas
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="grado">Grado</Label>
                <Input
                  id="grado"
                  value={formData.grado}
                  disabled={!!grado}
                  required
                />
              </div>

              <div className="border rounded-lg p-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">
                  Materias y Rangos
                </h3>
                {materias.map((materia, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <Label>Materia</Label>
                      <Input
                        value={materia.nombre}
                        onChange={(e) =>
                          handleMateriaChange(index, "nombre", e.target.value)
                        }
                        placeholder="Nombre de la materia"
                      />
                    </div>
                    <div>
                      <Label>Pregunta Inicial</Label>
                      <Input
                        type="number"
                        value={materia.inicio}
                        onChange={(e) =>
                          handleMateriaChange(index, "inicio", e.target.value)
                        }
                        min={1}
                        max={totalPreguntas}
                      />
                    </div>
                    <div>
                      <Label>Pregunta Final</Label>
                      <Input
                        type="number"
                        value={materia.fin}
                        onChange={(e) =>
                          handleMateriaChange(index, "fin", e.target.value)
                        }
                        min={1}
                        max={totalPreguntas}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => eliminarMateria(index)}
                        disabled={materias.length === 1}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
                <Button type="button" onClick={agregarMateria} className="mt-2">
                  Agregar Materia
                </Button>
              </div>

              <div className="border rounded-lg p-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">
                  Respuestas Correctas (Total: {respuestasArray.length})
                </h3>
                <div className="grid grid-cols-10 gap-4 max-h-[60vh] overflow-y-auto pr-4">
                  {respuestasArray.map(([pregunta], index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-1"
                    >
                      <Label className="text-sm font-medium text-muted-foreground">
                        {pregunta}
                      </Label>
                      <Input
                        className="w-14 text-center"
                        maxLength={1}
                        value={formData.respuestas_correctas[pregunta] || ""}
                        onChange={(e) =>
                          handleRespuestaChange(pregunta, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar respuestas</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
