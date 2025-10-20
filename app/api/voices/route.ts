import axios from "axios";

export async function GET() {
  try {
    const response = await axios.get("https://api.heygen.com/v2/voices", {
      headers: {
        "X-Api-Key": process.env.HEYGEN_API_KEY!,
        "Accept": "application/json",
      },
    });

    // According to HeyGen docs, the response structure is:
    // { "error": null, "data": { "voices": [...] } }
    const voices = response.data.data?.voices;
    
    if (!Array.isArray(voices)) {
      console.error("Voices is not an array:", typeof voices);
      console.error("Response structure:", response.data);
      return Response.json({ error: "Invalid response format" }, { status: 500 });
    }
    
    return Response.json(voices);
  } catch (err) {
    console.error("Failed to load voices:", err);
    return Response.json({ error: "Failed to fetch voices" }, { status: 500 });
  }
}
