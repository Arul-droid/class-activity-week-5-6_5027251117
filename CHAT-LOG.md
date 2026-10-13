# Chat Log

## To-do list debugging

### User
Why does the to-do list not work?

### Assistant
The main problem was a variable-name mismatch in `script.js`: the task array was declared as `task`, but the rest of the code used `tasks`. This caused a `ReferenceError` when rendering tasks.

Other issues identified:

- The filter buttons did not have the IDs expected by the JavaScript.
- Task changes were not saved to local storage.
- The course and date inputs were not used when creating tasks.
- Task titles were inserted as HTML rather than rendered as plain text.

### User
Are there any more bugs?

### Assistant
Yes. The filter buttons in `todolist.html` had class and value attributes, but the JavaScript looked them up by ID. The failed lookups returned `null`, causing an error that prevented later code from running. The other identified issues were missing local-storage saves and unused course/date inputs.

## Fixes

### User
Try fixing it.

### Assistant
Updated `todolist.html` and `script.js` to:

- Connect the filter buttons to the JavaScript.
- Include course and due date when creating tasks and display them.
- Save task changes to local storage and load them on startup.
- Render task titles as text, not HTML.
- Remove the empty placeholder list item.
- Handle malformed saved task data and local-storage errors.

Verified in the browser that creating, filtering, completing, deleting, and saving tasks worked. JavaScript syntax and editor diagnostics passed.

## Exporting this chat

### User
How do I export the chat log?

### Assistant
The earlier instruction to find **Export Chat** in the Chat view menu was incorrect. The menu shown did not have that option. A manual workaround is to move the chat into the editor area and copy the conversation into a text or Markdown file, or copy individual responses using their copy buttons.

### User
Can you make a Markdown?

### Assistant
Created this Markdown chat log.

# W6

### User
Ini merupakan tugas saya sekarang, dan tugas saya minggu lalu. Tolong jelaskan apa yang diminta dari tugas tersebut dan berikan arahan mengenai bagaimana saya dapat melanjutkannya.

### Assistant
Halo Arul, tugas Minggu 6 pada dasarnya adalah pengembangan lanjutan dari aplikasi Task Tracker yang sudah kamu buat di Minggu 5. Kalau pada minggu lalu aplikasi masih bekerja dengan data lokal/DOM saja, maka pada Minggu 6 kamu diminta untuk menghubungkan aplikasi tersebut ke REST API menggunakan JavaScript asynchronous dan Fetch API.

Tujuan utama dari tugas ini adalah agar aplikasi Task Tracker bisa:
- mengambil data dari server dengan `fetch()`
- menambah tugas ke server lewat `POST`
- mengubah status tugas lewat `PATCH`
- menghapus tugas lewat `DELETE`
- menangani keadaan loading, error, dan data kosong dengan UI yang rapi

Berikut kebutuhan fungsional utama yang diminta:

1. Pengambilan data (GET) secara paralel
   Kamu harus memanggil dua endpoint secara bersamaan melalui `Promise.all`, yaitu:
   - `/api/tugas`
   - `/api/matakuliah`

   Tujuannya agar saat halaman pertama kali dibuka, daftar tugas dan pilihan mata kuliah muncul sekaligus.

2. Manajemen state UI
   Aplikasi harus mampu menampilkan kondisi berikut:
   - loading: sedang memuat data
   - error: gagal memuat data, dengan tombol "Coba lagi"
   - empty state: belum ada tugas

3. Fungsi helper `api()`
   Kamu wajib membuat fungsi pembungkus `fetch()` yang berfungsi untuk menangani respons API. Jika `res.ok` bernilai `false`, fungsi tersebut harus melempar error dengan pesan dari server. Ini penting agar aplikasi tidak crash dan dapat menampilkan pesan error yang jelas ke user.

4. Penambahan tugas (POST)
   Form tidak lagi hanya mengubah DOM, tetapi harus mengirim data ke server dalam format JSON. Tombol submit harus dinonaktifkan saat proses pengiriman berlangsung agar tidak terjadi double submit. Harus juga menangani error seperti `400 Bad Request` dengan baik.

5. Modifikasi dan penghapusan tugas (PATCH & DELETE)
   Saat user menandai tugas selesai atau menghapus tugas, prosesnya harus dilakukan dengan event delegation, yaitu menaruh satu event listener di parent container. Setelah server berhasil merespons, UI harus dirender ulang dengan data terbaru.

