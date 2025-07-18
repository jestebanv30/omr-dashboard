import { auth } from "./config";

export const getInstitucionByUser = (): string => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  const email = user.email || "";

  if (email === "admin2025@gmail.com") {
    return "Institución Educativa El Carmelo";
  } else if (email === "adminremediossolano@gmail.com") {
    return "Institución Remedios Solano";
  } else if (email === "adminmariaaux@gmail.com") {
    return "Institución María Auxiliadora";
  } else if (email === "adminjoseeduardog@gmail.com") {
    return "Institución José Eduardo Guerra";
  } else if (email === "adminruralashajaa@gmail.com") {
    return "Institución Etnoeducativa Rural Ashajaa Jamuchenchon";
  } else if (email === "adminelcarmelo@gmail.com") {
    return "Institución Educativa El Carmelo";
  } else if (email === "adminroigvillalba@gmail.com") {
    return "Institución Educativa Roig Villalba";
  } else if (email === "adminelcarmelo3@gmail.com") {
    return "Institución Educativa El Carmelo 3";
  } else if (email === "adminurbanamixta@gmail.com") {
    return "Institución Educativa Urbana Mixta No.1";
  }
  return "Desconocido";
};
