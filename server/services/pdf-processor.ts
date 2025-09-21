import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  },
});

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // In a real implementation, you would use a PDF parsing library like pdf-parse
    // For now, we'll simulate text extraction
    // TODO: Implement actual PDF text extraction using pdf-parse or similar library
    
    // Simulated extraction - in production, replace with actual PDF parsing
    const simulatedText = `
    Contenido extraído del PDF:
    Este es contenido de ejemplo extraído del PDF cargado.
    En una implementación real, aquí estaría el texto completo del documento PDF.
    `;
    
    return simulatedText;
  } catch (error) {
    console.error('Error extrayendo texto del PDF:', error);
    throw new Error('Error al procesar el archivo PDF');
  }
}

export function validatePDF(file: Express.Multer.File): boolean {
  return file.mimetype === 'application/pdf' && file.size <= 50 * 1024 * 1024;
}
