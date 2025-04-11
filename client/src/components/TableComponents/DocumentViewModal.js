import { Grid, IconButton, Typography } from "@mui/material";
import React from "react";
import CancelIcon from "@mui/icons-material/Cancel";

const getFileType = (url) => {
  const ext = url.split(".").pop().toLowerCase();
  return ext;
};

const DocumentViewerModal = ({ isOpen, onClose, fileUrl }) => {
  if (!isOpen || !fileUrl) return null;

  const fileType = getFileType(fileUrl);

  const isImage = ["jpg", "jpeg", "png", "svg", "webp", "gif"].includes(
    fileType
  );
  const isPDF = fileType === "pdf";
  const isWord = ["doc", "docx"].includes(fileType);

  return (
    <Grid
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: "100vw",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1000,
      }}
    >
      <Grid
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "50%",
          height: !isImage && !isWord && !isPDF ? "20%" : "80%",
          backgroundColor: "white",
          boxShadow: "0 0 10px rgba(0,0,0,0.3)",
          zIndex: 1001,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Grid
          container
          alignItems="center"
          justifyContent="space-between"
          sx={(theme) => ({
            backgroundColor: theme.palette.primary.main,
            padding: "10px 16px",
            color: "white",
            display: "flex",
            justifyContent: "center",
            height: "70",
          })}
        >
          <Typography variant="h4" style={{ color: "white" }}>
            Document
          </Typography>
          <IconButton
            onClick={onClose}
            style={{ color: "white", position: "absolute", right: 0 }}
          >
            <CancelIcon />
          </IconButton>
        </Grid>

        {/* Content */}
        <Grid style={{ flex: 1, padding: 10 }}>
          {isPDF ? (
            <iframe
              src={`${fileUrl}#toolbar=0&zoom=80`}
              title="PDF Viewer"
              width="100%"
              height="100%"
              style={{ border: "none" }}
            />
          ) : isImage ? (
            <Grid
              container
              justifyContent="center"
              alignItems="center"
              style={{
                height: "100%",
                width: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                overflow: "auto",
                maxHeight: "680px",
              }}
            >
              <img
                src={fileUrl}
                alt="Preview"
                style={{
                  maxHeight: "90%",
                  maxWidth: "90%",
                  objectFit: "contain",
                }}
              />
            </Grid>
          ) : isWord ? (
            <Grid style={{ padding: 20 }}>
              <p>This is a Word document.</p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "blue" }}
              >
                Click here to download or open in a new tab.
              </a>
            </Grid>
          ) : (
            <Grid
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <p>File type not supported for preview.</p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "blue" }}
              >
                Click here to download or open in a new tab.
              </a>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default DocumentViewerModal;
