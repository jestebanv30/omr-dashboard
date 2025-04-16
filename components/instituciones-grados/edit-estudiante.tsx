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
  actualizarEstudiante,
  type Estudiante,
} from "@/lib/firebase/estudiantesService";
import { cn } from "@/lib/utils";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

interface EditEstudianteFormProps extends React.ComponentProps<"div"> {
  estudiante: Estudiante;
  onClose?: () => void;
}

export function EditEstudianteForm({
  estudiante,
  className,
  onClose,
  ...props
}: EditEstudianteFormProps) {
  const [formData, setFormData] = useState<Estudiante>(estudiante);
  const [showDialog, setShowDialog] = useState(false);

  const respuestasArray = Object.entries(formData.respuestas);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowDialog(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      if (!formData.id) {
        toast.error("ID de estudiante no encontrado");
        return;
      }
      await actualizarEstudiante(formData.id, formData);
      toast.success("Estudiante actualizado correctamente");
      onClose?.();
    } catch (error) {
      console.error("Error al actualizar estudiante:", error);
      toast.error("Error al actualizar estudiante");
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
            <AlertDialogTitle>¿Confirmar cambios?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas guardar los cambios realizados? Esta
              acción actualizará la información del estudiante.
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
          <CardTitle>Editar Estudiante</CardTitle>
          <CardDescription>
            Modifica la información del estudiante
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
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="grado">Grado</Label>
                  <Input
                    id="grado"
                    value={formData.grado}
                    onChange={(e) => handleInputChange("grado", e.target.value)}
                    //disabled
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="curso">Curso</Label>
                  <Input
                    id="curso"
                    value={formData.curso}
                    onChange={(e) => handleInputChange("curso", e.target.value)}
                    //disabled
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">
                  Preguntas (Total: {respuestasArray.length})
                </h3>
                <div className="grid grid-cols-10 gap-4 max-h-[60vh] overflow-y-auto pr-4">
                  {respuestasArray.map(([pregunta, respuesta], index) => (
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
                <Button type="submit">Guardar cambios</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
