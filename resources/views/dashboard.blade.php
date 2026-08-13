<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SIKAP Gondang - Portal Informasi Kependudukan & Pemetaan</title>
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS v3 -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            50: '#f0f9ff',
                            100: '#e0f2fe',
                            500: '#0ea5e9',
                            600: '#0284c7',
                            900: '#0c4a6e',
                        }
                    }
                }
            }
        }
    </script>
    
    <!-- FontAwesome v6 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        .glass {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        #hero-section {
            position: relative;
            background-color: #0f172a;
        }
        #hero-section::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(to right, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.4) 60%, rgba(15, 23, 42, 0.1) 100%);
            z-index: 2;
        }
        .hero-slide {
            position: absolute;
            inset: 0;
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            opacity: 0;
            transition: opacity 1.5s ease-in-out;
            z-index: 1;
        }
        .hero-slide.active {
            opacity: 1;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1; 
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8; 
        }
        
        /* Tom Select Styling - Modern Premium */
        .ts-control { 
            border-radius: 9999px !important; 
            padding: 0.75rem 2.5rem 0.75rem 1.25rem !important; 
            border: 1px solid #e2e8f0 !important; 
            box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.05), 0 2px 4px -1px rgba(14, 165, 233, 0.03) !important; 
            font-size: 0.875rem !important; 
            background-color: #ffffff !important; 
            font-family: 'Inter', sans-serif !important;
            font-weight: 600 !important;
            color: #1e293b !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            cursor: pointer !important;
        }
        .ts-wrapper:not(.disabled) .ts-control:hover {
            box-shadow: 0 10px 15px -3px rgba(14, 165, 233, 0.1), 0 4px 6px -2px rgba(14, 165, 233, 0.05) !important;
            border-color: #bae6fd !important;
            transform: translateY(-1px);
        }
        .ts-wrapper.focus .ts-control { 
            border-color: #0ea5e9 !important; 
            box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.15) !important; 
        }
        .ts-dropdown { 
            border-radius: 1rem !important; 
            font-size: 0.875rem !important; 
            font-family: 'Inter', sans-serif !important; 
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important; 
            border: 1px solid #f1f5f9 !important; 
            margin-top: 8px !important; 
            padding: 0.5rem !important;
            animation: slideDown 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            transform-origin: top;
            opacity: 0;
        }
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .ts-dropdown .option {
            border-radius: 0.5rem !important;
            padding: 0.6rem 1rem !important;
            margin-bottom: 2px !important;
            color: #64748b !important;
            font-weight: 500 !important;
            transition: all 0.15s ease !important;
        }
        .ts-dropdown .option:hover {
            background-color: #f8fafc !important;
            color: #0ea5e9 !important;
        }
        .ts-dropdown .active { 
            background-color: #f0f9ff !important; 
            color: #0284c7 !important; 
            font-weight: 700 !important; 
        }
        .ts-wrapper.single .ts-control:after {
            border-color: #94a3b8 transparent transparent transparent !important;
            border-width: 5px 4px 0 4px !important;
            right: 1.25rem !important;
            transition: all 0.3s ease !important;
        }
        .ts-wrapper.focus .ts-control:after {
            border-color: transparent transparent #0ea5e9 transparent !important;
            border-width: 0 4px 5px 4px !important;
            transform: translateY(-2px);
        }
    </style>
    
    <!-- Tom Select CSS -->
    <link href="https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/css/tom-select.default.min.css" rel="stylesheet">
