import { useState, useEffect } from 'react';
import { Download, Filter, BarChart2, TrendingUp, AlertTriangle, LineChart, Target, Clock } from 'lucide-react';
import { timeEntriesService, usersService, orgUnitsService } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { TIME_ENTRY_STATUS } from '../constants';
import { isAdminOrSuperadmin, isOperario } from '../utils/roleHelpers';
import { isDateInRange } from '../utils/dateHelpers';

// Componentes modularizados
import { ReportFilters } from '../components/reports/ReportFilters';
import { ReportMetrics } from '../components/reports/ReportMetrics';
import { ReportCharts } from '../components/reports/ReportCharts';
import { ReportTable } from '../components/reports/ReportTable';
import { ComparativeAnalysis } from '../components/reports/ComparativeAnalysis';
import { ProductivityAnalysis } from '../components/reports/ProductivityAnalysis';
import { AreaEfficiencyReport } from '../components/reports/AreaEfficiencyReport';
import { OvertimeReport } from '../components/reports/OvertimeReport';
import { MonthlyTrendsReport } from '../components/reports/MonthlyTrendsReport';
import { GoalComplianceReport } from '../components/reports/GoalComplianceReport';
import { TimeDistributionReport } from '../components/reports/TimeDistributionReport';

// Utilidades
import { getUnitAndChildren, calculateReportMetrics } from '../utils/reportCalculations';
import { exportToCSV } from '../utils/reportExport';
import { exportToExcel } from '../utils/exportToExcel';
import { exportToPDF } from '../utils/exportToPDF';

export const Reports = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('all');
  
  const [users, setUsers] = useState([]);
  const [units, setUnits] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [reportData, setReportData] = useState({
    totalHours: 0,
    totalEntries: 0,
    byUser: [],
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
      case 'custom':
        break;
      default:
        break;
    }
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
      console.error('Error loading filters:', error);
    }
  };

  const loadReportData = async () => {
    try {
      setLoading(true);

      const { timeEntries: entries } = await timeEntriesService.getAll();

      // Filtrar por fechas (usando helper)
      let filtered = entries.filter(entry => {
        return isDateInRange(entry.start_time, startDate, endDate) && 
               entry.status === TIME_ENTRY_STATUS.COMPLETED;
      });

      // Filtrar por usuario
      if (isOperario(user)) {
        filtered = filtered.filter(e => e.user_id === user.id);
      } else if (selectedUser !== 'all') {
        filtered = filtered.filter(e => e.user_id === selectedUser);
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
      console.error('Error loading report data:', error);
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
          selectedUnit={selectedUnit}
          setSelectedUnit={setSelectedUnit}
          users={users}
          units={units}
        />
      </Card>

      {/* Indicador de filtro activo */}
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
              General
            </button>
            <button
              onClick={() => setActiveTab('efficiency')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'efficiency'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Eficiencia por Área
            </button>
            <button
              onClick={() => setActiveTab('overtime')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'overtime'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Horas Extras
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'trends'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <LineChart className="h-4 w-4 mr-2" />
              Tendencias
            </button>
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
            <button
              onClick={() => setActiveTab('distribution')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'distribution'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clock className="h-4 w-4 mr-2" />
              Distribución Horaria
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
          <ReportCharts reportData={reportData} />

          {/* Tabla */}
          <ReportTable 
            reportData={reportData} 
            units={units}
            selectedUnit={selectedUnit}
          />

          {/* Análisis Avanzados */}
          {filteredEntries.length > 0 && (
            <>
              {/* Análisis Comparativo */}
              <ComparativeAnalysis timeEntries={filteredEntries} />

              {/* Análisis de Trabajo - Visible para operarios siempre, y para admins cuando filtran por usuario */}
              {(isOperario(user) || (isAdminOrSuperadmin(user) && selectedUser !== 'all')) && (
                <ProductivityAnalysis timeEntries={filteredEntries} />
              )}
            </>
          )}
        </>
      )}

      {/* Reporte de Eficiencia por Área */}
      {activeTab === 'efficiency' && (
        <AreaEfficiencyReport 
          timeEntries={filteredEntries} 
          units={units}
        />
      )}

      {/* Reporte de Horas Extras */}
      {activeTab === 'overtime' && (
        <OvertimeReport timeEntries={filteredEntries} />
      )}

      {/* Reporte de Tendencias Mensuales */}
      {activeTab === 'trends' && (
        <MonthlyTrendsReport timeEntries={filteredEntries} />
      )}

      {/* Reporte de Cumplimiento de Objetivos */}
      {activeTab === 'goals' && (
        <GoalComplianceReport timeEntries={filteredEntries} />
      )}

      {/* Reporte de Distribución Horaria */}
      {activeTab === 'distribution' && (
        <TimeDistributionReport timeEntries={filteredEntries} />
      )}
    </div>
  );
};

export default Reports;
