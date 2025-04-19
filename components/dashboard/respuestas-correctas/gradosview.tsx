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
import { agruparPorGrado } from "@/lib/firebase/estudiantesService";
import { AgregarRespuestasForm } from "./agregar-respuestas";

export function GradosView() {
  const [grados, setGrados] = useState<string[]>([]);
  const [selectedGrado, setSelectedGrado] = useState<string | null>(null);

  useEffect(() => {
    const cargarGrados = async () => {
      try {
        const gradosData = await agruparPorGrado();

        // Filtrar grados vacíos y undefined/null
        const gradosDisponibles = gradosData.filter(
          (grado) => grado && typeof grado === "string" && grado.trim() !== ""
        );

        setGrados(gradosDisponibles);
      } catch (error) {
        console.error("Error al cargar grados:", error);
      }
    };
    cargarGrados();
  }, []);

  if (selectedGrado) {
    return (
      <AgregarRespuestasForm
        grado={selectedGrado}
        onClose={() => setSelectedGrado(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {grados.map((grado) => (
          <Card
            key={grado}
            className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedGrado(grado)}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full" />
            <CardHeader>
              <CardDescription className="text-primary/70">
                Respuestas Correctas
              </CardDescription>
              <CardTitle className="text-3xl font-bold">
                Grado {grado}
              </CardTitle>
              <CardAction>
                <Badge className="bg-primary/20 hover:bg-primary/30">
                  <IconChevronRight className="h-5 w-5" />
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-2">
              <div className="text-sm text-muted-foreground">
                Configura las respuestas para este grado
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
