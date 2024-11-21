document.addEventListener("DOMContentLoaded", () => {
const tableBody = document.querySelector("#dataTable tbody");
const addItemButton = document.getElementById("addItem");
const importExcel = document.getElementById("importExcel");
const generatePDF = document.getElementById("generatePDF");
const itemModal = new bootstrap.Modal(document.getElementById("itemModal"));
const merkInput = document.getElementById("merk");
const submerkInput = document.getElementById("submerk");
const volumeInput = document.getElementById("volume");
const jualInput = document.getElementById("jual");
const promoInput = document.getElementById("promo");
const dariInput = document.getElementById("dari");
const sampaiInput = document.getElementById("sampai");
const itemForm = document.getElementById("itemForm");

const itemPreviewCanvas = document.getElementById("itemPreview");
const prevItemButton = document.getElementById("prevItem");
const nextItemButton = document.getElementById("nextItem");
const dataLabel = document.getElementById("dataLabel");
let currentItemIndex = 0; 

const data = [];
let filename;

let editIndex = null;


const renderCanvas = (item) => {
    const ctx = itemPreviewCanvas.getContext("2d");
    ctx.clearRect(0, 0, itemPreviewCanvas.width, itemPreviewCanvas.height); // Clear canvas

    // Ukuran Canvas: 108.3mm x 105mm (diperkirakan berdasarkan PDF)
    const canvasWidth = 108.3 * 3.7795275591; // convert mm to px (1mm = 3.7795px)
    const canvasHeight = 105 * 3.7795275591; // convert mm to px (1mm = 3.7795px)
    itemPreviewCanvas.width = canvasWidth;
    itemPreviewCanvas.height = canvasHeight;

    // Set background image
    const backgroundImage = new Image();
    backgroundImage.src = "background.jpg";  // Path to your background image

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
    const mmToPx = 3.7795275591; // 1mm = 3.7795px
    const ptToPx = 1.3333; 

    const name_x = 69 * mmToPx, name_y = 38 * mmToPx;
    const submerk_x = 69 * mmToPx, submerk_y = 44.6 * mmToPx;
    const volume_x = 69 * mmToPx, volume_y = 49.1 * mmToPx;
    const jual_x = 101.2 * mmToPx, jual_y = 68.9 * mmToPx;
    const coret_x1 = 62.8 * mmToPx, coret_y1 = 64.8 * mmToPx, coret_x2 = 99.4 * mmToPx, coret_y2 = 59.8 * mmToPx;
    const periode_x = 101.2 * mmToPx, periode_y = 100 * mmToPx;
    const price_x = 101.2 * mmToPx, price_y = 86.9 * mmToPx;


    // Render Merk
    ctx.font = `bold ${28*ptToPx}px Helvetica`; // Adjust font size for 'Merk'
    ctx.textAlign = "center";
    ctx.fillText(item.merk, name_x, name_y);

    // Render Submerk
    ctx.font = `bold ${11.5*ptToPx}px Helvetica`; // Adjust font size for 'Submerk'
    ctx.fillText(item.submerk, submerk_x, submerk_y);

    // Render Volume
    ctx.fillText(item.volume, volume_x, volume_y);

    // Render Harga Jual
    ctx.font = `bold ${37.9*ptToPx}px Helvetica`; // Adjust font size for 'Jual'
    ctx.textAlign = "right";
    ctx.fillText(item.jual, jual_x, jual_y);

    // Render garis coret
    ctx.strokeStyle = "red";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(coret_x1, coret_y1);
    ctx.lineTo(coret_x2, coret_y2);
    ctx.stroke();

    // Render Promo
    ctx.font = `bold ${49*ptToPx}px Helvetica`; // Adjust font size for 'Promo'
    ctx.fillStyle = "red";
    ctx.fillText(item.promo, price_x, price_y);

    // Render Periode
    ctx.font = `bold ${10*ptToPx}px Helvetica`; // Adjust font size for 'Periode'
    ctx.fillStyle = "black";
    ctx.fillText(`Periode: ${formatTanggalTabel(item.dari)} - ${formatTanggalTabel(item.sampai)}`, periode_x, periode_y);
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
    const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
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
            <td>${item.jual}</td>
            <td>${item.promo}</td>
            <td>${formatTanggalTabel(item.dari)}</td>
            <td>${formatTanggalTabel(item.sampai)}</td>
            <td>
                <button class="btn btn-warning btn-sm editItem" data-index="${index}">Edit</button>
                <button class="btn btn-danger btn-sm deleteItem" data-index="${index}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    if (data.length > 0) {
        updatePreview();
    }
};


// Add/Edit Item
itemForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const merk = merkInput.value;
    const submerk = submerkInput.value;
    const volume = volumeInput.value;
    const jual = jualInput.value;
    const promo = promoInput.value;
    const dari = dariInput.value; // Tetap dalam format input YYYY-MM-DD
    const sampai = sampaiInput.value;

    const fJual = parseFloat(jual).toLocaleString("id-ID");
    const fPromo = parseFloat(promo).toLocaleString("id-ID");

    // Format tanggal untuk penyimpanan
    const formattedDari = formatTanggal(dari); // Format ke "15 November 2024"
    const formattedSampai = formatTanggal(sampai);

    if (editIndex !== null) {
        // Update item di array data
        data[editIndex] = {
            merk,
            submerk,
            volume,
            jual: fJual,
            promo: fPromo,
            dari: formattedDari,
            sampai: formattedSampai
        };
        editIndex = null;
    } else {
        // Tambahkan item baru ke array data
        data.push({
            merk,
            submerk,
            volume,
            jual: fJual,
            promo: fPromo,
            dari: formattedDari,
            sampai: formattedSampai
        });
    }

    itemForm.reset();
    itemModal.hide();
    renderTable(data);
});

