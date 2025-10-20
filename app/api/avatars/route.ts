import axios from "axios";

export async function GET() {
  try {
    const response = await axios.get("https://api.heygen.com/v2/avatars", {
      headers: {
        "X-Api-Key": process.env.HEYGEN_API_KEY!,
        "Accept": "application/json",
      },
    });

    // According to HeyGen docs, the response structure is:
    // { "error": null, "data": { "avatars": [...] } }
    const avatars = response.data.data?.avatars;
    
    if (!Array.isArray(avatars)) {
      console.error("Avatars is not an array:", typeof avatars);
      console.error("Response structure:", response.data);
      return Response.json({ error: "Invalid response format" }, { status: 500 });
    }
    
    return Response.json(avatars);
  } catch (err) {
    console.error("Failed to load avatars:", err);
    return Response.json({ error: "Failed to fetch avatars" }, { status: 500 });
  }
}
