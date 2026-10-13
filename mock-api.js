// Mock server lokal: hanya request /api/* yang diintersep.
// Ganti script ini dengan backend sungguhan tanpa mengubah app.js.
(() => {
  const nativeFetch = window.fetch.bind(window);

  const courses = [
    { id: "kjk", name: "Keamanan Jaringan Komputer" },
    { id: "pemweb", name: "Pemrograman Web" },
    { id: "pemmob", name: "Pemrograman Mobile" },
    { id: "jarkom", name: "Komunikasi Data dan Jaringan Komputer" },
    { id: "kompro", name: "Komunikasi Profesional" },
    { id: "iot", name: "Internet of Things" }
  ];

  let tasks = [
    {
      id: "1",
      text: "Membuat Website to-do list",
      course: "pemweb",
      dueDate: "2026-10-15",
      completed: false
    },
    {
      id: "2",
      text: "Kerjain Jarkom Modul 2",
      course: "jarkom",
      dueDate: "2026-10-16",
      completed: false
    },
    {
      id: "3",
      text: "Buat aplikasi pemmob",
      course: "pemmob",
      dueDate: "2026-10-18",
      completed: true
    }
  ];

  let mode = "normal";
  let nextId = 4;

  const json = (data, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" }
    });
  };

  window.__API = {
    setMode(value) {
      if (!["normal", "offline", "lambat"].includes(value)) {
        throw new Error("Mode tidak dikenal");
      }

      mode = value;
    }
  };

  window.fetch = async (input, options = {}) => {
    const url = new URL(
      typeof input === "string" ? input : input.url,
      location.href
    );

    if (
      url.origin !== location.origin ||
      !url.pathname.startsWith("/api/")
    ) {
      return nativeFetch(input, options);
    }

    const requestMode = mode;

    await new Promise(resolve => {
      setTimeout(resolve, requestMode === "lambat" ? 2000 : 180);
    });

    if (requestMode === "offline") {
      throw new TypeError(
        "Jaringan offline. Periksa koneksi lalu coba lagi."
      );
    }

    const method = (options.method || "GET").toUpperCase();

    if (url.pathname === "/api/tugas" && method === "GET") {
      return json(tasks);
    }

    if (url.pathname === "/api/matakuliah" && method === "GET") {
      return json(courses);
    }

    return json({ message: "Endpoint tidak ditemukan." }, 404);
  };
})();