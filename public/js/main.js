const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRIKTAku9jGz6xmjzztLQeNgh0kWVfJSzDcCvdxy8p-yuSz2irereNQZKGpuphigS9NS0Wnb_tNpA-/pub?output=csv';

let allData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 10;
let mapInstance = null;
let markersLayer = null;
let charts = {
    air: null,
    jamban: null,
    sampah: null
};
let uniqueDusun = {};
let tsDusun = null;
let tsRt = null;

// --- Authentication Setup ---
const AUTH_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRIKTAku9jGz6xmjzztLQeNgh0kWVfJSzDcCvdxy8p-yuSz2irereNQZKGpuphigS9NS0Wnb_tNpA-/pub?gid=1373793115&single=true&output=csv';

window.toggleAuthModal = function(show) {
    const modal = document.getElementById('login-modal');
    const content = document.getElementById('login-modal-content');
    if (!modal || !content) return;
    
    if (show) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        // Small delay to allow display block to apply before transition
        setTimeout(() => {
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 10);
    } else {
        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }, 300);
    }
};

window.toggleAuth = function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        // Logout
        localStorage.removeItem('isLoggedIn');
        checkAuth();
    } else {
        // Show Login Modal
        toggleAuthModal(true);
    }
};

window.processLogin = function() {
    const emailInput = document.getElementById('login-email').value.trim().toLowerCase();
    const errorMsg = document.getElementById('login-error');
    const btn = document.getElementById('modal-login-btn');
    const btnText = document.getElementById('modal-login-text');
    const btnIcon = document.getElementById('modal-login-icon');
    
    if (!emailInput) {
        document.getElementById('login-error-msg').innerText = "Silakan masukkan email.";
        errorMsg.classList.remove('hidden');
        return;
    }
    
    // Set loading state
    if (btn) {
        btn.disabled = true;
        btn.classList.add('opacity-75', 'cursor-not-allowed');
    }
    if (btnText) btnText.innerText = "Memverifikasi...";
    if (btnIcon) btnIcon.className = "fa-solid fa-spinner fa-spin";
    errorMsg.classList.add('hidden');
    
    // Gunakan cache-buster agar selalu memuat data terbaru dari Google Sheets
    const noCacheUrl = AUTH_CSV_URL + '&t=' + Date.now();
    
    Papa.parse(noCacheUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            let found = false;
            if (results.data && results.data.length > 0) {
                for (let i = 0; i < results.data.length; i++) {
                    const row = results.data[i];
                    // Check all values in the row for a matching email
                    const values = Object.values(row).map(v => v ? v.toString().trim().toLowerCase() : '');
                    if (values.includes(emailInput)) {
                        found = true;
                        break;
                    }
                }
            }
            
            // Restore button state
            if (btn) {
                btn.disabled = false;
                btn.classList.remove('opacity-75', 'cursor-not-allowed');
            }
            if (btnText) btnText.innerText = "Masuk Dashboard";
            if (btnIcon) btnIcon.className = "fa-solid fa-right-to-bracket";
            
            if (found) {
                // Success
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('loggedInEmail', emailInput);
                errorMsg.classList.add('hidden');
                toggleAuthModal(false);
                checkAuth();
            } else {
                // Failed
                document.getElementById('login-error-msg').innerText = "Akses Ditolak: Email tidak terdaftar di Whitelist Google Sheets.";
                errorMsg.classList.remove('hidden');
            }
        },
        error: function(err) {
            console.error("Error fetching whitelist CSV:", err);
            // Restore button state
            if (btn) {
                btn.disabled = false;
                btn.classList.remove('opacity-75', 'cursor-not-allowed');
            }
            if (btnText) btnText.innerText = "Masuk Dashboard";
            if (btnIcon) btnIcon.className = "fa-solid fa-right-to-bracket";
            
            document.getElementById('login-error-msg').innerText = "Gagal menghubungi server. Periksa koneksi internet.";
            errorMsg.classList.remove('hidden');
        }
    });
};

window.checkAuth = function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loggedInEmail = localStorage.getItem('loggedInEmail');
    const authReqElements = document.querySelectorAll('.auth-required');
    const lockMsg = document.getElementById('public-lock-message');
    const authBtnText = document.getElementById('auth-btn-text');
    const authBtnIcon = document.getElementById('auth-btn-icon');
    
    if (isLoggedIn) {
        // Show private elements immediately
        authReqElements.forEach(el => el.classList.remove('hidden'));
        if (lockMsg) lockMsg.classList.add('hidden');
        
        // Update button
        if (authBtnText) authBtnText.innerText = 'Admin Desa (Logout)';
        if (authBtnIcon) {
            authBtnIcon.classList.remove('fa-lock');
            authBtnIcon.classList.add('fa-unlock');
        }
        
        // Asynchronously re-verify if the email is STILL in the whitelist
        if (loggedInEmail) {
            const noCacheUrl = AUTH_CSV_URL + '&t=' + Date.now();
            Papa.parse(noCacheUrl, {
                download: true,
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    let found = false;
                    if (results.data && results.data.length > 0) {
                        for (let i = 0; i < results.data.length; i++) {
                            const row = results.data[i];
                            const values = Object.values(row).map(v => v ? v.toString().trim().toLowerCase() : '');
                            if (values.includes(loggedInEmail)) {
                                found = true;
                                break;
                            }
                        }
                    }
                    if (!found) {
                        // Force logout if no longer in whitelist
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('loggedInEmail');
                        alert("Sesi Anda telah berakhir. Akses email Anda telah dicabut dari Whitelist Admin.");
                        window.location.reload();
                    }
                }
            });
        }
    } else {
        // Hide private elements
        authReqElements.forEach(el => el.classList.add('hidden'));
        if (lockMsg) lockMsg.classList.remove('hidden');
        
        // Update button
        if (authBtnText) authBtnText.innerText = 'Login Admin Desa';
        if (authBtnIcon) {
            authBtnIcon.classList.remove('fa-unlock');
            authBtnIcon.classList.add('fa-lock');
        }
    }
};


document.addEventListener('DOMContentLoaded', () => {
    initHeroSlider();
    initApp();
});

