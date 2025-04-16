import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "./config";

export interface Estudiante {
  archivo: string;
  nombre: string;
  identificacion: string;
  institucion: string;
  grado: string;
  curso: string;
  respuestas: Record<string, string>;
  secuencialId: number;
  listo?: boolean;
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

export const getInstitucionByUser = () => {
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

export const obtenerTodosLosEstudiantes = async (): Promise<Estudiante[]> => {
  const collectionName = getCollectionByUser();
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((doc) => doc.data() as Estudiante);
};

export const obtenerEstudiantesPorGrado = async (
  grado: string
): Promise<Estudiante[]> => {
  const collectionName = getCollectionByUser();
  const ref = collection(db, collectionName);
  const q = query(ref, where("grado", "==", grado));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Estudiante);
};

export const agruparPorGrado = async () => {
  const estudiantes = await obtenerTodosLosEstudiantes();
  const grados = [...new Set(estudiantes.map((e) => e.grado))];
  return grados;
};

export const obtenerCursosPorGrado = async (grado: string) => {
  const estudiantes = await obtenerTodosLosEstudiantes();
  const cursos = [
    ...new Set(
      estudiantes.filter((e) => e.grado === grado).map((e) => e.curso)
    ),
  ];
  return cursos;
};

export const obtenerEstudiantesPorCurso = async (
  grado: string,
  curso: string
): Promise<Estudiante[]> => {
  const collectionName = getCollectionByUser();
  const ref = collection(db, collectionName);
  const q = query(
    ref,
    where("grado", "==", grado),
    where("curso", "==", curso)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Estudiante);
};

export const agregarEstudiante = async (estudiante: Estudiante) => {
  try {
    const collectionName = getCollectionByUser();
    // Obtener todos los estudiantes para calcular el siguiente secuencialId
    const estudiantes = await obtenerTodosLosEstudiantes();
    const maxId = estudiantes.reduce(
      (max, est) => Math.max(max, est.secuencialId),
      0
    );
    const nuevoId = maxId + 1;

    // Asignar el nuevo secuencialId y generar el archivo
    const estudianteCompleto = {
      ...estudiante,
      secuencialId: nuevoId,
      archivo: `EST_${nuevoId}`,
      institucion: getInstitucionByUser(), // Ahora usa la función para obtener la institución
    };

    // Guardar el estudiante en Firestore
    const docRef = doc(collection(db, collectionName), `EST_${nuevoId}`);
    await setDoc(docRef, estudianteCompleto);

    return estudianteCompleto;
  } catch (error) {
    console.error("Error al agregar estudiante:", error);
    throw error;
  }
};

export const actualizarEstudiante = async (
  secuencialId: number,
  data: Partial<Estudiante>
) => {
  const collectionName = getCollectionByUser();
  const docRef = doc(collection(db, collectionName), `EST_${secuencialId}`);
  await setDoc(docRef, data, { merge: true });
};

export const marcarEstudianteComoListo = async (
  secuencialId: number,
  listo: boolean
) => {
  const collectionName = getCollectionByUser();
  const docRef = doc(collection(db, collectionName), `EST_${secuencialId}`);
  await setDoc(docRef, { listo }, { merge: true });
};

export const eliminarEstudiantesPorGrado = async (
  grado: string
): Promise<number> => {
  try {
    const collectionName = getCollectionByUser();
    const ref = collection(db, collectionName);
    const q = query(ref, where("grado", "==", grado));
    const snapshot = await getDocs(q);

    const batchDeletions = snapshot.docs.map(async (docSnap) => {
      await deleteDoc(docSnap.ref);
    });

    await Promise.all(batchDeletions);
    console.log(
      `✔️ Se eliminaron ${snapshot.size} estudiantes del grado ${grado}`
    );
    return snapshot.size;
  } catch (error) {
    console.error("❌ Error al eliminar estudiantes por grado:", error);
    return 0;
  }
};

export const eliminarEstudiante = async (
  secuencialId: number
): Promise<boolean> => {
  try {
    const collectionName = getCollectionByUser();
    const docRef = doc(collection(db, collectionName), `EST_${secuencialId}`);
    await deleteDoc(docRef);
    console.log(`✔️ Se eliminó el estudiante con ID ${secuencialId}`);
    return true;
  } catch (error) {
    console.error("❌ Error al eliminar estudiante:", error);
    return false;
  }
};
