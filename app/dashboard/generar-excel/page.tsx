import { GenerarExcel } from "@/components/generar-excel/generar-excel";
import AnimatedCard from "@/components/utils/animated-card";
import Title from "@/components/utils/title";

const Page = () => {
  return (
    <div className="mt-4 flex flex-1 flex-col gap-2 p-4 pt-0">
      <Title title={"Genera los Resultados de los Estudiantes por Grado"} />
      <AnimatedCard text="Obten los resultados de los estudiantes procesados y promediados en formato de Excel por grados" />
      <GenerarExcel />
    </div>
  );
};

export default Page;
