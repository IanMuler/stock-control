const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

async function executeRawQuery(query) {
    try {
        return await prisma.$queryRawUnsafe(query);
    } catch (error) {
        log(`    ⚠️  Error ejecutando query: ${error.message}`, colors.yellow);
        return [];
    }
}

async function getTables() {
    try {
        const tables = await prisma.$queryRaw`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename;
        `;
        return tables.map(t => t.tablename);
    } catch (error) {
        log(`Error obteniendo tablas: ${error.message}`, colors.red);
        return [];
    }
}

async function getTableData(tableName) {
    try {
        const data = await prisma.$queryRawUnsafe(`SELECT * FROM "${tableName}"`);
        return data;
    } catch (error) {
        log(`    ⚠️  Error obteniendo datos de ${tableName}: ${error.message}`, colors.yellow);
        return [];
    }
}

function formatValue(value) {
    if (value === null || value === undefined) {
        return 'NULL';
    }
    if (typeof value === 'boolean') {
        return value.toString();
    }
    if (typeof value === 'number') {
        return value.toString();
    }
    if (value instanceof Date) {
        return `'${value.toISOString()}'`;
    }
    // String - escapar comillas simples
    return `'${value.toString().replace(/'/g, "''")}'`;
}

async function createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupDir = path.join(__dirname, '..', 'backups');
    
    // Crear directorio si no existe
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupFile = path.join(backupDir, `stockcontrol_raw_backup_${timestamp}.sql`);
    
    log('🗄️  StockControl Database Raw Backup', colors.green);
    log('=====================================');
    log(`📋 Información del backup:`, colors.yellow);
    log(`  • Archivo: ${path.basename(backupFile)}`);
    log(`  • Fecha: ${new Date().toLocaleString()}`);
    log('');
    
    let sqlContent = `-- StockControl Database Raw Backup
-- Generated on: ${new Date().toISOString()}
-- This backup contains the actual data from the database
-- 

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

-- Disable triggers for faster inserts
SET session_replication_role = replica;

`;

    try {
        log('🔄 Obteniendo lista de tablas...', colors.yellow);
        const tables = await getTables();
        
        if (tables.length === 0) {
            log('❌ No se encontraron tablas', colors.red);
            return;
        }
        
        log(`   Encontradas ${tables.length} tablas: ${tables.join(', ')}`);
        log('');
        
        for (const table of tables) {
            log(`  📊 Procesando tabla: ${table}`, colors.cyan);
            
            const data = await getTableData(table);
            
            sqlContent += `\n-- Data for table: ${table}\n`;
            sqlContent += `-- Records found: ${data.length}\n`;
            
            if (data.length > 0) {
                // Obtener las columnas del primer registro
                const columns = Object.keys(data[0]);
                const columnList = columns.map(col => `"${col}"`).join(', ');
                
                sqlContent += `DELETE FROM "${table}";\n`;
                
                for (const row of data) {
                    const values = columns.map(col => formatValue(row[col])).join(', ');
                    sqlContent += `INSERT INTO "${table}" (${columnList}) VALUES (${values});\n`;
                }
                
                log(`    ✅ ${data.length} registros exportados`);
            } else {
                sqlContent += `-- No data found in ${table}\n`;
                log(`    ℹ️  Tabla vacía`);
            }
        }
        
        sqlContent += `\n-- Re-enable triggers\nSET session_replication_role = DEFAULT;\n`;
        
        // Escribir archivo
        fs.writeFileSync(backupFile, sqlContent, 'utf8');
        
        const stats = fs.statSync(backupFile);
        const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);
        
        log('');
        log('✅ Backup completado exitosamente', colors.green);
        log(`   📁 Archivo: ${backupFile}`);
        log(`   📊 Tamaño: ${sizeInMB} MB`);
        log(`   📋 Tablas procesadas: ${tables.length}`);
        
    } catch (error) {
        log(`❌ Error durante el backup: ${error.message}`, colors.red);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar backup
createBackup().catch(console.error);