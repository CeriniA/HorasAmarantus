import { useState, useEffect } from 'react';
import { Download, Filter, BarChart2, Target, FileText, Users } from 'lucide-react';
import { timeEntriesService, usersService, orgUnitsService } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions.v2';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, subYears } from 'date-fns';
import { TIME_ENTRY_STATUS } from '../constants';
import { isAdminOrSuperadmin, isOperario } from '../utils/roleHelpers';
import { isDateInRange, safeDate } from '../utils/dateHelpers';
import logger from '../utils/logger';

// Componentes modularizados
import { ReportFilters } from '../components/reports/ReportFilters';
import { ReportMetrics } from '../components/reports/ReportMetrics';
import { ReportCharts } from '../components/reports/ReportCharts';
import { ReportTable } from '../components/reports/ReportTable';
import { ObjectivesReport } from '../components/reports/ObjectivesReport';
import { DetailedEntriesReport } from '../components/reports/DetailedEntriesReport';
import { MultiEntityComparisonReport } from '../components/reports/MultiEntityComparisonReport';
import { UserHoursTable } from '../components/reports/UserHoursTable';
// Componentes eliminados (inútiles):
// - ProductivityAnalysis (métricas subjetivas)
// - AreaVolumeReport (redundante con ReportTable)
// - OvertimeReport (sin jornada estándar definida)
// - MonthlyTrendsReport (redundante con ReportCharts)
// - TimeDistributionReport (mapa de calor sin sentido)

// Utilidades
import { getUnitAndChildren, calculateReportMetrics } from '../utils/reportCalculations';
import { exportToCSV } from '../utils/reportExport';
import { exportToExcel } from '../utils/exportToExcel';
import { exportToPDF } from '../utils/exportToPDF';

