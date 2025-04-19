import AnimatedCard from "@/components/utils/animated-card";
import Title from "@/components/utils/title";
import { SectionCards } from "@/components/dashboard/instituciones-grados/gradosview";

const Page = () => {
  return (
    <div className="mt-4 flex flex-1 flex-col gap-2 p-4 pt-0">
      <Title title={"Análisis de Resultados de los Estudiantes"} />
      <AnimatedCard text="Gestiona las respuestas de los estudiantes y validalas antes de ser calificadas." />
      <SectionCards />
    </div>
  );
};

export default Page;