6. Error handling dan ketahanan aplikasi
   Ini bagian yang paling penting. Aplikasi tidak boleh crash saat kondisi jaringan buruk atau server tidak merespons. Kamu harus menguji dengan `__API.setMode("offline")` atau `"lambat"` dan memastikan error ditangani dengan blok `try...catch` serta ditampilkan ke UI, bukan hanya muncul di console sebagai unhandled rejection.

Arahan langkah demi langkah untuk mengerjakan tugas

Sebelum mulai coding, pastikan kamu menyesuaikan nama file proyek Minggu 5 agar sesuai dengan spesifikasi pengumpulan:
- `todolist.html` menjadi `index.html`
- `script.js` menjadi `app.js`

Jangan lupa menambahkan file mock API dari referensi dosen ke dalam proyek.

Lakukan pengerjaan secara bertahap agar mudah dikelola dan memenuhi syarat minimal 5 kali Git commit:

### Commit 1: Helper API dan fetch awal
- buat fungsi `api(url, options)`
- gunakan `fetch()`
- cek `res.ok`
- kembalikan data JSON jika sukses
- lempar `new Error(...)` jika gagal
- buat fungsi `fetchInitialData()` yang memanggil `/api/tugas` dan `/api/matakuliah` dengan `Promise.all`
- tampilkan state loading sebelum data selesai dimuat

### Commit 2: Render state UI
- gunakan data dari API untuk membuat elemen HTML daftar tugas
- isi dropdown mata kuliah dengan data dari `/api/matakuliah`
- tampilkan pesan kosong ketika data belum ada
- ganti tampilan loading menjadi list tugas yang sesungguhnya

### Commit 3: Menambahkan tugas via POST
- tambahkan event `submit` pada form
- panggil `e.preventDefault()`
- ambil data dari input teks, mata kuliah, dan tanggal deadline
- nonaktifkan tombol submit saat proses sedang berjalan
- kirim data ke server dengan `method: "POST"` dan `Content-Type: application/json`
- tambahkan `try...catch` untuk menangani error
- aktifkan kembali tombol submit setelah berhasil atau gagal

### Commit 4: PATCH dan DELETE dengan event delegation
- pasang listener di elemen parent list tugas
- deteksi klik checkbox dan tombol hapus menggunakan `closest()` atau `matches()`
- ambil `data-id` untuk target tugas tertentu
- kirim request dengan method sesuai (`PATCH` atau `DELETE`)
- render ulang UI setelah sukses

### Commit 5: Error handling yang tahan uji
- tes dengan `__API.setMode("offline")` dan `__API.setMode("lambat")`
- pastikan semua error ditangkap dalam `catch`
- tampilkan pesan error di UI, bukan hanya di console
- buat tombol "Coba lagi" untuk memuat ulang data awal
- pastikan aplikasi tetap berfungsi meskipun server tidak responsif

Bonus (jika waktu memungkinkan):
- tambahkan fitur debounce pada pencarian
- gunakan optimistic update agar perubahan pada UI terlihat lebih cepat sebelum respons server datang

### Kesimpulan
Tugas Minggu 6 bukan hanya tentang menampilkan daftar tugas di browser, tetapi juga tentang bagaimana aplikasi berinteraksi dengan server secara aman, konsisten, dan tahan terhadap error. Jika kamu mengikuti alur commit di atas, kamu akan lebih mudah memahami arsitektur aplikasi, mulai dari fetch API, render UI, update state, sampai penanganan error yang profesional.

Jika kamu mau, saya juga bisa bantu lanjutkan dengan:
1. membuat versi ringkas untuk tugas yang akan dikumpulkan
2. membantu menuliskan pseudo-code atau flowchart
3. menuntun pembuatan kode `app.js` step-by-step dari awal sampai selesai

### User
Coba cek apakah ada error di website ini.

### Assistant
Saya sudah mengecek langsung halaman website di browser dan hasilnya tidak ditemukan error runtime pada kondisi normal.

Hasil pemeriksaan:
- halaman bisa dibuka dengan benar
- judul website muncul: "Task Tracker Kuliah Arul v2"
- daftar tugas tampil normal
- tidak ada `pageerror`
- tidak ada error di console browser
- status pengecekan: `NO_ERRORS`

Jadi, untuk kondisi normal, website ini tidak mengalami error saat dibuka. Hanya ada jeda ketika mode jaringan diatur ke "Lambat" karena mock API sengaja dibuat menunggu 2 detik, dan jika mode diubah ke "Offline" maka aplikasi akan menampilkan pesan error yang sudah dirancang untuk ditangani oleh fitur error handling.

### User
Tambahkan ke chat log.

### Assistant
Catatan pengecekan website telah ditambahkan ke chat log ini.