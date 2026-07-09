import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

const PROMPT = `Você é um leitor de cupons fiscais e comandas de bar/restaurante.
Analise esta imagem e extraia APENAS os itens consumidos (produtos/bebidas/comidas).

Regras:
- Ignore cabeçalho, rodapé, datas, CNPJ, mesa, vendedor, subtotal, total, serviço, taxa, troco
- Para cada item identifique: quantidade, nome do produto, preço UNITÁRIO
- Se não houver quantidade explícita, use 1
- Responda SOMENTE com JSON válido, sem explicações nem markdown

Formato:
{"itens": [{"qty": 2, "name": "Cerveja Original", "unit": 9.90}, ...]}`;

export async function POST(req: NextRequest) {
  const { imageBase64, mediaType } = await req.json();

  if (!imageBase64) {
    return NextResponse.json({ error: "Imagem ausente" }, { status: 400 });
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent([
    PROMPT,
    { inlineData: { data: imageBase64, mimeType: mediaType ?? "image/jpeg" } },
  ]);

  const text = result.response.text();
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return NextResponse.json({ itens: [] });

  try {
    const data = JSON.parse(match[0]);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ itens: [] });
  }
}
