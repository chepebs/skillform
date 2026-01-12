// Lightweight module declarations to keep typechecking stable.
// We intentionally import the distribution bundles in code, which don't ship TS declarations.


declare module 'jspdf/dist/jspdf.umd.min.js' {
  const jsPDF: any;
  export default jsPDF;
}

declare module 'html2canvas/dist/html2canvas.min.js' {
  const html2canvas: any;
  export default html2canvas;
}
