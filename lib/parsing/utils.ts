const SUPPORTED_EXTENSIONS = [".txt", ".pdf", ".docx", ".doc"];

export function isSupportedFileType(filename: string): boolean {
  const lower = filename.toLowerCase();
  return SUPPORTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}
