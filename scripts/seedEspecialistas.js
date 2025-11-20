// scripts/seedEspecialistas.js
import 'dotenv/config.js';
import mongoose from 'mongoose';
import Especialista from '../models/EspecialistaModel.js';

const uri = (process.env.URI_DB || process.env.MONGO_URI || '').trim();
if (!uri) {
  console.error('❌ Falta URI_DB en .env');
  process.exit(1);
}

/**
 * Coberturas válidas que usa tu app: 'prepaga', 'obra social', 'privado'
 * Modalidad: 'presencial', 'virtual', 'mixta'
 * type debe coincidir EXACTO con las especialidades base:
 *  - 'Psicóloga' | 'Psiquiatra' | 'Ginecóloga' | 'Nutricionista' | 'Clínico'
 */

const CLINICOS_8 = [
  {
    name: "Dr. Martín Ocampo",
    type: "Clínico",
    modality: "presencial",
    coverage: "obra social",
    city: "CABA",
    province: "Buenos Aires",
    insurance: ["OSDE", "Swiss Medical"],
    bio: "Médico clínico con abordaje integral de la salud física y mental.",
    contact: { email: "martin.ocampo@salud.com", whatsapp: "5491123456789" },
    avatar:  '/Fotos/especialistas/men/45.jpg'
  },
  {
    name: "Dra. Lucía Fernández",
    type: "Clínico",
    modality: "virtual",
    coverage: "prepaga",
    city: "Rosario",
    province: "Santa Fe",
    insurance: ["Galeno", "Medifé"],
    bio: "Atención clínica general con foco en prevención y bienestar.",
    contact: { email: "lucia.fernandez@clinicavida.com", whatsapp: "5491139876543" },
    avatar:  '/Fotos/especialistas/46.jpg'
  },
  {
    name: "Dr. Nicolás Suárez",
    type: "Clínico",
    modality: "presencial",
    coverage: "privado",
    city: "Córdoba",
    province: "Córdoba",
    insurance: [],
    bio: "Diagnóstico y tratamiento de enfermedades crónicas en adultos.",
    contact: { email: "nicolas.suarez@hospitalcentral.com", whatsapp: "5491145678901" },
    avatar:  '/Fotos/especialistas/men/47.jpg'
  },
  {
    name: "Dra. Carla Giménez",
    type: "Clínico",
    modality: "mixta",
    coverage: "prepaga",
    city: "La Plata",
    province: "Buenos Aires",
    insurance: ["OSDE", "Medicus"],
    bio: "Control de salud y manejo clínico coordinado con equipos de TCA.",
    contact: { email: "carla.gimenez@saludtotal.com", whatsapp: "5491123498574" },
    avatar:  '/Fotos/especialistas/47.jpg'
  },
  {
    name: "Dr. Esteban Aguilar",
    type: "Clínico",
    modality: "virtual",
    coverage: "obra social",
    city: "Mendoza",
    province: "Mendoza",
    insurance: ["OSDE", "Sancor Salud"],
    bio: "Seguimiento clínico de comorbilidades frecuentes en TCA.",
    contact: { email: "esteban.aguilar@medcare.com", whatsapp: "5492617894561" },
    avatar:  '/Fotos/especialistas/men/48.jpg'
  },
  {
    name: "Dra. Florencia Rivas",
    type: "Clínico",
    modality: "presencial",
    coverage: "prepaga",
    city: "San Isidro",
    province: "Buenos Aires",
    insurance: ["Swiss Medical"],
    bio: "Médica clínica con enfoque interdisciplinario en salud y nutrición.",
    contact: { email: "florencia.rivas@centrosalud.com", whatsapp: "5491145638920" },
    avatar:  '/Fotos/especialistas/48.jpg'
  },
  {
    name: "Dr. Ricardo Benítez",
    type: "Clínico",
    modality: "mixta",
    coverage: "obra social",
    city: "Mar del Plata",
    province: "Buenos Aires",
    insurance: ["OSDE", "IOMA"],
    bio: "Experiencia en seguimiento de pacientes con trastornos alimentarios.",
    contact: { email: "ricardo.benitez@saludarg.com", whatsapp: "5492236789012" },
    avatar:  '/Fotos/especialistas/men/49.jpg'
  },
  {
    name: "Dra. Paula Ortiz",
    type: "Clínico",
    modality: "virtual",
    coverage: "privado",
    city: "Salta",
    province: "Salta",
    insurance: [],
    bio: "Consultas médicas generales y orientación preventiva.",
    contact: { email: "paula.ortiz@clinicavirtual.com", whatsapp: "5493876543210" },
    avatar:  '/Fotos/especialistas/49.jpg'
  }
];

