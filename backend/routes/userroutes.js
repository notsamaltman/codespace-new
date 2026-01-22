import express from "express";

const router = express.Router();

router.post("/run", async (req, res) => {
  try {
    const { language, version, code, stdin } = req.body;

    // Basic validation
    if (!language || !code) {
      return res.status(400).json({
        success: false,
        error: "language and code are required",
      });
    }

    const pistonPayload = {
      language,
      version: version || "*",
      files: [
        {
          content: code,
        },
      ],
      stdin: stdin || "",
    };

    const pistonResponse = await fetch(
      "https://emkc.org/api/v2/piston/execute",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pistonPayload),
      }
    );

    if (!pistonResponse.ok) {
      throw new Error(`Piston API error: ${pistonResponse.status}`);
    }

    const result = await pistonResponse.json();

    return res.status(200).json({
      success: true,
      output: result.run?.stdout || "",
      error: result.run?.stderr || "",
      exitCode: result.run?.code,
      language: result.language,
      version: result.version,
    });
  } catch (err) {
    console.error("Execution error:", err);

    return res.status(500).json({
      success: false,
      error: "Code execution failed",
      details: err.message,
    });
  }
});

export default router;
