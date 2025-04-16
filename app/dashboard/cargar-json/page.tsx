import { CargarJson } from "@/components/cargar-json/cargar-json";
import AnimatedCard from "@/components/utils/animated-card";
import Title from "@/components/utils/title";

const Page = () => {
  return (
    <div className="mt-4 flex flex-1 flex-col gap-2 p-4 pt-0">
      <Title title={"Carga Datos de los Estudiantes"} />
      <AnimatedCard text="Adjunta el archivo *.json con el formato correcto para procesar los estudiantes" />
      <CargarJson />
    </div>
  );
};

export default Page;
