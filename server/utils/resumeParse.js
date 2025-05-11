const axios = require("axios");

async function parseResume(resumeUrl) {
  try {
    console.log(resumeUrl);
    const response = await axios.get(
      `https://api.apilayer.com/resume_parser/url`,
      {
        params: { url: resumeUrl },
        headers: {
          apikey: "ZmD3isfJZpXljOSfzSnCUVGDiNiJsEhz",
        },
      }
    );

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Resume parsing error:",
      error.response?.data || error.message
    );
    throw error;
  }
}

module.exports = parseResume;
