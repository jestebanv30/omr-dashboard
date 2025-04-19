import { GradosView } from "@/components/dashboard/respuestas-correctas/gradosview";
import AnimatedCard from "@/components/utils/animated-card";
import Title from "@/components/utils/title";

const Page = () => {
  return (
    <div className="mt-4 flex flex-1 flex-col gap-2 p-4 pt-0">
      <Title title={"Añade las Respuestas Correctas para Calificación"} />
      <AnimatedCard text="Agrega las respuestas correctas para los grados disponibles" />
      <GradosView />
    </div>
  );
};

export default Page;
