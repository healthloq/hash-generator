import React, { useState } from "react";
import { Typography, makeStyles, Box, TextField, Button } from "../";
import axios from "axios";
import { LinearWithValueLabel } from "../common";

const useStyle = makeStyles((theme) => ({
  formRoot: {
    width: "50%",
    "&>div": {
      marginTop: 10,
    },
  },
}));

export default function DocumentVerification() {
  const classes = useStyle();
  const [folderPath, setFolderPath] = useState("");
  const [documentVerificationRes, setDocumentVerificationRes] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(10);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (folderPath?.trim()) {
      setIsLoading(true);
      axios
        .post(`${process.env.REACT_APP_API_BASE_URL}/verify-documents`, {
          folderPath,
        })
        .then((res) => {
          setDocumentVerificationRes(res.data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setIsLoading(false);
        });
    }
  };
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Document Verification
      </Typography>
      <Box className={classes.formRoot}>
        <form onSubmit={handleSubmit}>
          <Box display={"flex"}>
            <TextField
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              type="text"
              placeholder="Enter folder path"
              variant="standard"
              InputProps={{ disableUnderline: true }}
              required
            />
            <Button
              variant="contained"
              sx={{ ml: 1 }}
              disabled={isLoading}
              type="submit"
            >
              Verify
            </Button>
          </Box>
        </form>
        {/* <LinearWithValueLabel progress={progress} /> */}
      </Box>
    </Box>
  );
}
