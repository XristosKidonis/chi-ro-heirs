<script>
  let { n } = $props();
  const D = {
    menu: 'M4 7h16M4 12h16M4 17h16',
    buscar: 'M16 16l4.5 4.5M11 4.5a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0-13',
    voz: 'M5 9.5h3l4.5-4v13l-4.5-4H5zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11',
    pausa: 'M8 5v14M16 5v14',
    musica: 'M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0a2.5 2.5 0 1 1 5 0M19 16a2.5 2.5 0 1 1-5 0a2.5 2.5 0 1 1 5 0',
    tema: 'M12 4a8 8 0 1 0 0 16a8 8 0 1 0 0-16M12 4v16',
    estudio: 'M3 5.5c3-1.5 6-1.5 9 .5 3-2 6-2 9-.5V19c-3-1.5-6-1.5-9 .5-3-2-6-2-9-.5zM12 6v13.5',
    cerrar: 'M6 6l12 12M18 6L6 18',
    ant: 'M15 5l-7 7 7 7',
    sig: 'M9 5l7 7-7 7',
    nota: 'M5 19l1-4L16 5l3 3L9 18zM14 7l3 3',
    copiar: 'M8 8h11v12H8zM5 16V4h11',
    refs: 'M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1.2 1.2M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1.2-1.2',
    comparar: 'M4 6h7v13H4zM13 6h7v13h-7z',
    memoria: 'M12 3v3M12 18v3M3 12h3M18 12h3M12 7a5 5 0 1 0 0 10a5 5 0 1 0 0-10',
    poster: 'M5 3h14v18H5zM8 8h8M8 11h8M8 14h5',
    palabra: 'M5 19L10.5 5h3L19 19M7.5 13.5h9',
    paralelo: 'M4 5h16M4 19h16M12 5v14',
    lector: 'M6 4h12v16H6zM9 8h6M9 12h6M9 16h4',
    original: 'M5 6l7 12M12 6l-3 5M17 6c2 0 3 1.5 3 3s-1 3-3 3h-2V6M15 12v6',
    guardar: 'M6 4.3h12v16l-6-4.5-6 4.5z',
    ajustes: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4',
    inicio: 'M4 11l8-6.5 8 6.5M6.5 9.5V19h11V9.5',
    biblioteca: 'M5 4h4v16H5zM10 4h4v16h-4zM15.5 4.8l3.6-1 3.6 15.3-3.6 1z',
    archivo: 'M4 6h16M4 12h16M4 18h10',
    laminas: 'M4 4h7v9H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 15h7v5H4z',
    historia: 'M3 8l9-4.5L21 8M5 8h14M6 10.5v7M10 10.5v7M14 10.5v7M18 10.5v7M4 20h16',
  };
</script>

<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d={D[n]} /></svg>