function initHeroSlider() {
    const heroImages = [
        'hero_balai_desa.jpeg',
        'hero_1.jpeg',
        'hero_2.jpeg',
        'hero_3.jpeg',
        'hero_4.jpeg',
        'hero_5.jpeg',
        'hero_6.jpeg'
    ];
    const container = document.getElementById('slider-container');
    if (!container) return;
    
    const baseUrl = (window.APP_CONFIG && window.APP_CONFIG.imgBaseUrl) ? window.APP_CONFIG.imgBaseUrl : '/img';

    heroImages.forEach((img, index) => {
        const slide = document.createElement('div');
        slide.className = `hero-slide ${index === 0 ? 'active' : ''}`;
        slide.style.backgroundImage = `url('${baseUrl}/${img}')`;
        container.appendChild(slide);
    });

    let currentIndex = 0;
    const slides = container.querySelectorAll('.hero-slide');
    
    if (slides.length > 1) {
        setInterval(() => {
            slides[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % slides.length;
            slides[currentIndex].classList.add('active');
        }, 5000);
    }
}

function initApp() {
    checkAuth();

    const dusunFilterEl = document.getElementById('dusun-filter');
    const rtFilterEl = document.getElementById('rt-filter');
    
    if (dusunFilterEl) {
        tsDusun = new TomSelect('#dusun-filter', {
            create: false,
            controlInput: null,
            sortField: { field: 'text', direction: 'asc' },
            onChange: handleDusunChange
        });
    }
    
    if (rtFilterEl) {
        tsRt = new TomSelect('#rt-filter', {
            create: false,
            controlInput: null,
            sortField: { field: 'text', direction: 'asc' },
            onChange: handleFilterChange
        });
    }
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            handleFilterChange();
        });
    }
    
    const umkmSearchInput = document.getElementById('umkm-search-input');
    if (umkmSearchInput) {
        umkmSearchInput.addEventListener('input', () => {
            renderUMKM();
        });
    }

    // Pagination buttons
    document.getElementById('btn-prev')?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });
    
    document.getElementById('btn-next')?.addEventListener('click', () => {
        const maxPage = Math.ceil(filteredData.length / rowsPerPage);
        if (currentPage < maxPage) {
            currentPage++;
            renderTable();
        }
    });

    // Close modal on click outside
    document.getElementById('detail-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'detail-modal') {
            closeModal();
        }
    });

    fetchData();
}

function fetchData() {
    // Gunakan cache buster agar browser tidak menggunakan cache lama
    const noCacheCsvUrl = CSV_URL + '&t=' + Date.now();
    
    Papa.parse(noCacheCsvUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            // Filter out purely empty rows that might be parsed
            allData = results.data.filter(row => row.nama_kk && row.nama_kk.trim() !== '');
            
            // Build uniqueDusun map dynamically and normalize data
            uniqueDusun = {};
            allData.forEach(row => {
                // Normalize Title Case
                if(row.nama_kk) row.nama_kk = toTitleCase(row.nama_kk);
                if(row.nama_responden) row.nama_responden = toTitleCase(row.nama_responden);
                if(row.nama_usaha) row.nama_usaha = toTitleCase(row.nama_usaha);
                if(row.jenis_usaha) row.jenis_usaha = toTitleCase(row.jenis_usaha);
                if(row.produk_jasa) row.produk_jasa = toTitleCase(row.produk_jasa);
                
                // Normalize Dusun
                let dStr = (row.dusun || '').toString().trim();
                if (/^[1-4]$/.test(dStr)) dStr = `Dusun ${dStr}`;
                row.dusun = dStr || 'Tidak Diketahui';
                
                // Normalize RT/RW
                row.rt_rw = formatRtRw(row.rt_rw);
                
                // Generate Kode Rumah dynamically here for sorting
                let dsCode = 'DSX';
                if (row.dusun) {
                    const dsMatch = row.dusun.match(/\d+/);
                    if (dsMatch) dsCode = `DS${dsMatch[0]}`;
                }
                
                let rtCode = 'RTXX';
                if (row.rt_rw) {
                    const rtMatch = row.rt_rw.match(/RT\s*(\d+)/i);
                    if (rtMatch) rtCode = `RT${rtMatch[1].padStart(2, '0')}`;
                }
                
                let noCode = 'XX';
                if (row.nomor_rumah) {
                    const noMatch = row.nomor_rumah.match(/\d+/);
                    if (noMatch) noCode = noMatch[0].padStart(3, '0'); // Pad with 3 zeros for sorting
                }
                
                row.kode_rumah = `${dsCode}-${rtCode}-${noCode}`;
                
                let dusun = row.dusun;
                let rt = row.rt_rw;
                
                if (!uniqueDusun[dusun]) {
                    uniqueDusun[dusun] = new Set();
                }
                uniqueDusun[dusun].add(rt);
            });
            
            // Automatically sort by Kode Rumah (alphanumerically)
            allData.sort((a, b) => a.kode_rumah.localeCompare(b.kode_rumah, undefined, {numeric: true, sensitivity: 'base'}));
            
            populateDusunDropdown();
            
            filteredData = [...allData];
            handleDusunChange(); // Populate RTs immediately and trigger filter change
        },
        error: function(err) {
            console.error("Error parsing CSV:", err);
            document.getElementById('table-body').innerHTML = `<tr><td colspan="9" class="px-6 py-8 text-center text-red-500"><i class="fa-solid fa-triangle-exclamation mr-2"></i> Gagal memuat data CSV.</td></tr>`;
        }
    });
}

function populateDusunDropdown() {
    if (!tsDusun) return;
    
    tsDusun.clearOptions();
    
    const predefinedDusuns = ['Dusun 1', 'Dusun 2', 'Dusun 3', 'Dusun 4'];
    predefinedDusuns.forEach(dusun => {
        tsDusun.addOption({value: dusun, text: dusun});
    });
    
    Object.keys(uniqueDusun).forEach(dusun => {
        if (dusun !== 'Tidak Diketahui' && dusun !== '' && !predefinedDusuns.includes(dusun)) {
            tsDusun.addOption({value: dusun, text: dusun});
        }
    });
    
    if (uniqueDusun['Tidak Diketahui']) {
        tsDusun.addOption({value: 'Tidak Diketahui', text: 'Tidak Diketahui'});
    }
    
    tsDusun.addOption({value: 'semua', text: 'Semua Dusun'});
    tsDusun.addItem('semua', true);
}

function toTitleCase(str) {
    if (!str) return '';
    return str.toString().toLowerCase().split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

function formatRtRw(raw) {
    if (!raw) return 'Tidak Diketahui';
    let str = raw.toString().trim();
    
    // Extract all numbers from the string
    const numbers = str.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
        const rt = numbers[0].padStart(2, '0');
        const rw = numbers[1].padStart(2, '0');
        return `RT ${rt} / RW ${rw}`;
    } else if (numbers && numbers.length === 1) {
        const rt = numbers[0].padStart(2, '0');
        let rwNum = 1;
        const rtInt = parseInt(rt);
        if (rtInt >= 1 && rtInt <= 6) rwNum = 1;
        else if (rtInt >= 7 && rtInt <= 11) rwNum = 2;
        else if (rtInt >= 12 && rtInt <= 15) rwNum = 3;
        else if (rtInt >= 16 && rtInt <= 21) rwNum = 4;
        const rw = rwNum.toString().padStart(2, '0');
        return `RT ${rt} / RW ${rw}`;
    }
    
    return str;
}

