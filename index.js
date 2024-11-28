const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const cvData = require('./mi-cv.json'); // Cargar el archivo JSON
console.log(cvData);
// Validar datos
if (!cvData.aboutMe || !cvData.experience) {
  console.error("El archivo JSON no tiene la estructura esperada.");
  process.exit(1); // Detener si hay un problema
}

function getPersonalData(data) {
  return {
    name: data.aboutme.name,
    email: data.aboutme.email,
    location: data.aboutme.location,
  };
}

function getProfessionalExperience(data) {
  return data.experience.jobs.map(exp => ({
    position: exp.position,
    organization: exp.organization,
    startDate: exp.startDate,
    endDate: exp.endDate || "Actualidad",
    description: exp.description,
  }));
}

function getEducation(data) {
  return data.knowledge.studies.map(edu => ({
    degree: edu.degree,
    institution: edu.institution,
    startDate: edu.startDate,
    endDate: edu.endDate,
  }));
}

function searchInJson(data, keyword) {
    const results = [];
  
        function recursiveSearch(obj, parentPath = '') {
        if (typeof obj !== 'object' || obj === null) return;
      
        const isArray = Array.isArray(obj); // Detecta si es un array
      
        for (const key in obj) {
          const value = obj[key];
          const currentPath = isArray ? `${parentPath}[${key}]` : parentPath ? `${parentPath}.${key}` : key;
      
          if (typeof value === 'object' && value !== null) {
            recursiveSearch(value, currentPath); // Llama recursivamente para objetos y arrays
          } else if (typeof value === 'string' && value.toLowerCase().includes(keyword.toLowerCase())) {
            /* analizar currentPath */
            
            results.push({ path: currentPath, value });
          }
        }
      }
      
  
    recursiveSearch(data);
    return results.length > 0 ? results : `No se encontraron coincidencias para "${keyword}".`;
  }

function getSkills(data) {
  return data.knowledge.hardSkills.map(skill => skill.name).join(', ');
}

// Middleware para procesar JSON
app.use(express.json());

// Endpoint para responder preguntas
app.post('/preguntar', (req, res) => {
  const { pregunta } = req.body;
  let respuesta;

  if (pregunta.includes('nombre')) {
    respuesta = getPersonalData(cvData).name;
  } else if (pregunta.includes('experiencia')) {
    respuesta = getProfessionalExperience(cvData);
  } else if (pregunta.includes('educación')) {
    respuesta = getEducation(cvData);
  } else if (pregunta.includes('habilidades')) {
    respuesta = getSkills(cvData);
} else {
    // Último caso: Buscar una palabra clave en todo el JSON.
    const keyword = pregunta.split(' ').pop(); // La última palabra de la pregunta.
    respuesta = searchInJson(cvData, keyword);
  }

  res.json({ respuesta });
});
res.setHeader('Access-Control-Allow-Origin', '*'); // Permite solicitudes de cualquier origen
// Iniciar el servidor
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
