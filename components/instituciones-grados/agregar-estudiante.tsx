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
  agregarEstudiante,
  type Estudiante,
} from "@/lib/firebase/estudiantesService";
import { cn } from "@/lib/utils";
import { FormEvent, useState, useEffect } from "react";
import { toast } from "sonner";

interface AgregarEstudianteFormProps extends React.ComponentProps<"div"> {
  onClose?: () => void;
  grado?: string;
  curso?: string;
}

export function AgregarEstudianteForm({
  className,
  onClose,
  grado,
  curso,
  ...props
}: AgregarEstudianteFormProps) {
  const [formData, setFormData] = useState<Partial<Estudiante>>({
    nombre: "",
    identificacion: "",
    grado: grado || "",
    curso: curso || "",
    respuestas: {},
    listo: false,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [totalPreguntas, setTotalPreguntas] = useState(0);

  useEffect(() => {
    const fetchRespuestasCorrectas = async () => {
      try {
        const response = await fetch("/respuestas_correctas.json");
        const data = await response.json();
        if (grado && data[grado]) {
          const respuestasCorrectas = data[grado].respuestas_correctas;
          const maxPregunta = Math.max(
            ...Object.keys(respuestasCorrectas).map(Number)
          );
          setTotalPreguntas(maxPregunta);
        }
      } catch (error) {
        console.error("Error al cargar respuestas correctas:", error);
      }
    };

    fetchRespuestasCorrectas();
  }, [grado]);

  // Crear array de preguntas basado en el total de preguntas del grado
  const respuestasArray = Array.from({ length: totalPreguntas }, (_, i) => [
    (i + 1).toString(),
    "",
  ]);
  const preguntasPorPagina = 30;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowDialog(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      await agregarEstudiante(formData as Estudiante);
      toast.success("Estudiante agregado correctamente");
      onClose?.();
    } catch (error) {
      console.error("Error al agregar estudiante:", error);
      toast.error("Error al agregar estudiante");
    }
  };

  const handleInputChange = (field: keyof Estudiante, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRespuestaChange = (pregunta: string, respuesta: string) => {
    setFormData((prev) => ({
      ...prev,
      respuestas: {
        ...prev.respuestas,
        [pregunta]: respuesta.toUpperCase(),
      },
    }));
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar registro?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas agregar este nuevo estudiante? Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="max-w-7xl mx-auto w-full">
        <CardHeader>
          <CardTitle>Agregar Nuevo Estudiante</CardTitle>
          <CardDescription>
            Ingresa la información del nuevo estudiante
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) =>
                      handleInputChange("nombre", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="identificacion">Identificación</Label>
                  <Input
                    id="identificacion"
                    value={formData.identificacion}
                    onChange={(e) =>
                      handleInputChange("identificacion", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="grado">Grado</Label>
                  <Input
                    id="grado"
                    value={formData.grado}
                    onChange={(e) => handleInputChange("grado", e.target.value)}
                    required
                    disabled={!!grado}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="curso">Curso</Label>
                  <Input
                    id="curso"
                    value={formData.curso}
                    onChange={(e) => handleInputChange("curso", e.target.value)}
                    required
                    disabled={!!curso}
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Preguntas {currentPage * preguntasPorPagina + 1} a{" "}
                    {Math.min(
                      (currentPage + 1) * preguntasPorPagina,
                      respuestasArray.length
                    )}{" "}
                    de {respuestasArray.length}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      disabled={currentPage === 0}
                    >
                      Anterior
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={
                        (currentPage + 1) * preguntasPorPagina >=
                        respuestasArray.length
                      }
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {respuestasArray
                    .slice(
                      currentPage * preguntasPorPagina,
                      (currentPage + 1) * preguntasPorPagina
                    )
                    .map(([pregunta, respuesta], index) => (
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
                          value={respuesta}
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
                <Button type="submit">Agregar estudiante</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