function handleDusunChange() {
    if (!tsDusun || !tsRt) return;
    
    const selectedDusun = tsDusun.getValue();
    
    tsRt.clearOptions();
    tsRt.addOption({value: 'semua', text: 'Semua RT/RW'});
    
    if (selectedDusun === 'semua' || !selectedDusun) {
        // If "Semua Dusun" is selected, the RT dropdown should be locked/disabled
        tsRt.setValue('semua', true);
        tsRt.disable();
    } else {
        // Enable if specific Dusun is selected
        tsRt.enable();
        
        let predefinedRTs = [];
        if (selectedDusun === 'Dusun 1') predefinedRTs = ['RT 01 / RW 01', 'RT 02 / RW 01', 'RT 03 / RW 01', 'RT 04 / RW 01', 'RT 05 / RW 01', 'RT 06 / RW 01'];
        else if (selectedDusun === 'Dusun 2') predefinedRTs = ['RT 07 / RW 02', 'RT 08 / RW 02', 'RT 09 / RW 02', 'RT 10 / RW 02', 'RT 11 / RW 02'];
        else if (selectedDusun === 'Dusun 3') predefinedRTs = ['RT 12 / RW 03', 'RT 13 / RW 03', 'RT 14 / RW 03', 'RT 15 / RW 03'];
        else if (selectedDusun === 'Dusun 4') predefinedRTs = ['RT 16 / RW 04', 'RT 17 / RW 04', 'RT 18 / RW 04', 'RT 19 / RW 04', 'RT 20 / RW 04', 'RT 21 / RW 04'];
        
        let rtsFromData = Array.from(uniqueDusun[selectedDusun] || []);
        let allRTs = new Set([...predefinedRTs, ...rtsFromData]);
        
        const sortedRTs = Array.from(allRTs).sort((a, b) => {
            const aNum = parseInt(a.replace(/\D/g, '')) || 0;
            const bNum = parseInt(b.replace(/\D/g, '')) || 0;
            return aNum - bNum;
        });
        
        sortedRTs.forEach(rt => {
            if (rt !== 'Tidak Diketahui' && rt !== '') {
                tsRt.addOption({value: rt, text: rt});
            }
        });
        
        if (uniqueDusun[selectedDusun] && uniqueDusun[selectedDusun].has('Tidak Diketahui')) {
            tsRt.addOption({value: 'Tidak Diketahui', text: 'Tidak Diketahui'});
        }
        
        tsRt.addItem('semua', true);
    }
    
    // reset search on dusun change
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    
    handleFilterChange();
}

function handleFilterChange() {
    const selectedDusun = tsDusun ? tsDusun.getValue() : 'semua';
    const selectedRt = tsRt ? tsRt.getValue() : 'semua';
    
    const mainContent = document.getElementById('main-content');
    const emptyState = document.getElementById('empty-state');
    const statCards = document.querySelector('#hero-section .grid');

    // Filter by dropdowns
    filteredData = allData.filter(row => {
        let rDusun = (row.dusun || 'Tidak Diketahui').trim();
        let rRt = (row.rt_rw || 'Tidak Diketahui').trim();
        
        let dusunMatch = selectedDusun === 'semua' || rDusun === selectedDusun;
        let rtMatch = selectedRt === 'semua' || rRt === selectedRt;
        
        return dusunMatch && rtMatch;
    });
    
    // Apply search query as well
    const searchInput = document.getElementById('search-input');
    if (searchInput && searchInput.value.trim() !== '') {
        const q = searchInput.value.toLowerCase().trim();
        filteredData = filteredData.filter(row => {
            return (row.nama_kk && row.nama_kk.toLowerCase().includes(q)) ||
                   (row.nomor_rumah && row.nomor_rumah.toLowerCase().includes(q));
        });
    }

    if (filteredData.length === 0 && allData.length > 0 && searchInput.value.trim() === '') {
        // If absolutely no data for a valid combo (rare, but possible)
        if (mainContent) mainContent.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
        if (statCards) statCards.classList.add('hidden');
    } else {
        if (mainContent) mainContent.classList.remove('hidden');
        if (emptyState) emptyState.classList.add('hidden');
        if (statCards) statCards.classList.remove('hidden');
        
        currentPage = 1;
        updateStats();
        renderTable();
        renderUMKM();
        initCharts();
    }
}

