import * as pdfjsLib from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

export const MAX_RESUME_BYTES = 5 * 1024 * 1024

// Reads the text out of a resume so it can be matched against a role's skills.
// Supports text-based PDFs and .txt files. With a backend, do this on the server instead.
export async function extractResumeText(file) {
  const name = file.name.toLowerCase()

  if (file.size > MAX_RESUME_BYTES) throw new Error('That file is over 5 MB. Upload a smaller resume.')

  let text = ''
  if (name.endsWith('.txt')) {
    text = await file.text()
  } else if (name.endsWith('.pdf')) {
    const data = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data }).promise
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const content = await page.getTextContent()
      text += `${content.items.map((item) => item.str).join(' ')}\n`
    }
  } else {
    throw new Error('Upload your resume as a PDF or a .txt file.')
  }

  if (!text.trim()) {
    throw new Error('We could not read any text in that file. Upload a text-based PDF (not a scan) or a .txt file.')
  }
  return text
}
