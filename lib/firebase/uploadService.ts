// src/libs/firebase/uploadService.ts
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "./config";

interface Estudiante {
  archivo: string;
  nombre: string;
  identificacion: string;
  institucion: string;
  grado: string;
  curso: string;
  respuestas: Record<string, string>;
}

interface ResultadoJson {
  total_estudiantes_detectados: number;
  total_estudiantes_sin_qr: number;
  estudiantes: Estudiante[];
}

const getCollectionByUser = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  if (user.email === "admin2025@gmail.com") {
    return "estudiantes";
  } else if (user.email === "adminremediossolano@gmail.com") {
    return "estudiantes_remedios_solano";
  } else {
    throw new Error("Usuario no autorizado");
  }
};

export const subirResultadosEstudiantes = async (data: ResultadoJson) => {
  const collectionName = getCollectionByUser();

  // Obtener el último ID secuencial
  const estudiantesRef = collection(db, collectionName);
  const q = query(estudiantesRef, orderBy("secuencialId", "desc"), limit(1));
  const querySnapshot = await getDocs(q);

  let ultimoId = 0;
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.secuencialId) {
      ultimoId = data.secuencialId;
    }
  });

  const batchPromises = data.estudiantes.map(async (est, index) => {
    const nuevoId = ultimoId + index + 1;
    const docRef = doc(collection(db, collectionName), `EST_${nuevoId}`);
    await setDoc(docRef, {
      nombre: est.nombre,
      identificacion: est.identificacion,
      institucion: est.institucion,
      grado: est.grado,
      curso: est.curso,
      respuestas: est.respuestas,
      archivo: est.archivo,
      secuencialId: nuevoId,
      timestamp: new Date(),
    });
  });

  await Promise.all(batchPromises);
};
