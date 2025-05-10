async function parseResume(file) {
  const data = new FormData();
  data.append("file", file);

  const options = {
    method: "POST",
    url: "https://resume-parser-and-analyzer.p.rapidapi.com/api/v1/cv/",
    headers: {
      "x-rapidapi-key": process.env.RESUME_PARSER_KEY,
      "x-rapidapi-host": "resume-parser-and-analyzer.p.rapidapi.com",
    },
    data: data,
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);
  } catch (error) {
    console.error(error.message);
  }
}

module.exports = parseResume;
