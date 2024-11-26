document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#dataTable tbody");
    const addItemButton = document.getElementById("addItem");
    const importExcel = document.getElementById("importExcel");
    const generatePDF = document.getElementById("generatePDF");
    const itemModal = new bootstrap.Modal(document.getElementById("itemModal"));
    const merkInput = document.getElementById("merk");
    const submerkInput = document.getElementById("submerk");
    const volumeInput = document.getElementById("volume");
    const diskonInput = document.getElementById("diskon");
    const dariInput = document.getElementById("dari");
    const sampaiInput = document.getElementById("sampai")
    const noteInput = document.getElementById("note");;
    const itemForm = document.getElementById("itemForm");
    
    const itemPreviewCanvas = document.getElementById("itemPreview");
    const prevItemButton = document.getElementById("prevItem");
    const nextItemButton = document.getElementById("nextItem");
    const dataLabel = document.getElementById("dataLabel");
    let currentItemIndex = 0; 
    
    const savedData = localStorage.getItem("tableDataDiskon");
    const data = savedData ? JSON.parse(savedData) : []; // Parse atau gunakan array kosong jika tidak ada data

    let filename;
    
    let editIndex = null;
    
    document.getElementById('importExcelButton').addEventListener('click', function() {
        console.log('click import')
        document.getElementById('importExcel').click();
          });
    
    // Size & Koordinat
    const bg_w = 108.3, bg_h = 105;
    const name_x = 69,name_y=38; 
    const submerk_x = 69,submerk_y=44.6;
    const volume_x = 69,volume_y=49.1;
    const periode_x=101.2,periode_y=94;
    const note_x=101.2,note_y=98;
    const diskon_x=55,diskon_y=88;
    
    const merkSize = 28;
    const submerkSize = 11.5;
    const volSize = 11.5;
    const diskonSize = 72;
    const periodeSize = 10;
    const noteSize = 10;
    
    const mmToPx = 3.7795275591; // 1mm = 3.7795px
    const ptToPx = 1.3333; 
    
    
    const renderCanvas = (item) => {
        const ctx = itemPreviewCanvas.getContext("2d");
        ctx.clearRect(0, 0, itemPreviewCanvas.width, itemPreviewCanvas.height); // Clear canvas
    
        // Ukuran Canvas: 108.3mm x 105mm (diperkirakan berdasarkan PDF)
        const canvasWidth = bg_w * mmToPx; // convert mm to px (1mm = 3.7795px)
        const canvasHeight = bg_h * mmToPx; // convert mm to px (1mm = 3.7795px)
        itemPreviewCanvas.width = canvasWidth;
        itemPreviewCanvas.height = canvasHeight;
    
        // Set background image
        const backgroundImage = new Image();
        backgroundImage.src = "background-diskon.jpg";  // Path to your background image
    
        backgroundImage.onload = function() {
            // Draw the background image
            ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
    
            // Render text after the background is loaded
            renderText(ctx, item);
        };
    };
    
    // Fungsi untuk render teks setelah background dimuat
    const renderText = (ctx, item) => {
        // Set the styles for text
        ctx.fillStyle = "black";
    
        // Posisi dan Ukuran Teks untuk PDF
    
        const cmerk_x = name_x * mmToPx, cmerk_y = name_y * mmToPx;
        const csubmerk_x = submerk_x * mmToPx, csubmerk_y = submerk_y * mmToPx;
        const cvolume_x = volume_x * mmToPx, cvolume_y = volume_y * mmToPx;
        const cperiode_x = periode_x * mmToPx, cperiode_y = periode_y * mmToPx;
        const cnote_x = note_x * mmToPx, cnote_y = note_y * mmToPx;
        const cdiskon_x = diskon_x * mmToPx, cdiskon_y = diskon_y * mmToPx;
    
    
        // Render Merk
        ctx.font = `bold ${merkSize*ptToPx}px Helvetica`; // Adjust font size for 'Merk'
        ctx.textAlign = "center";
        ctx.fillText(item.merk, cmerk_x, cmerk_y);
    
        // Render Submerk
        ctx.font = `bold ${submerkSize*ptToPx}px Helvetica`; // Adjust font size for 'Submerk'
        ctx.fillText(item.submerk, csubmerk_x, csubmerk_y);
    
        // Render Volume
        ctx.fillText(item.volume, cvolume_x, cvolume_y);
    
        // Render diskon
        ctx.textAlign = "center";
        ctx.font = `bold ${diskonSize*ptToPx}px Helvetica`; // Adjust font size for 'diskon'
        ctx.fillStyle = "red";
        ctx.fillText(`${item.diskon}`, cdiskon_x, cdiskon_y);
    
        // Render Periode
        ctx.textAlign = "right";
        ctx.font = `bold ${periodeSize*ptToPx}px Helvetica`; // Adjust font size for 'Periode'
        ctx.fillStyle = "black";
        ctx.fillText(`Periode: ${formatTanggalTabel(item.dari)} - ${formatTanggalTabel(item.sampai)}`, cperiode_x, cperiode_y);

        // Render Note
        ctx.font = `bold ${noteSize*ptToPx}px Helvetica`; // Adjust font size for 'Submerk'
        ctx.fillText(item.note, cnote_x, cnote_y);
    };
    
    
    // Fungsi untuk memperbarui preview
    const updatePreview = () => {
        const item = data[currentItemIndex];
        renderCanvas(item);
        dataLabel.textContent = `${currentItemIndex + 1}`;
    };
    
    // Tombol Prev
    prevItemButton.addEventListener("click", () => {
        if (currentItemIndex > 0) {
            currentItemIndex--;
            updatePreview();
        }
    });
    
    // Tombol Next
    nextItemButton.addEventListener("click", () => {
        if (currentItemIndex < data.length - 1) {
            currentItemIndex++;
            updatePreview();
        }
    });
    
    
    const parseTanggalExcel = (tanggalExcel) => {
        if (!tanggalExcel) return "Invalid Date";
    
        // Cek jika tanggalExcel sudah berupa objek Date atau string
        if (tanggalExcel instanceof Date) {
            const day = tanggalExcel.getDate().toString().padStart(2, "0");
            const month = (tanggalExcel.getMonth() + 1).toString().padStart(2, "0"); // getMonth() dimulai dari 0
            const year = tanggalExcel.getFullYear();
            return `${year}-${month}-${day}`;
        }
    
        // Cek jika tanggalExcel adalah angka serial tanggal dari Excel
        if (typeof tanggalExcel === "number") {
            const javascriptDate = new Date((tanggalExcel - 25569) * 86400 * 1000); // Konversi Excel ke JS
            const day = javascriptDate.getDate().toString().padStart(2, "0");
            const month = (javascriptDate.getMonth() + 1).toString().padStart(2, "0");
            const year = javascriptDate.getFullYear();
            return `${year}-${month}-${day}`;
        }
    
        // Jika tanggalExcel masih dalam format string (DD/MM/YYYY), lakukan split
        if (typeof tanggalExcel === "string" && tanggalExcel.includes("/")) {
            const [day, month, year] = tanggalExcel.split("/");
            return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }
    
        return "Invalid Date"; // Jika format tidak dikenali
    };
    
    // Format tanggal untuk tampilan: dari YYYY-MM-DD menjadi DD MMMM YYYY
    const formatTanggal = (tanggalInput) => {
        if (typeof tanggalInput !== "string" || !tanggalInput.includes("-")) {
            return "Invalid Date"; // Penanganan jika input tidak valid
        }
    
        const [year, month, day] = tanggalInput.split("-");
    
        // Format ulang menjadi YYYY-MM-DD
        return `${year}-${month}-${day}`;
    };
    
    // Fungsi untuk mengonversi tanggal input dalam format DD/MM/YYYY dari Excel
    const parseTanggalInput = (tanggal) => {
        if (!tanggal) return "";
        const [day, month, year] = tanggal.split(" ");
        const monthNames = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        const monthIndex = monthNames.indexOf(month) + 1;
        const paddedMonth = monthIndex.toString().padStart(2, "0");
        const paddedDay = day.padStart(2, "0");
        return `${year}-${paddedMonth}-${paddedDay}`;
    };
    
    
    // Fungsi Format Tanggal untuk Tabel
    const formatTanggalTabel = (tanggal) => {
        if (!tanggal || tanggal === "Invalid Date") return "";
    
        // Cek jika tanggal dalam format "YYYY-MM-DD"
        if (/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
            const [year, month, day] = tanggal.split("-");
            const monthNames = [
                "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                "Juli", "Agustus", "September", "Oktober", "November", "Desember"
            ];
            return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
        }
    
        // Jika tanggal sudah dalam format "18 November 2024", kembalikan apa adanya
        if (/^\d{1,2}\s\w+\s\d{4}$/.test(tanggal)) {
            return tanggal;
        }
    
        return ""; // Penanganan jika format tidak dikenali
    };
    // Render Table
    const renderTable = (data) => {
        tableBody.innerHTML = ""; // Bersihkan tabel
    
        data.forEach((item, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.merk}</td>
                <td>${item.submerk}</td>
                <td>${item.volume}</td>
                <td>${item.diskon}</td>
                <td>${formatTanggalTabel(item.dari)}</td>
                <td>${formatTanggalTabel(item.sampai)}</td>
                <td>${item.note}</td>
                <td>
                    <button class="btn btn-warning btn-sm editItem" data-index="${index}">Edit</button>
                    <button class="btn btn-danger btn-sm deleteItem" data-index="${index}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Simpan data ke localStorage
        localStorage.setItem("tableDataDiskon", JSON.stringify(data));
        if (data.length > 0) {
            updatePreview();
        }
    };
    renderTable(data);

    document.getElementById("clearData").addEventListener("click", () => {
        // Konfirmasi sebelum menghapus semua data
        const confirmDelete = confirm("Apakah Anda yakin ingin menghapus semua data?");
        if (confirmDelete) {
            // Kosongkan data tabel
            const data = [];
            renderTable(data);
    
            // Hapus data dari localStorage
            localStorage.removeItem("tableDataDiskon");
    
            alert("Semua data telah dihapus.");
        }
    });
    
    // Add/Edit Item
    itemForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const merk = merkInput.value;
        const submerk = submerkInput.value;
        const volume = volumeInput.value;
        const diskon = diskonInput.value;
        const dari = dariInput.value; // Tetap dalam format input YYYY-MM-DD
        const sampai = sampaiInput.value;
        const note = noteInput.value;
        const fdiskon = (diskon);
    
        // Format tanggal untuk penyimpanan
        const formattedDari = formatTanggal(dari); // Format ke "15 November 2024"
        const formattedSampai = formatTanggal(sampai);
    
        if (editIndex !== null) {
            // Update item di array data
            data[editIndex] = {
                merk,
                submerk,
                volume,
                diskon: fdiskon,
                dari: formattedDari,
                sampai: formattedSampai,
                note
            };
            editIndex = null;
        } else {
            // Tambahkan item baru ke array data
            data.push({
                merk,
                submerk,
                volume,
                diskon: fdiskon,
                dari: formattedDari,
                sampai: formattedSampai,
                note
            });
        }
    
        itemForm.reset();
        itemModal.hide();
        renderTable(data);
    });
    
    // Import Excel
