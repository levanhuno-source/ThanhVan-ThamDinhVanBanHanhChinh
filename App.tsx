
import React, { useState, useRef } from 'react';
import { auditDocument } from './services/geminiService';
import { AppState, AuditResponse } from './types';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAudit = async () => {
    if (!inputText && selectedFiles.length === 0) {
      alert('Vui lòng nhập văn bản hoặc tải lên file.');
      return;
    }

    setStatus(AppState.LOADING);
    setError('');
    
    try {
      let fileData;
      if (selectedFiles.length > 0) {
        const file = selectedFiles[0];
        const base64 = await fileToBase64(file);
        fileData = { data: base64, mimeType: file.type };
      }

      const response = await auditDocument(inputText, fileData);
      setResult(response);
      setStatus(AppState.RESULT);
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi khi xử lý. Vui lòng kiểm tra lại file hoặc nội dung.');
      setStatus(AppState.ERROR);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const reset = () => {
    setInputText('');
    setSelectedFiles([]);
    setResult(null);
    setStatus(AppState.IDLE);
  };

  return (
    <div className="h-screen flex flex-col bg-transparent">
      {/* Navbar */}
      <nav className="bg-pro-blue text-white px-6 py-4 flex justify-between items-center shadow-xl z-10 border-b-2 border-sky-400">
        <div className="flex items-center gap-4">
          <div className="bg-white p-1.5 rounded-lg shadow-lg">
            <svg className="w-6 h-6 text-pro-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight uppercase leading-none">AuditPro <span className="font-light opacity-80">Blue</span></h1>
            <span className="text-[10px] font-black tracking-widest mt-1 uppercase text-sky-200">Trường mầm non Tân Lập B</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={reset}
            className="text-sm font-bold hover:bg-blue-700 px-4 py-2 rounded-lg transition-all border border-blue-400/30 hover:border-sky-300"
          >
            Làm mới
          </button>
          <div className="h-6 w-px bg-blue-500"></div>
          <p className="text-xs font-black hidden sm:block text-sky-100 uppercase tracking-wide">Nghị định 30/2020/NĐ-CP</p>
        </div>
      </nav>

      {/* Main Content Split View */}
      <main className="flex-grow flex flex-col md:flex-row overflow-hidden p-4 gap-4">
        
        {/* Left Side: Input & Audit Report */}
        <div className="w-full md:w-1/2 flex flex-col glass-panel rounded-3xl shadow-2xl border border-sky-200 overflow-hidden">
          <div className="p-5 bg-sky-50/70 border-b border-sky-100">
             <div className="flex flex-col gap-4">
                <div className="relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Dán nội dung văn bản hành chính tại đây..."
                    className="w-full h-36 p-4 text-sm border-2 border-sky-100 rounded-2xl focus:ring-4 focus:ring-sky-100 focus:border-sky-400 outline-none resize-none transition-all bg-white/80 placeholder:text-sky-300"
                  />
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <input 
                      type="file" 
                      multiple 
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden" 
                      ref={fileInputRef} 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white hover:bg-sky-50 text-pro-blue p-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-bold shadow-md border border-sky-100 active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      {selectedFiles.length > 0 ? `${selectedFiles.length} file đã chọn` : 'Tải lên Tài liệu'}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleAudit}
                  disabled={status === AppState.LOADING}
                  className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 ${
                    status === AppState.LOADING ? 'bg-slate-400 cursor-not-allowed' : 'bg-pro-blue hover:bg-blue-800 hover:shadow-blue-200'
                  }`}
                >
                  {status === AppState.LOADING ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      HỆ THỐNG ĐANG PHÂN TÍCH...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      BẮT ĐẦU THẨM ĐỊNH CHI TIẾT
                    </>
                  )}
                </button>
             </div>
          </div>

          <div className="flex-grow overflow-y-auto p-6 custom-scrollbar bg-white/50">
            <h3 className="text-[11px] font-black text-pro-blue uppercase tracking-[0.2em] mb-5 flex items-center gap-3">
              <span className="w-4 h-1 rounded-full bg-sky-400"></span>
              Cửa sổ 1: Kết quả thẩm định thể thức
            </h3>
            {status === AppState.IDLE && (
              <div className="flex flex-col items-center justify-center h-full text-sky-200/60">
                <div className="p-8 rounded-full bg-sky-50 mb-4">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002-2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <p className="font-bold text-sky-300">Hệ thống đang chờ nội dung văn bản</p>
                <p className="text-xs text-sky-200 mt-2 italic">Dán text hoặc tải file PDF/Word để bắt đầu</p>
              </div>
            )}
            {status === AppState.LOADING && (
              <div className="space-y-6">
                <div className="h-4 bg-sky-100 rounded-full w-3/4 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-32 bg-sky-50/50 rounded-2xl animate-pulse"></div>
                  <div className="h-20 bg-sky-50/50 rounded-2xl animate-pulse"></div>
                </div>
                <div className="h-4 bg-sky-100 rounded-full w-1/2 animate-pulse"></div>
              </div>
            )}
            {status === AppState.RESULT && result && (
              <div className="prose prose-sm max-w-none prose-sky animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div dangerouslySetInnerHTML={{ __html: result.auditReport.replace(/\n/g, '<br/>') }} className="text-sm text-slate-700 leading-relaxed font-medium" />
              </div>
            )}
            {status === AppState.ERROR && (
              <div className="p-5 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3">
                <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Suggested Completed Document */}
        <div className="w-full md:w-1/2 flex flex-col glass-panel rounded-3xl shadow-2xl border border-sky-200 overflow-hidden">
          <div className="p-5 border-b border-sky-100 flex justify-between items-center bg-sky-50/40">
            <h3 className="text-[11px] font-black text-pro-blue uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-4 h-1 rounded-full bg-sky-400"></span>
              Cửa sổ 2: Đề xuất văn bản hoàn chỉnh
            </h3>
            {result && (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(result.correctedDocument);
                  alert('Đã sao chép văn bản hoàn chỉnh!');
                }}
                className="text-xs bg-pro-blue text-white px-4 py-2 rounded-xl font-black flex items-center gap-2 shadow-lg hover:bg-blue-800 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 8h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                SAO CHÉP
              </button>
            )}
          </div>
          <div className="flex-grow overflow-y-auto p-6 md:p-8 custom-scrollbar bg-white/40">
            {status === AppState.RESULT && result ? (
              <div className="font-serif text-slate-800 text-sm whitespace-pre-wrap leading-loose p-10 border-2 border-sky-50 shadow-2xl rounded-2xl bg-white animate-in zoom-in-95 duration-500" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                {result.correctedDocument}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-sky-200/60">
                <div className="p-8 rounded-full bg-sky-50 mb-4">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <p className="font-bold text-sky-300">Văn bản gợi ý sẽ hiển thị tại đây</p>
                <p className="text-xs text-sky-200 mt-2 italic text-center max-w-[200px]">Sau khi phân tích, hệ thống sẽ tự động trình bày lại đúng chuẩn NĐ 30</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Status Bar & Copyright */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-sky-200 px-6 py-3 flex flex-col gap-2 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-3">
          <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-[10px] text-pro-blue font-black uppercase tracking-[0.1em]">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-sky-400 rounded-full shadow-sm shadow-sky-400/50"></span> 
              ENGINE: GEMINI 3 PRO PREVIEW
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-sky-400 rounded-full shadow-sm shadow-sky-400/50"></span> 
              TIÊU CHUẨN: NGHỊ ĐỊNH 30/2020/NĐ-CP
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-[10px] text-pro-blue font-black uppercase">
            <div className={`w-3 h-3 rounded-full shadow-lg ${status === AppState.RESULT ? 'bg-green-500 shadow-green-500/50 animate-pulse' : 'bg-sky-300 shadow-sky-300/50'}`}></div>
            <span className="tracking-[0.15em]">{status === AppState.IDLE ? 'SẴN SÀNG HOẠT ĐỘNG' : status}</span>
          </div>
        </div>
        
        <div className="text-center text-[9px] md:text-[10px] text-pro-blue font-black tracking-widest uppercase border-t border-sky-100 pt-2 opacity-80">
          BẢN QUYỀN: CÔ GIÁO LÊ THANH VÂN - TRƯỜNG MẦM NON TÂN LẬP B - XÃ Ô DIÊN - TP HÀ NỘI
        </div>
      </footer>
    </div>
  );
}
