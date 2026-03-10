import { extractText } from "unpdf";

export async function extractPdfText(fileBuffer) {

  try {

    const result = await extractText(
      new Uint8Array(fileBuffer)
    );

    return result.text || "";

  }
  catch (error) {

    console.error("PDF extraction failed:", error);

    return "";

  }

}
