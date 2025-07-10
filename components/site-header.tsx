"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import { ModeToggle } from "./theme/mode-toggle";

export function SiteHeader() {
  const [user] = useAuthState(auth);

  const getInstitucionName = () => {
    if (user?.email === "admin2025@gmail.com") {
      return "Resultados - Institución Educativa El Carmelo";
    } else if (user?.email === "adminremediossolano@gmail.com") {
      return "Resultados - Institución Remedios Solano";
    } else if (user?.email === "adminmariaaux@gmail.com") {
      return "Resultados - Institución Maria Auxiliadora";
    } else if (user?.email === "adminjoseeduardog@gmail.com") {
      return "Resultados - Institución José Eduardo Guerra";
    } else if (user?.email === "adminruralashajaa@gmail.com") {
      return "Resultados - Institución Etnoeducativa Rural Ashajaa Jamuchenchon";
    } else if (user?.email === "adminelcarmelo@gmail.com") {
      return "Resultados - Institución Educativa El Carmelo";
    } else if (user?.email === "adminroigvillalba@gmail.com") {
      return "Resultados - Institución Educativa Roig Villalba";
    } else if (user?.email === "adminelcarmelo3@gmail.com") {
      return "Resultados - Institución Educativa El Carmelo 3";
    }
    return "Resultados de Estudiantes";
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{getInstitucionName()}</h1>
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