function updateStats() {
    const totalRumah = filteredData.length;
    let totalJiwa = 0; 
    let totalUMKM = 0;
    let rumahSehat = 0; 

    filteredData.forEach(row => {
        const jiwaCount = parseInt(row.jumlah_anggota) || 0;
        totalJiwa += jiwaCount; 
        
        if (row.is_umkm && row.is_umkm.toLowerCase() === 'ya') {
            totalUMKM++;
        }
        
        const health = calculateHealthScore(row);
        if (health.category === 'Rumah Sehat') {
            rumahSehat++;
        }
    });

    const percentSehat = totalRumah > 0 ? Math.round((rumahSehat / totalRumah) * 100) : 0;

    animateValue('stat-rumah', 0, totalRumah, 1000);
    animateValue('stat-jiwa', 0, Math.floor(totalJiwa), 1000);
    animateValue('stat-umkm', 0, totalUMKM, 1000);
    
    const sehatEl = document.getElementById('stat-sehat');
    if (sehatEl) {
        let start = 0;
        const duration = 1000;
        const startTime = performance.now();
        const updateSehat = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(progress * percentSehat);
            sehatEl.innerText = `${current}%`;
            if (progress < 1) {
                requestAnimationFrame(updateSehat);
            }
        };
        requestAnimationFrame(updateSehat);
    }
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function renderTable() {
    const tbody = document.getElementById('table-body');
    const info = document.getElementById('pagination-info');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    
    if (!tbody) return;

    if (filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="px-6 py-8 text-center text-slate-500">Tidak ada data ditemukan.</td></tr>`;
        info.innerText = `Menampilkan 0 dari 0 data`;
        btnPrev.disabled = true;
        btnNext.disabled = true;
        return;
    }

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredData.length);
    const paginatedData = filteredData.slice(startIndex, endIndex);

    let html = '';
    paginatedData.forEach((row, i) => {
        const isUmkm = row.is_umkm && row.is_umkm.toLowerCase() === 'ya';
        const umkmText = row.nama_usaha ? row.nama_usaha : (row.jenis_usaha || 'UMKM');
        const umkmBadge = isUmkm 
            ? `<span class="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded border border-amber-200 whitespace-nowrap">${umkmText}</span>` 
            : `<span class="text-slate-400">-</span>`;

        const jiwaCount = parseInt(row.jumlah_anggota) || 0;
        const jiwaDisplay = jiwaCount > 0 ? jiwaCount + ' Orang' : '-';
        
        // Remove padding from Kode Rumah for display
        const displayKode = (row.kode_rumah || '').replace(/-0+(\d+)$/, '-$1');

        html += `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 text-center font-bold text-slate-700 whitespace-nowrap">${displayKode}</td>
                <td class="px-6 py-4 text-center font-medium text-slate-900 whitespace-nowrap">${row.nomor_rumah || '-'}</td>
                <td class="px-6 py-4 text-center font-semibold text-brand-700 whitespace-nowrap">${row.nama_kk || '-'}</td>
                <td class="px-6 py-4 text-center text-slate-600 whitespace-nowrap">${row.dusun || '-'}</td>
                <td class="px-6 py-4 text-center text-slate-600 whitespace-nowrap">${row.rt_rw || '-'}</td>
                <td class="px-6 py-4 text-center text-slate-600 whitespace-nowrap">${jiwaDisplay}</td>
                <td class="px-6 py-4 text-center text-slate-600 whitespace-nowrap">${row.usia || '-'} Thn</td>
                <td class="px-6 py-4 text-center">${umkmBadge}</td>
                <td class="px-6 py-4 text-center">
                    <button onclick='openDetailModal(${JSON.stringify(row).replace(/'/g, "&#39;")})' class="text-brand-600 hover:text-brand-800 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors">
                        Detail <i class="fa-solid fa-arrow-right ml-1"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    
    info.innerText = `Menampilkan ${startIndex + 1} - ${endIndex} dari ${filteredData.length} data`;
    
    btnPrev.disabled = currentPage === 1;
    btnNext.disabled = currentPage === Math.ceil(filteredData.length / rowsPerPage);
}

window.openMapModal = function() {
    const modal = document.getElementById('map-modal');
    const modalContent = document.getElementById('map-modal-content');
    if (modal && modalContent) {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        setTimeout(() => {
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');
        }, 10);
    }
};

window.switchMap = function(type) {
    const img = document.getElementById('map-image');
    const title = document.getElementById('map-modal-title');
    const tabPersil = document.getElementById('tab-persil');
    const tabAdministrasi = document.getElementById('tab-administrasi');
    const baseUrl = (window.APP_CONFIG && window.APP_CONFIG.imgBaseUrl) ? window.APP_CONFIG.imgBaseUrl : '/img';

    if (!img || !tabPersil || !tabAdministrasi) return;

    if (type === 'persil') {
        img.src = `${baseUrl}/peta-persil.png`;
        title.innerHTML = '<i class="fa-solid fa-map-location-dot text-brand-500 mr-2"></i> Peta Persil Desa Gondang';
        
        tabPersil.className = 'px-4 py-1.5 text-sm font-semibold rounded-md bg-white text-brand-700 shadow-sm transition-all';
        tabAdministrasi.className = 'px-4 py-1.5 text-sm font-semibold rounded-md text-slate-500 hover:text-slate-700 transition-all';
    } else if (type === 'administrasi') {
        img.src = `${baseUrl}/peta-gondang.png`;
        title.innerHTML = '<i class="fa-solid fa-map text-brand-500 mr-2"></i> Peta Administrasi Desa Gondang';
        
        tabAdministrasi.className = 'px-4 py-1.5 text-sm font-semibold rounded-md bg-white text-brand-700 shadow-sm transition-all';
        tabPersil.className = 'px-4 py-1.5 text-sm font-semibold rounded-md text-slate-500 hover:text-slate-700 transition-all';
    }

    if (typeof resetMapZoom === 'function') {
        resetMapZoom();
    }
};

window.switchPreviewMap = function(type) {
    const previewImg = document.getElementById('preview-map-image');
    const tabPersil = document.getElementById('preview-tab-persil');
    const tabAdmin = document.getElementById('preview-tab-administrasi');
    const baseUrl = (window.APP_CONFIG && window.APP_CONFIG.imgBaseUrl) ? window.APP_CONFIG.imgBaseUrl : '/img';

    if (!previewImg || !tabPersil || !tabAdmin) return;

    if(type === 'persil') {
        previewImg.src = `${baseUrl}/peta-persil.png`;
        tabPersil.className = 'px-3 py-1.5 text-xs font-semibold rounded-md bg-white text-brand-700 shadow-sm transition-all';
        tabAdmin.className = 'px-3 py-1.5 text-xs font-semibold rounded-md text-slate-500 hover:text-slate-700 transition-all';
    } else {
        previewImg.src = `${baseUrl}/peta-gondang.png`;
        tabAdmin.className = 'px-3 py-1.5 text-xs font-semibold rounded-md bg-white text-brand-700 shadow-sm transition-all';
        tabPersil.className = 'px-3 py-1.5 text-xs font-semibold rounded-md text-slate-500 hover:text-slate-700 transition-all';
    }
    
    // Sync the modal map state
    if (typeof switchMap === 'function') {
        switchMap(type);
    }
};

window.closeMapModal = function() {
    const modal = document.getElementById('map-modal');
    const modalContent = document.getElementById('map-modal-content');
    if (modal && modalContent) {
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('opacity-0', 'pointer-events-none');
            if (typeof resetMapZoom === 'function') resetMapZoom();
        }, 300);
    }
};

// --- Interactive Map Zoom & Pan Logic ---
let mapScale = 1;
let pointX = 0;
let pointY = 0;
let isPanning = false;
let startX = 0;
let startY = 0;
let clickStart = {x:0, y:0, time:0};

window.resetMapZoom = function() {
    mapScale = 1;
    pointX = 0;
    pointY = 0;
    setMapTransform();
};

function setMapTransform() {
    const wrapper = document.getElementById('map-transform-wrapper');
    if (wrapper) {
        wrapper.style.transform = `translate(${pointX}px, ${pointY}px) scale(${mapScale})`;
    }
}

