import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { auth, db } from "./config";

export interface RespuestasCorrectas {
  id?: string;
  grado: string;
  institucion: string;
  respuestas_correctas: Record<string, string>;
  materias: Record<string, number[]>;
  fechaCreacion?: string;
}

const getCollectionByUser = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  if (user.email === "admin2025@gmail.com") {
    return "respuestas_correctas";
  } else if (user.email === "adminremediossolano@gmail.com") {
    return "respuestas_correctas_remedios_solano";
  } else {
    throw new Error("Usuario no autorizado");
  }
};

const getInstitucionByUser = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  if (user.email === "admin2025@gmail.com") {
    return "Institución Educativa El Carmelo";
  } else if (user.email === "adminremediossolano@gmail.com") {
    return "Institución Remedios Solano";
  } else {
    throw new Error("Usuario no autorizado");
  }
};

export const guardarRespuestasCorrectas = async (
  grado: string,
  respuestas_correctas: Record<string, string>,
  materias: Record<string, number[]>
): Promise<RespuestasCorrectas> => {
  const collectionName = getCollectionByUser();
  const institucion = getInstitucionByUser();

  const nuevasRespuestas: RespuestasCorrectas = {
    grado,
    institucion,
    respuestas_correctas,
    materias,
    fechaCreacion: new Date().toISOString(),
  };

  const docRef = doc(collection(db, collectionName), grado);
  await setDoc(docRef, nuevasRespuestas);
  return nuevasRespuestas;
};

export const obtenerRespuestasCorrectas = async (
  grado: string
): Promise<RespuestasCorrectas | null> => {
  const collectionName = getCollectionByUser();
  const docRef = doc(collection(db, collectionName), grado);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...(docSnap.data() as RespuestasCorrectas),
  };
};

export const obtenerTodasLasRespuestasCorrectas = async (): Promise<
  RespuestasCorrectas[]
> => {
  const collectionName = getCollectionByUser();
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as RespuestasCorrectas),
  }));
};
