const { default: axios } = require("axios");

exports.syncHash = async (data) => {
  try {
    if (data.hashList.length || data.deletedHashList.length) {
      console.log("Start syncing with healthloq db...");
      const response = await axios.post(
        `${process.env.HEALTHLOQ_API_BASE_URL}/document-hash/createOrDelete`,
        data,
        {
          headers: {
            Authorization: `Bearer ${process.env.JWT_TOKEN}`,
          },
        }
      );
      if (response.data.status === "1")
        console.log("Hash synced with healthloq successful");
      else console.log(response.data.message);
    }
  } catch (error) {
    console.log("sync hash with healthloq catch block", error);
  }
};