// Initialize map interactions
function initMapInteractions() {
    const container = document.getElementById('map-zoom-container');
    if (!container) return;
    
    // Pointer Down (Mouse or Touch Start)
    container.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        startX = e.clientX - pointX;
        startY = e.clientY - pointY;
        isPanning = true;
        container.setPointerCapture(e.pointerId);
        clickStart = { x: e.clientX, y: e.clientY, time: Date.now() };
    });
    
    // Pointer Move (Mouse or Touch Drag)
    container.addEventListener('pointermove', (e) => {
        if (!isPanning) return;
        e.preventDefault();
        pointX = e.clientX - startX;
        pointY = e.clientY - startY;
        setMapTransform();
    });
    
    // Pointer Up (Mouse or Touch End)
    container.addEventListener('pointerup', (e) => {
        if (!isPanning) return;
        isPanning = false;
        container.releasePointerCapture(e.pointerId);
        
        // Handle Click to Zoom
        const distance = Math.hypot(e.clientX - clickStart.x, e.clientY - clickStart.y);
        const timeDiff = Date.now() - clickStart.time;
        
        // If it was a quick tap/click without dragging significantly
        if (distance < 5 && timeDiff < 300) {
            const rect = container.getBoundingClientRect();
            const clientX = e.clientX - rect.left;
            const clientY = e.clientY - rect.top;
            
            const xs = (clientX - pointX) / mapScale;
            const ys = (clientY - pointY) / mapScale;
            
            mapScale *= 1.5;
            mapScale = Math.min(mapScale, 15); // Max zoom 15x
            
            pointX = clientX - xs * mapScale;
            pointY = clientY - ys * mapScale;
            
            setMapTransform();
        }
    });
    
    // Wheel Zoom
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = container.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;
        
        const xs = (clientX - pointX) / mapScale;
        const ys = (clientY - pointY) / mapScale;
        
        const delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);
        if (delta > 0) {
            mapScale *= 1.2; // Zoom In
        } else {
            mapScale /= 1.2; // Zoom Out
        }
        
        mapScale = Math.min(Math.max(0.5, mapScale), 15);
        
        pointX = clientX - xs * mapScale;
        pointY = clientY - ys * mapScale;
        
        setMapTransform();
    }, { passive: false });
}

document.addEventListener('DOMContentLoaded', initMapInteractions);

function renderUMKM() {
    const umkmList = document.getElementById('umkm-list');
    if (!umkmList) return;

    const umkmSearchInput = document.getElementById('umkm-search-input');
    const searchVal = umkmSearchInput ? umkmSearchInput.value.toLowerCase().trim() : '';

    const umkmData = filteredData.filter(row => {
        if (!row.is_umkm || row.is_umkm.toLowerCase() !== 'ya') return false;
        
        if (searchVal) {
            const usaha = (row.nama_usaha || '').toLowerCase();
            const produk = (row.produk_jasa || '').toLowerCase();
            const pemilik = (row.nama_kk || '').toLowerCase();
            
            return usaha.includes(searchVal) || 
                   produk.includes(searchVal) || 
                   pemilik.includes(searchVal);
        }
        
        return true;
    });
    
    if (umkmData.length === 0) {
        umkmList.innerHTML = `<div class="text-center text-slate-400 py-8 text-sm">Tidak ada data UMKM yang cocok dengan pencarian Anda.</div>`;
        return;
    }

    let html = '';
    umkmData.forEach(row => {
        let phone = row.no_hp || '';
        let waLink = '#';
        if (phone && phone.length > 5) {
            if (phone.startsWith('0')) {
                phone = '62' + phone.substring(1);
            }
            phone = phone.replace(/\\D/g, '');
            waLink = `https://wa.me/${phone}`;
        }

        html += `
            <div class="bg-white border border-slate-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-2">
                    <h5 class="font-bold text-slate-800">${row.nama_usaha || 'Usaha Warga'}</h5>
                    <span class="bg-brand-50 text-brand-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">${row.jenis_usaha || 'UMKM'}</span>
                </div>
                <div class="text-sm text-slate-500 mb-1"><i class="fa-regular fa-user mr-1"></i> ${row.nama_kk}</div>
                <div class="text-sm text-slate-500 mb-3"><i class="fa-solid fa-box mr-1"></i> ${row.produk_jasa || '-'}</div>
                
                <a href="${waLink}" target="_blank" class="block w-full text-center px-4 py-2 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-500 rounded-lg text-sm font-semibold transition-colors">
                    <i class="fa-brands fa-whatsapp mr-1"></i> Hubungi WhatsApp
                </a>
            </div>
        `;
    });

    umkmList.innerHTML = html;
}