export const Reports = () => {
  const { user } = useAuthContext();
  const { canViewAllObjectives } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]); // Para comparativas multi-usuario
  const [selectedAreas, setSelectedAreas] = useState([]); // Para comparativa de áreas
  const [selectedProcesses, setSelectedProcesses] = useState([]); // Para comparativa de procesos
  const [comparisonType, setComparisonType] = useState('users'); // users, areas, processes, top10
  const [selectedUnit, setSelectedUnit] = useState('all');
  
  const [users, setUsers] = useState([]);
  const [units, setUnits] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [topUsers, setTopUsers] = useState([]); // Top general (sin filtros)
  const [reportData, setReportData] = useState({
    totalHours: 0,
    totalEntries: 0,
    byUser: [],
    byUserAll: [],
    byUnit: [],
    byDay: []
  });

  useEffect(() => {
    loadFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateDateRange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  useEffect(() => {
    loadReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, selectedUser, selectedUnit]);

  const updateDateRange = () => {
    const today = new Date();
    
    switch (dateRange) {
      case 'week':
        setStartDate(format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
        setEndDate(format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
        break;
      case 'month':
        setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'));
        break;
      case 'year':
        setStartDate(format(startOfYear(today), 'yyyy-MM-dd'));
        setEndDate(format(endOfYear(today), 'yyyy-MM-dd'));
        break;
      case 'lastYear': {
        const lastYear = subYears(today, 1);
        setStartDate(format(startOfYear(lastYear), 'yyyy-MM-dd'));
        setEndDate(format(endOfYear(lastYear), 'yyyy-MM-dd'));
        break;
      }
      case 'custom':
        break;
      default:
        break;
    }
  };

  // Validar que startDate <= endDate
  const handleStartDateChange = (newStartDate) => {
    setStartDate(newStartDate);
    // Si la fecha de inicio es mayor que la de fin, ajustar la de fin
    const start = safeDate(newStartDate);
    const end = safeDate(endDate);
    if (start && end && start > end) {
      setEndDate(newStartDate);
    }
  };

  const handleEndDateChange = (newEndDate) => {
    // Si la fecha de fin es menor que la de inicio, ajustar la de inicio
    const start = safeDate(startDate);
    const end = safeDate(newEndDate);
    if (start && end && end < start) {
      setStartDate(newEndDate);
    }
    setEndDate(newEndDate);
  };

  const loadFilters = async () => {
    try {
      // Cargar usuarios según rol
      if (isAdminOrSuperadmin(user)) {
        const { users: usersData } = await usersService.getAll();
        setUsers(usersData || []);
      } else if (isOperario(user)) {
        // Operario solo ve su propio usuario en el filtro
        setUsers([user]);
        setSelectedUser(user.id); // Pre-seleccionar su usuario
      }

      const { organizationalUnits: unitsData } = await orgUnitsService.getAll();
      setUnits(unitsData || []);
    } catch (error) {
      logger.error('Error loading filters:', error);
    }
  };

  const loadReportData = async () => {
    try {
      setLoading(true);

      const { timeEntries: entries } = await timeEntriesService.getAll();

      // Calcular Top de Usuarios GENERAL (sin filtros) - Solo para admins
      if (isAdminOrSuperadmin(user)) {
        const allCompleted = entries.filter(e => e.status === TIME_ENTRY_STATUS.COMPLETED);
        const topMetrics = calculateReportMetrics(allCompleted, units);
        setTopUsers(topMetrics.byUser);
      }

      // Filtrar por fechas (usando helper)
      let filtered = entries.filter(entry => {
        return isDateInRange(entry.start_time, startDate, endDate) && 
               entry.status === TIME_ENTRY_STATUS.COMPLETED;
      });

      // Filtrar por usuario(s)
      if (isOperario(user)) {
        // Operario solo ve sus propios registros
        filtered = filtered.filter(e => e.user_id === user.id);
      } else if (selectedUser !== 'all') {
        // Admin/Superadmin con selección personalizada
        if (selectedUsers.length > 0) {
          // Filtrar por usuarios seleccionados
          filtered = filtered.filter(e => selectedUsers.includes(e.user_id));
        } else {
          // Si no hay usuarios seleccionados, mostrar todos (fallback a 'all')
          // No aplicar filtro
        }
      }

      // Filtrar por unidad (jerárquico)
      if (selectedUnit !== 'all') {
        const unitIds = getUnitAndChildren(selectedUnit, units);
        filtered = filtered.filter(e => unitIds.includes(e.organizational_unit_id));
      }

      setFilteredEntries(filtered);
      
      // Calcular métricas usando utilidad
      const metrics = calculateReportMetrics(filtered, units);
      setReportData(metrics);

    } catch (error) {
      logger.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    exportToCSV(filteredEntries, startDate, endDate);
  };

  const handleExportExcel = () => {
    const exportData = {
      ...reportData,
      entries: filteredEntries,
      startDate,
      endDate,
      avgPerDay: reportData.totalHours / (reportData.byDay?.length || 1),
      daysWorked: reportData.byDay?.length || 0
    };
    exportToExcel(exportData, 'reporte_horas');
  };

  const handleExportPDF = () => {
    const exportData = {
      ...reportData,
      entries: filteredEntries,
      startDate,
      endDate,
      avgPerDay: reportData.totalHours / (reportData.byDay?.length || 1),
      daysWorked: reportData.byDay?.length || 0
    };
    exportToPDF(exportData, 'reporte_horas');
  };

  const handleExportPayroll = () => {
    // Validar que haya datos
    if (!reportData.byUserAll || reportData.byUserAll.length === 0) {
      logger.warn('No hay datos de usuarios para exportar');
      window.alert('No hay datos de usuarios en el período seleccionado');
      return;
    }

    logger.info('Exportando nómina:', {
      usuarios: reportData.byUserAll.length,
      totalHoras: reportData.totalHours,
      periodo: `${startDate} - ${endDate}`
    });

    // Exportar datos de nómina (usuarios + horas)
    const payrollData = {
      byUser: reportData.byUserAll || [],
      byUserAll: reportData.byUserAll || [],
      totalHours: reportData.totalHours || 0,
      totalEntries: reportData.totalEntries || 0,
      startDate,
      endDate,
      avgPerDay: reportData.totalHours / (reportData.byDay?.length || 1),
      daysWorked: reportData.byDay?.length || 0,
      generatedAt: new Date().toISOString()
    };

    try {
      exportToExcel(payrollData, `nomina_${startDate}_${endDate}`);
      logger.info('✅ Nómina exportada exitosamente');
    } catch (error) {
      logger.error('❌ Error al exportar nómina:', error);
      window.alert('Error al generar el archivo de nómina. Revisa la consola para más detalles.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isOperario(user) ? 'Tus horas trabajadas' : 'Análisis de horas trabajadas'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button onClick={handleExportExcel} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button onClick={handleExportPDF} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card title="Filtros" action={
        <Button size="sm" onClick={loadReportData} loading={loading}>
          <Filter className="h-4 w-4 mr-2" />
          Aplicar
        </Button>
      }>
        <ReportFilters
          user={user}
          dateRange={dateRange}
          setDateRange={setDateRange}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
          selectedAreas={selectedAreas}
          setSelectedAreas={setSelectedAreas}
          selectedProcesses={selectedProcesses}
          setSelectedProcesses={setSelectedProcesses}
          comparisonType={comparisonType}
          setComparisonType={setComparisonType}
          selectedUnit={selectedUnit}
          setSelectedUnit={setSelectedUnit}
          users={users}
          units={units}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          showComparisonTypeSelector={activeTab === 'comparison'}
        />
      </Card>

      {/* Indicadores de filtros activos */}
      {(selectedUnit !== 'all' || (selectedUsers.length > 0 && selectedUser !== 'all')) && (
        <div className="space-y-3">
          {/* Filtro de Unidad */}
          {selectedUnit !== 'all' && (
            <Card>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Filter className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Filtro Activo: Vista Jerárquica
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Mostrando <strong>{units.find(u => u.id === selectedUnit)?.name}</strong> y todos sus procesos internos (sub-unidades).
                      </p>
                      <p className="mt-1 text-xs">
                        {reportData.byUnit.length} unidad(es) incluida(s) en el reporte
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
          
          {/* Filtro de Usuarios Personalizados */}
          {selectedUsers.length > 0 && selectedUser !== 'all' && (
            <Card>
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Users className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Usuarios Seleccionados ({selectedUsers.length})
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.slice(0, 5).map(userId => {
                          const foundUser = users.find(u => u.id === userId);
                          return foundUser ? (
                            <span key={userId} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              {foundUser.name}
                            </span>
                          ) : null;
                        })}
                        {selectedUsers.length > 5 && (
                          <span className="text-xs text-green-600">
                            +{selectedUsers.length - 5} más
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Tabs de Reportes */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('general')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'general'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Resumen
            </button>
            {canViewAllObjectives() && (
              <button
                onClick={() => setActiveTab('goals')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'goals'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Target className="h-4 w-4 mr-2" />
                Objetivos
              </button>
            )}
            <button
              onClick={() => setActiveTab('detail')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'detail'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Detalle
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'comparison'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4 mr-2" />
              Comparativas
            </button>
          </nav>
        </div>
      </Card>

      {/* Contenido según tab activo */}
      {activeTab === 'general' && (
        <>
          {/* Métricas */}
          <ReportMetrics reportData={reportData} />

          {/* Gráficos */}
          <ReportCharts reportData={reportData} topUsers={topUsers} user={user} />

          {/* Tabla por Unidad */}
          <ReportTable 
            reportData={reportData} 
            units={units}
            selectedUnit={selectedUnit}
          />

          {/* Tabla de Horas por Usuario (para nómina) */}
          {isAdminOrSuperadmin(user) && (
            <UserHoursTable
              usersData={reportData.byUserAll || []}
              totalHours={reportData.totalHours}
              startDate={startDate}
              endDate={endDate}
              onExport={handleExportPayroll}
            />
          )}
        </>
      )}

      {/* Reporte de Objetivos */}
      {activeTab === 'goals' && (
        <ObjectivesReport />
      )}

      {/* Reporte Detallado de Registros */}
      {activeTab === 'detail' && (
        <DetailedEntriesReport 
          timeEntries={filteredEntries}
          user={user}
        />
      )}

      {/* Reporte de Comparativa Multi-Entidad */}
      {activeTab === 'comparison' && (
        <MultiEntityComparisonReport 
          timeEntries={filteredEntries}
          users={users}
          selectedUsers={selectedUsers}
          selectedAreas={selectedAreas}
          selectedProcesses={selectedProcesses}
          comparisonType={comparisonType}
          units={units}
        />
      )}
    </div>
  );
};

export default Reports;
