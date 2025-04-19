"use client";

import { subirRespuestasCorrectas } from "@/lib/firebase/uploadService";
import { IconUpload } from "@tabler/icons-react";
import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CargarJson() {
  const [mensaje, setMensaje] = React.useState("");
  const [error, setError] = React.useState("");
  const [isDragging, setIsDragging] = React.useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const contenido = await file.text();
      const data = JSON.parse(contenido);
      setMensaje("Cargando datos...");

      await subirRespuestasCorrectas(data);
      setMensaje("Respuestas correctas cargadas exitosamente.");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Error al procesar el archivo.");
      setMensaje("");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file || file.type !== "application/json") {
      setError("Por favor selecciona un archivo JSON válido");
      return;
    }

    try {
      const contenido = await file.text();
      const data = JSON.parse(contenido);
      setMensaje("Cargando datos...");

      await subirRespuestasCorrectas(data);
      setMensaje("Respuestas correctas cargadas exitosamente.");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Error al procesar el archivo.");
      setMensaje("");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Cargar Respuestas Correctas JSON</CardTitle>
        <CardDescription>
          Selecciona un archivo JSON para cargar las respuestas correctas
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div
          className={`w-full rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "hover:border-primary hover:bg-primary/5"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label className="flex cursor-pointer flex-col items-center gap-4">
            <IconUpload className="h-16 w-16 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <span className="text-xl font-medium">
                Seleccionar archivo JSON
              </span>
              <span className="text-sm text-muted-foreground">
                o arrastra y suelta aquí
              </span>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {mensaje && (
          <div className="w-full bg-green-500/10 border border-green-500 rounded-lg p-4">
            <p className="text-green-500 text-center">{mensaje}</p>
          </div>
        )}

        {error && (
          <div className="w-full bg-destructive/10 border border-destructive rounded-lg p-4">
            <p className="text-destructive text-center">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