function initCharts() {
    const colors = ['#0ea5e9', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6', '#64748b'];
    
    if (charts.air) charts.air.destroy();
    if (charts.jamban) charts.jamban.destroy();
    if (charts.sampah) charts.sampah.destroy();

    let airCounts = {};
    let jambanCounts = {};
    let sampahCounts = {};

    filteredData.forEach(row => {
        let air = row.air_sumber || 'Tidak Diketahui';
        airCounts[air] = (airCounts[air] || 0) + 1;
        
        let jamban = row.jamban_jenis || 'Tidak Diketahui';
        jambanCounts[jamban] = (jambanCounts[jamban] || 0) + 1;
        
        let sampah = row.sampah_kelola || 'Tidak Diketahui';
        sampahCounts[sampah] = (sampahCounts[sampah] || 0) + 1;
    });

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11, family: "'Inter', sans-serif" } } }
        }
    };

    const ctxAir = document.getElementById('chart-air');
    if (ctxAir) {
        charts.air = new Chart(ctxAir, {
            type: 'doughnut',
            data: {
                labels: Object.keys(airCounts),
                datasets: [{
                    data: Object.values(airCounts),
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: { ...commonOptions, cutout: '65%' }
        });
    }

    const ctxJamban = document.getElementById('chart-jamban');
    if (ctxJamban) {
        // Helper to split long labels into multiple lines
        const wrapText = (text, maxLength) => {
            const words = text.split(' ');
            let lines = [];
            let currentLine = words[0];
            for (let i = 1; i < words.length; i++) {
                if (currentLine.length + words[i].length + 1 <= maxLength) {
                    currentLine += ' ' + words[i];
                } else {
                    lines.push(currentLine);
                    currentLine = words[i];
                }
            }
            lines.push(currentLine);
            return lines;
        };

        charts.jamban = new Chart(ctxJamban, {
            type: 'bar',
            data: {
                labels: Object.keys(jambanCounts).map(l => wrapText(l, 18)),
                datasets: [{
                    label: 'Jumlah Rumah',
                    data: Object.values(jambanCounts),
                    backgroundColor: colors[2],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                // Join the array back into a single string for the tooltip title
                                return context[0].label.replace(/,/g, ' ');
                            }
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 } },
                    x: { 
                        grid: { display: false },
                        ticks: {
                            maxRotation: 0, // Force labels to stay horizontal
                            minRotation: 0,
                            font: { size: 10 }
                        }
                    }
                }
            }
        });
    }

    const ctxSampah = document.getElementById('chart-sampah');
    if (ctxSampah) {
        charts.sampah = new Chart(ctxSampah, {
            type: 'doughnut',
            data: {
                labels: Object.keys(sampahCounts),
                datasets: [{
                    data: Object.values(sampahCounts),
                    backgroundColor: [colors[1], colors[3], colors[0], colors[4]],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: { ...commonOptions, cutout: '65%' }
        });
    }
}

// Modal Functions
window.openDetailModal = function(data) {
    const modal = document.getElementById('detail-modal');
    const modalBody = document.getElementById('modal-body');
    const modalContent = document.getElementById('modal-content-wrapper');
    const modalTitle = document.getElementById('modal-title');
    
    if (!modal || !modalBody) return;

    const health = calculateHealthScore(data);
    
    modalTitle.innerHTML = `Detail: ${data.nama_kk || 'Data Rumah'} <span class="${health.badgeClass} text-xs font-bold px-2 py-1 rounded ml-2 border align-middle tracking-wide">Skor: ${health.score}/22 &mdash; ${health.category}</span>`;
    
    let isUmkm = data.is_umkm && data.is_umkm.toLowerCase() === 'ya';

    modalBody.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Informasi Umum -->
            <div>
                <h4 class="font-bold text-slate-800 mb-3 border-b pb-2"><i class="fa-solid fa-address-card mr-2 text-brand-500"></i> Informasi Umum</h4>
                <div class="space-y-3 text-sm">
                    <div class="grid grid-cols-3 gap-2 border-b border-slate-50 pb-2">
                        <span class="text-slate-500">Nomor Rumah</span>
                        <span class="col-span-2 font-medium text-slate-900">${data.nomor_rumah || '-'}</span>
                    </div>
                    <div class="grid grid-cols-3 gap-2 border-b border-slate-50 pb-2">
                        <span class="text-slate-500">Nama KK</span>
                        <span class="col-span-2 font-medium text-slate-900">${data.nama_kk || '-'}</span>
                    </div>
                    <div class="grid grid-cols-3 gap-2 border-b border-slate-50 pb-2">
                        <span class="text-slate-500">Jumlah Jiwa</span>
                        <span class="col-span-2 font-medium text-slate-900">${parseInt(data.jumlah_anggota) || '-'} Orang</span>
                    </div>
                    <div class="grid grid-cols-3 gap-2 border-b border-slate-50 pb-2">
                        <span class="text-slate-500">Responden</span>
                        <span class="col-span-2 font-medium text-slate-900">${data.nama_responden || '-'}</span>
                    </div>
                    <div class="grid grid-cols-3 gap-2 border-b border-slate-50 pb-2">
                        <span class="text-slate-500">Usia KK</span>
                        <span class="col-span-2 font-medium text-slate-900">${data.usia || '-'} Tahun</span>
                    </div>
                    <div class="grid grid-cols-3 gap-2 border-b border-slate-50 pb-2">
                        <span class="text-slate-500">No. HP</span>
                        <span class="col-span-2 font-medium text-slate-900">${data.no_hp || '-'}</span>
                    </div>
                    <div class="grid grid-cols-3 gap-2">
                        <span class="text-slate-500">Status</span>
                        <span class="col-span-2 font-medium text-slate-900">${data.status || '-'}</span>
                    </div>
                </div>
            </div>

            <!-- Potensi UMKM -->
            <div class="${isUmkm ? 'bg-amber-50/50 border border-amber-100 rounded-xl p-4' : 'bg-slate-50 border border-slate-100 rounded-xl p-4'}">
                <h4 class="font-bold text-slate-800 mb-3 border-b border-black/5 pb-2"><i class="fa-solid fa-store mr-2 text-amber-500"></i> Data UMKM</h4>
                ${isUmkm ? `
                    <div class="space-y-3 text-sm">
                        <div class="grid grid-cols-3 gap-2">
                            <span class="text-slate-500">Nama Usaha</span>
                            <span class="col-span-2 font-bold text-slate-900">${data.nama_usaha || '-'}</span>
                        </div>
                        <div class="grid grid-cols-3 gap-2">
                            <span class="text-slate-500">Jenis Usaha</span>
                            <span class="col-span-2 font-medium text-slate-900">${data.jenis_usaha || '-'}</span>
                        </div>
                        <div class="grid grid-cols-3 gap-2">
                            <span class="text-slate-500">Produk/Jasa</span>
                            <span class="col-span-2 font-medium text-slate-900">${data.produk_jasa || '-'}</span>
                        </div>
                    </div>
                ` : `
                    <div class="text-center text-slate-400 py-4">Tidak ada data UMKM</div>
                `}
            </div>
        </div>

        <!-- Indikator Kesehatan -->
        <div class="mt-6">
            <h4 class="font-bold text-slate-800 mb-4 border-b pb-2"><i class="fa-solid fa-heart-pulse mr-2 text-brand-500"></i> Indikator Sanitasi & Kesehatan</h4>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-center">
                <!-- Air Bersih -->
                <div class="bg-blue-50/50 border border-blue-100 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center min-h-[140px]">
                    <div class="text-blue-500 mb-2"><i class="fa-solid fa-droplet fa-xl"></i></div>
                    <div class="text-[10px] uppercase font-bold text-slate-500 mb-1">Air Bersih</div>
                    <div class="text-sm font-semibold text-slate-800 mb-1 leading-tight line-clamp-3" title="${data.air_sumber || ''}">${data.air_sumber || '-'}</div>
                    <div class="text-xs text-slate-500 italic">${data.air_kondisi || ''}</div>
                </div>
                
                <!-- Jamban -->
                <div class="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center min-h-[140px]">
                    <div class="text-emerald-500 mb-2"><i class="fa-solid fa-toilet fa-xl"></i></div>
                    <div class="text-[10px] uppercase font-bold text-slate-500 mb-1">Jamban</div>
                    <div class="text-sm font-semibold text-slate-800 leading-tight line-clamp-3" title="${data.jamban_jenis || ''}">${data.jamban_jenis || '-'}</div>
                </div>

                <!-- SPAL -->
                <div class="bg-purple-50/50 border border-purple-100 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center min-h-[140px]">
                    <div class="text-purple-500 mb-2"><i class="fa-solid fa-water fa-xl"></i></div>
                    <div class="text-[10px] uppercase font-bold text-slate-500 mb-1">Sanitasi Limbah (SPAL)</div>
                    <div class="text-sm font-semibold text-slate-800 leading-tight line-clamp-3" title="${data.spal_kondisi || ''}">${data.spal_kondisi || '-'}</div>
                </div>

                <!-- Sampah -->
                <div class="bg-amber-50/50 border border-amber-100 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center min-h-[140px]">
                    <div class="text-amber-500 mb-2"><i class="fa-solid fa-trash-can fa-xl"></i></div>
                    <div class="text-[10px] uppercase font-bold text-slate-500 mb-1">Sampah</div>
                    <div class="text-sm font-semibold text-slate-800 leading-tight line-clamp-3" title="${data.sampah_kelola || ''}">${data.sampah_kelola || '-'}</div>
                </div>

                <!-- Ventilasi -->
                <div class="bg-cyan-50/50 border border-cyan-100 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center min-h-[140px]">
                    <div class="text-cyan-500 mb-2"><i class="fa-solid fa-wind fa-xl"></i></div>
                    <div class="text-[10px] uppercase font-bold text-slate-500 mb-1">Ventilasi</div>
                    <div class="text-sm font-semibold text-slate-800 leading-tight line-clamp-3" title="${data.ventilasi_kondisi || ''}">${data.ventilasi_kondisi || '-'}</div>
                </div>

                <!-- Pencahayaan -->
                <div class="bg-yellow-50/50 border border-yellow-100 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center min-h-[140px]">
                    <div class="text-yellow-500 mb-2"><i class="fa-solid fa-sun fa-xl"></i></div>
                    <div class="text-[10px] uppercase font-bold text-slate-500 mb-1">Pencahayaan</div>
                    <div class="text-sm font-semibold text-slate-800">${data.pencahayaan_syarat || '-'}</div>
                </div>
            </div>
            
            </div>

            <!-- Kondisi Lingkungan & Fisik (New Section) -->
            <div class="mt-6">
                <h4 class="font-bold text-slate-800 mb-4 border-b pb-2"><i class="fa-solid fa-house-chimney-window mr-2 text-brand-500"></i> Kondisi Fisik Bangunan & Lingkungan</h4>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="bg-slate-50 border border-slate-100 rounded-lg p-4 shadow-sm">
                        <h5 class="font-bold text-slate-700 mb-3 text-sm">Fisik Bangunan</h5>
                        <div class="space-y-3 text-sm">
                            <div class="grid grid-cols-3 gap-2 border-b border-slate-100 pb-2">
                                <span class="text-slate-500">Lantai</span>
                                <span class="col-span-2 font-medium text-slate-900">${data.kondisi_lantai || '-'}</span>
                            </div>
                            <div class="grid grid-cols-3 gap-2 border-b border-slate-100 pb-2">
                                <span class="text-slate-500">Dinding</span>
                                <span class="col-span-2 font-medium text-slate-900">${data.kondisi_dinding || '-'}</span>
                            </div>
                            <div class="grid grid-cols-3 gap-2">
                                <span class="text-slate-500">Atap</span>
                                <span class="col-span-2 font-medium text-slate-900">${data.kondisi_atap || '-'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-slate-50 border border-slate-100 rounded-lg p-4 shadow-sm">
                        <h5 class="font-bold text-slate-700 mb-3 text-sm">Lingkungan & Perilaku</h5>
                        <div class="space-y-3 text-sm">
                            <div class="grid grid-cols-3 gap-2 border-b border-slate-100 pb-2">
                                <span class="text-slate-500">Pekarangan</span>
                                <span class="col-span-2 font-medium text-slate-900">${data.kondisi_pekarangan || '-'}</span>
                            </div>
                            <div class="grid grid-cols-3 gap-2 border-b border-slate-100 pb-2">
                                <span class="text-slate-500">Kepadatan Hunian</span>
                                <span class="col-span-2 font-medium text-slate-900">${data.kepadatan_hunian || '-'}</span>
                            </div>
                            <div class="grid grid-cols-3 gap-2">
                                <span class="text-slate-500">Pelaksanaan 3M</span>
                                <span class="col-span-2 font-medium text-slate-900">${data.pelaksanaan_3m || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            ${data.notes ? `
            <div class="mt-6 bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm">
                <div class="font-bold text-amber-800 mb-1"><i class="fa-solid fa-note-sticky mr-1"></i> Catatan Tambahan:</div>
                <div class="text-amber-700">${data.notes}</div>
            </div>
            ` : ''}
        </div>
    `;

    modal.classList.remove('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
    }, 10);
};

window.closeModal = function() {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('modal-content-wrapper');
    
    if (modal && modalContent) {
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('opacity-0', 'pointer-events-none');
        }, 200);
    }
};

function calculateHealthScore(row) {
    let score = 0;
    let questionsAnswered = 0; // To track if the form was actually filled
    
    const safeStr = (val) => (val || '').toLowerCase();

    // 1. Ventilasi Kondisi
    let vk = safeStr(row.ventilasi_kondisi);
    if (vk.includes('segar')) { score += 2; questionsAnswered++; }
    else if (vk.includes('sebagian')) { score += 0; questionsAnswered++; }
    else if (vk.includes('tidak ada') || vk.includes('sama sekali')) { score += 0; questionsAnswered++; }

    // 2. Pencahayaan
    let ps = safeStr(row.pencahayaan_syarat) || safeStr(row.pencahayaan_kondisi);
    if (ps.includes('tidak memenuhi')) { score += 0; questionsAnswered++; }
    else if (ps.includes('memenuhi')) { score += 1; questionsAnswered++; }

    // 3. SPAL (Sanitasi)
    let sk = safeStr(row.spal_kondisi);
    if (sk.includes('tertutup')) { score += 2; questionsAnswered++; }
    else if (sk.includes('terbuka') || sk.includes('tidak menggenang')) { score += 1; questionsAnswered++; }
    else if (sk.includes('menggenang')) { score += 0; questionsAnswered++; }

    // 4. Jamban
    let jj = safeStr(row.jamban_jenis);
    if (jj.includes('leher angsa') && jj.includes('septic tank')) { score += 2; questionsAnswered++; }
    else if (jj.includes('tanpa septic tank') || jj.includes('cubluk')) { score += 1; questionsAnswered++; }
    else if (jj.includes('tidak punya') || jj.includes('babs') || jj.includes('sembarangan')) { score += 0; questionsAnswered++; }

    // 5. Air Sumber
    let as = safeStr(row.air_sumber);
    if (as.includes('pdam') || as.includes('bor') || as.includes('terlindungi')) { score += 2; questionsAnswered++; }
    else if (as.includes('gali') || as.includes('kadang kering')) { score += 1; questionsAnswered++; }
    else if (as.includes('tidak terlindungi') || as.includes('kekurangan air')) { score += 0; questionsAnswered++; }

    // 6. Air Kondisi
    let ak = safeStr(row.air_kondisi);
    if (ak.includes('jernih')) { score += 2; questionsAnswered++; }
    else if (ak.includes('kadang keruh')) { score += 1; questionsAnswered++; }
    else if (ak.includes('keruh') || ak.includes('berbau') || ak.includes('berwarna')) { score += 0; questionsAnswered++; }

    // 7. Sampah
    let skel = safeStr(row.sampah_kelola);
    if (skel.includes('diangkut')) { score += 1; questionsAnswered++; }
    else if (skel.includes('dibakar')) { score += 0; questionsAnswered++; }
    else if (skel.includes('sembarangan')) { score += 0; questionsAnswered++; }

    // 8. 3M Plus
    let p3m = safeStr(row.pelaksanaan_3m);
    if (p3m === 'ya') { score += 1; questionsAnswered++; }
    else if (p3m === 'tidak') { score += 0; questionsAnswered++; }

    // 9. Kepadatan Hunian
    let kh = safeStr(row.kepadatan_hunian);
    if (kh.includes('lega')) { score += 2; questionsAnswered++; }
    else if (kh.includes('cukup padat')) { score += 1; questionsAnswered++; }
    else if (kh.includes('sangat padat')) { score += 0; questionsAnswered++; }

    // 10. Lantai
    let kl = safeStr(row.kondisi_lantai);
    if (kl.includes('keramik') || kl.includes('plester')) { score += 1; questionsAnswered++; }
    else if (kl.includes('tanah')) { score += 0; questionsAnswered++; }

    // 11. Dinding
    let kd = safeStr(row.kondisi_dinding);
    if (kd.includes('tembok permanen') && !kd.includes('semi')) { score += 2; questionsAnswered++; }
    else if (kd.includes('semi')) { score += 1; questionsAnswered++; }
    else if (kd.includes('bambu') || kd.includes('kayu')) { score += 0; questionsAnswered++; }

    // 12. Atap
    let ka = safeStr(row.kondisi_atap);
    if (ka.includes('ada plafon')) { score += 2; questionsAnswered++; }
    else if (ka.includes('tanpa plafon')) { score += 1; questionsAnswered++; }
    else if (ka.includes('bocor')) { score += 0; questionsAnswered++; }

    // 13. Pekarangan
    let kp = safeStr(row.kondisi_pekarangan);
    if (kp.includes('kering') || kp.includes('bersih dan kering')) { score += 2; questionsAnswered++; }
    else if (kp.includes('cukup bersih')) { score += 1; questionsAnswered++; }
    else if (kp.includes('kotor') || kp.includes('becek') || kp.includes('genangan')) { score += 0; questionsAnswered++; }

    let category = '';
    let badgeClass = '';
    
    // Fallback if data is totally empty for this row
    if (questionsAnswered < 5) {
        return { score: 0, category: 'Data Tidak Lengkap', badgeClass: 'bg-slate-100 text-slate-600 border-slate-300' };
    }
    
    if (score >= 16) {
        category = 'Rumah Sehat';
        badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    } else {
        category = 'Kurang Sehat';
        badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
    }

    return { score, category, badgeClass };
}

// --- Excel Download Logic ---
window.downloadExcel = function() {
    if (typeof XLSX === 'undefined') {
        alert('Sistem sedang memuat pustaka Excel. Silakan tunggu beberapa detik dan coba lagi.');
        return;
    }

    const dusunVal = document.getElementById('dusun-filter').value;
    const rtVal = document.getElementById('rt-filter').value;
    const wb = XLSX.utils.book_new();

    // Helper to format row data for Excel
    const formatRowForExcel = (row) => {
        const health = calculateHealthScore(row);
        return {
            "Kode Rumah": row.kode_rumah || "-",
            "Dusun": row.dusun || "-",
            "RT/RW": formatRtRw(row.rt_rw),
            "Nama Kepala Keluarga": row.nama_kk || "-",
            "Nama Responden": row.nama_responden || "-",
            "Usia Responden": row.usia ? `${row.usia} Tahun` : "-",
            "Jumlah Jiwa": row.jumlah_anggota || "-",
            "Pelaku UMKM": row.is_umkm && row.is_umkm.toLowerCase() === 'ya' ? 'Ya' : 'Tidak',
            "Nama Usaha": row.nama_usaha || "-",
            "Jenis Usaha": row.jenis_usaha || "-",
            "Produk Jasa": row.produk_jasa || "-",
            "Kategori Kesehatan": health.category,
            "Skor Kesehatan": health.score
        };
    };

    if (dusunVal === 'semua') {
        // Multi-sheet logic based on allData or filteredData? 
        // If they searched something, we should only download what's filtered.
        const dusunGroups = {
            "Dusun 1": [],
            "Dusun 2": [],
            "Dusun 3": [],
            "Dusun 4": []
        };
        
        filteredData.forEach(row => {
            const dName = row.dusun;
            if (dusunGroups[dName]) {
                dusunGroups[dName].push(formatRowForExcel(row));
            } else {
                if (!dusunGroups["Lainnya"]) dusunGroups["Lainnya"] = [];
                dusunGroups["Lainnya"].push(formatRowForExcel(row));
            }
        });

        // Create sheets for each Dusun that has data
        Object.keys(dusunGroups).forEach(dName => {
            if (dusunGroups[dName].length > 0) {
                const ws = XLSX.utils.json_to_sheet(dusunGroups[dName]);
                XLSX.utils.book_append_sheet(wb, ws, dName);
            }
        });

        XLSX.writeFile(wb, "Data_Kependudukan_Gondang_Lengkap.xlsx");
    } else {
        // Single sheet logic (Specific Dusun / RT)
        const exportData = filteredData.map(formatRowForExcel);
        if (exportData.length === 0) {
            alert('Tidak ada data yang sesuai dengan filter saat ini untuk diunduh.');
            return;
        }
        
        const ws = XLSX.utils.json_to_sheet(exportData);
        
        let sheetName = dusunVal;
        if (rtVal !== 'semua') {
            sheetName += ` - ${formatRtRw(rtVal)}`;
        }
        
        // Excel sheet names can't exceed 31 chars or have special chars
        sheetName = sheetName.replace(/[\/\?\*\[\]\:]/g, '_').substring(0, 31);
        
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, `Data_${sheetName.replace(/\s+/g, '_')}_Gondang.xlsx`);
    }
};

