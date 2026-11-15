'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  UploadCloud,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Bus,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Clock,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  Check,
  X,
  Loader2,
  Download,
  Trash2,
  ToggleLeft,
  ToggleRight,
  UserPlus
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  gender?: string;
  grade?: string;
  section?: string;
  transport?: string;
  busRoute?: string;
  busStop?: string;
  stayBack?: boolean;
  remedial?: boolean;
  consentStatus?: string;
  parentName?: string;
  parentSalutation?: string;
  parentEmail?: string;
  parentWhatsApp?: string;
  guardians?: any[];
  assessments?: any[];
}

export default function RosterPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterTab, setFilterTab] = useState<'ALL' | 'BUS_14' | 'STAY_BACK' | 'REMEDIAL' | 'PENDING_CONSENT'>('ALL');
  const [search, setSearch] = useState<string>('');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // Import modal states
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importing, setImporting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);

  // Add Single Student Modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addingStudent, setAddingStudent] = useState<boolean>(false);
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    gender: 'Male',
    parentSalutation: 'Mr.',
    parentName: '',
    parentEmail: '',
    parentWhatsApp: '',
    transport: 'Bus 14',
    busRoute: 'Bus 14',
    busStop: '',
    stayBack: false,
    remedial: false,
    consentStatus: 'SUBMITTED'
  });
  const [addError, setAddError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchRoster = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/roster');
      const data = await res.json();
      setStudents(data.students || []);
    } catch (err) {
      console.error('Failed to load roster:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleExpand = (id: string) => {
    setExpandedStudentId(expandedStudentId === id ? null : id);
  };

  // Inline Quick Toggle for stayBack & remedial
  const handleToggleFlag = async (studentId: string, field: 'stayBack' | 'remedial') => {
    // 1. Optimistic Update
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return { ...s, [field]: !s[field] };
        }
        return s;
      })
    );

    const student = students.find((s) => s.id === studentId);
    const newVal = !student?.[field];

    try {
      // Try hitting /api/roster/student with PUT
      const res = await fetch('/api/roster/student', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: studentId, [field]: newVal })
      }).catch(() => null);

      if (!res || !res.ok) {
        // Fallback update via /api/roster/import
        if (student) {
          await fetch('/api/roster/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              students: [{ ...student, [field]: newVal }]
            })
          }).catch(() => {});
        }
      }
      showToast(`Updated ${field === 'stayBack' ? 'Stay-back' : 'Remedial'} for ${student?.name}`);
    } catch (err) {
      console.error('Error toggling flag:', err);
    }
  };

  const filteredStudents = students.filter((s) => {
    // 1. Tab filter
    if (filterTab === 'BUS_14' && s.busRoute !== 'Bus 14') return false;
    if (filterTab === 'STAY_BACK' && !s.stayBack) return false;
    if (filterTab === 'REMEDIAL' && !s.remedial) return false;
    if (filterTab === 'PENDING_CONSENT' && s.consentStatus === 'SUBMITTED') return false;

    // 2. Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchParent = s.parentName?.toLowerCase().includes(q);
      const matchRoute = s.busRoute?.toLowerCase().includes(q);
      const matchEmail = s.parentEmail?.toLowerCase().includes(q);
      return matchName || matchParent || matchRoute || matchEmail;
    }

    return true;
  });

  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.name.trim() || !newStudentForm.parentName.trim()) {
      setAddError('Student Name and Parent Name are required');
      return;
    }

    setAddingStudent(true);
    setAddError(null);

    const newId = `STU-GEMS-${Date.now().toString().slice(-6)}`;
    const studentPayload = {
      id: newId,
      ...newStudentForm,
      busRoute: newStudentForm.transport
    };

    try {
      // 1. Try POST /api/roster/student
      let res = await fetch('/api/roster/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentPayload)
      }).catch(() => null);

      // 2. Fallback to /api/roster/import
      if (!res || !res.ok) {
        res = await fetch('/api/roster/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ students: [studentPayload] })
        });
      }

      const data = await res.json();
      if (res.ok && (data.success || data.student)) {
        showToast(`Student ${newStudentForm.name} added successfully!`);
        setShowAddModal(false);
        setNewStudentForm({
          name: '',
          gender: 'Male',
          parentSalutation: 'Mr.',
          parentName: '',
          parentEmail: '',
          parentWhatsApp: '',
          transport: 'Bus 14',
          busRoute: 'Bus 14',
          busStop: '',
          stayBack: false,
          remedial: false,
          consentStatus: 'SUBMITTED'
        });
        fetchRoster();
      } else {
        setAddError(data.error || 'Failed to add student');
      }
    } catch (err: any) {
      setAddError(err.message || 'Error creating student record');
    } finally {
      setAddingStudent(false);
    }
  };

  const handleImportSubmit = async () => {
    if (!importJsonText.trim()) return;
    setImporting(true);
    setImportResult(null);

    try {
      let parsed = JSON.parse(importJsonText);
      const studentsArray = Array.isArray(parsed) ? parsed : (parsed.students || [parsed]);

      const res = await fetch('/api/roster/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: studentsArray })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setImportResult({
          success: true,
          message: `Successfully imported ${data.imported || studentsArray.length} student record(s)!`
        });
        fetchRoster();
        setTimeout(() => {
          setShowImportModal(false);
          setImportJsonText('');
          setImportResult(null);
        }, 1500);
      } else {
        setImportResult({
          success: false,
          message: data.error || 'Import failed'
        });
      }
    } catch (err: any) {
      setImportResult({
        success: false,
        message: err.message || 'Invalid JSON format'
      });
    } finally {
      setImporting(false);
    }
  };

  const loadSampleImport = () => {
    const sample = [
      {
        id: `STU-GEMS-${Math.floor(1000 + Math.random() * 9000)}`,
        name: 'Karan Malhotra',
        gender: 'Male',
        parentName: 'Deepak Malhotra',
        parentSalutation: 'Mr.',
        parentEmail: 'deepak.malhotra@example.com',
        parentWhatsApp: '+971501112233',
        transport: 'Bus 14',
        busRoute: 'Bus 14',
        busStop: 'Tecom Block B',
        stayBack: false,
        remedial: true,
        lastScore: 65,
        consentStatus: 'PENDING'
      }
    ];
    setImportJsonText(JSON.stringify(sample, null, 2));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs flex items-center space-x-2 animate-in fade-in slide-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Grade 11-A Student Directory</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gems-green/10 text-gems-green">
              {students.length} Total Enrolled
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Official class roster with linked parent contact points, transportation routes, and inline activity toggles.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={fetchRoster}
            className="p-2 text-gray-500 hover:text-gray-800 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            title="Refresh Directory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Download CSV Template Button */}
          <a
            href="/api/roster/template"
            download="gems_class_roster_template.csv"
            className="bg-white border border-gray-300 hover:border-gems-green text-gray-700 font-semibold px-3.5 py-2 rounded-xl text-xs transition-colors flex items-center space-x-1.5 shadow-2xs"
            title="Download formatted CSV spreadsheet template"
          >
            <Download className="w-3.5 h-3.5 text-gems-green" />
            <span>Download CSV Template</span>
          </a>

          {/* Import Roster Button */}
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="bg-white border border-gray-300 hover:border-gems-green text-gray-700 font-semibold px-3.5 py-2 rounded-xl text-xs transition-colors flex items-center space-x-1.5 shadow-2xs"
          >
            <UploadCloud className="w-3.5 h-3.5 text-amber-500" />
            <span>Import CSV / JSON</span>
          </button>

          {/* Add Student Quick Modal Button */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-gems-green hover:bg-gems-green-dark text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center space-x-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFilterTab('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterTab === 'ALL'
                ? 'bg-gems-green text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Students ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('BUS_14')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 ${
              filterTab === 'BUS_14'
                ? 'bg-gems-green text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>Bus 14 ({students.filter((s) => s.busRoute === 'Bus 14').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('STAY_BACK')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 ${
              filterTab === 'STAY_BACK'
                ? 'bg-gems-green text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Stay-back ({students.filter((s) => s.stayBack).length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('REMEDIAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 ${
              filterTab === 'REMEDIAL'
                ? 'bg-gems-green text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Remedial ({students.filter((s) => s.remedial).length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('PENDING_CONSENT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 ${
              filterTab === 'PENDING_CONSENT'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Pending Consent ({students.filter((s) => s.consentStatus !== 'SUBMITTED').length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, parent, route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gems-green focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gems-green mb-2" />
            <span>Loading class directory...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">No students match this filter</p>
            <p className="text-xs text-gray-400 mt-1">Try resetting filters or searching for another student</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-600 uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 w-10"></th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Primary Guardian</th>
                  <th className="py-3 px-4">Transport & Stop</th>
                  <th className="py-3 px-4">Inline Quick Toggles</th>
                  <th className="py-3 px-4">Consent Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => {
                  const isExpanded = expandedStudentId === student.id;
                  const primaryGuardian = student.guardians?.[0] || {
                    name: student.parentName,
                    email: student.parentEmail,
                    whatsappNumber: student.parentWhatsApp,
                    salutation: student.parentSalutation
                  };

                  return (
                    <React.Fragment key={student.id}>
                      <tr
                        onClick={() => toggleExpand(student.id)}
                        className={`cursor-pointer transition-colors ${
                          isExpanded ? 'bg-emerald-50/40' : 'hover:bg-gray-50/70'
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gems-green" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900">{student.name}</div>
                          <div className="text-[11px] text-gray-400">
                            {student.gender || 'Student'} &bull; ID: {student.id.slice(-6)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-800">
                            {primaryGuardian.salutation ? `${primaryGuardian.salutation} ` : ''}
                            {primaryGuardian.name || 'Not Linked'}
                          </div>
                          <div className="text-[11px] text-gray-500 font-mono">
                            {primaryGuardian.email || '—'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="inline-flex items-center space-x-1 font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                            <Bus className="w-3 h-3" />
                            <span>{student.busRoute || student.transport || 'Private Car'}</span>
                          </div>
                          {student.busStop && (
                            <div className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[180px]">
                              {student.busStop}
                            </div>
                          )}
                        </td>

                        {/* Inline Quick Toggles for Stay-back & Remedial */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                            {/* Stay-back toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleFlag(student.id, 'stayBack')}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1 ${
                                student.stayBack
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                              title="Toggle Stay-back status"
                            >
                              <Clock className="w-2.5 h-2.5" />
                              <span>{student.stayBack ? 'Stay-back: ON' : 'Stay-back: OFF'}</span>
                            </button>

                            {/* Remedial toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleFlag(student.id, 'remedial')}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1 ${
                                student.remedial
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                              title="Toggle Remedial academic flag"
                            >
                              <BookOpen className="w-2.5 h-2.5" />
                              <span>{student.remedial ? 'Remedial: ON' : 'Remedial: OFF'}</span>
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {student.consentStatus === 'SUBMITTED' ? (
                            <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Submitted
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-3 h-3 mr-1" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(student.id);
                            }}
                            className="text-gems-green font-semibold hover:underline"
                          >
                            {isExpanded ? 'Hide' : 'Expand'}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Guardian & Assessment Detail Panel */}
                      {isExpanded && (
                        <tr className="bg-slate-50 border-y border-emerald-100">
                          <td colSpan={7} className="p-4 sm:p-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Guardian Contacts */}
                              <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                  Guardian Directory
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Full Name:</span>
                                    <span className="font-semibold text-gray-900">
                                      {primaryGuardian.salutation} {primaryGuardian.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500 flex items-center space-x-1">
                                      <Mail className="w-3 h-3" />
                                      <span>Email:</span>
                                    </span>
                                    <span className="font-mono text-gray-800 text-[11px]">
                                      {primaryGuardian.email || 'None'}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500 flex items-center space-x-1">
                                      <Phone className="w-3 h-3" />
                                      <span>WhatsApp:</span>
                                    </span>
                                    <span className="font-mono text-gray-800 text-[11px]">
                                      {primaryGuardian.whatsappNumber || 'None'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Transportation Specifics */}
                              <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                  Transport Logistics
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Designated Bus:</span>
                                    <span className="font-semibold text-amber-800">{student.busRoute || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Pick/Drop Stop:</span>
                                    <span className="font-medium text-gray-800">{student.busStop || 'Main Gate'}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Stay-back Eligible:</span>
                                    <span className="font-medium">{student.stayBack ? 'Yes (4:00 PM bus)' : 'No (2:15 PM regular)'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Academic Records */}
                              <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                  Assessments & Focus
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Remedial Flag:</span>
                                    <span className="font-semibold text-blue-700">
                                      {student.remedial ? 'Mandatory Support' : 'Good Standing'}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Consent Status:</span>
                                    <span className="font-semibold text-gray-800">{student.consentStatus}</span>
                                  </div>
                                  {student.assessments && student.assessments.length > 0 && (
                                    <div className="text-[11px] text-gray-600 pt-1 border-t border-gray-100">
                                      Latest Score: <strong>{student.assessments[0].subject} ({student.assessments[0].score}%)</strong>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Single Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-gems-green" />
                <h3 className="text-base font-bold text-gray-900">Add New Student to Grade 11-A</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-4">
              {/* Student details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.name}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                    placeholder="e.g. Aryan Sehgal"
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Gender</label>
                  <select
                    value={newStudentForm.gender}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, gender: e.target.value })}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              {/* Guardian details */}
              <div className="pt-2 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-900 block mb-2">Guardian Contact Information</span>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Salutation</label>
                    <select
                      value={newStudentForm.parentSalutation}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, parentSalutation: e.target.value })}
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Parent Name *</label>
                    <input
                      type="text"
                      required
                      value={newStudentForm.parentName}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, parentName: e.target.value })}
                      placeholder="e.g. Vikram Sehgal"
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Parent Email</label>
                    <input
                      type="email"
                      value={newStudentForm.parentEmail}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, parentEmail: e.target.value })}
                      placeholder="parent@example.com"
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Parent WhatsApp (+971...)</label>
                    <input
                      type="text"
                      value={newStudentForm.parentWhatsApp}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, parentWhatsApp: e.target.value })}
                      placeholder="+971501234567"
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Logistics & Flags */}
              <div className="pt-2 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-900 block mb-2">Transport & School Activities</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Transport Route</label>
                    <input
                      type="text"
                      value={newStudentForm.transport}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, transport: e.target.value, busRoute: e.target.value })}
                      placeholder="e.g. Bus 14"
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Bus Stop</label>
                    <input
                      type="text"
                      value={newStudentForm.busStop}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, busStop: e.target.value })}
                      placeholder="e.g. Dubai Marina Gate 1"
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-xs text-gray-700">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newStudentForm.stayBack}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, stayBack: e.target.checked })}
                      className="rounded text-gems-green focus:ring-gems-green"
                    />
                    <span>Stay-back Eligible</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newStudentForm.remedial}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, remedial: e.target.checked })}
                      className="rounded text-gems-green focus:ring-gems-green"
                    />
                    <span>Remedial Student</span>
                  </label>
                </div>
              </div>

              {addError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingStudent}
                  className="bg-gems-green hover:bg-gems-green-dark text-white font-bold px-5 py-2 text-xs rounded-xl transition-colors flex items-center space-x-1.5 disabled:opacity-50 shadow-xs"
                >
                  {addingStudent ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Student...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-amber-300" />
                      <span>Save Student Record</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV / JSON Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-gems-green" />
                <h3 className="text-base font-bold text-gray-900">Import Student Roster</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Paste a JSON array of student records to batch import or update student details and guardian contacts into the GEMS class directory.
            </p>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={loadSampleImport}
                className="text-xs font-semibold text-gems-green hover:underline"
              >
                Load Sample Student Template
              </button>
              <a
                href="/api/roster/template"
                download="gems_class_roster_template.csv"
                className="text-xs font-semibold text-amber-700 hover:underline flex items-center space-x-1"
              >
                <Download className="w-3 h-3" />
                <span>Download CSV Template</span>
              </a>
            </div>

            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste JSON array here..."
              className="w-full text-xs font-mono p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gems-green focus:bg-white"
            />

            {importResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                  importResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {importResult.success ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                )}
                <span>{importResult.message}</span>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                disabled={importing || !importJsonText.trim()}
                className="bg-gems-green hover:bg-gems-green-dark text-white font-bold px-5 py-2 text-xs rounded-xl transition-colors flex items-center space-x-1.5 disabled:opacity-50"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5 text-amber-300" />
                    <span>Import Records</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
