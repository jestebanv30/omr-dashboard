"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AgregarEstudianteForm } from "./agregar-estudiante-general";

export function AgregarEstudianteGeneralView() {
  const [showAgregarForm, setShowAgregarForm] = useState(false);

  return (
    <div className="px-4">
      <Button onClick={() => setShowAgregarForm(true)} className="mb-4">
        Agregar Estudiante
      </Button>

      {showAgregarForm && (
        <AgregarEstudianteForm
          onClose={() => setShowAgregarForm(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        />
      )}
    </div>
  );
}
