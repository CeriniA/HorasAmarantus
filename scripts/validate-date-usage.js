#!/usr/bin/env node
/**
 * Script de Validación de Uso de Fechas
 * Detecta violaciones de las reglas de REGLAS_FECHAS_TIMESTAMPS.md
 * 
 * Uso: node scripts/validate-date-usage.js
 * 
 * Reglas que valida:
 * 1. ❌ new Date(entry.start_time) o new Date(entry.end_time)
 * 2. ❌ new Date() con timestamps de DB
 * 3. ✅ Uso correcto de safeDate(), parseLocalTime(), extractDate()
 */

const fs = require('fs');
const path = require('path');

// Colores para terminal
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Patrones prohibidos
const FORBIDDEN_PATTERNS = [
  {
    pattern: /new Date\(.*?\.start_time\)/g,
    message: 'Uso de new Date() con start_time - usar parseLocalTime() o safeDate()',
    severity: 'error'
  },
  {
    pattern: /new Date\(.*?\.end_time\)/g,
    message: 'Uso de new Date() con end_time - usar parseLocalTime() o safeDate()',
    severity: 'error'
  },
  {
    pattern: /new Date\(entry\./g,
    message: 'Uso de new Date() con entry - usar helpers de dateHelpers.js',
    severity: 'error'
  },
  {
    pattern: /\.toDateString\(\)/g,
    message: 'Uso de toDateString() - usar isSameDay() de date-fns',
    severity: 'warning'
  },
  {
    pattern: /getHours\(safeDate\(/g,
    message: 'Uso de getHours(safeDate()) - safeDate() siempre devuelve 12:00, usar parseLocalTime()',
    severity: 'error'
  }
];

// Patrones correctos (para estadísticas)
const CORRECT_PATTERNS = [
  /safeDate\(/g,
  /parseLocalTime\(/g,
  /extractDate\(/g,
  /calculateHours\(/g,
  /isDateInRange\(/g
];

// Directorios a escanear
const SCAN_DIRS = [
  'frontend/src/pages',
  'frontend/src/components',
  'frontend/src/utils',
  'frontend/src/hooks'
];

// Archivos a excluir
const EXCLUDE_FILES = [
  'dateHelpers.js', // El archivo de helpers está permitido
  'validate-date-usage.js' // Este script
];

let totalFiles = 0;
let filesWithIssues = 0;
let totalIssues = 0;
let issuesByFile = {};

/**
 * Escanea un archivo en busca de violaciones
 */
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  
  // Excluir archivos permitidos
  if (EXCLUDE_FILES.includes(fileName)) {
    return;
  }

  totalFiles++;
  const issues = [];

  // Buscar patrones prohibidos
  FORBIDDEN_PATTERNS.forEach(({ pattern, message, severity }) => {
    const matches = content.match(pattern);
    if (matches) {
      // Encontrar líneas específicas
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (pattern.test(line)) {
          issues.push({
            line: index + 1,
            content: line.trim(),
            message,
            severity
          });
          totalIssues++;
        }
      });
    }
  });

  if (issues.length > 0) {
    filesWithIssues++;
    issuesByFile[filePath] = issues;
  }
}

/**
 * Escanea recursivamente un directorio
 */
function scanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  entries.forEach(entry => {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      scanFile(fullPath);
    }
  });
}

/**
 * Imprime resultados
 */
function printResults() {
  console.log('\n' + colors.bold + '📅 VALIDACIÓN DE USO DE FECHAS' + colors.reset);
  console.log('═'.repeat(60));

  if (totalIssues === 0) {
    console.log(colors.green + '✅ No se encontraron violaciones de las reglas de fechas' + colors.reset);
    console.log(`\n📊 Archivos escaneados: ${totalFiles}`);
    return true;
  }

  console.log(colors.red + `\n❌ Se encontraron ${totalIssues} violaciones en ${filesWithIssues} archivos\n` + colors.reset);

  // Mostrar violaciones por archivo
  Object.entries(issuesByFile).forEach(([filePath, issues]) => {
    const relativePath = filePath.replace(process.cwd(), '.');
    console.log(colors.bold + `\n📄 ${relativePath}` + colors.reset);
    
    issues.forEach(issue => {
      const color = issue.severity === 'error' ? colors.red : colors.yellow;
      const icon = issue.severity === 'error' ? '❌' : '⚠️';
      
      console.log(`  ${icon} Línea ${issue.line}: ${color}${issue.message}${colors.reset}`);
      console.log(`     ${colors.blue}${issue.content}${colors.reset}`);
    });
  });

  console.log('\n' + '═'.repeat(60));
  console.log(colors.bold + '\n📖 REGLAS:' + colors.reset);
  console.log('  ✅ Para FECHAS (día/mes/año): usar safeDate()');
  console.log('  ✅ Para HORAS (HH:mm): usar parseLocalTime()');
  console.log('  ✅ Para extraer fecha: usar extractDate()');
  console.log('  ✅ Para calcular horas: usar calculateHours()');
  console.log('  ✅ Para comparar fechas: usar isSameDay() de date-fns');
  console.log('\n📚 Ver: REGLAS_FECHAS_TIMESTAMPS.md');
  
  return false;
}

/**
 * Main
 */
function main() {
  const rootDir = path.resolve(__dirname, '..');
  
  console.log(colors.blue + '🔍 Escaneando archivos...' + colors.reset);
  
  SCAN_DIRS.forEach(dir => {
    const fullPath = path.join(rootDir, dir);
    scanDirectory(fullPath);
  });

  const success = printResults();
  
  // Exit code: 0 si no hay errores, 1 si hay errores
  process.exit(success ? 0 : 1);
}

main();
