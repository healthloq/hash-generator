const { default: axios } = require("axios");
const { generateJwtToken } = require("../utils");

exports.syncHash = async (data) => {
  try {
    console.log(data);
    console.log("Start syncing with healthloq db...");
    const token = generateJwtToken();
    const response = await axios.post(
      `${process.env.HEALTHLOQ_API_BASE_URL}/document-hash/createOrDelete`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.data.status === "1")
      console.log("Hash synced with healthloq successful");
    else console.log(response.data.message);
  } catch (error) {
    console.log("sync hash with healthloq catch block", error);
  }
};