const ORIGINALES_27 = [
  // Psiquiatras
  {
    name: 'Dr. Ernesto Gómez',
    type: 'Psiquiatra',
    modality: 'presencial',
    coverage: 'prepaga',
    city: 'Córdoba',
    province: 'Buenos Aires',
    insurance: ['OSDE', 'Swiss Medical'],
    bio: 'Psiquiatra con foco en trastornos de ansiedad y TCA en adultos.',
    contact: { email: 'ernesto.gomez@mail.com', whatsapp: '5491151111111' },
    avatar:  '/Fotos/especialistas/men/12.jpg'
  },
  {
    name: 'Dr. Ignacio Pérez',
    type: 'Psiquiatra',
    modality: 'mixta',
    coverage: 'obra social',
    city: 'La Plata',
    province: 'Buenos Aires',
    insurance: ['OSDE'],
    bio: 'Aborda TCA con enfoque integral y trabajo interdisciplinario.',
    contact: { email: 'ignacio.perez@mail.com', whatsapp: '5491152222222' },
    avatar:  '/Fotos/especialistas/men/13.jpg'
  },
  {
    name: 'Dr. Martín Vera',
    type: 'Psiquiatra',
    modality: 'virtual',
    coverage: 'prepaga',
    city: 'Bahía Blanca',
    province: 'Buenos Aires',
    insurance: ['OSDE'],
    bio: 'Tratamiento de TCA y comorbilidades del estado de ánimo.',
    contact: { email: 'martin.vera@mail.com', whatsapp: '5491153333333' },
    avatar:  '/Fotos/especialistas/men/14.jpg'
  },
  {
    name: 'Dr. Ulises Cabral',
    type: 'Psiquiatra',
    modality: 'mixta',
    coverage: 'prepaga',
    city: 'CABA',
    province: 'Buenos Aires',
    insurance: ['OSDE', 'Medicus'],
    bio: 'Intervención psiquiátrica en TCA y psicoeducación familiar.',
    contact: { email: 'ulises.cabral@mail.com', whatsapp: '5491155555555' },
    avatar:  '/Fotos/especialistas/men/15.jpg'
  },
  {
    name: 'Dr. Yago Molina',
    type: 'Psiquiatra',
    modality: 'virtual',
    coverage: 'privado',
    city: 'Rosario',
    province: 'Santa Fe',
    insurance: [],
    bio: 'Consultas virtuales para TCA y trastornos del sueño.',
    contact: { email: 'yago.molina@mail.com', whatsapp: '5493416666666' },
    avatar:  '/Fotos/especialistas/men/16.jpg'
  },
  {
    name: 'Dr. Pedro Ratti',
    type: 'Psiquiatra',
    modality: 'virtual',
    coverage: 'prepaga',
    city: 'CABA',
    province: 'Buenos Aires',
    insurance: ['OSDE', 'Medicus'],
    bio: 'Farmacoterapia personalizada y seguimiento cercano.',
    contact: { email: 'pedro.ratti@mail.com', whatsapp: '5491170000006' },
    avatar:  '/Fotos/especialistas/men/17.jpg'
  },
  {
    name: 'Dr. Tomás Medina',
    type: 'Psiquiatra',
    modality: 'mixta',
    coverage: 'privado',
    city: 'Córdoba',
    province: 'Córdoba',
    insurance: [],
    bio: 'Psicofarmacología prudente y coordinación con psicoterapia.',
    contact: { email: 'tomas.medina@mail.com', whatsapp: '5493517000014' },
    avatar:  '/Fotos/especialistas/men/18.jpg'
  },
  {
    name: 'Dr. Patricio Silva',
    type: 'Psiquiatra',
    modality: 'presencial',
    coverage: 'obra social',
    city: 'Morón',
    province: 'Buenos Aires',
    insurance: ['OSDE', 'OMINT'],
    bio: 'Tratamiento de TCA y trastornos del control de impulsos.',
    contact: { email: 'patricio.silva@mail.com', whatsapp: '5491170000018' },
    avatar:  '/Fotos/especialistas/men/19.jpg'
  },

  // Psicólogas
  {
    name: 'Lic. Camila Torres',
    type: 'Psicóloga',
    modality: 'presencial',
    coverage: 'prepaga',
    city: 'Lanús',
    province: 'Buenos Aires',
    insurance: ['OSDE', 'Galeno'],
    bio: 'Terapia cognitivo-conductual enfocada en imagen corporal.',
    contact: { email: 'camila.torres@mail.com', whatsapp: '5491170000002' },
    avatar:  '/Fotos/especialistas/12.jpg'
  },
  {
    name: 'Lic. Sofía Ponce',
    type: 'Psicóloga',
    modality: 'mixta',
    coverage: 'obra social',
    city: 'Córdoba',
    province: 'Córdoba',
    insurance: ['OSDE', 'Swiss Medical'],
    bio: 'Terapia orientada a la regulación emocional y autocuidado.',
    contact: { email: 'sofia.ponce@mail.com', whatsapp: '5493517000007' },
    avatar:  '/Fotos/especialistas/13.jpg'
  },
  {
    name: 'Lic. Micaela Suárez',
    type: 'Psicóloga',
    modality: 'presencial',
    coverage: 'privado',
    city: 'Mendoza',
    province: 'Mendoza',
    insurance: [],
    bio: 'Abordaje de TCA en adolescentes y adultos jóvenes.',
    contact: { email: 'mica.suarez@mail.com', whatsapp: '5492617000008' },
    avatar:  '/Fotos/especialistas/14.jpg'
  },
  {
    name: 'Lic. Nicolás Vera',
    type: 'Psicóloga',
    modality: 'virtual',
    coverage: 'obra social',
    city: 'Rosario',
    province: 'Santa Fe',
    insurance: ['OSDE'],
    bio: 'Trabajo sobre autoestima y relación con la comida.',
    contact: { email: 'nicolas.vera@mail.com', whatsapp: '5493417000011' },
    avatar:  '/Fotos/especialistas/men/32.jpg'
  },
  {
    name: 'Lic. Malena Díaz',
    type: 'Psicóloga',
    modality: 'mixta',
    coverage: 'privado',
    city: 'CABA',
    province: 'Buenos Aires',
    insurance: [],
    bio: 'Terapia breve centrada en objetivos y compasión.',
    contact: { email: 'malena.diaz@mail.com', whatsapp: '5491170000019' },
    avatar:  '/Fotos/especialistas/15.jpg'
  },
  {
    name: 'Lic. Daniela Roldán',
    type: 'Psicóloga',
    modality: 'virtual',
    coverage: 'prepaga',
    city: 'San Miguel de Tucumán',
    province: 'Tucumán',
    insurance: ['OSDE'],
    bio: 'Prevención de recaídas y habilidades de afrontamiento.',
    contact: { email: 'daniela.roldan@mail.com', whatsapp: '5493817000015' },
    avatar:  '/Fotos/especialistas/16.jpg'
  },

  // Nutricionistas
  {
    name: 'Lic. Ana Rivas',
    type: 'Nutricionista',
    modality: 'mixta',
    coverage: 'obra social',
    city: 'CABA',
    province: 'Buenos Aires',
    insurance: ['OSDE', 'Swiss Medical'],
    bio: 'Plan nutricional flexible y sin dietas rígidas para TCA.',
    contact: { email: 'ana.rivas@mail.com', whatsapp: '5491170000001' },
    avatar:  '/Fotos/especialistas/17.jpg'
  },
  {
    name: 'Lic. Lucía Benítez',
    type: 'Nutricionista',
    modality: 'virtual',
    coverage: 'privado',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    insurance: [],
    bio: 'Acompañamiento nutricional con educación alimentaria.',
    contact: { email: 'lucia.benitez@mail.com', whatsapp: '5491170000003' },
    avatar:  '/Fotos/especialistas/18.jpg'
  },
  {
    name: 'Lic. Javier Ramos',
    type: 'Nutricionista',
    modality: 'virtual',
    coverage: 'prepaga',
    city: 'Neuquén',
    province: 'Neuquén',
    insurance: ['Swiss Medical'],
    bio: 'Nutrición basada en evidencia y hábitos sostenibles.',
    contact: { email: 'javier.ramos@mail.com', whatsapp: '5492997000009' },
    avatar:  '/Fotos/especialistas/men/33.jpg'
  },
  {
    name: 'Lic. Belén Ortiz',
    type: 'Nutricionista',
    modality: 'presencial',
    coverage: 'privado',
    city: 'CABA',
    province: 'Buenos Aires',
    insurance: [],
    bio: 'Reeducación alimentaria con enfoque en señales internas.',
    contact: { email: 'belen.ortiz@mail.com', whatsapp: '5491170000012' },
    avatar:  '/Fotos/especialistas/19.jpg'
  },
  {
    name: 'Lic. Florencia Vidal',
    type: 'Nutricionista',
    modality: 'mixta',
    coverage: 'obra social',
    city: 'CABA',
    province: 'Buenos Aires',
    insurance: ['IOMA', 'OSDE'],
    bio: 'Acompañamiento compasivo y trabajo con familia.',
    contact: { email: 'florencia.vidal@mail.com', whatsapp: '5491170000016' },
    avatar:  '/Fotos/especialistas/20.jpg'
  },
  {
    name: 'Lic. Valentina Cruz',
    type: 'Nutricionista',
    modality: 'virtual',
    coverage: 'prepaga',
    city: 'Rosario',
    province: 'Santa Fe',
    insurance: ['Medicus'],
    bio: 'Planificación alimentaria flexible y sin culpa.',
    contact: { email: 'valentina.cruz@mail.com', whatsapp: '5493417000020' },
    avatar:  '/Fotos/especialistas/21.jpg'
  },

  // Ginecólogas
  {
    name: 'Dra. Quique Salas',
    type: 'Ginecóloga',
    modality: 'presencial',
    coverage: 'obra social',
    city: 'San Miguel de Tucumán',
    province: 'Tucumán',
    insurance: ['OMINT', 'OSDE'],
    bio: 'Salud ginecológica con perspectiva en nutrición y TCA.',
    contact: { email: 'quique.salas@mail.com', whatsapp: '5493814444444' },
    avatar:  '/Fotos/especialistas/22.jpg'
  },
  {
    name: 'Dra. Paula Ramírez',
    type: 'Ginecóloga',
    modality: 'mixta',
    coverage: 'prepaga',
    city: 'CABA',
    province: 'Buenos Aires',
    insurance: ['OSDE'],
    bio: 'Salud hormonal y ciclo menstrual en TCA.',
    contact: { email: 'paula.ramirez@mail.com', whatsapp: '5491170000004' },
    avatar:  '/Fotos/especialistas/23.jpg'
  },
  {
    name: 'Dra. Agustina Ross',
    type: 'Ginecóloga',
    modality: 'presencial',
    coverage: 'obra social',
    city: 'La Plata',
    province: 'Buenos Aires',
    insurance: ['IOMA', 'OSDE'],
    bio: 'Prevención y controles ginecológicos en contexto de TCA.',
    contact: { email: 'agustina.ross@mail.com', whatsapp: '5492217000005' },
    avatar:  '/Fotos/especialistas/24.jpg'
  },
  {
    name: 'Dra. Romina Álvarez',
    type: 'Ginecóloga',
    modality: 'mixta',
    coverage: 'prepaga',
    city: 'San Isidro',
    province: 'Buenos Aires',
    insurance: ['OSDE', 'OMINT'],
    bio: 'Salud sexual y reproductiva en pacientes con TCA.',
    contact: { email: 'romina.alvarez@mail.com', whatsapp: '5491170000010' },
    avatar:  '/Fotos/especialistas/25.jpg'
  },
  {
    name: 'Dra. Mariana Costa',
    type: 'Ginecóloga',
    modality: 'presencial',
    coverage: 'obra social',
    city: 'Bahía Blanca',
    province: 'Buenos Aires',
    insurance: ['OSDE'],
    bio: 'Chequeos integrales y salud ósea en TCA.',
    contact: { email: 'mariana.costa@mail.com', whatsapp: '5492917000013' },
    avatar:  '/Fotos/especialistas/26.jpg'
  },
  {
    name: 'Dra. Julieta Prieto',
    type: 'Ginecóloga',
    modality: 'virtual',
    coverage: 'prepaga',
    city: 'La Plata',
    province: 'Buenos Aires',
    insurance: ['OSDE'],
    bio: 'Salud ginecológica y nutricional coordinada.',
    contact: { email: 'julieta.prieto@mail.com', whatsapp: '5492217000017' },
    avatar:  '/Fotos/especialistas/27.jpg'
  },

  // Extra para completar 27 (distribución equilibrada)
  {
    name: 'Dr. Ignacio Caballé',
    type: 'Psiquiatra',
    modality: 'presencial',
    coverage: 'obra social',
    city: 'Mar del Plata',
    province: 'Buenos Aires',
    insurance: ['IOMA'],
    bio: 'Psiquiatría clínica con foco en adherencia terapéutica.',
    contact: { email: 'ignacio.caballe@mail.com', whatsapp: '5492237000001' },
    avatar:  '/Fotos/especialistas/men/28.jpg'
  },
  {
    name: 'Lic. Celeste Paredes',
    type: 'Psicóloga',
    modality: 'virtual',
    coverage: 'prepaga',
    city: 'Posadas',
    province: 'Misiones',
    insurance: ['OSDE'],
    bio: 'Terapia de aceptación y compromiso aplicada a TCA.',
    contact: { email: 'celeste.paredes@mail.com', whatsapp: '5493765000002' },
    avatar:  '/Fotos/especialistas/28.jpg'
  },
  {
    name: 'Lic. Mauro Sosa',
    type: 'Nutricionista',
    modality: 'presencial',
    coverage: 'obra social',
    city: 'San Juan',
    province: 'San Juan',
    insurance: ['OSDE'],
    bio: 'Educación alimentaria y enfoque no dietante.',
    contact: { email: 'mauro.sosa@mail.com', whatsapp: '5492645000003' },
    avatar:  '/Fotos/especialistas/men/29.jpg'
  }
];

const DATA = [...ORIGINALES_27, ...CLINICOS_8];

async function run() {
  await mongoose.connect(uri);
  console.log('✅ Conectado para SEED de especialistas');

  await Especialista.deleteMany({});
  await Especialista.insertMany(DATA);

  const total = await Especialista.countDocuments();
  console.log(`🌱 Seed listo. Especialistas: ${total}`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error('❌ Seed especialistas error:', e);
  process.exit(1);
});
