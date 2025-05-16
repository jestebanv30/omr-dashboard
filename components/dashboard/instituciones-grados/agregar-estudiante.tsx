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
import { getInstitucionByUser } from "@/lib/firebase/userInfoService";
import { cn } from "@/lib/utils";
import { FormEvent, useEffect, useState } from "react";
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
  const [showDialog, setShowDialog] = useState(false);
  const [totalPreguntas, setTotalPreguntas] = useState(0);

  useEffect(() => {
    const fetchCantidadPreguntas = async () => {
      try {
        const response = await fetch(
          "/cantidad_preguntas_por_colegio_y_grado.json"
        );
        const data = await response.json();

        const institucion = getInstitucionByUser();

        if (grado && data[institucion] && data[institucion][grado]) {
          setTotalPreguntas(data[institucion][grado]);
        } else {
          setTotalPreguntas(120); // valor por defecto
        }
      } catch (error) {
        console.error("Error al cargar cantidad de preguntas:", error);
      }
    };

    fetchCantidadPreguntas();
  }, [grado]);

  // Crear array de preguntas basado en el total de preguntas del grado
  const respuestasArray = Array.from({ length: totalPreguntas }, (_, i) => [
    (i + 1).toString(),
    formData.respuestas?.[i + 1] || "",
  ]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowDialog(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      // Inicializar todas las respuestas vacías
      const respuestasCompletas: Record<string, string> = {};
      for (let i = 1; i <= totalPreguntas; i++) {
        const respuestaActual = formData.respuestas?.[i.toString()];
        respuestasCompletas[i.toString()] = respuestaActual || "";
      }

      const estudianteCompleto = {
        ...formData,
        respuestas: respuestasCompletas,
      };

      await agregarEstudiante(estudianteCompleto as Estudiante);
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
              ¿Estás seguro de que deseas agregar este nuevo estudiante? Esta
              acción no se puede deshacer.
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
          <CardTitle>Agregar Nuevo Estudiante</CardTitle>
          <CardDescription>
            Ingresa la información del nuevo estudiante
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <h3 className="text-lg font-semibold mb-4">
                  Preguntas (Total: {respuestasArray.length})
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
                        value={formData.respuestas?.[pregunta] || ""}
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
