'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import { 
  User, 
  MapPin, 
  Briefcase, 
  CreditCard, 
  Upload, 
  Save, 
  Send,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function OnboardingPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('basic');
  const [status, setStatus] = useState('Draft');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    basic: {
      fullName: '',
      dateOfBirth: '',
      gender: '',
      nationality: ''
    },
    job: {
      department: '',
      designation: '',
      dateOfJoining: '',
      employmentType: ''
    },
    contact: {
      email: '',
      phone: '',
      address: '',
      city: ''
    },
    bank: {
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      salary: ''
    },
    docs: {
      resume: null as any,
      aadhar: null as any,
      pan: null as any,
      experienceLetter: null as any,
      certificates: null as any
    }
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchOnboardingData = async () => {
      try {
        const response = await api.get('/onboarding');
        if (response.data.data) {
          const data = response.data.data;
          setFormData({
            basic: data.basic || formData.basic,
            job: data.job || formData.job,
            contact: data.contact || formData.contact,
            bank: data.bank || formData.bank,
            docs: data.docs || formData.docs
          });
          setStatus(data.status || 'Draft');
        }
      } catch (error) {
        console.error('Failed to fetch onboarding data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOnboardingData();
  }, [user, router]);

  // Debounced Autosave
  useEffect(() => {
    if (isLoading || status === 'Submitted' || status === 'Approved') return;

    const timer = setTimeout(() => {
      handleSave(true); // silent save
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData]);

  if (!user || isLoading) {
    if (!user) return null;
    return (
      <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </main>
      </div>
    );
  }

  const sections = [
    { id: 'basic', name: 'Basic Details', icon: User },
    { id: 'job', name: 'Job Details', icon: Briefcase },
    { id: 'contact', name: 'Contact Info', icon: MapPin },
    { id: 'bank', name: 'Bank & Salary', icon: CreditCard },
    { id: 'docs', name: 'Documents', icon: Upload },
  ];

  const handleSave = async (silent = false) => {
    if (!silent) setIsSaving(true);
    setSaveError('');
    if (!silent) setSaveMessage('');
    
    try {
      // Prepare data for save (convert file objects to something serializable or handle separately)
      // For now, we only save the metadata/selection if they were already uploaded
      const dataToSave = {
        ...formData,
        status
      };

      const response = await api.post('/onboarding/save', dataToSave);
      
      if (!silent) {
        setSaveMessage('✓ Onboarding data saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error: any) {
      if (!silent) {
        setSaveError(error.response?.data?.detail || 'Failed to save onboarding data');
        setTimeout(() => setSaveError(''), 3000);
      }
    } finally {
      if (!silent) setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setSaveError('');
    
    try {
      await api.post('/onboarding/submit', {
        ...formData,
        status: 'Submitted'
      });
      
      setStatus('Submitted');
      setSaveMessage('✓ Onboarding submitted for approval!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error: any) {
      setSaveError(error.response?.data?.detail || 'Failed to submit onboarding');
      setTimeout(() => setSaveError(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen">
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                status === 'Draft' ? 'bg-slate-100 text-slate-500' : 
                status === 'Submitted' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                Status: {status}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Employee Onboarding</h2>
            <p className="text-slate-500 font-bold mt-1 opacity-80 uppercase text-[10px] tracking-widest">New Hire Provisioning System</p>
          </div>
          <div className="flex flex-col gap-2">
            {saveMessage && (
              <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg flex items-center gap-2">
                <CheckCircle2 size={16} /> {saveMessage}
              </div>
            )}
            {saveError && (
              <div className="text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} /> {saveError}
              </div>
            )}
            <div className="flex gap-3">
              <button 
                onClick={() => handleSave()}
                disabled={isSaving || status === 'Approved'}
                className="bg-white border-2 border-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-black text-xs hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={18} /> {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSaving || status === 'Approved'}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <Send size={18} /> {isSaving ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button 
                  key={section.id} 
                  onClick={() => setActiveSection(section.id)} 
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-sm ${
                    activeSection === section.id 
                      ? 'bg-slate-900 text-white shadow-lg' 
                      : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
                  }`}
                >
                  <Icon size={18} />
                  <span>{section.name}</span>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-12">
            {activeSection === 'basic' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <h3 className="text-2xl font-black text-slate-900">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField 
                    label="Full Name" 
                    placeholder="John Doe"
                    value={formData.basic.fullName}
                    onChange={(e: any) => setFormData({...formData, basic: {...formData.basic, fullName: e.target.value}})}
                  />
                  <InputField 
                    label="Date of Birth" 
                    type="date"
                    value={formData.basic.dateOfBirth}
                    onChange={(e: any) => setFormData({...formData, basic: {...formData.basic, dateOfBirth: e.target.value}})}
                  />
                  <InputField 
                    label="Gender" 
                    type="select" 
                    options={['Male', 'Female', 'Other']}
                    value={formData.basic.gender}
                    onChange={(e: any) => setFormData({...formData, basic: {...formData.basic, gender: e.target.value}})}
                  />
                  <InputField 
                    label="Nationality" 
                    placeholder="Indian"
                    value={formData.basic.nationality}
                    onChange={(e: any) => setFormData({...formData, basic: {...formData.basic, nationality: e.target.value}})}
                  />
                </div>
              </div>
            )}

            {activeSection === 'job' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <h3 className="text-2xl font-black text-slate-900">Employment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField 
                    label="Department" 
                    type="select" 
                    options={['Software', 'Sales', 'HR', 'Admin']}
                    value={formData.job.department}
                    onChange={(e: any) => setFormData({...formData, job: {...formData.job, department: e.target.value}})}
                  />
                  <InputField 
                    label="Designation" 
                    placeholder="Senior Developer"
                    value={formData.job.designation}
                    onChange={(e: any) => setFormData({...formData, job: {...formData.job, designation: e.target.value}})}
                  />
                  <InputField 
                    label="Date of Joining" 
                    type="date"
                    value={formData.job.dateOfJoining}
                    onChange={(e: any) => setFormData({...formData, job: {...formData.job, dateOfJoining: e.target.value}})}
                  />
                  <InputField 
                    label="Employment Type" 
                    type="select" 
                    options={['Full-time', 'Contract', 'Intern']}
                    value={formData.job.employmentType}
                    onChange={(e: any) => setFormData({...formData, job: {...formData.job, employmentType: e.target.value}})}
                  />
                </div>
              </div>
            )}

            {activeSection === 'contact' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <h3 className="text-2xl font-black text-slate-900">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField 
                    label="Email Address" 
                    type="email"
                    placeholder="john@company.com"
                    value={formData.contact.email}
                    onChange={(e: any) => setFormData({...formData, contact: {...formData.contact, email: e.target.value}})}
                  />
                  <InputField 
                    label="Phone Number" 
                    placeholder="+91 9876543210"
                    value={formData.contact.phone}
                    onChange={(e: any) => setFormData({...formData, contact: {...formData.contact, phone: e.target.value}})}
                  />
                  <InputField 
                    label="Address" 
                    placeholder="123 Street, City"
                    value={formData.contact.address}
                    onChange={(e: any) => setFormData({...formData, contact: {...formData.contact, address: e.target.value}})}
                  />
                  <InputField 
                    label="City" 
                    placeholder="Bangalore"
                    value={formData.contact.city}
                    onChange={(e: any) => setFormData({...formData, contact: {...formData.contact, city: e.target.value}})}
                  />
                </div>
              </div>
            )}

            {activeSection === 'bank' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <h3 className="text-2xl font-black text-slate-900">Financial Setup</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField 
                    label="Bank Name" 
                    placeholder="HDFC Bank"
                    value={formData.bank.bankName}
                    onChange={(e: any) => setFormData({...formData, bank: {...formData.bank, bankName: e.target.value}})}
                  />
                  <InputField 
                    label="Account Number" 
                    placeholder="50100..."
                    value={formData.bank.accountNumber}
                    onChange={(e: any) => setFormData({...formData, bank: {...formData.bank, accountNumber: e.target.value}})}
                  />
                  <InputField 
                    label="IFSC Code" 
                    placeholder="HDFC0001"
                    value={formData.bank.ifscCode}
                    onChange={(e: any) => setFormData({...formData, bank: {...formData.bank, ifscCode: e.target.value}})}
                  />
                  <InputField 
                    label="Proposed Annual CTC" 
                    placeholder="₹ 12,00,000"
                    value={formData.bank.salary}
                    onChange={(e: any) => setFormData({...formData, bank: {...formData.bank, salary: e.target.value}})}
                  />
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mt-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Statutory Benefits</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-xl border border-slate-200">
                      <input type="checkbox" className="w-4 h-4 rounded text-blue-600" defaultChecked />
                      <span className="text-xs font-bold text-slate-700">PF Contribution</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-xl border border-slate-200">
                      <input type="checkbox" className="w-4 h-4 rounded text-blue-600" defaultChecked />
                      <span className="text-xs font-bold text-slate-700">ESIC Benefit</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-white rounded-xl border border-slate-200">
                      <input type="checkbox" className="w-4 h-4 rounded text-blue-600" defaultChecked />
                      <span className="text-xs font-bold text-slate-700">Health Insurance</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'docs' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                <h3 className="text-2xl font-black text-slate-900">Required Documents</h3>
                <div className="grid grid-cols-1 gap-4">
                  <FileUploadItem 
                    label="Aadhar Card / ID Proof" 
                    status={formData.docs.aadhar ? "Uploaded" : "Pending"}
                    fileName={formData.docs.aadhar?.name}
                    onChange={(file: File) => setFormData({...formData, docs: {...formData.docs, aadhar: file}})}
                  />
                  <FileUploadItem 
                    label="PAN Card" 
                    status={formData.docs.pan ? "Uploaded" : "Pending"}
                    fileName={formData.docs.pan?.name}
                    onChange={(file: File) => setFormData({...formData, docs: {...formData.docs, pan: file}})}
                  />
                  <FileUploadItem 
                    label="Resume" 
                    status={formData.docs.resume ? "Uploaded" : "Pending"}
                    fileName={formData.docs.resume?.name}
                    onChange={(file: File) => setFormData({...formData, docs: {...formData.docs, resume: file}})}
                  />
                  <FileUploadItem 
                    label="Education Certificates" 
                    status={formData.docs.certificates ? "Uploaded" : "Pending"}
                    fileName={formData.docs.certificates?.name}
                    onChange={(file: File) => setFormData({...formData, docs: {...formData.docs, certificates: file}})}
                  />
                </div>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between">
              <button 
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.id === activeSection);
                  if (currentIndex > 0) setActiveSection(sections[currentIndex - 1].id);
                }}
                className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Previous Step
              </button>
              <button 
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.id === activeSection);
                  if (currentIndex < sections.length - 1) {
                    setActiveSection(sections[currentIndex + 1].id);
                  } else {
                    handleSave();
                  }
                }}
                className="bg-slate-100 text-slate-900 px-8 py-3 rounded-xl font-black text-xs hover:bg-slate-200 transition-all"
              >
                {activeSection === 'docs' ? 'Save Draft' : 'Save & Continue'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function InputField({ label, placeholder, type = 'text', options = [], value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>
      {type === 'select' ? (
        <select 
          value={value || ''}
          onChange={onChange}
          className="w-full border-none p-4 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer"
        >
          <option value="">Select {label}</option>
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input 
          type={type} 
          placeholder={placeholder}
          value={value || ''}
          onChange={onChange}
          className="w-full border-none p-4 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-slate-900" 
        />
      )}
    </div>
  );
}

function FileUploadItem({ label, status, fileName, onChange }: any) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      onChange?.(e.target.files[0]);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
          {selectedFile || status === 'Uploaded' ? <FileText className="text-emerald-500" size={18} /> : <Upload size={18} />}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900">{label}</p>
          <p className={`text-[9px] font-black uppercase tracking-tighter ${selectedFile || status === 'Uploaded' ? 'text-emerald-500' : 'text-amber-500'}`}>
            {selectedFile ? selectedFile.name : fileName ? fileName : status}
          </p>
        </div>
      </div>
      <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer">
        {selectedFile || status === 'Uploaded' ? 'Change File' : 'Choose File'}
        <input 
          type="file" 
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
        />
      </label>
    </div>
  );
}