// Import Excel
importExcel.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const workbook = XLSX.read(event.target.result, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

                sheetData.forEach((row) => {
                    if (row["MERK"] && row["SUBMERK"] && row["DARI"] && row["SAMPAI"]) {
                        const dariDate = row["DARI"];
                        const sampaiDate = row["SAMPAI"];

                        data.push({
                            merk: row["MERK"],
                            submerk: row["SUBMERK"],
                            volume: row["VOLUME"],
                            jual: row["JUAL"].toLocaleString("id-ID"),
                            promo: row["PROMO"].toLocaleString("id-ID"),
                            dari: parseTanggalExcel(dariDate),  // Ubah format tanggal
                            sampai: parseTanggalExcel(sampaiDate) // Ubah format tanggal
                        });
                    }
                });
                renderTable(data);
            } catch (error) {
                console.error("Error processing file:", error);
            }
        };
        reader.readAsBinaryString(file);
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
        jualInput.value = item.jual.replace(/\./g, "").replace(",", ".");
        promoInput.value = item.promo.replace(/\./g, "").replace(",", ".");
        
        // Pastikan tanggal valid untuk input
        dariInput.value = item.dari ? parseTanggalInput(item.dari) : "";
        sampaiInput.value = item.sampai ? parseTanggalInput(item.sampai) : "";

        editIndex = index;
        itemModal.show();
    } else if (e.target.classList.contains("deleteItem")) {
        const index = e.target.dataset.index;
        data.splice(index, 1);
        renderTable(data);
    }
});
    
addItemButton.addEventListener('click', () => {
    itemModal.show(); // Tampilkan modal saat tombol 'Tambah Item' ditekan
});    

    // Generate PDF
    generatePDF.addEventListener("click", () => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("landscape", "mm", [325, 210]);
        const background = "background.jpg";

        let bg_w = 108.3, bg_h = 105;
        let name_x = 69,name_y=38; 
        let submerk_x = 69,submerk_y=44.6;
        let volume_x = 69,volume_y=49.1;
        let jual_x=101.2,jual_y=68.9;
        let coret_x1=62.8,coret_y1=64.8,coret_x2=99.4,coret_y2=59.8;
        let periode_x=101.2,periode_y=100;
        let price_x=101.2,price_y=86.9;

        let x = 0, y = 0;
        // JUAL | PROMO | DARI | SAMPAI | MERK | SUBMERK | VOLUME
        data.forEach((item, index) => {
            // Jika index data habis dibagi 6 (misal 6,12,18 dst) maka tambah halaman baru

            if (index % 6 === 0 && index !== 0) {
                pdf.addPage();
                x = 0, y = 0;
            }

            // Set background
            pdf.addImage(background, "JPEG", x, y, bg_w, bg_h);
            
            pdf.setFont("Helvetica", "bold"); 

            // Set Teks Merk
            pdf.setTextColor('black');
            pdf.setFontSize(28);
            pdf.text(item.merk, x + name_x, y + name_y,'center');

            // Set Teks Submerk
            pdf.setTextColor('black');
            pdf.setFontSize(11.5);
            pdf.text(item.submerk, x + submerk_x, y + submerk_y,'center');
            
            // Set Teks Volume
            pdf.setTextColor('black');
            pdf.setFontSize(11.5);
            pdf.text(item.volume, x + volume_x, y + volume_y,'center');

            // Set Teks Jual
            pdf.setFontSize(37.9);
            pdf.setTextColor('black');
            pdf.text(`${item.jual}`, x + jual_x, y + jual_y,'right');

            // Set Garis Coret 
            // line(x1, y1, x2, y2, style)
            pdf.setDrawColor('red'); 
            pdf.setLineWidth(1.2);
            pdf.line(x+coret_x1, y+coret_y1,x+coret_x2, y+coret_y2);

            // Set Teks Promo
            pdf.setFontSize(49);
            pdf.setTextColor('red');
            pdf.text(`${item.promo}`, x + price_x, y + price_y,'right');

            // Set Teks Periode

            const dariFormatted = formatTanggalTabel(item.dari);
            const sampaiFormatted = formatTanggalTabel(item.sampai);

            pdf.setFontSize(10);
            pdf.setTextColor('black');
            pdf.text(`Periode: ${dariFormatted} - ${sampaiFormatted}`, x + periode_x, y + periode_y,'right');

            // Jika index+1 data habis dibagi 3, maka reset x dan, y pindah p
            if ((index + 1) % 3 === 0) {
                x = 0;
                y += bg_h;
            // Jika index+1 data tidak habis dibagi 3, maka reset x dan, y turun
            } else {
                x += bg_w;
            }
        });

        pdf.save(filename+".pdf");
    });
});
