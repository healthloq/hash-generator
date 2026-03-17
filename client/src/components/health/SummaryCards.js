import React from "react";
import { Card, CardContent, Typography, Box, Skeleton } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

const PERIODS = [
  { key: "hour",  label: "Last Hour" },
  { key: "day",   label: "Last 24 Hours" },
  { key: "week",  label: "Last 7 Days" },
  { key: "month", label: "Last 30 Days" },
];

export default function SummaryCards({ summary, loading }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
      {PERIODS.map(({ key, label }) => (
        <PeriodCard
          key={key}
          label={label}
          data={summary?.[key]}
          loading={loading}
        />
      ))}
    </Box>
  );
}

function PeriodCard({ label, data, loading }) {
  const successRate =
    data?.total > 0 ? Math.round((data.success / data.total) * 100) : null;

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>

        {loading ? (
          <Skeleton variant="rectangular" height={60} />
        ) : (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <InsertDriveFileOutlinedIcon sx={{ color: "primary.main" }} />
              <Typography variant="h4" fontWeight={700}>
                {data?.total ?? 0}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Stat
                icon={<CheckCircleOutlineIcon fontSize="small" sx={{ color: "success.main" }} />}
                count={data?.success ?? 0}
                label="ok"
                color="success.main"
              />
              <Stat
                icon={<ErrorOutlineIcon fontSize="small" sx={{ color: "error.main" }} />}
                count={data?.failed ?? 0}
                label="failed"
                color="error.main"
              />
            </Box>

            {successRate !== null && (
              <Box sx={{ mt: 1 }}>
                <Box
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: "error.light",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: `${successRate}%`,
                      bgcolor: "success.main",
                      borderRadius: 2,
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {successRate}% success rate
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ icon, count, label, color }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      {icon}
      <Typography variant="body2" fontWeight={600} sx={{ color }}>
        {count}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
