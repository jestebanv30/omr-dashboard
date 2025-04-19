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
import { auth, db } from "./config";

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

interface RespuestasCorrectas {
  respuestas_correctas: Record<string, string>;
  materias: Record<string, number[]>;
}

interface RespuestasJson {
  [grado: string]: RespuestasCorrectas;
}

const getCollectionByUser = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  if (user.email === "admin2025@gmail.com") {
    return {
      estudiantes: "estudiantes",
      respuestas: "respuestas_correctas",
    };
  } else if (user.email === "adminremediossolano@gmail.com") {
    return {
      estudiantes: "estudiantes_remedios_solano",
      respuestas: "respuestas_correctas_remedios_solano",
    };
  } else {
    throw new Error("Usuario no autorizado");
  }
};

export const subirResultadosEstudiantes = async (data: ResultadoJson) => {
  const collections = getCollectionByUser();
  const estudiantesRef = collection(db, collections.estudiantes);

  const isNuevaColeccion =
    collections.estudiantes === "estudiantes_remedios_solano";

  if (isNuevaColeccion) {
    const batchPromises = data.estudiantes.map(async (est) => {
      const docRef = doc(estudiantesRef); // Firestore genera un ID
      await setDoc(docRef, {
        id: docRef.id,
        archivo: est.archivo,
        nombre: est.nombre,
        identificacion: est.identificacion,
        institucion: est.institucion,
        grado: est.grado,
        curso: est.curso,
        respuestas: est.respuestas,
        fechaCreacion: new Date().toISOString(),
      });
    });
    await Promise.all(batchPromises);
  } else {
    // Obtener el último ID secuencial
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
      const archivo = `EST_${nuevoId}`;
      const docRef = doc(estudiantesRef, archivo);
      await setDoc(docRef, {
        archivo,
        nombre: est.nombre,
        identificacion: est.identificacion,
        institucion: est.institucion,
        grado: est.grado,
        curso: est.curso,
        respuestas: est.respuestas,
        secuencialId: nuevoId,
        fechaCreacion: new Date().toISOString(),
      });
    });

    await Promise.all(batchPromises);
  }
};

export const subirRespuestasCorrectas = async (data: RespuestasJson) => {
  const collections = getCollectionByUser();
  const respuestasRef = collection(db, collections.respuestas);

  const batchPromises = Object.entries(data).map(
    async ([grado, respuestas]) => {
      const docRef = doc(respuestasRef, grado);
      await setDoc(docRef, {
        respuestas_correctas: respuestas.respuestas_correctas,
        materias: respuestas.materias,
        fechaActualizacion: new Date().toISOString(),
      });
    }
  );

  await Promise.all(batchPromises);
};
