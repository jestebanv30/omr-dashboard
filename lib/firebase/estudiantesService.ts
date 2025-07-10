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
  id?: string; // id del documento
  archivo: string;
  nombre: string;
  identificacion: string;
  institucion: string;
  grado: string;
  curso: string;
  respuestas: Record<string, string>;
  secuencialId?: number;
  listo?: boolean;
  fechaCreacion?: string;
}

const getCollectionByUser = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  if (user.email === "admin2025@gmail.com") {
    return "estudiantes";
  } else if (user.email === "adminremediossolano@gmail.com") {
    return "estudiantes_remedios_solano";
  } else if (user.email === "adminmariaaux@gmail.com") {
    return "estudiantes_maria_auxiliadora";
  } else if (user.email === "adminjoseeduardog@gmail.com") {
    return "estudiantes_jose_eduardo_guerra";
  } else if (user.email === "adminruralashajaa@gmail.com") {
    return "estudiantes_rural_ashajaa";
  } else if (user.email === "adminelcarmelo@gmail.com") {
    return "estudiantes_el_carmelo";
  } else if (user.email === "adminroigvillalba@gmail.com") {
    return "estudiantes_roig_villalba";
  } else if (user.email === "adminelcarmelo3@gmail.com") {
    return "estudiantes_el_carmelo_3";
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
  } else if (user.email === "adminmariaaux@gmail.com") {
    return "Institución María Auxiliadora";
  } else if (user.email === "adminjoseeduardog@gmail.com") {
    return "Institución José Eduardo Guerra";
  } else if (user.email === "adminruralashajaa@gmail.com") {
    return "Institución Etnoeducativa Rural Ashajaa Jamuchenchon";
  } else if (user.email === "adminelcarmelo@gmail.com") {
    return "Institución Educativa El Carmelo";
  } else if (user.email === "adminroigvillalba@gmail.com") {
    return "Institución Educativa Roig Villalba";
  } else if (user.email === "adminelcarmelo3@gmail.com") {
    return "Institución Educativa El Carmelo 3";
  } else {
    throw new Error("Usuario no autorizado");
  }
};

export const obtenerTodosLosEstudiantes = async (): Promise<Estudiante[]> => {
  const collectionName = getCollectionByUser();
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Estudiante),
  }));
};

export const obtenerEstudiantesPorGrado = async (
  grado: string
): Promise<Estudiante[]> => {
  const collectionName = getCollectionByUser();
  const ref = collection(db, collectionName);
  const q = query(ref, where("grado", "==", grado));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Estudiante),
  }));
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
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Estudiante),
  }));
};

export const agregarEstudiante = async (
  estudiante: Omit<
    Estudiante,
    "archivo" | "institucion" | "fechaCreacion" | "secuencialId" | "id"
  >
): Promise<Estudiante> => {
  const collectionName = getCollectionByUser();
  const institucion = getInstitucionByUser();
  const isNuevaColeccion =
    collectionName === "estudiantes_remedios_solano" ||
    collectionName === "estudiantes_maria_auxiliadora" ||
    collectionName === "estudiantes_jose_eduardo_guerra" ||
    collectionName === "estudiantes_rural_ashajaa" ||
    collectionName === "estudiantes_el_carmelo" ||
    collectionName === "estudiantes_roig_villalba" ||
    collectionName === "estudiantes_el_carmelo_3";

  if (isNuevaColeccion) {
    const docRef = doc(collection(db, collectionName));
    const nuevoEstudiante: Estudiante = {
      ...estudiante,
      id: docRef.id,
      archivo: "Agregado Manual",
      institucion,
      fechaCreacion: new Date().toISOString(),
    };
    await setDoc(docRef, nuevoEstudiante);
    return nuevoEstudiante;
  } else {
    const estudiantes = await obtenerTodosLosEstudiantes();
    const maxId = estudiantes.reduce(
      (max, e) => Math.max(max, e.secuencialId ?? 0),
      0
    );
    const nuevoId = maxId + 1;
    const archivo = `EST_${nuevoId}`;

    const nuevoEstudiante: Estudiante = {
      ...estudiante,
      archivo,
      secuencialId: nuevoId,
      institucion,
      fechaCreacion: new Date().toISOString(),
    };
    const docRef = doc(collection(db, collectionName), archivo);
    await setDoc(docRef, nuevoEstudiante);
    return nuevoEstudiante;
  }
};

export const actualizarEstudiante = async (
  id: string,
  data: Partial<Estudiante>
) => {
  const collectionName = getCollectionByUser();
  const docRef = doc(collection(db, collectionName), id);
  await setDoc(docRef, data, { merge: true });
};

export const marcarEstudianteComoListo = async (id: string, listo: boolean) => {
  const collectionName = getCollectionByUser();
  const docRef = doc(collection(db, collectionName), id);
  await setDoc(docRef, { listo }, { merge: true });
};

export const eliminarEstudiante = async (id: string): Promise<boolean> => {
  try {
    const collectionName = getCollectionByUser();
    const docRef = doc(collection(db, collectionName), id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("❌ Error al eliminar estudiante:", error);
    return false;
  }
};

export const eliminarEstudiantesPorGrado = async (
  grado: string
): Promise<number> => {
  const collectionName = getCollectionByUser();
  const ref = collection(db, collectionName);
  const q = query(ref, where("grado", "==", grado));
  const snapshot = await getDocs(q);

  const batchDeletions = snapshot.docs.map(async (docSnap) => {
    await deleteDoc(docSnap.ref);
  });

  await Promise.all(batchDeletions);
  return snapshot.size;
};