importExcel.addEventListener("change", (e) => {
    const file = e.target.files[0];
    console.log("File selected:", file);

    if (file) {
        const reader = new FileReader();

        reader.onload = (event) => {
            console.log("FileReader onload triggered");
            try {
                const workbook = XLSX.read(event.target.result, { type: "binary" });
                console.log("Workbook loaded:", workbook);

                const sheetName = workbook.SheetNames[0];
                console.log("Sheet name:", sheetName);

                const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                console.log("Sheet data:", sheetData);

                sheetData.forEach((row, index) => {
                    console.log(`Processing row ${index + 1}:`, row);

                    if (row["MERK"] && row["SUBMERK"] && row["VOLUME"] && row["DISKON"] && row["DARI"] && row["SAMPAI"]) {
                        const dariDate = row["DARI"];
                        const sampaiDate = row["SAMPAI"];

                        const formattedRow = {
                            merk: row["MERK"],
                            submerk: row["SUBMERK"],
                            volume: row["VOLUME"],
                            diskon: row["DISKON"],
                            dari: parseTanggalExcel(dariDate), // Ubah format tanggal
                            sampai: parseTanggalExcel(sampaiDate), // Ubah format tanggal
                            note: row["CATATAN"] !== undefined ? row["CATATAN"] : ""
                        };

                        console.log("Formatted row:", formattedRow);
                        data.push(formattedRow);
                    } else {
                        console.warn(`Row ${index + 1} is missing required fields`, row);
                    }
                });

                console.log("Final data array:", data);
                renderTable(data);
            } catch (error) {
                console.error("Error processing file:", error);
            }
        };

        reader.onerror = (error) => {
            console.error("FileReader encountered an error:", error);
        };

        console.log("Starting to read file as binary string");
        reader.readAsBinaryString(file);
    } else {
        console.warn("No file selected");
    }
});

    
    // Edit/Delete Actions
    tableBody.addEventListener("click", (e) => {
        if (e.target.classList.contains("editItem")) {
            const index = e.target.dataset.index;
            const item = data[index];
            merkInput.value = item.merk;
            submerkInput.value = item.submerk;
            volumeInput.value = item.volume;
            diskonInput.value = item.diskon;
            
            // Pastikan tanggal valid untuk input
            dariInput.value = item.dari;
            sampaiInput.value = item.sampai;
    
            noteInput.value = item.note;

            editIndex = index;
            itemModal.show();
        } else if (e.target.classList.contains("deleteItem")) {
            const confirmDelete = confirm("Apakah Anda yakin ingin menghapus item ini?");
        if (confirmDelete) {
            const index = e.target.dataset.index;
            data.splice(index, 1);
            renderTable(data);
        }
        }
    });
        
    addItemButton.addEventListener('click', () => {
        itemModal.show(); // Tampilkan modal saat tombol 'Tambah Item' ditekan
    });    
    
        // Generate PDF
        generatePDF.addEventListener("click", () => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF("landscape", "mm", [325, 210]);
            const background = "background-diskon.jpg";
    
    
            let x = 0, y = 0;
            const itemsPerPage = 6; // 2 baris x 3 kolom
            data.forEach((item, index) => {
                // Tambah halaman baru setiap 6 item
                if (index % itemsPerPage === 0 && index !== 0) {
                    pdf.addPage();
                    x = 0; // Reset kolom ke posisi awal
                    y = 0; // Reset baris ke posisi awal
                }

                // Tentukan kolom dan baris
                const column = Math.floor(index / 2) % 3; // Kolom (0, 1, 2 untuk setiap halaman)
                const row = index % 2; // Baris (0 atau 1)

                x = column * bg_w; // Kolom menentukan posisi horizontal
                y = row * bg_h;    // Baris menentukan posisi vertikal
    
                // Set background
                pdf.addImage(background, "JPEG", x, y, bg_w, bg_h);
                
                pdf.setFont("Helvetica", "bold"); 
    
                // Set Teks Merk
                pdf.setTextColor('black');
    
                pdf.setFontSize(merkSize);
                pdf.text(item.merk, x + name_x, y + name_y,'center');
    
                // Set Teks Submerk
                pdf.setTextColor('black');
                pdf.setFontSize(submerkSize);
                pdf.text(item.submerk, x + submerk_x, y + submerk_y,'center');
                
                // Set Teks Volume
                pdf.setTextColor('black');
                pdf.setFontSize(volSize);
                pdf.text(item.volume, x + volume_x, y + volume_y,'center');
    
                // Set Teks diskon
                pdf.setFontSize(diskonSize);
                pdf.setTextColor('red');
                pdf.text(`${item.diskon}`, x + diskon_x, y + diskon_y,'center');
    
                // Set Teks Periode
    
                const dariFormatted = formatTanggalTabel(item.dari);
                const sampaiFormatted = formatTanggalTabel(item.sampai);
    
                pdf.setFontSize(periodeSize);
                pdf.setTextColor('black');
                pdf.text(`Periode: ${dariFormatted} - ${sampaiFormatted}`, x + periode_x, y + periode_y,'right');
    
                // Set Teks Catatan
                pdf.setTextColor('black');
                pdf.setFontSize(noteSize);
                pdf.text(item.note, x + note_x, y + note_y,'right');
            });
    
            pdf.save(filename+".pdf");
        });
    });
    
