const {
  sort,
  getDateWith12HourTimeFormate,
  getData,
  readFolder,
  removeDeletedFilesFromFolder,
} = require("../utils");

exports.renderHomePage = async (req, res) => {
  const data = await getData();
  const lastSyncedDate = getDateWith12HourTimeFormate(
    sort("createdAt", data).reverse()[0]?.createdAt
  );
  res.render("home", {
    lastSyncedDate,
    totalFiles: data.length,
    files:
      sort("createdAt", data)
        .reverse()
        .slice(0, 5)
        ?.map((item) => ({
          ...item,
          state: {
            ...item?.state,
            mtime: getDateWith12HourTimeFormate(item.state.mtime),
            birthtime: getDateWith12HourTimeFormate(item.state.birthtime),
          },
        })) || [],
    syncNow: async () => {
      await removeDeletedFilesFromFolder();
      await readFolder();
    },
  });
};