</head>
<body class="bg-slate-50 text-slate-800 font-sans antialiased">

    <!-- Header & Navbar -->
    <nav class="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all duration-300">
        <div class="container mx-auto px-4 lg:px-8 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="flex items-center gap-4">
                <img src="{{ asset('img/logo_undip.png') }}" alt="Logo UNDIP" class="h-10 w-auto object-contain drop-shadow-sm">
                <img src="{{ asset('img/logo_pemalang.png') }}" alt="Logo Pemalang" class="h-10 w-auto object-contain drop-shadow-sm">
                <img src="{{ asset('img/logo_kkn.jpeg') }}" alt="Logo KKN" class="h-10 w-auto object-contain rounded-full shadow-sm">
                <div class="h-8 w-px bg-slate-300 mx-1 hidden md:block"></div>
                <h1 class="text-xl font-bold text-brand-900 tracking-tight hidden sm:block">SIKAP Gondang</h1>
            </div>
            
            <div class="flex items-center gap-2">
                <i class="fa-solid fa-location-dot text-brand-600 mr-1 hidden sm:block auth-required hidden"></i>
                <div class="w-36 sm:w-48 z-50 auth-required hidden">
                    <select id="dusun-filter" autocomplete="off" placeholder="Pilih Dusun...">
                        <option value="semua">Semua Dusun</option>
                    </select>
                </div>
                <div class="w-40 sm:w-56 z-50 auth-required hidden">
                    <select id="rt-filter" autocomplete="off" placeholder="Pilih RT/RW..." disabled>
                        <option value="semua">Semua RT/RW</option>
                    </select>
                </div>
                <!-- Login Button -->
                <button id="auth-btn" onclick="toggleAuth()" class="ml-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2">
                    <i class="fa-solid fa-lock" id="auth-btn-icon"></i> <span id="auth-btn-text">Login Admin Desa</span>
                </button>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <header id="hero-section" class="text-white pt-24 pb-56 px-4 lg:px-8 relative overflow-hidden">
        <div id="slider-container"></div>
        
        <!-- Fading Bottom Border -->
        <div class="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-50 to-transparent z-[3]"></div>
        
        <div class="container mx-auto relative z-10 flex flex-col items-start text-left">
            <div class="flex items-center gap-4 mb-6">
                <div class="h-[2px] w-12 bg-[#FCEE7C] shadow-sm"></div>
                <span class="text-slate-100 text-xs md:text-sm font-bold tracking-[0.15em] uppercase drop-shadow-md">
                    Sistem Informasi Kependudukan & Pemetaan Desa Gondang
                </span>
            </div>
            <h2 class="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight drop-shadow-lg text-white" style="font-family: 'Playfair Display', serif;">
                Menapak Gondang,<br>
                <span class="text-[#FCEE7C] italic">Merajut Perubahan</span>
            </h2>
            <p class="text-lg md:text-xl text-slate-100 max-w-3xl font-medium leading-relaxed drop-shadow-md">
                Sistem Pendataan & Pemetaan Terpadu — Portal Kependudukan,<br class="hidden md:block"> UMKM, dan Sanitasi Desa Gondang.
            </p>
        </div>
    </header>

    <!-- Stat Cards (Overlapping) -->
    <div class="container mx-auto px-4 lg:px-8 relative z-20 -mt-28 mb-10">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
            <div class="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 transform hover:-translate-y-1 transition-transform duration-300 text-slate-800 flex flex-col justify-center items-center text-center md:items-start md:text-left">
                <div class="text-brand-500 mb-3"><i class="fa-solid fa-house-chimney fa-2x"></i></div>
                <div class="text-3xl font-extrabold mb-1 text-slate-900" id="stat-rumah">0</div>
                <div class="text-xs md:text-sm text-slate-500 font-semibold uppercase tracking-wide">Total Rumah Terdata</div>
            </div>
            <div class="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 transform hover:-translate-y-1 transition-transform duration-300 text-slate-800 flex flex-col justify-center items-center text-center md:items-start md:text-left">
                <div class="text-brand-500 mb-3"><i class="fa-solid fa-users fa-2x"></i></div>
                <div class="text-3xl font-extrabold mb-1 text-slate-900" id="stat-jiwa">0</div>
                <div class="text-xs md:text-sm text-slate-500 font-semibold uppercase tracking-wide">Total Estimasi Jiwa</div>
            </div>
            <div class="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 transform hover:-translate-y-1 transition-transform duration-300 text-slate-800 flex flex-col justify-center items-center text-center md:items-start md:text-left">
                <div class="text-brand-500 mb-3"><i class="fa-solid fa-store fa-2x"></i></div>
                <div class="text-3xl font-extrabold mb-1 text-slate-900" id="stat-umkm">0</div>
                <div class="text-xs md:text-sm text-slate-500 font-semibold uppercase tracking-wide">UMKM Aktif</div>
            </div>
            <div class="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 transform hover:-translate-y-1 transition-transform duration-300 text-slate-800 flex flex-col justify-center items-center text-center md:items-start md:text-left">
                <div class="text-brand-500 mb-3"><i class="fa-solid fa-heart-pulse fa-2x"></i></div>
                <div class="text-3xl font-extrabold mb-1 text-slate-900" id="stat-sehat">0%</div>
                <div class="text-xs md:text-sm text-slate-500 font-semibold uppercase tracking-wide">Rumah Sehat</div>
            </div>
        </div>
    </div>
    
    <!-- Scoring Methodology Banner (Moved from Analytics) -->
    <div class="container mx-auto px-4 lg:px-8 relative z-20 mb-8">
        <div class="bg-gradient-to-br from-brand-50 to-white border border-brand-100 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center shadow-sm relative overflow-hidden">
            <div class="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                <i class="fa-solid fa-microscope" style="font-size: 12rem;"></i>
            </div>
            <div class="bg-brand-500 text-white w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/30 z-10">
                <i class="fa-solid fa-clipboard-check fa-2xl"></i>
            </div>
            <div class="z-10 flex-1">
                <h4 class="text-lg font-bold text-brand-900 mb-2">Sistem Evaluasi Berbasis Skor Ilmiah</h4>
                <p class="text-sm text-slate-600 leading-relaxed mb-4 max-w-4xl">
                    Penentuan kelayakan rumah tangga dievaluasi secara terukur menggunakan instrumen penilaian berbobot dengan <strong>Total Maksimal 39 Poin</strong>. Penilaian ditarik dari 13 variabel parameter lingkungan termasuk kelayakan ventilasi, pencahayaan, pengelolaan sanitasi air limbah (SPAL), sumber air bersih, hingga pengelolaan sampah.
                </p>
                <div class="flex flex-wrap gap-2 text-xs font-bold">
                    <span class="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-sm"><i class="fa-solid fa-shield-virus mr-1"></i> Rumah Sehat (≥ 30 Poin)</span>
                    <span class="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm"><i class="fa-solid fa-circle-exclamation mr-1"></i> Kurang Sehat (20 - 29 Poin)</span>
                    <span class="bg-red-100 text-red-800 px-3 py-1.5 rounded-lg border border-red-200 shadow-sm"><i class="fa-solid fa-triangle-exclamation mr-1"></i> Tidak Sehat (< 20 Poin)</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Empty State (Fallback if no data) -->
    <div id="empty-state" class="hidden container mx-auto px-4 py-32 text-center">
        <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 mb-6 text-slate-400">
            <i class="fa-solid fa-folder-open fa-3x"></i>
        </div>
        <h2 class="text-3xl font-bold text-slate-700 mb-4">Tidak Ada Data Ditemukan</h2>
        <p class="text-slate-500 max-w-lg mx-auto text-lg">Coba ubah kombinasi filter Dusun dan RT Anda.</p>
    </div>
    
    <main id="main-content" class="container mx-auto px-4 lg:px-8 py-12 space-y-24">
        
        <!-- Section 1: Data Rumah & Pencarian -->
        <!-- Public Lock Message -->
        <section id="public-lock-message" class="scroll-mt-24 py-16 text-center">
            <div class="max-w-2xl mx-auto bg-white rounded-3xl p-10 md:p-14 shadow-xl border border-slate-100 flex flex-col items-center">
                <div class="w-24 h-24 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
                    <i class="fa-solid fa-lock"></i>
                </div>
                <h3 class="text-3xl font-bold text-slate-800 mb-4">Akses Direktori Terkunci</h3>
                <p class="text-slate-500 text-lg leading-relaxed mb-8">
                    Data kependudukan, kesehatan, dan status rumah tangga bersifat rahasia dan hanya dapat diakses oleh Admin Desa Gondang. Silakan login untuk melihat direktori warga.
                </p>
                <button onclick="toggleAuth()" class="bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-md flex items-center gap-3">
                    <i class="fa-solid fa-right-to-bracket"></i> Login Admin Desa
                </button>
            </div>
        </section>

        <!-- Private Data Section -->
        <section id="data-rumah" class="scroll-mt-24 auth-required hidden">
            <div class="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h3 class="text-2xl font-bold text-slate-800 flex items-center gap-2"><i class="fa-solid fa-address-book text-brand-500"></i> Direktori Data Rumah</h3>
                    <p class="text-slate-500 mt-1">Daftar lengkap rumah tangga berdasarkan hasil sensus.</p>
                </div>
                <div class="w-full md:w-auto flex flex-col sm:flex-row gap-3 relative flex-shrink-0">
                    <div class="relative w-full sm:w-80">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </div>
                        <input type="text" id="search-input" class="bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 p-3 shadow-sm transition-all" placeholder="Cari Nama KK atau No. Rumah...">
                    </div>
                    <button onclick="downloadExcel()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl shadow-sm transition-all text-sm font-bold flex items-center justify-center gap-2 flex-shrink-0 whitespace-nowrap">
                        <i class="fa-solid fa-file-excel"></i> Unduh Excel
                    </button>
                </div>
            </div>
            
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="overflow-x-auto custom-scrollbar">
                    <table class="w-full text-sm text-left text-slate-600">
                        <thead class="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th scope="col" class="px-6 py-4 font-semibold text-center whitespace-nowrap">Kode Rumah</th>
                                <th scope="col" class="px-6 py-4 font-semibold text-center whitespace-nowrap">No. Rumah</th>
                                <th scope="col" class="px-6 py-4 font-semibold text-center whitespace-nowrap">Nama KK</th>
                                <th scope="col" class="px-6 py-4 font-semibold text-center whitespace-nowrap">Dusun</th>
                                <th scope="col" class="px-6 py-4 font-semibold text-center whitespace-nowrap">RT/RW</th>
                                <th scope="col" class="px-6 py-4 font-semibold text-center whitespace-nowrap">Jml Jiwa</th>
                                <th scope="col" class="px-6 py-4 font-semibold text-center whitespace-nowrap">Usia</th>
                                <th scope="col" class="px-6 py-4 font-semibold text-center whitespace-nowrap">UMKM</th>
                                <th scope="col" class="px-6 py-4 font-semibold text-center whitespace-nowrap">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="table-body" class="divide-y divide-slate-100">
                            <!-- Rows injected by JS -->
                            <tr>
                                <td colspan="9" class="px-6 py-8 text-center text-slate-400">
                                    <i class="fa-solid fa-spinner fa-spin mr-2"></i> Memuat data...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination Controls -->
                <div class="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <div class="text-sm text-slate-500" id="pagination-info">Menampilkan 0 dari 0 data</div>
                    <div class="flex gap-2">
                        <button id="btn-prev" class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><i class="fa-solid fa-chevron-left"></i></button>
                        <button id="btn-next" class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><i class="fa-solid fa-chevron-right"></i></button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Section 2: Peta Persil & UMKM -->
        <section id="peta-umkm" class="scroll-mt-24">
            <div class="mb-8">
                <h3 class="text-2xl font-bold text-slate-800 flex items-center gap-2"><i class="fa-solid fa-map-location-dot text-brand-500"></i> Peta Potensi & UMKM</h3>
                <p class="text-slate-500 mt-1">Pemetaan lokasi persil dan katalog Usaha Mikro, Kecil, dan Menengah (UMKM).</p>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Static Map -->
                <div class="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-full">
                    <h3 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><i class="fa-solid fa-map-location-dot text-brand-500"></i> Peta Persil Desa Gondang</h3>
                    
                    <!-- Creative Frame with Blueprint/Grid Background -->
                    <div class="relative w-full flex-1 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden group cursor-zoom-in min-h-[350px] flex items-center justify-center p-3 sm:p-5" onclick="openMapModal()">
                        <!-- Subtle Dotted Grid Background -->
                        <div class="absolute inset-0 opacity-40" style="background-image: radial-gradient(#94a3b8 1px, transparent 1px); background-size: 20px 20px;"></div>
                        
                        <!-- The Map Image (No Cropping) -->
                        <img src="{{ asset('img/peta-persil.png') }}" alt="Peta Persil Desa" class="relative z-10 w-full h-full max-h-[400px] object-contain transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:drop-shadow-2xl drop-shadow-md" onerror="this.onerror=null; this.src='https://placehold.co/800x400/e2e8f0/64748b?text=Peta+Persil+Belum+Tersedia';">
                        
                        <!-- Elegant Hover Overlay -->
                        <div class="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-slate-900/50 via-slate-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end items-center pb-8">
                            <span class="text-white font-bold bg-white/20 backdrop-blur-md border border-white/30 px-6 py-2.5 rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out flex items-center gap-2">
                                <i class="fa-solid fa-magnifying-glass-plus"></i> Lihat Mode Layar Penuh
                            </span>
                        </div>
                    </div>
                    
                    <p class="text-sm text-slate-500 mt-4 italic text-center"><i class="fa-solid fa-hand-pointer mr-1.5 text-brand-400"></i>Klik area peta untuk memperbesar dan melihat detail.</p>
                </div>
                
                <!-- UMKM List -->
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[516px]">
                    <div class="p-5 border-b border-slate-100 bg-slate-50/50">
                        <h4 class="font-bold text-slate-800"><i class="fa-solid fa-store mr-2 text-amber-500"></i> Katalog UMKM</h4>
                    </div>
                    <div id="umkm-list" class="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                        <!-- UMKM Cards injected by JS -->
                        <div class="text-center text-slate-400 py-8"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Memuat UMKM...</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Section 3: Analytics Sanitasi -->
        <section id="analytics" class="scroll-mt-24">
            <div class="mb-8">
                <h3 class="text-2xl font-bold text-slate-800 flex items-center gap-2"><i class="fa-solid fa-chart-pie text-brand-500"></i> Profil Kesehatan Lingkungan</h3>
                <p class="text-slate-500 mt-1">Visualisasi indikator kesehatan lingkungan dari total rumah yang disurvei.</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Chart 1 -->
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h4 class="text-center font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wide">Sumber Air Bersih</h4>
                    <div class="relative h-64 w-full">
                        <canvas id="chart-air"></canvas>
                    </div>
                </div>
                <!-- Chart 2 -->
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h4 class="text-center font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wide">Ketersediaan Jamban</h4>
                    <div class="relative h-64 w-full">
                        <canvas id="chart-jamban"></canvas>
                    </div>
                </div>
                <!-- Chart 3 -->
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h4 class="text-center font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wide">Pengelolaan Sampah</h4>
                    <div class="relative h-64 w-full">
                        <canvas id="chart-sampah"></canvas>
                    </div>
                </div>
            </div>
        </section>

        <!-- Section 4: Pusat Dokumen -->
        <section id="dokumen" class="scroll-mt-24 pb-12">
            <div class="mb-8">
                <h3 class="text-2xl font-bold text-slate-800 flex items-center gap-2"><i class="fa-solid fa-folder-open text-brand-500"></i> Pusat Dokumen Digital</h3>
                <p class="text-slate-500 mt-1">Akses cepat dokumen administratif dan Standar Operasional Prosedur (SOP).</p>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <a href="#" class="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex items-start gap-4">
                    <div class="bg-red-50 text-red-500 p-3 rounded-lg group-hover:bg-red-500 group-hover:text-white transition-colors">
                        <i class="fa-solid fa-file-pdf fa-lg"></i>
                    </div>
                    <div>
                        <h5 class="font-semibold text-slate-800 text-sm mb-1 group-hover:text-brand-600 transition-colors">SOP Pemutakhiran Data</h5>
                        <p class="text-xs text-slate-500">Panduan entry data 2024</p>
                    </div>
                </a>
                
                <a href="#" class="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex items-start gap-4">
                    <div class="bg-blue-50 text-blue-500 p-3 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <i class="fa-solid fa-file-signature fa-lg"></i>
                    </div>
                    <div>
                        <h5 class="font-semibold text-slate-800 text-sm mb-1 group-hover:text-brand-600 transition-colors">BAST</h5>
                        <p class="text-xs text-slate-500">Berita Acara Serah Terima</p>
                    </div>
                </a>

                <a href="#" class="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex items-start gap-4">
                    <div class="bg-amber-50 text-amber-500 p-3 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <i class="fa-solid fa-file-image fa-lg"></i>
                    </div>
                    <div>
                        <h5 class="font-semibold text-slate-800 text-sm mb-1 group-hover:text-brand-600 transition-colors">Spesifikasi Plakat</h5>
                        <p class="text-xs text-slate-500">Desain & Ukuran Standar</p>
                    </div>
                </a>

                <a href="#" class="group bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex items-start gap-4">
                    <div class="bg-emerald-50 text-emerald-500 p-3 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <i class="fa-solid fa-file-invoice-dollar fa-lg"></i>
                    </div>
                    <div>
                        <h5 class="font-semibold text-slate-800 text-sm mb-1 group-hover:text-brand-600 transition-colors">LPJ Keuangan</h5>
                        <p class="text-xs text-slate-500">Laporan Pertanggungjawaban</p>
                    </div>
                </a>
            </div>
        </section>
    </main>
    
    <footer class="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
        <div class="container mx-auto px-4 text-center">
            <p class="text-sm mb-3">&copy; 2026 SIKAP Gondang. Dikembangkan oleh KKN-R Tim II Undip Desa Gondang.</p>
            <div class="inline-flex items-center justify-center bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50">
                <p class="text-xs text-slate-500 font-medium">
                    Designed & Engineered with <i class="fa-solid fa-heart text-red-500 mx-1 animate-pulse"></i> by 
                    <span class="text-slate-200 font-bold tracking-wide">Angelica Putri (Informatika '23)</span>
                </p>
            </div>
        </div>
    </footer>

    <!-- Detail Modal -->
    <div id="detail-modal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 opacity-0 pointer-events-none transition-opacity duration-300">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden transform scale-95 transition-transform duration-300" id="modal-content-wrapper">
            <!-- Modal Header -->
            <div class="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                <h3 class="font-bold text-lg text-slate-800" id="modal-title">Detail Rumah</h3>
                <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-200 transition-colors">
                    <i class="fa-solid fa-xmark fa-lg"></i>
                </button>
            </div>
            
            <!-- Modal Body -->
            <div class="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar" id="modal-body">
                <!-- Content injected by JS -->
            </div>
            
            <!-- Modal Footer -->
            <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button onclick="closeModal()" class="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 shadow-sm transition-colors">Tutup</button>
            </div>
        </div>
    </div>
    
    <!-- Map Modal -->
    <div id="map-modal" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm opacity-0 pointer-events-none transition-all duration-300 p-2 sm:p-6" onclick="if(event.target === this) closeMapModal()">
        <div class="bg-white rounded-2xl w-full max-w-7xl h-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden relative transform scale-95 transition-transform duration-300" id="map-modal-content">
            <div class="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 z-10 shadow-sm flex-shrink-0">
                <h3 class="text-lg font-bold text-slate-800"><i class="fa-solid fa-map-location-dot text-brand-500 mr-2"></i> Peta Persil Desa Gondang</h3>
                <div class="flex items-center gap-2">
                    <button onclick="resetMapZoom()" class="text-slate-600 hover:text-brand-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors bg-slate-200 border border-slate-300 shadow-sm">
                        <i class="fa-solid fa-rotate-right mr-1"></i> Reset View
                    </button>
                    <button onclick="closeMapModal()" class="text-slate-400 hover:text-red-500 transition-colors w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-50">
                        <i class="fa-solid fa-xmark fa-xl"></i>
                    </button>
                </div>
            </div>
            <div id="map-zoom-container" class="bg-slate-200 flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing" style="touch-action: none;">
                <!-- Subtle grid background -->
                <div class="absolute inset-0 opacity-30 pointer-events-none z-0" style="background-image: radial-gradient(#94a3b8 1px, transparent 1px); background-size: 20px 20px;"></div>
                
                <div id="map-transform-wrapper" style="transform-origin: 0 0; transition: transform 0.05s ease-out;" class="w-full h-full flex items-center justify-center pointer-events-none relative z-10">
                    <img src="{{ asset('img/peta-persil.png') }}" alt="Peta Persil Desa Lengkap" class="max-w-full max-h-full w-auto h-auto object-contain drop-shadow-xl" onerror="this.src='https://placehold.co/1200x800/e2e8f0/64748b?text=Peta+Persil+Belum+Tersedia';">
                </div>
            </div>
            <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900/80 backdrop-blur border border-slate-700 text-white px-5 py-2.5 rounded-full text-sm font-medium pointer-events-none shadow-xl z-20 flex items-center gap-4">
                <span class="flex items-center"><i class="fa-solid fa-hand-pointer mr-2 text-brand-400"></i> Klik untuk Zoom</span>
                <span class="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>
                <span class="flex items-center"><i class="fa-solid fa-arrows-up-down-left-right mr-2 text-brand-400"></i> Seret untuk Geser</span>
            </div>
        </div>
    </div>

    <!-- Login Modal -->
    <div id="login-modal" class="fixed inset-0 z-[100] hidden items-center justify-center p-4 sm:p-0">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onclick="toggleAuthModal(false)"></div>
        
        <div class="bg-white rounded-3xl overflow-hidden shadow-2xl transform transition-all sm:max-w-md w-full relative z-10 scale-95 opacity-0 duration-300" id="login-modal-content">
            <div class="px-6 py-6 md:px-8 md:py-8">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-slate-800">Login Admin Desa</h3>
                    <button onclick="toggleAuthModal(false)" class="text-slate-400 hover:text-slate-600 focus:outline-none bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                        <i class="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>
                <div class="mb-6">
                    <div class="flex justify-center mb-6">
                        <div class="w-16 h-16 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                            <i class="fa-solid fa-shield-halved"></i>
                        </div>
                    </div>
                    <p class="text-slate-500 text-center text-sm mb-6">Masukkan email yang terdaftar pada Whitelist Admin Desa Gondang untuk mengakses data kependudukan privat.</p>
                    
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fa-solid fa-envelope text-slate-400"></i>
                        </div>
                        <input type="email" id="login-email" class="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 p-3.5 transition-all shadow-sm" placeholder="admin.gondang@gmail.com" required onkeydown="if(event.key === 'Enter') processLogin()">
                    </div>
                    <div id="login-error" class="text-red-500 text-xs font-semibold mt-2 hidden">
                        <i class="fa-solid fa-triangle-exclamation mr-1"></i> <span id="login-error-msg">Email tidak terdaftar.</span>
                    </div>
                </div>
                <button id="modal-login-btn" onclick="processLogin()" class="w-full text-white bg-brand-600 hover:bg-brand-700 focus:ring-4 focus:outline-none focus:ring-brand-300 font-bold rounded-xl text-sm px-5 py-3.5 text-center transition-all shadow-md flex justify-center items-center gap-2">
                    <i class="fa-solid fa-right-to-bracket" id="modal-login-icon"></i> <span id="modal-login-text">Masuk Dashboard</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/js/tom-select.complete.min.js"></script>
    <!-- Config Variables -->
    <script>
        window.APP_CONFIG = {
            imgBaseUrl: "{{ asset('img') }}"
        };
    </script>
    <!-- Application Logic -->
    <script src="{{ asset('js/main.js') }}?v=1.1"></script>
</body>
</html>
